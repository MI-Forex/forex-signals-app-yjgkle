import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfkghlcxjswdfvgothph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma2dobGN4anN3ZGZ2Z290aHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzE2NjksImV4cCI6MjA2ODUwNzY2OX0.KwLB7SVVJr2BlnzEQcDXhqWkNq0enNcwHUPignfnbIU';

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
    
    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('Profiles table does not exist. Please run the SQL migration manually.');
      console.log(`
        Please run this SQL in your Supabase SQL editor:

        -- Create profiles table
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          display_name TEXT,
          phone_number TEXT,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
          is_admin BOOLEAN DEFAULT FALSE,
          is_editor BOOLEAN DEFAULT FALSE,
          is_vip BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

        CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY "Users can insert their own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);

        -- Admin can view all profiles
        CREATE POLICY "Admins can view all profiles" ON profiles
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND is_admin = TRUE
            )
          );

        -- Admin can update all profiles
        CREATE POLICY "Admins can update all profiles" ON profiles
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() AND is_admin = TRUE
            )
          );

        -- Create function to handle user creation
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO profiles (id, email, display_name, phone_number)
          VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'displayName',
            NEW.raw_user_meta_data->>'phoneNumber'
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create trigger for new user creation
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();

        -- Create updated_at trigger
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    // Check if chats table exists
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id')
      .limit(1);

    if (chatsError && chatsError.code === 'PGRST116') {
      console.log('Chats table does not exist. Please run the chat tables SQL migration manually.');
    }

    console.log('Supabase tables check completed');
  } catch (error) {
    console.error('Error checking Supabase tables:', error);
  }
};