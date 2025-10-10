
/**
 * Global TypeScript declarations
 */

// Extend Window interface for Google Analytics
interface Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}

// React Native ErrorUtils
declare const ErrorUtils: {
  setGlobalHandler: (handler: (error: Error, isFatal: boolean) => void) => void;
  getGlobalHandler: () => ((error: Error, isFatal: boolean) => void) | undefined;
};

// Environment variables
declare module '@env' {
  export const REACT_APP_FIREBASE_API_KEY: string;
  export const REACT_APP_FIREBASE_AUTH_DOMAIN: string;
  export const REACT_APP_FIREBASE_PROJECT_ID: string;
  export const REACT_APP_FIREBASE_STORAGE_BUCKET: string;
  export const REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
  export const REACT_APP_FIREBASE_APP_ID: string;
  export const REACT_APP_FIREBASE_MEASUREMENT_ID: string;
}
