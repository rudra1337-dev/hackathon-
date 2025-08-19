import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import ProfileScreen from './screens/ProfileScreen';
import MedicalInfoScreen from './screens/MedicalInfoScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import ShareScreen from './screens/ShareScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0066CC',
    accent: '#FF4500',
    background: '#f7f7f7',
    surface: '#ffffff',
    error: '#B00020',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ title: 'Login' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen 
              name="Emergency" 
              component={EmergencyScreen} 
              options={{ 
                title: 'Emergency Info',
                headerStyle: { backgroundColor: '#FF4500' },
                headerTintColor: '#fff'
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ title: 'My Profile' }}
            />
            <Stack.Screen 
              name="MedicalInfo" 
              component={MedicalInfoScreen} 
              options={{ title: 'Medical Information' }}
            />
            <Stack.Screen 
              name="Documents" 
              component={DocumentsScreen} 
              options={{ title: 'Medical Documents' }}
            />
            <Stack.Screen 
              name="Share" 
              component={ShareScreen} 
              options={{ title: 'Share Records' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 