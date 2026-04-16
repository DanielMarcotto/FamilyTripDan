import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useLastNotificationResponse } from 'expo-notifications';
import { router } from 'expo-router';
import { saveNotificationToken } from '@/services/api';
import { logEvent, AnalyticsEvents } from '@/services/analytics';

interface NotificationsContextProps {
  initializeNotifications: () => Promise<void>;
  expoPushToken: string | null;
}

export const NotificationsContext = createContext<NotificationsContextProps>({
  initializeNotifications: async () => { },
  expoPushToken: null,
});

export const useNotifications = () => {
  return useContext(NotificationsContext) as NotificationsContextProps;
}

// Configure how notifications are handled when app is foregrounded
// IMPORTANTE: Questo handler controlla solo le notifiche quando l'app è in foreground
// Le notifiche quando l'app è in background sono gestite direttamente dal sistema
try {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Log per debug
      if (__DEV__) {
        console.log('🔔 Notifica ricevuta in foreground:', {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
      }
      
      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true, // Mostra il banner della notifica in foreground
        shouldShowList: true, // Aggiunge la notifica alla lista delle notifiche
        shouldShowAlert: true, // Mostra alert anche in foreground (iOS)
      };
    },
  });
} catch (error) {
  // Handle case where notifications are not available (e.g., Expo Go SDK 53+)
  if (__DEV__) {
    console.info('Notifications handler not available in Expo Go. Development build required.');
    console.error('Error setting notification handler:', error);
  }
}

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastNotificationResponse = useLastNotificationResponse();

  // Handle last notification response (cold start scenario)
  useEffect(() => {
    if (lastNotificationResponse) {
      const data = lastNotificationResponse.notification.request.content.data;
      console.log('App opened from notification (cold start):', lastNotificationResponse);
      
      // Log notification opened event from background/quit state
      logEvent(AnalyticsEvents.NOTIFICATION_OPENED, {
        notification_type: data?.type || 'unknown',
        poi_id: data?.poiId || null,
        app_state: 'quit', // App was closed when notification was received
      });
      
      // Handle navigation based on notification data
      if (data?.poiId && data?.type === 'poi_proximity') {
        // Navigate to POI detail page
        const poiId = String(data.poiId);
        router.push({ pathname: '/destinations/poi', params: { destinationId: poiId } });
      }
    }
  }, [lastNotificationResponse]);

  useEffect(() => {
    // Track app state changes to determine if app is in foreground or background
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
    });

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Determine if app is in foreground or background
      const currentAppState = appState.current;
      const appStateLabel = currentAppState === 'active' ? 'foreground' : 'background';
      
      // Log notification received event with app state
      logEvent(AnalyticsEvents.NOTIFICATION_RECEIVED, {
        notification_type: notification.request.content.data?.type || 'unknown',
        poi_id: notification.request.content.data?.poiId || null,
        app_state: appStateLabel,
      });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      // Determine app state when notification was opened
      // If app was in background, it's now becoming active
      const appStateLabel = appState.current === 'active' ? 'foreground' : 'background';
      
      // Log notification opened event with app state
      logEvent(AnalyticsEvents.NOTIFICATION_OPENED, {
        notification_type: data?.type || 'unknown',
        poi_id: data?.poiId || null,
        app_state: appStateLabel,
      });
      
      // Handle navigation based on notification data
      if (data?.poiId && data?.type === 'poi_proximity') {
        // Navigate to POI detail page
        const poiId = String(data.poiId);
        router.push({ pathname: '/destinations/poi', params: { destinationId: poiId } });
      }
    });

    return () => {
      subscription.remove();
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotificationsAsync = async (retryCount = 0): Promise<string | null> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 5000]; // Exponential backoff delays in ms

    try {
      // 1. Ask for permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        // For iOS, explicitly request alert, badge, and sound permissions
        try {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
            },
          });
          finalStatus = status;
        } catch (error: any) {
          // Handle OutOfMemoryError when requesting permissions
          if (error?.message?.includes('OutOfMemoryError') || error?.cause?.message?.includes('OutOfMemoryError')) {
            console.warn('[Notifications] OutOfMemoryError requesting permissions. Retrying after delay...');
            if (retryCount < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[retryCount]));
              return registerForPushNotificationsAsync(retryCount + 1);
            }
            console.error('[Notifications] Max retries reached for permission request');
            return null;
          }
          throw error;
        }
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notifications permission not granted');
        return null;
      }

      // 2. Configure Android notification channel (iOS doesn't use channels)
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
            enableVibrate: true,
            showBadge: true,
          });
        } catch (error: any) {
          // Non-critical error, continue anyway
          if (__DEV__) {
            console.warn('[Notifications] Error setting notification channel:', error);
          }
        }
      }

      // 3. Get the Expo push token (this is where WebSocket connection happens)
      let tokenData;
      try {
        tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: '4ee3e469-2f5e-4ce5-ac13-5f0ef28241fa', // From app.json
        });
      } catch (error: any) {
        // Handle OutOfMemoryError when getting push token (WebSocket connection)
        if (error?.message?.includes('OutOfMemoryError') || 
            error?.cause?.message?.includes('OutOfMemoryError') ||
            error?.stack?.includes('OutOfMemoryError') ||
            error?.stack?.includes('WebSocket')) {
          console.warn('[Notifications] OutOfMemoryError getting push token (WebSocket). Retrying after delay...');
          if (retryCount < MAX_RETRIES) {
            // Wait longer before retrying WebSocket connection
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[retryCount]));
            return registerForPushNotificationsAsync(retryCount + 1);
          }
          console.error('[Notifications] Max retries reached for push token. App may be low on memory.');
          // Don't crash the app, just return null
          return null;
        }
        throw error;
      }
      
      const token = tokenData.data;
      setExpoPushToken(token);
      
      // 4. Save token to backend (non-blocking, don't fail if this errors)
      try {
        await saveNotificationToken(token);
        console.log('Push token saved to backend');
      } catch (error) {
        // Non-critical error, token is still set locally
        console.error('Error saving push token to backend:', error);
      }
      
      return token;
    } catch (error: any) {
      // Handle case where remote push notifications are not available (e.g., Expo Go SDK 53+)
      if (error?.message?.includes('removed from Expo Go') || error?.message?.includes('development build')) {
        if (__DEV__) {
          console.info(
            '📱 Push notifications remote non disponibili in Expo Go SDK 53+. ' +
            'Per abilitarle, esegui: npx expo run:ios o npx expo run:android dopo aver completato il prebuild. ' +
            'Vedi: https://docs.expo.dev/develop/development-builds/introduction/'
          );
        }
      } else if (error?.message?.includes('OutOfMemoryError') || 
                 error?.cause?.message?.includes('OutOfMemoryError') ||
                 error?.stack?.includes('OutOfMemoryError')) {
        // Retry on OutOfMemoryError
        if (retryCount < MAX_RETRIES) {
          console.warn(`[Notifications] OutOfMemoryError. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[retryCount]));
          return registerForPushNotificationsAsync(retryCount + 1);
        }
        console.error('[Notifications] Max retries reached. App may be low on memory.');
      } else {
        console.error('Error getting push token:', error);
      }
      return null;
    }
  };

  const initializeNotifications = async () => {
    try {
      await resetBadgeCount();
    } catch (error) {
      // Non-critical error, continue anyway
      console.warn('[Notifications] Error resetting badge count:', error);
    }
    
    // Register for push notifications with error handling
    // This may fail silently if memory is low, which is acceptable
    try {
      await registerForPushNotificationsAsync();
    } catch (error) {
      // Already handled in registerForPushNotificationsAsync, but catch here to prevent crashes
      console.error('[Notifications] Error initializing notifications:', error);
    }
  };

  async function resetBadgeCount() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error resetting badge count:', error);
    }
  }

  return (
    <NotificationsContext.Provider value={{ initializeNotifications, expoPushToken }}>
      {children}
    </NotificationsContext.Provider>
  );
};