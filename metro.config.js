
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle module resolution issues
config.resolver = {
  ...config.resolver,
  alias: {
    '@': __dirname,
    '@components': `${__dirname}/components`,
    '@utils': `${__dirname}/utils`,
    '@styles': `${__dirname}/styles`,
    '@contexts': `${__dirname}/contexts`,
    '@firebase': `${__dirname}/firebase`,
  },
  // Ensure proper handling of node modules
  nodeModulesPaths: [
    `${__dirname}/node_modules`,
  ],
};

// Add transformer configuration for better ES module handling
config.transformer = {
  ...config.transformer,
  // Enable hermetic builds for better module resolution
  unstable_allowRequireContext: true,
};

module.exports = config;
