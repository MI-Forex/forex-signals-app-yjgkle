
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@utils': './utils',
            '@styles': './styles',
            '@contexts': './contexts',
            '@firebase': './firebase',
          },
        },
      ],
    ],
  };
};
