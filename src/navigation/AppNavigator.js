import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../context/AuthContext'
import { ActivityIndicator, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'

// Screens import edilecek
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import HomeScreen from '../screens/main/HomeScreen'
import TournamentsScreen from '../screens/main/TournamentsScreen'
import LobbiesScreen from '../screens/main/LobbiesScreen'
import ProfileScreen from '../screens/main/ProfileScreen'
import NotificationsScreen from '../screens/main/NotificationsScreen'
import TournamentDetailsScreen from '../screens/main/TournamentDetailsScreen'

import UserGameProfilesScreen from '../screens/main/UserGameProfilesScreen'
import UserSearchScreen from '../screens/main/UserSearchScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// Loading komponenti
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: Colors.background 
  }}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
)

// Auth Stack - Giriş yapmamış kullanıcılar için
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
)

// Ana Tab Navigator - Giriş yapmış kullanıcılar için
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName

        if (route.name === 'Ana Sayfa') {
          iconName = focused ? 'home' : 'home-outline'
        } else if (route.name === 'Turnuvalar') {
          iconName = focused ? 'trophy' : 'trophy-outline'
        } else if (route.name === 'Bildirimler') {
          iconName = focused ? 'notifications' : 'notifications-outline'
        } else if (route.name === 'Profil') {
          iconName = focused ? 'person' : 'person-outline'
        }

        return <Ionicons name={iconName} size={size} color={color} />
      },
      tabBarActiveTintColor: Colors.tabBar.active,
      tabBarInactiveTintColor: Colors.tabBar.inactive,
      tabBarStyle: {
        backgroundColor: Colors.tabBar.background,
        borderTopWidth: 1,
        borderTopColor: Colors.card.border,
        height: 65,
        paddingBottom: 10,
        paddingTop: 10,
        shadowColor: Colors.card.shadow,
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: Colors.background,
        shadowColor: Colors.card.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
      headerTintColor: Colors.text.primary,
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: Colors.text.primary,
      },
    })}
  >
    <Tab.Screen 
      name="Ana Sayfa" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Tab.Screen 
      name="Turnuvalar" 
      component={TournamentsScreen}
      options={{
        headerTitle: '🏆 Turnuvalar',
      }}
    />
    <Tab.Screen 
      name="Bildirimler" 
      component={NotificationsScreen}
      options={{
        headerTitle: '🔔 Bildirimler',
      }}
    />
    <Tab.Screen 
      name="Profil" 
      component={ProfileScreen}
      options={{
        headerTitle: '👤 Profil',
      }}
    />
  </Tab.Navigator>
)

// Ana App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.card.background,
          text: Colors.text.primary,
          border: Colors.card.border,
          notification: Colors.primary,
        },
      }}
    >
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} options={{ headerShown: true, headerTitle: 'Turnuva Detayları' }} />

          <Stack.Screen name="UserGameProfiles" component={UserGameProfilesScreen} options={{ headerShown: true, headerTitle: 'Oyun Profilleri' }} />
          <Stack.Screen name="UserSearch" component={UserSearchScreen} options={{ headerShown: true, headerTitle: '👥 Kullanıcı Ara' }} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  )
}

export default AppNavigator 