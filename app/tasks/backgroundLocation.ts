import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { checkPOIProximity } from '@/services/poiNotifications';
import PreferencesManager from '@/utils/LocalSettings';
import { POI } from '@/context/NavigationContext';

// Nome del task per il background location tracking
export const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Storage per i POI (necessario perché il task non può accedere direttamente al context React)
let cachedPOIList: POI[] = [];

/**
 * Aggiorna la lista dei POI nel task (chiamato dal NavigationContext)
 */
export function updatePOIListInTask(poiList: POI[]) {
  cachedPOIList = poiList;
  if (__DEV__) {
    console.log(`[BackgroundLocationTask] POI list updated: ${poiList.length} POI`);
  }
}

/**
 * Task manager per il background location tracking
 * Questo task viene eseguito anche quando l'app è completamente in background
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error('[BackgroundLocationTask] Error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1]; // Prendi l'ultima posizione
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (__DEV__) {
        console.log(`[BackgroundLocationTask] 📍 Location update in background:`, coords);
        console.log(`[BackgroundLocationTask] POI count: ${cachedPOIList.length}`);
      }

      // Verifica se l'utente vuole le notifiche
      try {
        const manager = PreferencesManager.getInstance();
        await manager.initialize();
        const userWantsNotifications = await manager.getNotificationPreference();

        if (!userWantsNotifications) {
          if (__DEV__) {
            console.log('[BackgroundLocationTask] 🔕 Notifiche disabilitate dall\'utente');
          }
          return;
        }

        // Controlla la prossimità ai POI
        if (cachedPOIList && cachedPOIList.length > 0) {
          await checkPOIProximity(coords, cachedPOIList);
          
          if (__DEV__) {
            console.log(`[BackgroundLocationTask] ✅ Proximity check completed`);
          }
        } else {
          if (__DEV__) {
            console.log(`[BackgroundLocationTask] ⚠️ No POI available for proximity check`);
          }
        }
      } catch (error) {
        console.error('[BackgroundLocationTask] Error checking proximity:', error);
      }
    }
  }
});
