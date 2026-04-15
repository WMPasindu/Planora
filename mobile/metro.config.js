const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/**
 * Zustand’s package exports map `import` → `esm/*.mjs`, which uses `import.meta.env`.
 * Metro’s web bundle can pick that build and the browser throws
 * "Cannot use 'import.meta' outside a module".
 * Force the CommonJS `*.js` files (same as the `react-native` export condition).
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand') {
    return {
      filePath: path.join(__dirname, 'node_modules/zustand/index.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName.startsWith('zustand/')) {
    const sub = moduleName.slice('zustand/'.length);
    return {
      filePath: path.join(__dirname, 'node_modules/zustand', `${sub}.js`),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
