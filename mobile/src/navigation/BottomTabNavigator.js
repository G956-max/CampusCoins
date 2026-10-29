import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/student/HomeScreen';
import ComplaintsListScreen from '../screens/student/ComplaintsListScreen';
import ReportIssueScreen from '../screens/student/ReportIssueScreen';
import RewardsStoreScreen from '../screens/student/RewardsStoreScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom Center (+) Button for Report Issue
const CustomReportButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.customButtonWrapper}
    activeOpacity={0.85}
    onPress={onPress}
  >
    <View style={styles.customButtonInner}>
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </View>
  </TouchableOpacity>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ComplaintsTab"
        component={ComplaintsListScreen}
        options={{
          tabBarLabel: 'Issues',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'alert-circle' : 'alert-circle-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ReportTab"
        component={ReportIssueScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <CustomReportButton {...props} />,
        }}
      />

      <Tab.Screen
        name="RewardsTab"
        component={RewardsStoreScreen}
        options={{
          tabBarLabel: 'Store',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'gift' : 'gift-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  customButtonWrapper: {
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default BottomTabNavigator;

