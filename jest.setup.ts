jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native', () => require('./jest.react-native-mock'));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
    useNavigation: () => navigation,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => children,
      Screen: ({ component: Component, initialParams }: { component: React.ComponentType<any>; initialParams?: unknown }) =>
        React.createElement(Component, { navigation: {}, route: { params: initialParams } }),
    }),
  };
});

// Define global variables required by React Native
(globalThis as typeof globalThis & { __DEV__: boolean }).__DEV__ =
  process.env.NODE_ENV !== 'production';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
