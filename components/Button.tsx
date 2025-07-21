import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, buttonStyles, spacing, borderRadius, shadows, typography } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'gradient';
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  gradient?: string[];
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: spacing.sm,
  },
});

export default function Button({
  text,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'medium',
  gradient,
  children
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles = [buttonStyles.base];
    
    if (size === 'small') baseStyles.push(buttonStyles.small);
    if (size === 'large') baseStyles.push(buttonStyles.large);
    
    if (variant === 'primary') baseStyles.push(buttonStyles.primary);
    if (variant === 'secondary') baseStyles.push(buttonStyles.secondary);
    if (variant === 'success') baseStyles.push(buttonStyles.success);
    if (variant === 'danger') baseStyles.push(buttonStyles.danger);
    if (variant === 'warning') baseStyles.push(buttonStyles.warning);
    if (variant === 'outline') baseStyles.push(buttonStyles.outline);
    
    if (disabled) baseStyles.push(buttonStyles.disabled);
    
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
    if (variant === 'outline') return colors.text;
    return colors.white;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = size === 'small' ? buttonStyles.textSmall : buttonStyles.text;
    const colorStyle = variant === 'outline' ? buttonStyles.textOutline : { color: getTextColor() };
    
    return {
      ...baseTextStyle,
      ...colorStyle,
      ...(textStyle || {})
    };
  };

  const getGradientColors = (): string[] => {
    if (gradient) return gradient;
    
    switch (variant) {
      case 'primary':
        return colors.gradientPrimary;
      case 'success':
        return colors.gradientSuccess;
      case 'warning':
        return colors.gradientWarning;
      case 'danger':
        return colors.gradientDanger;
      default:
        return [colors.primary, colors.primaryDark];
    }
  };

  const buttonContent = (
    <View style={styles.content}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loadingIndicator}
        />
      )}
      {children || <Text style={getTextStyle()}>{text}</Text>}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), styles.button]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}