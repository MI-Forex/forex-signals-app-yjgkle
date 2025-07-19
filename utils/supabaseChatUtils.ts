import { supabase, SupabaseMessage, SupabaseChat } from './supabaseConfig';

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('chats').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  senderName: string;
  timestamp: Date;
  chatId: string;
  userId: string;
  read: boolean;
}

export interface ChatUser {
  id: string;
  email: string;
  displayName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isVIP: boolean;
}

export const createChatId = (userId: string): string => {
  return `${userId}_admin`;
};

export const ensureChatExists = async (userId: string, userEmail: string, userName: string): Promise<string> => {
  const chatId = createChatId(userId);
  
  try {
    console.log('SupabaseChatUtils: Ensuring chat exists for user:', userId, 'chatId:', chatId);
    
    // Check if chat already exists
    const { data: existingChat, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('SupabaseChatUtils: Error checking existing chat:', fetchError);
      throw new Error(`Failed to check existing chat: ${fetchError.message}`);
    }

    if (!existingChat) {
      // Create new chat
      const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert([
          {
            id: chatId,
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
            last_message: '',
            last_message_time: new Date().toISOString(),
            unread_count: 0,
            is_vip: false
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('SupabaseChatUtils: Error creating chat:', insertError);
        throw new Error(`Failed to create chat: ${insertError.message}`);
      }

      console.log('SupabaseChatUtils: New chat created for user:', userId);
    } else {
      console.log('SupabaseChatUtils: Chat already exists for user:', userId);
    }
    
    return chatId;
  } catch (error) {
    console.error('SupabaseChatUtils: Error ensuring chat exists:', error);
    throw new Error(`Failed to create chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const sendChatMessage = async (
  chatId: string,
  userId: string,
  text: string,
  sender: 'user' | 'admin',
  senderName: string
): Promise<void> => {
  try {
    console.log('SupabaseChatUtils: Sending message:', { 
      chatId, 
      userId, 
      sender, 
      senderName,
      textLength: text.length 
    });
    
    // Validate inputs
    if (!chatId || !userId || !text.trim() || !sender || !senderName) {
      console.error('SupabaseChatUtils: Missing required data:', {
        chatId: !!chatId,
        userId: !!userId,
        text: !!text.trim(),
        sender: !!sender,
        senderName: !!senderName
      });
      throw new Error('Missing required message data');
    }

    // Validate chatId format
    if (!chatId.includes('_admin')) {
      console.error('SupabaseChatUtils: Invalid chat ID format:', chatId);
      throw new Error('Invalid chat ID format');
    }

    // Prepare message data
    const messageData = {
      chat_id: chatId,
      user_id: userId,
      message: text.trim(),
      sender_type: sender,
      sender_name: senderName,
      read: false
    };

    console.log('SupabaseChatUtils: Inserting message data:', messageData);
    
    // Add message to Supabase
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (messageError) {
      console.error('SupabaseChatUtils: Error inserting message:', messageError);
      console.error('SupabaseChatUtils: Message data that failed:', messageData);
      throw new Error(`Failed to send message: ${messageError.message}`);
    }

    if (!message) {
      console.error('SupabaseChatUtils: No message returned from insert');
      throw new Error('Failed to send message: No data returned');
    }

    console.log('SupabaseChatUtils: Message added with ID:', message.id);

    // Update chat with last message info
    let updateData: any = {
      last_message: text.trim(),
      last_message_time: new Date().toISOString()
    };

    // If user is sending, increment unread count
    if (sender === 'user') {
      // Get current unread count first
      const { data: currentChat, error: fetchError } = await supabase
        .from('chats')
        .select('unread_count')
        .eq('id', chatId)
        .single();

      if (!fetchError && currentChat) {
        updateData.unread_count = (currentChat.unread_count || 0) + 1;
      }
    }

    const { error: updateError } = await supabase
      .from('chats')
      .update(updateData)
      .eq('id', chatId);

    if (updateError) {
      console.error('SupabaseChatUtils: Error updating chat:', updateError);
      // Don't throw here as message was sent successfully
    }

    console.log('SupabaseChatUtils: Message sent successfully');
  } catch (error) {
    console.error('SupabaseChatUtils: Error sending message:', error);
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    console.log('SupabaseChatUtils: Getting messages for chat:', chatId);
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('SupabaseChatUtils: Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    const chatMessages: ChatMessage[] = (messages || []).map((msg: SupabaseMessage) => ({
      id: msg.id,
      text: msg.message,
      sender: msg.sender_type,
      senderName: msg.sender_name,
      timestamp: new Date(msg.created_at),
      chatId: msg.chat_id,
      userId: msg.user_id,
      read: msg.read
    }));

    console.log('SupabaseChatUtils: Retrieved messages:', chatMessages.length);
    return chatMessages;
  } catch (error) {
    console.error('SupabaseChatUtils: Error getting chat messages:', error);
    return [];
  }
};

export const subscribeToMessages = (
  chatId: string,
  onMessage: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void
) => {
  console.log('SupabaseChatUtils: Subscribing to messages for chat:', chatId);
  
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
        console.log('SupabaseChatUtils: Received real-time update:', payload);
        try {
          // Small delay to ensure database consistency
          setTimeout(async () => {
            const messages = await getChatMessages(chatId);
            onMessage(messages);
          }, 100);
        } catch (error) {
          console.error('SupabaseChatUtils: Error handling real-time update:', error);
          onError(new Error('Failed to update messages'));
        }
      }
    )
    .subscribe((status) => {
      console.log('SupabaseChatUtils: Subscription status:', status);
      if (status === 'SUBSCRIPTION_ERROR') {
        onError(new Error('Failed to subscribe to messages'));
      } else if (status === 'SUBSCRIBED') {
        console.log('SupabaseChatUtils: Successfully subscribed to real-time updates');
      }
    });

  return () => {
    console.log('SupabaseChatUtils: Unsubscribing from messages');
    subscription.unsubscribe();
  };
};

export const markMessagesAsRead = async (chatId: string, sender: 'user' | 'admin'): Promise<void> => {
  try {
    console.log('SupabaseChatUtils: Marking messages as read for chatId:', chatId, 'sender:', sender);
    
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .eq('sender_type', sender)
      .eq('read', false);

    if (error) {
      console.error('SupabaseChatUtils: Error marking messages as read:', error);
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }

    // Reset unread count in chat if marking user messages as read (admin reading user messages)
    if (sender === 'user') {
      const { error: updateError } = await supabase
        .from('chats')
        .update({ unread_count: 0 })
        .eq('id', chatId);

      if (updateError) {
        console.error('SupabaseChatUtils: Error resetting unread count:', updateError);
      }
    }

    console.log('SupabaseChatUtils: Messages marked as read successfully');
  } catch (error) {
    console.error('SupabaseChatUtils: Error marking messages as read:', error);
    throw new Error(`Failed to mark messages as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAllUserChats = async (): Promise<ChatUser[]> => {
  try {
    console.log('SupabaseChatUtils: Getting all user chats...');
    
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .order('last_message_time', { ascending: false });

    if (error) {
      console.error('SupabaseChatUtils: Error fetching chats:', error);
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }

    const chatUsers: ChatUser[] = (chats || []).map((chat: SupabaseChat) => ({
      id: chat.user_id,
      email: chat.user_email,
      displayName: chat.user_name,
      lastMessage: chat.last_message,
      lastMessageTime: new Date(chat.last_message_time),
      unreadCount: chat.unread_count,
      isVIP: chat.is_vip
    }));
    
    console.log('SupabaseChatUtils: Found chat users:', chatUsers.length);
    return chatUsers;
  } catch (error) {
    console.error('SupabaseChatUtils: Error getting user chats:', error);
    return [];
  }
};

export const getUnreadCount = async (chatId: string, sender: 'user' | 'admin'): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .eq('sender_type', sender)
      .eq('read', false);

    if (error) {
      console.error('SupabaseChatUtils: Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('SupabaseChatUtils: Error getting unread count:', error);
    return 0;
  }
};