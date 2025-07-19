import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qfkghlcxjswdfvgothph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma2dobGN4anN3ZGZ2Z290aHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzE2NjksImV4cCI6MjA2ODUwNzY2OX0.KwLB7SVVJr2BlnzEQcDXhqWkNq0enNcwHUPignfnbIU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Firebase for auth
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

export const initializeSupabaseTables = async () => {
  try {
    console.log('Initializing Supabase tables...');
    
    // Create chats table if it doesn't exist
    const { error: chatsError } = await supabase.rpc('create_chats_table_if_not_exists');
    if (chatsError && !chatsError.message.includes('already exists')) {
      console.error('Error creating chats table:', chatsError);
    }

    // Create messages table if it doesn't exist
    const { error: messagesError } = await supabase.rpc('create_messages_table_if_not_exists');
    if (messagesError && !messagesError.message.includes('already exists')) {
      console.error('Error creating messages table:', messagesError);
    }

    console.log('Supabase tables initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
};