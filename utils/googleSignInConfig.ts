// Google Sign-In has been removed to prevent build errors
// This file is kept for compatibility but all functions are disabled

export const configureGoogleSignIn = async () => {
  console.log('Google Sign-In has been disabled');
  return false;
};

export const isGoogleSignInAvailable = () => {
  return false;
};

export const performGoogleSignIn = async () => {
  throw new Error('Google Sign-In has been disabled');
};

export const signOutFromGoogle = async () => {
  console.log('Google Sign-In has been disabled');
};