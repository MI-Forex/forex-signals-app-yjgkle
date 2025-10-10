import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface DevelopmentNoteProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  infoContainer: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  warningContainer: {
    backgroundColor: '#FFA50020',
    borderColor: '#FFA500',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
    borderWidth: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default function DevelopmentNote({ message, type = 'info' }: DevelopmentNoteProps) {
  const getContainerStyle = () => {
    switch (type) {
      case 'warning':
        return styles.warningContainer;
      case 'error':
        return styles.errorContainer;
      default:
        return styles.infoContainer;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#FFA500';
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      <Ionicons 
        name={getIconName() as any} 
        size={20} 
        color={getIconColor()} 
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}