import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/commonStyles';
import { useAuth } from '../../contexts/AuthContext';

export default function TabLayout() {
  console.log('TabLayout: Component rendering');
  const { userData } = useAuth();
  
  // Check if user is admin or editor - more comprehensive check
  const isAdminOrEditor = userData && (
    userData.isAdmin === true || 
    userData.role === 'admin' || 
    userData.isEditor === true || 
    userData.role === 'editor'
  );

  console.log('TabLayout: User data:', {
    uid: userData?.uid,
    role: userData?.role,
    isAdmin: userData?.isAdmin,
    isEditor: userData?.isEditor,
    isAdminOrEditor
  });

  console.log('TabLayout: Rendering tabs with isAdminOrEditor:', isAdminOrEditor);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="signals"
        options={{
          title: 'Signals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vip"
        options={{
          title: 'VIP',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
          // Hide VIP tab for admin and editor users
          href: isAdminOrEditor ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}