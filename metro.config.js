
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
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Configure resolver for Firebase modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add node modules that should be resolved
config.resolver.nodeModulesPaths = [
  './node_modules',
  '../node_modules',
];

// Configure for better web support and Firebase module resolution
config.resolver.alias = {
  ...config.resolver.alias,
  // Fix Firebase module resolution issues
  'firebase/app': '@firebase/app',
  'firebase/auth': '@firebase/auth',
  'firebase/firestore': '@firebase/firestore',
  'firebase/storage': '@firebase/storage',
};

// Configure for better web support
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    'react-native': 'react-native-web',
  };
}

// Add Firebase specific resolver configuration
config.resolver.blockList = [
  // Block the main firebase package to prevent conflicts
  /node_modules\/firebase\/.*$/,
];

module.exports = config;
