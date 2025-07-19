import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { router } from 'expo-router';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
  isVIP?: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email || 'No user');
      setUser(user);
      
      if (user) {
        console.log('User authenticated, fetching user data');
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('User data found in Firestore');
            const data = userDoc.data();
            const userData: UserData = {
              ...data,
              role: data.isAdmin ? 'admin' : 'user',
            } as UserData;
            setUserData(userData);
          } else {
            console.log('No user data found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No user, clearing user data and redirecting to login');
        setUserData(null);
        // Force redirect to login when user is null (logged out)
        if (!loading) {
          router.replace('/auth/login');
        }
      }
      
      console.log('Setting loading to false');
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [loading]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Generic error messages for security
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/invalid-email') {
        throw new Error('Please check your credentials');
      } else if (error.code === 'auth/network-request-failed' || 
                 error.message.includes('network')) {
        throw new Error('Please check internet connectivity');
      } else {
        throw new Error('Please check your credentials');
      }
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
        isAdmin: false,
        isVIP: false,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Generic error messages for security
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/network-request-failed' || 
                 error.message.includes('network')) {
        throw new Error('Please check internet connectivity');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await signOut(auth);
      // Clear local state immediately
      setUser(null);
      setUserData(null);
      // Force redirect to login and clear navigation stack
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Generic error messages for security
      if (error.code === 'auth/network-request-failed' || 
          error.message.includes('network')) {
        throw new Error('Please check internet connectivity');
      } else {
        throw new Error('Logout failed. Please try again.');
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Generic error messages for security
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/network-request-failed' || 
                 error.message.includes('network')) {
        throw new Error('Please check internet connectivity');
      } else {
        throw new Error('Failed to send reset email. Please try again.');
      }
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
      
      // Generic error messages for security
      if (error.code === 'auth/network-request-failed' || 
          error.message.includes('network')) {
        throw new Error('Please check internet connectivity');
      } else {
        throw new Error('Failed to update profile. Please try again.');
      }
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    updateUserProfile
  };

  console.log('AuthProvider rendering with loading:', loading, 'user:', user?.email || 'No user');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}