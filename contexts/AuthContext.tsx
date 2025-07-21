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
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'editor';
  isAdmin: boolean;
  isEditor?: boolean;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext: Auth state changed:', user ? user.uid : 'null');
      
      if (user) {
        try {
          console.log('AuthContext: Loading user data for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            const userData: UserData = {
              uid: user.uid,
              email: user.email || '',
              displayName: data.displayName || user.displayName || '',
              phoneNumber: data.phoneNumber || '',
              role: data.role || 'user',
              isAdmin: data.isAdmin || false,
              isEditor: data.isEditor || false,
              isVIP: data.isVIP || false,
              createdAt: data.createdAt?.toDate() || new Date()
            };
            
            console.log('AuthContext: User data loaded:', {
              uid: userData.uid,
              email: userData.email,
              role: userData.role,
              isAdmin: userData.isAdmin,
              isEditor: userData.isEditor,
              isVIP: userData.isVIP
            });
            
            setUser(user);
            setUserData(userData);
            
            // Only navigate if this is the initial load or after sign in
            if (initializing || loading) {
              console.log('AuthContext: Navigating user after authentication');
              // Both admin and regular users go to tabs
              // Admin will see admin options in the profile tab
              console.log('AuthContext: User authenticated, navigating to tabs');
              router.replace('/(tabs)/signals');
            }
          } else {
            console.log('AuthContext: User document not found, creating...');
            // Create user document if it doesn't exist
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              phoneNumber: '',
              role: 'user',
              isAdmin: false,
              isEditor: false,
              isVIP: false,
              createdAt: new Date()
            };
            
            await setDoc(doc(db, 'users', user.uid), {
              ...newUserData,
              createdAt: new Date()
            });
            
            setUser(user);
            setUserData(newUserData);
            
            if (initializing || loading) {
              router.replace('/(tabs)/signals');
            }
          }
        } catch (error) {
          console.error('AuthContext: Error loading user data:', error);
          // If there's an error loading user data, sign out
          await signOut(auth);
          setUser(null);
          setUserData(null);
          router.replace('/auth/login');
        }
      } else {
        console.log('AuthContext: No user, clearing state');
        setUser(null);
        setUserData(null);
        if (initializing || !loading) {
          router.replace('/auth/login');
        }
      }
      
      setLoading(false);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting sign in for:', email);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Sign in successful for:', userCredential.user.uid);
      
      // The onAuthStateChanged listener will handle navigation
      // Don't set loading to false here - let the auth state change handle it
    } catch (error: any) {
      console.error('AuthContext: Sign in error:', error);
      setLoading(false);
      
      // Provide user-friendly error messages
      let errorMessage = 'Please check your credentials';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Please check your credentials';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    try {
      console.log('AuthContext: Attempting sign up for:', email);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('AuthContext: Sign up successful, creating user document');
      
      // Update the user's display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        phoneNumber: phoneNumber || '',
        role: 'user',
        isAdmin: false,
        isEditor: false,
        isVIP: false,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: new Date()
      });
      
      console.log('AuthContext: User document created successfully');
      
      // The onAuthStateChanged listener will handle navigation
    } catch (error: any) {
      console.error('AuthContext: Sign up error:', error);
      setLoading(false);
      
      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Attempting logout');
      setLoading(true);
      
      await signOut(auth);
      console.log('AuthContext: Logout successful');
      
      // Clear state immediately
      setUser(null);
      setUserData(null);
      
      // Navigate to login
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('AuthContext: Logout error:', error);
      throw new Error('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('AuthContext: Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('AuthContext: Password reset email sent successfully');
    } catch (error: any) {
      console.error('AuthContext: Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      console.log('AuthContext: Updating user profile');
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName });
      
      // Update Firestore document
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName
      }, { merge: true });
      
      // Update local state
      if (userData) {
        setUserData({ ...userData, displayName });
      }
      
      console.log('AuthContext: User profile updated successfully');
    } catch (error: any) {
      console.error('AuthContext: Profile update error:', error);
      throw new Error('Failed to update profile. Please try again.');
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}