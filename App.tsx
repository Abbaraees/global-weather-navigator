import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/paper';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
