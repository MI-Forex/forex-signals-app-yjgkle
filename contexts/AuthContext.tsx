import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../utils/supabaseConfig';
import { Session, User } from '@supabase/supabase-js';

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
  emailVerified: boolean;
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
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session:', session ? session.user.id : 'null');
      if (session?.user) {
        handleUserSession(session.user, session);
      } else {
        setLoading(false);
        setInitializing(false);
        if (initializing) {
          router.replace('/auth/login');
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session ? session.user.id : 'null');
      
      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserSession(session.user, session);
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthContext: User signed out');
        setUser(null);
        setUserData(null);
        setLoading(false);
        router.replace('/auth/login');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('AuthContext: Token refreshed');
        await handleUserSession(session.user, session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (user: User, session: Session) => {
    try {
      console.log('AuthContext: Handling user session for:', user.id);
      
      // Check if email is verified
      if (!user.email_confirmed_at) {
        console.log('AuthContext: Email not verified');
        setUser(null);
        setUserData(null);
        setLoading(false);
        setInitializing(false);
        return;
      }

      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('AuthContext: Error fetching profile:', error);
        throw error;
      }

      let userData: UserData;

      if (!profile) {
        console.log('AuthContext: Creating new user profile');
        // Create new profile
        userData = {
          uid: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.displayName || '',
          phoneNumber: user.user_metadata?.phoneNumber || '',
          role: 'user',
          isAdmin: false,
          isEditor: false,
          isVIP: false,
          createdAt: new Date(),
          emailVerified: true
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            display_name: userData.displayName,
            phone_number: userData.phoneNumber,
            role: userData.role,
            is_admin: userData.isAdmin,
            is_editor: userData.isEditor,
            is_vip: userData.isVIP,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('AuthContext: Error creating profile:', insertError);
          throw insertError;
        }
      } else {
        console.log('AuthContext: Using existing profile');
        userData = {
          uid: user.id,
          email: user.email || '',
          displayName: profile.display_name || '',
          phoneNumber: profile.phone_number || '',
          role: profile.role || 'user',
          isAdmin: profile.is_admin || false,
          isEditor: profile.is_editor || false,
          isVIP: profile.is_vip || false,
          createdAt: new Date(profile.created_at),
          emailVerified: true
        };
      }

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

      // Navigate to app if this is initial load or after sign in
      if (initializing || loading) {
        console.log('AuthContext: Navigating to app');
        router.replace('/(tabs)/signals');
      }

    } catch (error) {
      console.error('AuthContext: Error handling user session:', error);
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting sign in for:', email);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('AuthContext: Sign in error:', error);
        throw error;
      }

      if (!data.user?.email_confirmed_at) {
        console.log('AuthContext: Email not confirmed');
        await supabase.auth.signOut();
        throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
      }

      console.log('AuthContext: Sign in successful');
      // The auth state change listener will handle navigation
    } catch (error: any) {
      console.error('AuthContext: Sign in error:', error);
      setLoading(false);

      // Provide user-friendly error messages
      let errorMessage = 'Please check your credentials';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Please check your credentials';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before signing in. Check your inbox for the verification link.';
      } else if (error.message?.includes('verify your email')) {
        errorMessage = error.message;
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, phoneNumber?: string) => {
    try {
      console.log('AuthContext: Attempting sign up for:', email);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            displayName: displayName,
            phoneNumber: phoneNumber || ''
          }
        }
      });

      if (error) {
        console.error('AuthContext: Sign up error:', error);
        throw error;
      }

      console.log('AuthContext: Sign up successful, verification email sent');
      
      // Don't set loading to false here - let the caller handle it
      // The user will need to verify their email before they can sign in
    } catch (error: any) {
      console.error('AuthContext: Sign up error:', error);
      setLoading(false);

      // Provide user-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';

      if (error.message?.includes('already registered')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Please check internet connectivity';
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Attempting logout');
      setLoading(true);

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext: Logout error:', error);
        throw error;
      }

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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://natively.dev/reset-password'
      });

      if (error) {
        console.error('AuthContext: Password reset error:', error);
        throw error;
      }

      console.log('AuthContext: Password reset email sent successfully');
    } catch (error: any) {
      console.error('AuthContext: Password reset error:', error);

      let errorMessage = 'Failed to send reset email. Please try again.';

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }

      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    try {
      if (!user) throw new Error('No user logged in');

      console.log('AuthContext: Updating user profile');

      // Update Supabase profile
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) {
        console.error('AuthContext: Profile update error:', error);
        throw error;
      }

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