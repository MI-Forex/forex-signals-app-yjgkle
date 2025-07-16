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
    // Add any aliases if needed
  },
  // Ensure proper module resolution
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
};

// Enhanced transformer configuration
config.transformer = {
  ...config.transformer,
  // Ensure proper handling of async modules
  asyncRequireModulePath: require.resolve('metro-runtime/src/modules/asyncRequire'),
};

module.exports = config;