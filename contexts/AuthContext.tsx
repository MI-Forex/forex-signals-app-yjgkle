import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { 
  configureGoogleSignIn, 
  isGoogleSignInAvailable, 
  performGoogleSignIn, 
  signOutFromGoogle 
} from '../utils/googleSignInConfig';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In
    configureGoogleSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in');
      
      if (!isGoogleSignInAvailable()) {
        throw new Error('Google Sign-In is not available on this platform');
      }

      const result = await performGoogleSignIn();
      console.log('Google Sign-In result received');

      const googleCredential = GoogleAuthProvider.credential(result.idToken);
      const { user } = await signInWithCredential(auth, googleCredential);
      
      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || '',
          role: 'user',
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        setUserData(userData);
      }
      
      console.log('Google sign in successful');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    try {
      console.log('Creating user:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName,
        phoneNumber,
        role: 'user',
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      
      // Sign out from Google if available
      await signOutFromGoogle();
      
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      if (user) {
        console.log('Updating user profile:', displayName);
        await updateProfile(user, { displayName });
        
        // Update Firestore document
        await setDoc(doc(db, 'users', user.uid), {
          displayName
        }, { merge: true });
        
        // Update local state
        if (userData) {
          setUserData({ ...userData, displayName });
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}