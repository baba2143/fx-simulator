/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App.tsx';
import { name as appName } from './app.json';

// Global error handler for unhandled promise rejections
if (!global.Promise) {
  global.Promise = require('promise');
}

// Catch unhandled promise rejections
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('Global error handler:', error, 'isFatal:', isFatal);
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

// Handle unhandled promise rejections
global.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

AppRegistry.registerComponent(appName, () => App);
