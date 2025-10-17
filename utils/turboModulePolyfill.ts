
import { Platform } from 'react-native';

// Simple TurboModule polyfill for compatibility
export function initializeTurboModulePolyfill() {
  console.log('🔧 Initializing TurboModule polyfill...');
  
  try {
    // Only add polyfills if they don't exist
    if (typeof global !== 'undefined' && !global.TurboModuleRegistry) {
      console.warn('🔧 TurboModuleRegistry not found, creating minimal polyfill...');
      
      global.TurboModuleRegistry = {
        getEnforcing: (name: string) => {
          console.warn(`🔇 TurboModuleRegistry.getEnforcing called for: ${name}`);
          
          // Return minimal mock for PlatformConstants
          if (name === 'PlatformConstants') {
            return {
              getConstants: () => ({
                osVersion: Platform.Version,
                systemName: Platform.OS,
              }),
            };
          }
          
          return {};
        },
        get: (name: string) => {
          console.warn(`🔇 TurboModuleRegistry.get called for: ${name}`);
          return null;
        },
      };
    }
    
    console.log('✅ TurboModule polyfill initialized');
  } catch (error) {
    console.error('❌ TurboModule polyfill error:', error);
  }
}

// Auto-initialize
if (Platform.OS !== 'web') {
  initializeTurboModulePolyfill();
}
