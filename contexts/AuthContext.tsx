
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
import { logLogin, logSignUp, setUserId, logError } from '../utils/analyticsUtils';

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
  justRegistered?: boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUserSession = useCallback(async (firebaseUser: FirebaseUser | null) => {
    console.log('🔐 AuthContext: Handling user session for:', firebaseUser?.email || 'no user');
    
    if (firebaseUser) {
      try {
        console.log('🔐 AuthContext: Fetching user data from Firestore...');
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          console.log('✅ AuthContext: User data found in Firestore');
          
          const userData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: data.displayName || firebaseUser.displayName || '',
            phoneNumber: data.phoneNumber || '',
            role: data.role || 'user',
            isAdmin: data.isAdmin || false,
            isEditor: data.isEditor || false,
            isVIP: data.isVIP || false,
            vipExpiryDate: data.vipExpiryDate?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            emailVerified: firebaseUser.emailVerified,
            justRegistered: data.justRegistered || false
          };

          // Check and update VIP status if expired
          await checkAndUpdateVIPStatus(userData, userDocRef);

          setUserData(userData);
          setUser(firebaseUser);
          
          // Set analytics user ID
          await setUserId(firebaseUser.uid);
          
          console.log('✅ AuthContext: User session established');
        } else {
          console.log('⚠️ AuthContext: User document not found in Firestore');
          
          // Create basic user data if document doesn't exist
          const newUserData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'user',
            isAdmin: false,
            isVIP: false,
            createdAt: new Date(),
            emailVerified: firebaseUser.emailVerified
          };

          setUserData(newUserData);
          setUser(firebaseUser);
          
          // Set analytics user ID
          await setUserId(firebaseUser.uid);
        }
      } catch (error: any) {
        console.error('❌ AuthContext: Error handling user session:', error);
        
        // Log error to analytics
        await logError(`Session error: ${error.message}`, 'AuthContext');
        
        // Set basic user data even if Firestore fetch fails
        const fallbackUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: 'user',
          isAdmin: false,
          isVIP: false,
          createdAt: new Date(),
          emailVerified: firebaseUser.emailVerified
        };

        setUserData(fallbackUserData);
        setUser(firebaseUser);
        
        // Set analytics user ID
        await setUserId(firebaseUser.uid);
      }
    } else {
      console.log('🔐 AuthContext: No user, clearing session');
      setUser(null);
      setUserData(null);
      
      // Clear analytics user ID
      await setUserId(null);
    }

    setLoading(false);
  }, []);

  const checkAndUpdateVIPStatus = async (userData: UserData, userDocRef: any) => {
    if (userData.isVIP && userData.vipExpiryDate) {
      const now = new Date();
      if (now > userData.vipExpiryDate) {
        console.log('⚠️ AuthContext: VIP status expired, updating...');
        try {
          await updateDoc(userDocRef, {
            isVIP: false,
            vipExpiryDate: null
          });
          userData.isVIP = false;
          userData.vipExpiryDate = undefined;
          console.log('✅ AuthContext: VIP status updated');
        } catch (error) {
          console.error('❌ AuthContext: Error updating VIP status:', error);
        }
      }
    }
  };

  useEffect(() => {
    console.log('🔐 AuthContext: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, handleUserSession);

    return () => {
      console.log('🔐 AuthContext: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [handleUserSession]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Signing in user:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Log login event to analytics
      await logLogin('email');
      
      console.log('✅ AuthContext: Sign in successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Sign in error:', error);
      
      // Log error to analytics
      await logError(`Login error: ${error.message}`, 'signIn');
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    try {
      console.log('🔐 AuthContext: Creating new user:', email);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('🔐 AuthContext: Updating user profile...');
      
      // Update profile with display name
      await updateProfile(user, { displayName });

      console.log('🔐 AuthContext: Sending verification email...');
      
      // Send verification email
      await sendEmailVerification(user);

      console.log('🔐 AuthContext: Creating user document in Firestore...');
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        displayName: displayName,
        phoneNumber: phoneNumber || '',
        role: 'user',
        isAdmin: false,
        isEditor: false,
        isVIP: false,
        createdAt: new Date(),
        emailVerified: false,
        justRegistered: true
      });

      // Log signup event to analytics
      await logSignUp('email');
      
      console.log('✅ AuthContext: User registration successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up error:', error);
      
      // Log error to analytics
      await logError(`Signup error: ${error.message}`, 'signUp');
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 AuthContext: Logging out user');
      await signOut(auth);
      
      // Clear analytics user ID
      await setUserId(null);
      
      console.log('✅ AuthContext: Logout successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Logout error:', error);
      
      // Log error to analytics
      await logError(`Logout error: ${error.message}`, 'logout');
      
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 AuthContext: Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ AuthContext: Password reset email sent');
    } catch (error: any) {
      console.error('❌ AuthContext: Password reset error:', error);
      
      // Log error to analytics
      await logError(`Password reset error: ${error.message}`, 'resetPassword');
      
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('🔐 AuthContext: Updating user profile...');
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName });

      // Update Firestore document
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName
      });

      // Update local state
      if (userData) {
        setUserData({ ...userData, displayName });
      }

      console.log('✅ AuthContext: Profile updated successfully');
    } catch (error: any) {
      console.error('❌ AuthContext: Update profile error:', error);
      
      // Log error to analytics
      await logError(`Profile update error: ${error.message}`, 'updateUserProfile');
      
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('🔐 AuthContext: Resending verification email...');
      await sendEmailVerification(auth.currentUser);
      console.log('✅ AuthContext: Verification email sent');
    } catch (error: any) {
      console.error('❌ AuthContext: Resend verification error:', error);
      
      // Log error to analytics
      await logError(`Resend verification error: ${error.message}`, 'resendVerificationEmail');
      
      throw error;
    }
  };

  const clearJustRegistered = () => {
    if (userData && userData.justRegistered) {
      console.log('🔐 AuthContext: Clearing justRegistered flag');
      
      const userDocRef = doc(db, 'users', userData.uid);
      updateDoc(userDocRef, {
        justRegistered: false
      }).catch(error => {
        console.error('❌ AuthContext: Error clearing justRegistered flag:', error);
      });

      setUserData({ ...userData, justRegistered: false });
    }
  };

  const value: AuthContextType = {
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
