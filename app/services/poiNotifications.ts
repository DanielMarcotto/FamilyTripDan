import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { POI } from '@/context/NavigationContext';
import { logEvent, AnalyticsEvents } from '@/services/analytics';
import PreferencesManager from '@/utils/LocalSettings';

// Distanza minima per considerare un POI "vicino" (in metri)
const PROXIMITY_DISTANCE = 500; // 500 metri

// Set di POI per cui abbiamo già inviato notifiche (per evitare spam)
const notifiedPOIs = new Set<string>();

// Ultima posizione dell'utente
let lastUserCoords: { latitude: number; longitude: number } | null = null;

/**
 * Verifica i permessi per le notifiche e li richiede se necessario
 * @returns true se i permessi sono concessi, false altrimenti
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (__DEV__) {
      console.log(`📱 Status permessi notifiche: ${existingStatus}`);
    }
    
    if (existingStatus === 'granted') {
      return true;
    }

    // Richiedi i permessi se non sono già concessi
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    if (__DEV__) {
      if (status === 'granted') {
        console.log('✅ Permessi notifiche concessi');
      } else {
        console.warn('❌ Permessi notifiche NON concessi. Status:', status);
        console.warn('   Per abilitare le notifiche:');
        console.warn('   - iOS: Impostazioni > App > Notifiche');
        console.warn('   - Android: Impostazioni > App > Notifiche (o nelle impostazioni del simulatore)');
      }
    }

    return status === 'granted';
  } catch (error) {
    console.error('Errore durante la verifica dei permessi notifiche:', error);
    return false;
  }
}

/**
 * Calcola la distanza tra due coordinate usando la formula di Haversine
 */
function getDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const R = 6371000; // Raggio della Terra in metri
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifica se l'utente è vicino a un POI e invia una notifica se necessario
 */
export async function checkPOIProximity(
  userCoords: { latitude: number; longitude: number } | null,
  poiList: POI[]
): Promise<void> {
  if (!userCoords || !poiList || poiList.length === 0) {
    return;
  }

  // Verifica se la posizione è cambiata significativamente
  if (lastUserCoords) {
    const distanceMoved = getDistance(lastUserCoords, userCoords);
    // Se l'utente non si è mosso molto, non controllare di nuovo (ottimizzazione)
    if (distanceMoved < 50) {
      return;
    }
  }

  lastUserCoords = userCoords;

  // Trova i POI vicini
  const nearbyPOIs = poiList.filter((poi) => {
    if (!poi.coordinates || !isFinite(poi.distance)) {
      return false;
    }

    const distance = poi.distance;
    
    // Se il POI è già stato notificato, non inviare di nuovo
    if (notifiedPOIs.has(poi.id)) {
      return false;
    }

    return distance <= PROXIMITY_DISTANCE;
  });

  // Invia notifiche per i POI vicini
  for (const poi of nearbyPOIs) {
    await sendPOIProximityNotification(poi);
    notifiedPOIs.add(poi.id);
  }
}

/**
 * Invia una notifica quando l'utente è vicino a un POI
 * 
 * @example
 * // Per simulare/testare una notifica:
 * import { sendPOIProximityNotification } from '@/services/poiNotifications';
 * 
 * await sendPOIProximityNotification({
 *   id: 'test-poi-1',
 *   title: 'Museo del Test',
 *   address: 'Via Test 123, Roma',
 *   category: 'museum',
 *   coordinates: { latitude: 41.9028, longitude: 12.4964 },
 *   distance: 100,
 *   // ... altri campi opzionali
 * });
 */
export async function sendPOIProximityNotification(poi: POI): Promise<void> {
  try {
    if (__DEV__) {
      console.log('📲 Tentativo di invio notifica POI:', poi.title);
    }

    // Verifica la preferenza utente per le notifiche (toggle nelle impostazioni)
    const manager = PreferencesManager.getInstance();
    await manager.initialize(); // Assicurati che sia inizializzato
    const userWantsNotifications = await manager.getNotificationPreference();
    
    if (__DEV__) {
      console.log('👤 Preferenza utente notifiche:', userWantsNotifications);
    }
    
    if (!userWantsNotifications) {
      if (__DEV__) {
        console.log('🔕 Notifica non inviata: utente ha disabilitato le notifiche nelle impostazioni');
      }
      return; // L'utente ha disabilitato le notifiche nelle impostazioni dell'app
    }

    // Verifica i permessi di sistema prima di inviare la notifica
    const hasPermissions = await checkNotificationPermissions();
    if (__DEV__) {
      console.log('🔐 Permessi sistema notifiche:', hasPermissions);
    }
    
    if (!hasPermissions) {
      if (__DEV__) {
        console.warn('⚠️ Impossibile inviare notifica: permessi di sistema non concessi');
      }
      return;
    }

    // Assicurati che il canale Android sia configurato prima di inviare la notifica
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifiche POI',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
      
      if (__DEV__) {
        const channels = await Notifications.getNotificationChannelsAsync();
        console.log('📱 Canali notifica Android disponibili:', channels?.map(c => ({
          id: c.id,
          name: c.name,
          importance: c.importance,
        })));
      }
    }

    // Configurazione notifica ottimizzata per background
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Sei vicino a ${poi.title}`,
        body: poi.address || `Scopri questo punto di interesse!`,
        data: {
          poiId: poi.id,
          type: 'poi_proximity',
        },
        sound: true,
        // iOS: Assicura che la notifica appaia anche quando l'app è in background
        ...(Platform.OS === 'ios' && {
          badge: 1, // Mostra badge
          categoryId: 'poi_proximity', // Categoria per azioni personalizzate (opzionale)
        }),
        // Android: Configurazione completa per background
        ...(Platform.OS === 'android' && {
          android: {
            channelId: 'default',
            priority: 'high', // Priorità alta per mostrare anche in background
            visibility: 'public', // Visibilità pubblica
            sound: 'default',
            vibrate: [0, 250, 250, 250],
            // Assicura che la notifica appaia anche quando lo schermo è spento
            lights: true,
            lightColor: '#FF231F7C',
          },
        }),
      },
      trigger: null, // Invia immediatamente
    });
    
    // Log POI proximity event
    logEvent(AnalyticsEvents.POI_PROXIMITY, {
      poi_id: poi.id,
      poi_name: poi.title,
      poi_category: poi.category,
    });
    
    if (__DEV__) {
      console.log(`✅ Notifica POI programmata con successo (ID: ${notificationId}): ${poi.title}`);
      console.log(`   Platform: ${Platform.OS}, Channel: default`);
    }
  } catch (error: any) {
    // Handle case where notifications are not available (e.g., Expo Go SDK 53+)
    if (error?.message?.includes('removed from Expo Go') || error?.message?.includes('development build')) {
      if (__DEV__) {
        console.info(
          '📱 Notifiche locali non disponibili in Expo Go. ' +
          'Per abilitarle, esegui: npx expo run:ios o npx expo run:android dopo aver completato il prebuild.'
        );
      }
    } else {
      console.error('Error sending POI proximity notification:', error);
    }
  }
}

/**
 * Resetta la lista dei POI notificati (utile quando l'utente si allontana)
 */
export function resetNotifiedPOIs(): void {
  notifiedPOIs.clear();
}

/**
 * Rimuove un POI dalla lista dei notificati (utile se l'utente si allontana)
 */
export function removeNotifiedPOI(poiId: string): void {
  notifiedPOIs.delete(poiId);
}
