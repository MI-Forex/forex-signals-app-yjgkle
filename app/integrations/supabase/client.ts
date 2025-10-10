import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://qfkghlcxjswdfvgothph.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma2dobGN4anN3ZGZ2Z290aHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzE2NjksImV4cCI6MjA2ODUwNzY2OX0.KwLB7SVVJr2BlnzEQcDXhqWkNq0enNcwHUPignfnbIU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
