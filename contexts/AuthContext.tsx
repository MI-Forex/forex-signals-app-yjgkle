
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
<<<<<<< HEAD
import { router } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
<<<<<<< HEAD
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { logLogin, logSignUp, setUserId, logError } from '../utils/analyticsUtils';
=======
} from '@firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from '@firebase/firestore';
import { auth, db } from '../firebase/config';
import { router } from 'expo-router';
import { setUserId, setUserProperties, logLogin, logSignUp, logEvent, ANALYTICS_EVENTS } from '../utils/analyticsUtils';
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

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

<<<<<<< HEAD
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
=======
export function AuthProvider({ children }: { children: React.ReactNode }) {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
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
      
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      throw error;
    }
  };

<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        role: 'user',
        isAdmin: false,
        isEditor: false,
        isVIP: false,
        createdAt: new Date(),
        emailVerified: false,
        justRegistered: true
<<<<<<< HEAD
      });

      // Log signup event to analytics
      await logSignUp('email');
      
      console.log('✅ AuthContext: User registration successful');
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up error:', error);
      
      // Log error to analytics
      await logError(`Signup error: ${error.message}`, 'signUp');
      
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      throw error;
    }
  };

  const logout = async () => {
<<<<<<< HEAD
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
      
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
<<<<<<< HEAD
    try {
      console.log('🔐 AuthContext: Sending password reset email to:', email);
=======
    console.log('AuthContext: Sending password reset email');
    
    try {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      await sendPasswordResetEmail(auth, email);
      console.log('✅ AuthContext: Password reset email sent');
    } catch (error: any) {
      console.error('❌ AuthContext: Password reset error:', error);
<<<<<<< HEAD
      
      // Log error to analytics
      await logError(`Password reset error: ${error.message}`, 'resetPassword');
      
=======
      console.error('❌ AuthContext: Error code:', error.code);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'Password reset error',
        error_code: error.code || 'unknown',
        context: 'AuthContext'
      });
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string) => {
<<<<<<< HEAD
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
      
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
<<<<<<< HEAD
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
      
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      throw error;
    }
  };

  const clearJustRegistered = () => {
<<<<<<< HEAD
    if (userData && userData.justRegistered) {
      console.log('🔐 AuthContext: Clearing justRegistered flag');
      
      const userDocRef = doc(db, 'users', userData.uid);
      updateDoc(userDocRef, {
        justRegistered: false
      }).catch(error => {
        console.error('❌ AuthContext: Error clearing justRegistered flag:', error);
      });

=======
    if (userData) {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
};

export const useAuth = () => {
=======
}

export function useAuth() {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
<<<<<<< HEAD
};

export default AuthContext;
=======
}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
