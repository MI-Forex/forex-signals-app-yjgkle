<<<<<<< HEAD
=======

>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
<<<<<<< HEAD
=======
      'react-native-reanimated/plugin',
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      [
        'module-resolver',
        {
          root: ['./'],
<<<<<<< HEAD
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './',
            '@components': './components',
            '@style': './style',
            '@hooks': './hooks',
            '@types': './types',
=======
          alias: {
            '@': './',
            '@components': './components',
            '@utils': './utils',
            '@styles': './styles',
            '@contexts': './contexts',
            '@firebase': './firebase',
            // Firebase module aliases to fix resolution issues
            'firebase/app': '@firebase/app',
            'firebase/auth': '@firebase/auth',
            'firebase/firestore': '@firebase/firestore',
            'firebase/storage': '@firebase/storage',
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
          },
        },
      ],
    ],
  };
};
