
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfkghlcxjswdfvgothph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma2dobGN4anN3ZGZ2Z290aHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzE2NjksImV4cCI6MjA2ODUwNzY2OX0.KwLB7SVVJr2BlnzEQcDXhqWkNq0enNcwHUPignfnbIU';

// Use the anon key for admin operations as well since we have permissive RLS policies
const supabaseServiceKey = supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Enhanced client with anon key for admin operations (using permissive RLS policies)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

console.log('Supabase client initialized with URL:', supabaseUrl);

// Chat message interface for Supabase
export interface SupabaseMessage {
  id: string;
  chat_id: string;
  user_id: string;
  message: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  created_at: string;
  read: boolean;
}

// Chat interface for Supabase
export interface SupabaseChat {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_vip: boolean;
  created_at: string;
}

// Profile interface
export interface SupabaseProfile {
  id: string;
  email: string;
  display_name?: string;
  phone_number?: string;
  role: 'user' | 'admin' | 'editor';
  is_admin: boolean;
  is_editor: boolean;
  is_vip: boolean;
  created_at: string;
  updated_at: string;
}

export const initializeSupabaseTables = async () => {
  try {
    console.log('Initializing Supabase tables...');
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Supabase initialization timeout')), 5000);
    });

    // Test connection with timeout
    const testPromise = supabaseAdmin
      .from('chats')
      .select('id')
      .limit(1);

    const { data: testData, error: testError } = await Promise.race([
      testPromise,
      timeoutPromise
    ]) as any;

    if (testError) {
      console.log('Supabase connection test result:', testError.message);
      
      if (testError.code === 'PGRST116' || testError.message.includes('does not exist')) {
        console.log('Tables may not exist or need setup. This is normal for first run.');
      } else if (testError.message.includes('timeout')) {
        console.log('Supabase connection timeout - continuing with app initialization');
      }
    } else {
      console.log('Supabase connection successful, tables exist');
    }

    console.log('Supabase initialization completed');
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Don't throw the error - let the app continue
    console.log('Continuing with app initialization despite Supabase error');
  }
};

// Helper function to test connection with better error handling
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Using URL:', supabaseUrl);
    console.log('Using key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 3000);
    });

    // Try to access chats table first
    const testPromise = supabaseAdmin
      .from('chats')
      .select('count(*)', { count: 'exact', head: true });
    
    const { data, error } = await Promise.race([testPromise, timeoutPromise]);
    
    if (error) {
      console.log('Supabase connection test error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // If table doesn't exist, that's still a successful connection
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Connection successful, but tables may need setup');
        return true;
      }
      
      // Check for API key issues
      if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
        console.error('API key validation failed');
        return false;
      }
      
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};
