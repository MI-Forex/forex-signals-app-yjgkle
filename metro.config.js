const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
    new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Enhanced resolver configuration
config.resolver = {
  ...config.resolver,
  alias: {
    // Force react-async-hook to resolve to the correct version
    'react-async-hook': path.resolve(__dirname, 'node_modules/react-async-hook'),
  },
  // Ensure proper module resolution
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
  // Add node_modules resolution
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
  // Ensure we can resolve modules from nested node_modules
  disableHierarchicalLookup: false,
  // Add resolver for native modules
  unstable_enableSymlinks: false,
};

// Enhanced transformer configuration
config.transformer = {
  ...config.transformer,
  // Use the default transformer from Expo instead of explicitly requiring metro-react-native-babel-transformer
  // This ensures compatibility with Expo's build system
  babelTransformerPath: require.resolve('@expo/metro-runtime/build/transformer'),
  // Enable hermesParser for better performance
  hermesParser: true,
};

// Add watchFolders to ensure Metro watches the correct directories
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];

// Add serializer configuration for better module handling
config.serializer = {
  ...config.serializer,
  // Ensure proper module serialization
  getModulesRunBeforeMainModule: () => [
    require.resolve('react-native/Libraries/Core/InitializeCore'),
  ],
};

module.exports = config;