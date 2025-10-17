
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Initialize app polyfills and configurations
export function initializeApp() {
  console.log('🚀 Initializing app...');
  
  try {
    // Initialize TurboModule polyfill if needed
    if (Platform.OS !== 'web' && typeof global !== 'undefined') {
      if (!global.TurboModuleRegistry) {
        console.log('🔧 Setting up TurboModule polyfill...');
        global.TurboModuleRegistry = {
          getEnforcing: (name: string) => {
            console.warn(`TurboModuleRegistry.getEnforcing called for: ${name}`);
            return {};
          },
          get: (name: string) => {
            console.warn(`TurboModuleRegistry.get called for: ${name}`);
            return null;
          },
        };
      }
    }
    
    console.log('✅ App initialization complete');
  } catch (error) {
    console.error('❌ App initialization error:', error);
  }
}

// Auto-initialize
initializeApp();
