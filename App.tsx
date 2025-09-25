import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DatabaseInit } from './src/services/database/DatabaseInit';

// データベース初期化
DatabaseInit.init().catch(console.error);

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

export default App;
