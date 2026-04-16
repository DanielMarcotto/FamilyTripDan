import 'react-native-gesture-handler'; 
import 'react-native-reanimated';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { StatusBarExpo } from '@/components/templates/Statusbar';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { BottomSheetProvider } from '@/context/BottomSheetContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationProvider } from '@/context/NavigationContext';
import { initializeAnalytics } from '@/services/analytics';
import { initializeCrashlytics } from '@/services/crashlytics';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
// Import background location task to register it
import '@/tasks/backgroundLocation';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Request tracking permission on iOS before initializing analytics
      (async () => {
        if (Platform.OS === 'ios') {
          try {
            // Add a small delay to ensure the app is fully active before showing the prompt
            await new Promise(resolve => setTimeout(resolve, 500));
            const { status } = await requestTrackingPermissionsAsync();
            
            if (status === 'granted') {
              // Only initialize analytics if tracking permission is granted
              await initializeAnalytics();
            } else {
              // Analytics will be disabled if permission is not granted
              console.log('Tracking permission not granted, analytics will be disabled');
            }
          } catch (error) {
            console.error('Error requesting tracking permission:', error);
            // If there's an error, don't initialize analytics
          }
        } else {
          // On Android, initialize analytics without tracking permission request
          // (Android handles this differently)
          await initializeAnalytics();
        }
        
        // Initialize Crashlytics regardless of tracking permission
        initializeCrashlytics().catch((error) => {
          console.error('Failed to initialize crashlytics:', error);
        });
      })();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
     <NavigationProvider>
        <NotificationsProvider>
          <AuthProvider>
            <FavoritesProvider>
              <BottomSheetProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </BottomSheetProvider>
            </FavoritesProvider>
          </AuthProvider>
        </NotificationsProvider>
     </NavigationProvider>
    </GestureHandlerRootView>
  );
}
