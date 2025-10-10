
import { logError } from './analyticsUtils';

/**
 * Global Error Logger
 * 
 * Sets up global error handlers to catch and log unhandled errors
 * and promise rejections.
 */

export function setupErrorLogging() {
  console.log('🔧 ErrorLogger: Setting up global error handlers');

  // Handle uncaught errors
  if (typeof ErrorUtils !== 'undefined') {
    const originalHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('❌ ErrorLogger: Uncaught error:', error);
      console.error('❌ ErrorLogger: Is fatal:', isFatal);

      // Log to analytics
      logError(
        error?.message || 'Unknown error',
        'GlobalErrorHandler'
      ).catch(err => {
        console.error('❌ ErrorLogger: Failed to log error to analytics:', err);
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    console.log('✅ ErrorLogger: Global error handler set up');
  }

  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ ErrorLogger: Unhandled promise rejection:', event.reason);

      // Log to analytics
      logError(
        event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
        'UnhandledPromiseRejection'
      ).catch(err => {
        console.error('❌ ErrorLogger: Failed to log error to analytics:', err);
      });
    });

    console.log('✅ ErrorLogger: Unhandled rejection handler set up');
  }

  console.log('✅ ErrorLogger: Error logging setup complete');
}

/**
 * Manually log an error
 * 
 * @param error - Error object or message
 * @param context - Context where error occurred
 */
export async function logErrorManually(error: Error | string, context: string = 'Unknown') {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  console.error(`❌ ErrorLogger [${context}]:`, errorMessage);
  
  try {
    await logError(errorMessage, context);
  } catch (err) {
    console.error('❌ ErrorLogger: Failed to log error to analytics:', err);
  }
}

export default setupErrorLogging;
