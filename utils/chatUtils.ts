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
  getDoc
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
    // Check if chat already exists
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      // Create new chat document
      await setDoc(chatRef, {
        userId: userId,
        adminId: 'admin',
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        participants: [userId, 'admin']
      });
      console.log('New chat created for user:', userId);
    } else {
      console.log('Chat already exists for user:', userId);
    }
    
    return chatId;
  } catch (error) {
    console.error('Error ensuring chat exists:', error);
    throw error;
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
    console.log('Sending message:', { chatId, sender, text: text.substring(0, 50) });
    
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

    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    console.log('Message added with ID:', messageRef.id);

    // Update chat document with last message info
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: text.trim(),
      lastMessageTime: serverTimestamp(),
      lastSender: sender
    });

    console.log('Chat updated with last message info');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (chatId: string, sender: 'user' | 'admin'): Promise<void> => {
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('sender', '==', sender),
      where('read', '==', false)
    );
    
    const unreadSnapshot = await getDocs(messagesQuery);
    const updatePromises = unreadSnapshot.docs.map(messageDoc => 
      updateDoc(doc(db, 'messages', messageDoc.id), { read: true })
    );
    
    await Promise.all(updatePromises);
    console.log('Marked messages as read:', unreadSnapshot.size);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
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
    console.error('Error getting unread count:', error);
    return 0;
  }
};