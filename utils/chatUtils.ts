import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  getDoc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

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

export const ensureChatExists = async (userId: string): Promise<string> => {
  const chatId = createChatId(userId);
  const chatRef = doc(db, 'chats', chatId);
  
  try {
    console.log('ChatUtils: Ensuring chat exists for user:', userId, 'chatId:', chatId);
    
    // Check if chat already exists
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      // Create new chat document
      const chatData = {
        userId: userId,
        adminId: 'admin',
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        participants: [userId, 'admin'],
        unreadCount: 0,
        lastSender: '',
        isActive: true
      };
      
      await setDoc(chatRef, chatData);
      console.log('ChatUtils: New chat created for user:', userId);
    } else {
      console.log('ChatUtils: Chat already exists for user:', userId);
    }
    
    return chatId;
  } catch (error) {
    console.error('ChatUtils: Error ensuring chat exists:', error);
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
    console.log('ChatUtils: Sending message:', { 
      chatId, 
      userId, 
      sender, 
      senderName,
      textLength: text.length 
    });
    
    // Validate inputs
    if (!chatId || !userId || !text.trim() || !sender || !senderName) {
      throw new Error('Missing required message data');
    }

    // Validate chatId format
    if (!chatId.includes('_admin')) {
      throw new Error('Invalid chat ID format');
    }
    
    // Ensure chat exists first
    await ensureChatExists(userId);
    
    // Add message to Firebase
    const messageData = {
      text: text.trim(),
      sender,
      senderName,
      timestamp: serverTimestamp(),
      chatId,
      userId,
      read: false,
      createdAt: serverTimestamp()
    };

    console.log('ChatUtils: Adding message to Firebase...');
    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    console.log('ChatUtils: Message added with ID:', messageRef.id);

    // Update chat document with last message info
    const chatRef = doc(db, 'chats', chatId);
    const chatUpdateData = {
      lastMessage: text.trim(),
      lastMessageTime: serverTimestamp(),
      lastSender: sender,
      isActive: true,
      // Increment unread count if message is from user
      ...(sender === 'user' && { 
        unreadCount: increment(1)
      })
    };
    
    console.log('ChatUtils: Updating chat document...');
    await updateDoc(chatRef, chatUpdateData);
    console.log('ChatUtils: Chat updated successfully');
  } catch (error) {
    console.error('ChatUtils: Error sending message:', error);
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const markMessagesAsRead = async (chatId: string, sender: 'user' | 'admin'): Promise<void> => {
  try {
    console.log('ChatUtils: Marking messages as read for chatId:', chatId, 'sender:', sender);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('sender', '==', sender),
      where('read', '==', false)
    );
    
    const unreadSnapshot = await getDocs(messagesQuery);
    console.log('ChatUtils: Found unread messages:', unreadSnapshot.size);
    
    const updatePromises = unreadSnapshot.docs.map(messageDoc => 
      updateDoc(doc(db, 'messages', messageDoc.id), { read: true })
    );
    
    await Promise.all(updatePromises);
    console.log('ChatUtils: Marked messages as read:', unreadSnapshot.size);

    // Reset unread count in chat document if marking admin messages as read
    if (sender === 'admin') {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, { unreadCount: 0 });
    }
  } catch (error) {
    console.error('ChatUtils: Error marking messages as read:', error);
    throw new Error(`Failed to mark messages as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getUnreadCount = async (chatId: string, sender: 'user' | 'admin'): Promise<number> => {
  try {
    const unreadQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('sender', '==', sender),
      where('read', '==', false)
    );
    
    const unreadSnapshot = await getDocs(unreadQuery);
    return unreadSnapshot.size;
  } catch (error) {
    console.error('ChatUtils: Error getting unread count:', error);
    return 0;
  }
};

export const getAllUserChats = async (): Promise<ChatUser[]> => {
  try {
    console.log('ChatUtils: Getting all user chats...');
    
    const chatsQuery = query(
      collection(db, 'chats'),
      orderBy('lastMessageTime', 'desc')
    );
    
    const chatsSnapshot = await getDocs(chatsQuery);
    const chatUsers: ChatUser[] = [];
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      const userId = chatData.userId;
      
      if (!userId) continue;
      
      // Get user data
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Get unread count
        const unreadCount = await getUnreadCount(chatDoc.id, 'user');
        
        chatUsers.push({
          id: userId,
          email: userData.email || '',
          displayName: userData.displayName || 'Unknown User',
          lastMessage: chatData.lastMessage || '',
          lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
          unreadCount,
          isVIP: userData.isVIP || false
        });
      }
    }
    
    console.log('ChatUtils: Found chat users:', chatUsers.length);
    return chatUsers;
  } catch (error) {
    console.error('ChatUtils: Error getting user chats:', error);
    return [];
  }
};