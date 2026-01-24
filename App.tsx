import React from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthBootstrap } from './src/viewmodels/useAuthViewModel';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const loading = useAuthBootstrap();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <RootNavigator />
      )}
    </SafeAreaProvider>
  );
}

export default App;
