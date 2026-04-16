import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { StatusBarExpo } from '@/components/templates/Statusbar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    //SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="subscriptions" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="terms" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="version" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="account" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="language" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="food" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="security" options={{ headerShown: false, animation: 'none' }} />
      </Stack>
      <Toast
        position='bottom'
        bottomOffset={30}
      />
      <StatusBarExpo style="dark" />
    </ThemeProvider>
  );
}
