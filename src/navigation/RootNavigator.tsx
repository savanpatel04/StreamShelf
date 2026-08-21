import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { MyListScreen } from '../screens/MyListScreen';
import { colors, spacing } from '../theme';
import type { HomeStackParamList, MyListStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const MyListStack = createNativeStackNavigator<MyListStackParamList>();

const screenOptions = {
  headerShown: false,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

function TopBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  const goToTab = (tab: 'HomeTab' | 'MyListTab') => {
    const screen = tab === 'HomeTab' ? 'HomeFeed' : 'MyListFeed';
    navigation.reset({
      index: 0,
      routes: [{ name: tab, params: { screen } }],
    });
  };

  return (
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top, spacing.sm) }]}> 
      <Pressable onPress={() => goToTab('HomeTab')} accessibilityRole="button" accessibilityLabel="Go to Home">
        <Text style={styles.brand}>StreamShelf</Text>
      </Pressable>

      <View style={styles.navGroup}>
        <Pressable onPress={() => goToTab('HomeTab')}>
          <Text style={styles.navItem}>Home</Text>
        </Pressable>
        <Pressable onPress={() => goToTab('MyListTab')}>
          <Text style={styles.navItem}>My List</Text>
        </Pressable>
        <Pressable style={styles.profileButton} accessibilityRole="button" onPress={() => {}}>
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="HomeFeed"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <HomeStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({ title: route.params.preview?.name ?? 'Details' })}
      />
    </HomeStack.Navigator>
  );
}

function MyListStackNavigator() {
  return (
    <MyListStack.Navigator screenOptions={screenOptions}>
      <MyListStack.Screen
        name="MyListFeed"
        component={MyListScreen}
        options={{ title: 'My List' }}
      />
      <MyListStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }) => ({ title: route.params.preview?.name ?? 'Details' })}
      />
    </MyListStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <View style={styles.appShell}>
      <TopBar />
      <Tab.Navigator tabBar={() => null} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
        <Tab.Screen name="MyListTab" component={MyListStackNavigator} options={{ title: 'My List' }} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: '#F4F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#D7E7FF',
  },
  brand: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCEEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 17,
  },
});
