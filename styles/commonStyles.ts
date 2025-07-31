import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

export const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#93c5fd',
  secondary: '#64748b',
  success: '#10b981',
  successLight: '#6ee7b7',
  danger: '#ef4444',
  dangerLight: '#fca5a5',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceDisabled: '#f1f5f9',
  text: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  shadow: '#00000015',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Modern gradient colors
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  gradientPrimary: ['#3b82f6', '#8b5cf6'],
  gradientSuccess: ['#10b981', '#059669'],
  gradientWarning: ['#f59e0b', '#d97706'],
  gradientDanger: ['#ef4444', '#dc2626'],
  
  // Glass morphism colors
  glass: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  
  // Status colors
  info: '#3b82f6',
  infoLight: '#dbeafe',
  
  // Modern accent colors
  accent: '#8b5cf6',
  accentLight: '#c4b5fd',
  
  // Dark mode support (for future)
  surfaceDark: '#1e293b',
  textDark: '#f1f5f9',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    // Add web-compatible shadow
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    }),
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    // Add web-compatible shadow
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Add web-compatible shadow
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    // Add web-compatible shadow
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 16px rgba(0, 0, 0, 0.2)',
    }),
  },
  xxl: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    // Add web-compatible shadow
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 24px rgba(0, 0, 0, 0.25)',
    }),
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.25,
  },
};

export const buttonStyles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    flexDirection: 'row',
    ...shadows.sm,
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    borderRadius: borderRadius.lg,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  success: {
    backgroundColor: colors.success,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  textSmall: {
    ...typography.buttonSmall,
    color: colors.white,
  },
  textOutline: {
    ...typography.button,
    color: colors.text,
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
  textSecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  textMuted: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  cardModern: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  glassmorphism: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.xl,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  modernButton: {
    borderRadius: borderRadius.xl,
    ...shadows.md,
    overflow: 'hidden',
  },
});