import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/commonStyles';
import Button from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: 'monospace',
  },
});

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.log('ErrorBoundary: Error caught:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific TurboModule errors
    if (error.message.includes('TurboModuleRegistry') || error.message.includes('RNGoogleSignin')) {
      console.error('TurboModule error detected:', error.message);
    }
    
    // Log CSS style errors
    if (error.message.includes('CSSStyleDeclaration') || error.message.includes('indexed property')) {
      console.error('CSS style error detected:', error.message);
    }
  }

  resetError = () => {
    console.log('ErrorBoundary: Resetting error state');
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      console.log('ErrorBoundary: Rendering error UI');
      
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message?.includes('CSSStyleDeclaration') || this.state.error?.message?.includes('indexed property')
              ? 'The app encountered a styling issue. This is likely due to a compatibility problem with the web platform.'
              : 'The app encountered an unexpected error. This might be due to a missing native module or configuration issue.'
            }
          </Text>
          {this.state.error && (
            <Text style={styles.errorDetails}>
              {this.state.error.message}
            </Text>
          )}
          <Button
            text="Try Again"
            onPress={this.resetError}
          />
        </View>
      );
    }

    console.log('ErrorBoundary: Rendering children normally');
    return this.props.children;
  }
}

export default ErrorBoundary;