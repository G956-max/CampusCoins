import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Navigators & Screens
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import ComplaintDetailScreen from '../screens/student/ComplaintDetailScreen';
import LeaderboardScreen from '../screens/student/LeaderboardScreen';
import MissionsScreen from '../screens/student/MissionsScreen';
import WalletScreen from '../screens/student/WalletScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Missions" component={MissionsScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

