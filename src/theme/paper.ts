import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Modern, bright and clean MD3 theme tuned for a weather app
export const theme = {
  ...DefaultTheme,
  roundness: 12,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0ea5e9', // sky-500
    secondary: '#06b6d4', // cyan-500
    tertiary: '#22d3ee', // cyan-400
    background: '#f8fafc', // slate-50
    surface: '#ffffff',
    surfaceVariant: '#e2f2ff',
    outline: '#cbd5e1',
    onPrimary: '#ffffff',
    onSurface: '#0f172a',
  },
};
