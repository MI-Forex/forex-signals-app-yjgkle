
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from '@firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from '@firebase/firestore';
import { auth, db } from '../firebase/config';
import { router } from 'expo-router';
import { setUserId, setUserProperties, logLogin, logSignUp, logEvent, ANALYTICS_EVENTS } from '../utils/analyticsUtils';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAndUpdateVIPStatus = useCallback(async (userData: UserData, userDocRef: any) => {
    if (userData.isVIP && userData.vipExpiryDate) {
      const now = new Date();
      const expiryDate = userData.vipExpiryDate instanceof Date ? userData.vipExpiryDate : userData.vipExpiryDate.toDate();
      
      if (now > expiryDate) {
        console.log('AuthContext: VIP subscription expired, updating user status');
        await updateDoc(userDocRef, {
          isVIP: false,
          vipExpiryDate: null
        });
        
        return {
          ...userData,
          isVIP: false,
          vipExpiryDate: null
        };
      }
    }
    return userData;
  }, []);

  const handleUserSession = useCallback(async (firebaseUser: FirebaseUser) => {
    console.log('AuthContext: Handling user session for:', firebaseUser.uid);
    
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log('AuthContext: User document found, loading data');
        let userData = userDoc.data() as UserData;
        userData.uid = firebaseUser.uid;
        userData.emailVerified = firebaseUser.emailVerified;
        
        // Check and update VIP status
        userData = await checkAndUpdateVIPStatus(userData, userDocRef);
        
        setUser(firebaseUser);
        setUserData(userData);
        
        // Set analytics user properties
        await setUserId(firebaseUser.uid);
        await setUserProperties({
          user_role: userData.role,
          is_vip: userData.isVIP ? 'true' : 'false',
          email_verified: firebaseUser.emailVerified ? 'true' : 'false'
        });
        
        console.log('✅ AuthContext: User session established successfully');
      } else {
        console.log('⚠️ AuthContext: User document not found');
        setUser(firebaseUser);
        setUserData(null);
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Error handling user session:', error);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'User session handling error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
    }
  }, [checkAndUpdateVIPStatus]);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthContext: Auth state changed:', firebaseUser?.uid || 'null');
      
      try {
        if (firebaseUser) {
          await handleUserSession(firebaseUser);
        } else {
          setUser(null);
          setUserData(null);
          await setUserId(null);
          console.log('AuthContext: User signed out, cleared state');
        }
      } catch (error: any) {
        console.error('❌ AuthContext: Error handling auth state change:', error);
        await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
          error_message: 'Auth state change error',
          error_code: error.code || 'unknown',
          context: 'AuthContext'
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [handleUserSession]);

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Attempting to sign in user');
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ AuthContext: Sign in successful');
      
      await logLogin('email');
      
      if (!result.user.emailVerified) {
        console.log('⚠️ AuthContext: Email not verified');
        throw new Error('Please verify your email before signing in. Check your inbox for a verification link.');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Sign in error:', error);
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Sign in error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('AuthContext: Attempting to create new user');
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ AuthContext: User created successfully');
      
      // Update profile
      await updateProfile(result.user, { displayName });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      // Create user document
      const userData: UserData = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName,
        role: 'user',
        isAdmin: false,
        isEditor: false,
        isVIP: false,
        createdAt: new Date(),
        emailVerified: false,
        justRegistered: true
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      
      await logSignUp('email');
      await setUserId(result.user.uid);
      await setUserProperties({
        user_role: 'user',
        is_vip: 'false',
        email_verified: 'false'
      });
      
      console.log('✅ AuthContext: User registration completed');
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up error:', error);
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Sign up error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext: Logging out user');
    
    try {
      await logEvent(ANALYTICS_EVENTS.USER_LOGOUT);
      await signOut(auth);
      console.log('✅ AuthContext: Logout successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Logout error:', error);
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Logout error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('AuthContext: Sending password reset email');
    
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ AuthContext: Password reset email sent');
    } catch (error: any) {
      console.error('❌ AuthContext: Password reset error:', error);
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Password reset error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
    console.log('AuthContext: Updating user profile');
    
    try {
      if (user) {
        await updateProfile(user, { displayName });
        
        if (userData) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { displayName });
          
          setUserData({ ...userData, displayName });
        }
        
        console.log('✅ AuthContext: Profile updated successfully');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Profile update error:', error);
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Profile update error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    console.log('AuthContext: Resending verification email');
    
    try {
      if (user) {
        await sendEmailVerification(user);
        console.log('✅ AuthContext: Verification email sent');
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Resend verification error:', error);
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Resend verification error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
      throw error;
    }
  };

  const clearJustRegistered = () => {
    if (userData) {
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
