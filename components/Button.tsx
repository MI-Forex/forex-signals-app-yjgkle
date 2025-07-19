import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, buttonStyles, spacing, borderRadius, shadows } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  size = 'medium'
}: ButtonProps) {
  
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles = [buttonStyles.base];
    
    // Size styles
    if (size === 'small') {
      baseStyles.push(styles.small);
    } else if (size === 'large') {
      baseStyles.push(styles.large);
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyles.push(buttonStyles.primary);
        break;
      case 'secondary':
        baseStyles.push(buttonStyles.secondary);
        break;
      case 'success':
        baseStyles.push(buttonStyles.success);
        break;
      case 'danger':
        baseStyles.push(buttonStyles.danger);
        break;
      case 'warning':
        baseStyles.push(buttonStyles.warning);
        break;
      case 'outline':
        baseStyles.push(buttonStyles.outline);
        break;
    }
    
    // Disabled state
    if (disabled || loading) {
      baseStyles.push(buttonStyles.disabled);
    }
    
    // Custom styles
    if (style) {
      if (Array.isArray(style)) {
        baseStyles.push(...style);
      } else {
        baseStyles.push(style);
      }
    }
    
    return baseStyles;
  };

  const getTextColor = (): string => {
    if (variant === 'outline') {
      return colors.text;
    }
    return colors.white;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseTextStyles = [
      buttonStyles.text,
      { color: getTextColor() }
    ];
    
    if (size === 'small') {
      baseTextStyles.push(styles.smallText);
    } else if (size === 'large') {
      baseTextStyles.push(styles.largeText);
    }
    
    if (variant === 'outline') {
      baseTextStyles.push(buttonStyles.textOutline);
    }
    
    if (textStyle) {
      baseTextStyles.push(textStyle);
    }
    
    return baseTextStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={{ marginRight: spacing.sm }} 
        />
      )}
      <Text style={getTextStyle()}>
        {loading ? 'Loading...' : text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
});