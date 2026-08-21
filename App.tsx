import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CatalogProvider } from './src/state/CatalogContext';
import { MyListProvider } from './src/state/MyListContext';
import { DirectionalNavProvider } from './src/focus/DirectionalNav';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.surfaceRaised,
    primary: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <CatalogProvider>
        <MyListProvider>
          <DirectionalNavProvider>
            <NavigationContainer theme={navTheme}>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </DirectionalNavProvider>
        </MyListProvider>
      </CatalogProvider>
    </SafeAreaProvider>
  );
}
