# Supabase Setup Guide for CNC Forex Signals

This guide will help you set up the Supabase database for the chat functionality in your CNC Forex Signals app.

## Prerequisites

1. You should have a Supabase project created
2. Your Supabase project URL: `https://qfkghlcxjswdfvgothph.supabase.co`
3. Your Supabase anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Database Setup

### Step 1: Run the Migration SQL

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `qfkghlcxjswdfvgothph`
3. Go to the "SQL Editor" tab
4. Create a new query and paste the contents of `supabase/migrations/001_create_chat_tables.sql`
5. Run the query

This will create:
- `profiles` table for user data
- `chats` table for chat conversations
- `messages` table for chat messages
- All necessary RLS (Row Level Security) policies
- Triggers for automatic user profile creation
- Indexes for better performance

### Step 2: Verify Tables

After running the migration, verify that the following tables exist:
- `profiles`
- `chats` 
- `messages`

You can check this in the "Table Editor" tab in your Supabase dashboard.

### Step 3: Test the Setup

1. Register a new user in your app
2. The user profile should automatically be created in the `profiles` table
3. Try initiating a chat from the VIP tab
4. Check that chat and message records are created properly

## Authentication Flow

The app uses **Firebase for authentication** and **Supabase for chat functionality only**:

1. **Registration**: Firebase handles user registration and email verification
2. **Login**: Firebase handles user authentication
3. **User Profiles**: Automatically synced to Supabase `profiles` table
4. **Chat**: All chat functionality uses Supabase real-time features

## RLS Policies

The database is secured with Row Level Security (RLS) policies:

### Profiles Table
- Users can view/update their own profile
- Admins can view/update all profiles

### Chats Table
- Users can view/create/update their own chats
- Admins can view/update all chats

### Messages Table
- Users can view/create messages in their own chats
- Admins can view/create/update messages in any chat

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**: Make sure you've run the migration SQL
2. **Permission denied errors**: Check that RLS policies are properly set up
3. **User profile not created**: Verify the trigger function is working

### Checking RLS Policies

To view current RLS policies, run this SQL:
