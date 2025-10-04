import React from 'react';
import { View, Text } from 'react-native';

function TestApp() {
  console.log('TestApp loaded successfully!');

  return (
    <View
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
      <Text style={{ fontSize: 20, color: '#000' }}>FX Simulator Test</Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 10 }}>JavaScript Connected!</Text>
    </View>
  );
}

export default TestApp;
