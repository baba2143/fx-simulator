import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DatabaseInit } from './src/services/database/DatabaseInit';

function App(): JSX.Element {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await DatabaseInit.init();
        setDbInitialized(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setDbError(errorMessage);
      }
    };

    // Add a small delay to ensure native modules are ready
    const timer = setTimeout(() => {
      initializeDatabase();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (dbError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorMessage}>{dbError}</Text>
        <Text style={styles.errorHint}>Please restart the app</Text>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

export default App;
