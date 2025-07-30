import { supabase, supabaseAdmin, SupabaseMessage, SupabaseChat } from './supabaseConfig';

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  message: string;
  senderType: 'user' | 'admin';
  senderName: string;
  createdAt: Date;
  read: boolean;
}

export interface ChatUser {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isVip: boolean;
  createdAt: Date;
}

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Use admin client for better access
    const { data, error } = await supabaseAdmin.from('chats').select('id').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      
      // If table doesn't exist, that's still a connection success
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Connection successful, but tables may need setup');
        return true;
      }
      
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

export const createChatId = (userId: string): string => {
  return `${userId}_admin`;
};

export const ensureChatExists = async (userId: string, userEmail: string, userName: string): Promise<string> => {
  try {
    console.log('Ensuring chat exists for user:', userId);
    
    // Use admin client for better access
    const chatId = createChatId(userId);
    
    // Check if chat already exists
    const { data: existingChat, error: fetchError } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing chat:', fetchError);
      throw new Error(`Failed to check existing chat: ${fetchError.message}`);
    }

    if (existingChat) {
      console.log('Chat already exists:', existingChat.id);
      return existingChat.id;
    }

    // Create new chat
    const { data: newChat, error: insertError } = await supabaseAdmin
      .from('chats')
      .insert({
        id: chatId,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        last_message: '',
        unread_count: 0,
        is_vip: false
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating chat:', insertError);
      throw new Error(`Failed to create chat: ${insertError.message}`);
    }

    console.log('New chat created:', newChat.id);
    return newChat.id;
  } catch (error) {
    console.error('Error in ensureChatExists:', error);
    throw error;
  }
};

export const sendChatMessage = async (
  chatId: string,
  userId: string,
  message: string,
  senderType: 'user' | 'admin',
  senderName: string
): Promise<ChatMessage> => {
  try {
    console.log('Sending chat message:', { chatId, userId, senderType, message: message.substring(0, 50) });
    
    // Use admin client for better access
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        message: message,
        sender_type: senderType,
        sender_name: senderName,
        read: false
      })
      .select('*')
      .single();

    if (messageError) {
      console.error('Error inserting message:', messageError);
      throw new Error(`Failed to send message: ${messageError.message}`);
    }

    // Update chat with last message
    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update({
        last_message: message,
        last_message_time: new Date().toISOString(),
        unread_count: senderType === 'user' ? 1 : 0 // Only increment for user messages
      })
      .eq('id', chatId);

    if (updateError) {
      console.error('Error updating chat:', updateError);
      // Don't throw here, message was sent successfully
    }

    const chatMessage: ChatMessage = {
      id: newMessage.id,
      chatId: newMessage.chat_id,
      userId: newMessage.user_id,
      message: newMessage.message,
      senderType: newMessage.sender_type as 'user' | 'admin',
      senderName: newMessage.sender_name,
      createdAt: new Date(newMessage.created_at),
      read: newMessage.read
    };

    console.log('Message sent successfully:', chatMessage.id);
    return chatMessage;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    console.log('Getting chat messages for chat:', chatId);
    
    // Use admin client for better access
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    const chatMessages: ChatMessage[] = (messages || []).map(msg => ({
      id: msg.id,
      chatId: msg.chat_id,
      userId: msg.user_id,
      message: msg.message,
      senderType: msg.sender_type as 'user' | 'admin',
      senderName: msg.sender_name,
      createdAt: new Date(msg.created_at),
      read: msg.read
    }));

    console.log(`Fetched ${chatMessages.length} messages for chat ${chatId}`);
    return chatMessages;
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  console.log('Subscribing to messages for chat:', chatId);
  
  const subscription = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      },
      async (payload) => {
        console.log('Message subscription update:', payload);
        try {
          // Fetch all messages for this chat
          const messages = await getChatMessages(chatId);
          callback(messages);
        } catch (error) {
          console.error('Error handling message subscription:', error);
          if (onError) {
            onError(error);
          }
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIPTION_ERROR' && onError) {
        onError(new Error('Subscription failed'));
      }
    });

  return () => {
    console.log('Unsubscribing from messages for chat:', chatId);
    supabase.removeChannel(subscription);
  };
};

export const getAllUserChats = async (): Promise<ChatUser[]> => {
  try {
    console.log('Getting all user chats');
    
    // Use admin client for better access
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .order('last_message_time', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }

    const chatUsers: ChatUser[] = (chats || []).map(chat => ({
      id: chat.id,
      userId: chat.user_id,
      userEmail: chat.user_email,
      userName: chat.user_name,
      lastMessage: chat.last_message || '',
      lastMessageTime: new Date(chat.last_message_time || chat.created_at),
      unreadCount: chat.unread_count || 0,
      isVip: chat.is_vip || false,
      createdAt: new Date(chat.created_at)
    }));

    console.log(`Fetched ${chatUsers.length} chats`);
    return chatUsers;
  } catch (error) {
    console.error('Error in getAllUserChats:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string): Promise<void> => {
  try {
    console.log('Marking messages as read for chat:', chatId);
    
    // Use admin client for better access
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }

    // Reset unread count for chat
    const { error: chatError } = await supabaseAdmin
      .from('chats')
      .update({ unread_count: 0 })
      .eq('id', chatId);

    if (chatError) {
      console.error('Error resetting unread count:', chatError);
      // Don't throw, messages were marked as read successfully
    }

    console.log('Messages marked as read successfully');
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    throw error;
  }
};