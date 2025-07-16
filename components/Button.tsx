import { Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, buttonStyles, spacing } from '../styles/commonStyles';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ 
  text, 
  onPress, 
  style, 
  textStyle, 
  variant = 'primary',
  disabled = false,
  loading = false
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [buttonStyles.base, buttonStyles.secondary];
      case 'success':
        return [buttonStyles.base, buttonStyles.success];
      case 'danger':
        return [buttonStyles.base, buttonStyles.danger];
      case 'outline':
        return [buttonStyles.base, buttonStyles.outline];
      default:
        return [buttonStyles.base, buttonStyles.primary];
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return colors.primary;
    }
    return colors.white;
  };

  return (
    <TouchableOpacity 
      style={[
        getButtonStyle(), 
        disabled && buttonStyles.disabled,
        style
      ]} 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});