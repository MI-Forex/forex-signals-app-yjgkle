
import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'editor';
  isAdmin: boolean;
  isEditor?: boolean;
  isVIP?: boolean;
  vipExpiryDate?: Date;
  createdAt: Date;
  emailVerified: boolean;
  justRegistered?: boolean; // Flag to track if user just registered
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  clearJustRegistered: () => void;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up Firebase auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthContext: Auth state changed:', firebaseUser ? firebaseUser.uid : 'null');
      
      try {
        if (firebaseUser) {
          await handleUserSession(firebaseUser);
        } else {
          console.log('AuthContext: User signed out');
          setUser(null);
          setUserData(null);
          setLoading(false);
          setInitializing(false);
          if (!initializing) {
            router.replace('/auth/login');
          }
        }
      } catch (error) {
        console.error('AuthContext: Error in auth state change handler:', error);
        setLoading(false);
        setInitializing(false);
      }
    });

    // Set a timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      console.log('AuthContext: Auth initialization timeout, setting loading to false');
      setLoading(false);
      setInitializing(false);
    }, 10000); // 10 seconds timeout

    return () => {
      unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  const checkAndUpdateVIPStatus = async (userData: UserData, userDocRef: any) => {
    if (userData.isVIP && userData.vipExpiryDate) {
      const now = new Date();
      const expiryDate = userData.vipExpiryDate;
      
      if (now > expiryDate) {
        console.log('AuthContext: VIP membership expired, removing VIP status');
        
        try {
          // Update Firestore
          await updateDoc(userDocRef, {
            isVIP: false,
            vipExpiryDate: null,
            updatedAt: new Date()
          });
          
          // Update local state
          userData.isVIP = false;
          userData.vipExpiryDate = undefined;
        } catch (error) {
          console.error('AuthContext: Error updating VIP status:', error);
        }
      }
    }
    
    return userData;
  };

  const handleUserSession = async (firebaseUser: FirebaseUser) => {
    try {
      console.log('AuthContext: Handling user session for:', firebaseUser.uid);
      
      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        console.log('AuthContext: Email not verified');
        setUser(null);
        setUserData(null);
        setLoading(false);
        setInitializing(false);
        return;
      }

      // Add timeout for Firestore operations
      const firestoreTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore operation timeout')), 8000);
      });

      // Get or create user profile in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocPromise = getDoc(userDocRef);

      const userDoc = await Promise.race([userDocPromise, firestoreTimeout]) as any;

      let userData: UserData;

      if (!userDoc.exists()) {
        console.log('AuthContext: Creating new user profile');
        // Create new profile
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          role: 'user',
          isAdmin: false,
          isEditor: false,
          isVIP: false,
          createdAt: new Date(),
          emailVerified: true
        };

        try {
          const setDocPromise = setDoc(userDocRef, {
            email: userData.email,
            displayName: userData.displayName,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
            isAdmin: userData.isAdmin,
            isEditor: userData.isEditor,
            isVIP: userData.isVIP,
            createdAt: userData.createdAt,
            emailVerified: userData.emailVerified
          });

          await Promise.race([setDocPromise, firestoreTimeout]);
        } catch (error) {
          console.error('AuthContext: Error creating user profile:', error);
          // Continue with local userData even if Firestore fails
        }
      } else {
        console.log('AuthContext: Using existing profile');
        const data = userDoc.data();
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || '',
          role: data.role || 'user',
          isAdmin: data.isAdmin || false,
          isEditor: data.isEditor || false,
          isVIP: data.isVIP || false,
          vipExpiryDate: data.vipExpiryDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          emailVerified: true,
          justRegistered: data.justRegistered || false
        };

        // Check and update VIP status if expired
        try {
          userData = await checkAndUpdateVIPStatus(userData, userDocRef);
        } catch (error) {
          console.error('AuthContext: Error checking VIP status:', error);
          // Continue with existing userData
        }
      }

      console.log('AuthContext: User data loaded successfully:', {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        isAdmin: userData.isAdmin,
        isEditor: userData.isEditor,
        isVIP: userData.isVIP,
        vipExpiryDate: userData.vipExpiryDate,
        justRegistered: userData.justRegistered
      });

      console.log('AuthContext: Setting user and userData state');

      setUser(firebaseUser);
      setUserData(userData);

      console.log('AuthContext: User and userData state set successfully');

      // Navigate to app if this is initial load
      if (initializing || loading) {
        console.log('AuthContext: Preparing to navigate to app');
        setTimeout(() => {
          try {
            console.log('AuthContext: Executing navigation to /(tabs)/signals');
            router.replace('/(tabs)/signals');
            console.log('AuthContext: Navigation completed successfully');
          } catch (navError) {
            console.error('AuthContext: Navigation error:', navError);
            // Fallback navigation
            console.log('AuthContext: Attempting fallback navigation');
            router.push('/(tabs)/signals');
          }
        }, 100); // Small delay to ensure proper navigation
      }

    } catch (error) {
      console.error('AuthContext: Error handling user session:', error);
      
      // If it's a timeout or network error, still try to set basic user data
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        console.log('AuthContext: Setting basic user data due to timeout/network error');
        setUser(firebaseUser);
        setUserData({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          role: 'user',
          isAdmin: false,
          isEditor: false,
          isVIP: false,
          createdAt: new Date(),
          emailVerified: true
        });
        
        if (initializing || loading) {
          setTimeout(() => {
            try {
              router.replace('/(tabs)/signals');
            } catch (navError) {
              console.error('AuthContext: Navigation error:', navError);
              // Fallback navigation
              router.push('/(tabs)/signals');
            }
          }, 100); // Small delay to ensure proper navigation
        }
      } else {
        // For other errors, sign out and redirect to login
        await signOut(auth);
        setUser(null);
        setUserData(null);
        router.replace('/auth/login');
      }
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting sign in for:', email);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      if (!userCredential.user.emailVerified) {
        console.log('AuthContext: Email not verified');
        await signOut(auth);
        throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      }

      console.log('AuthContext: Sign in successful');
      // The auth state change listener will handle navigation
    } catch (error: any) {
      console.error('AuthContext: Sign in error:', error);
      setLoading(false);

      // Provide user-friendly error messages
      let errorMessage = 'Please check your credentials';

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Please check your credentials';
      } else if (error.message?.includes('verify your email')) {
        errorMessage = error.message;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    try {
      console.log('AuthContext: Attempting sign up for:', email);
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update the user profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user document with justRegistered flag
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: email.trim(),
        displayName: displayName,
        phoneNumber: phoneNumber || '',
        role: 'user',
        isAdmin: false,
        isEditor: false,
        isVIP: false,
        createdAt: new Date(),
        emailVerified: false,
        justRegistered: true // Flag to show resend verification option
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      console.log('AuthContext: Sign up successful, verification email sent');
      
      // Sign out the user until they verify their email
      await signOut(auth);
      
      // Don't set loading to false here - let the caller handle it
    } catch (error: any) {
      console.error('AuthContext: Sign up error:', error);
      setLoading(false);

      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
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
      
      await sendPasswordResetEmail(auth, email.trim());

      console.log('AuthContext: Password reset email sent successfully');
    } catch (error: any) {
      console.error('AuthContext: Password reset error:', error);

      let errorMessage = 'Failed to send reset email. Please try again.';

      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      }

      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      if (!user) throw new Error('No user logged in');

      console.log('AuthContext: Updating user profile');

      // Update Firebase profile
      await updateProfile(user, { displayName });

      // Update Firestore profile
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { displayName });

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

  const resendVerificationEmail = async () => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('AuthContext: Resending verification email');
      await sendEmailVerification(user);
      console.log('AuthContext: Verification email resent successfully');
    } catch (error: any) {
      console.error('AuthContext: Resend verification error:', error);
      
      let errorMessage = 'Failed to resend verification email';
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Please check internet connectivity';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before trying again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const clearJustRegistered = () => {
    if (userData) {
      setUserData({ ...userData, justRegistered: false });
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
    updateUserProfile,
    resendVerificationEmail,
    clearJustRegistered
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
