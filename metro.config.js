
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Firebase on web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper handling of Firebase modules
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Add transformer configuration for better Firebase support
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Configure for better web support
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    'react-native': 'react-native-web',
  };
}

module.exports = config;
