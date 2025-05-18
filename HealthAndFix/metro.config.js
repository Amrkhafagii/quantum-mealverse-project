
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for React Native with Web Support
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const { resolver: defaultResolver } = defaultConfig;

// Add web extensions to support React Native Web
const config = {
  resolver: {
    sourceExts: [
      ...defaultResolver.sourceExts,
      'web.js',
      'web.jsx',
      'web.ts',
      'web.tsx',
    ],
    // Make sure 'native' extensions take priority
    platforms: ['ios', 'android', 'native', 'web'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);
