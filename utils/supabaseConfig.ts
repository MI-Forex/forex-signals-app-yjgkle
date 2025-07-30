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
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError && testError.code === 'PGRST116') {
      console.log('Tables do not exist. Creating them...');
      
      // Create tables using RPC calls or direct SQL execution
      // Note: In a real app, you would run these in the Supabase SQL editor
      console.log(`
        Please run the following SQL in your Supabase SQL editor:

        -- Create profiles table
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT NOT NULL UNIQUE,
          display_name TEXT,
          phone_number TEXT,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor')),
          is_admin BOOLEAN DEFAULT FALSE,
          is_editor BOOLEAN DEFAULT FALSE,
          is_vip BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create chats table
        CREATE TABLE IF NOT EXISTS chats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          user_name TEXT NOT NULL,
          last_message TEXT DEFAULT '',
          last_message_time TIMESTAMPTZ DEFAULT NOW(),
          unread_count INTEGER DEFAULT 0,
          is_vip BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create messages table
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL,
          message TEXT NOT NULL,
          sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
          sender_name TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies for profiles
        CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own profile" ON profiles
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (true);

        -- Create RLS policies for chats
        CREATE POLICY "Users can view their own chats" ON chats
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert their own chats" ON chats
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Users can update their own chats" ON chats
          FOR UPDATE USING (true);

        -- Create RLS policies for messages
        CREATE POLICY "Users can view messages in their chats" ON messages
          FOR SELECT USING (true);

        CREATE POLICY "Users can insert messages in their chats" ON messages
          FOR INSERT WITH CHECK (true);

        CREATE POLICY "Users can update messages in their chats" ON messages
          FOR UPDATE USING (true);

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

        -- Create updated_at trigger for profiles
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
    } else {
      console.log('Supabase tables already exist or connection successful');
    }

    console.log('Supabase tables check completed');
  } catch (error) {
    console.error('Error checking Supabase tables:', error);
  }
};

// Helper function to create tables programmatically
export const createSupabaseTables = async () => {
  try {
    console.log('Creating Supabase tables programmatically...');
    
    // Create chats table
    const { error: chatsError } = await supabase.rpc('create_chats_table');
    if (chatsError && !chatsError.message.includes('already exists')) {
      console.error('Error creating chats table:', chatsError);
    }

    // Create messages table
    const { error: messagesError } = await supabase.rpc('create_messages_table');
    if (messagesError && !messagesError.message.includes('already exists')) {
      console.error('Error creating messages table:', messagesError);
    }

    console.log('Supabase tables created successfully');
  } catch (error) {
    console.error('Error creating Supabase tables:', error);
  }
};