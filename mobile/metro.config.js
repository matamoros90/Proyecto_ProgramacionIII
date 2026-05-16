const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Forzar que Metro resuelva las exportaciones "react-native" de los paquetes
// Firebase. Sin esto, getReactNativePersistence no se exporta correctamente.
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
];

module.exports = config;
