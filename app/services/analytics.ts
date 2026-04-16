/**
 * Servizio per gestire Google Analytics tramite Firebase
 */

// Lazy-loaded Firebase modules
let analyticsModule: typeof import('@react-native-firebase/analytics').default | null = null;
let firebaseAppModule: typeof import('@react-native-firebase/app') | null = null;

// Flag per tracciare se Firebase è disponibile
let isFirebaseAvailable = false;
let firebaseCheckAttempted = false;

/**
 * Carica i moduli Firebase in modo lazy
 */
async function loadFirebaseModules(): Promise<boolean> {
  if (firebaseCheckAttempted) {
    return isFirebaseAvailable;
  }

  firebaseCheckAttempted = true;

  try {
    // Prova a importare i moduli Firebase
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    analyticsModule = require('@react-native-firebase/analytics').default;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    firebaseAppModule = require('@react-native-firebase/app');
    
    // Verifica se Firebase App è inizializzato
    try {
      if (firebaseAppModule) {
        firebaseAppModule.getApp();
        isFirebaseAvailable = true;
        return true;
      }
      isFirebaseAvailable = false;
      return false;
    } catch {
      // Firebase non è inizializzato, ma i moduli sono disponibili
      isFirebaseAvailable = false;
      return false;
    }
  } catch {
    // I moduli Firebase non sono disponibili (es. in Expo Go o senza rebuild)
    if (__DEV__) {
      console.info(
        '📊 Firebase Analytics non disponibile. ' +
        'Per abilitarlo, esegui: npx expo prebuild --clean e poi ricostruisci l\'app. ' +
        'L\'app continuerà a funzionare normalmente senza Analytics.'
      );
    }
    isFirebaseAvailable = false;
    return false;
  }
}

/**
 * Inizializza Firebase Analytics
 * Chiamare questa funzione all'avvio dell'app
 */
export async function initializeAnalytics(): Promise<void> {
  try {
    const available = await loadFirebaseModules();
    if (!available || !analyticsModule) {
      return;
    }

    // Abilita la raccolta dati Analytics
    await analyticsModule().setAnalyticsCollectionEnabled(true);
    console.log('Firebase Analytics initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
    isFirebaseAvailable = false;
    // Non blocchiamo l'app se Analytics non funziona
  }
}

/**
 * Registra un evento personalizzato
 * @param eventName Nome dell'evento
 * @param params Parametri aggiuntivi dell'evento
 */
export async function logEvent(
  eventName: string,
  params?: { [key: string]: any }
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !analyticsModule) return;
  
  try {
    await analyticsModule().logEvent(eventName, params);
  } catch (error) {
    // Silenziosamente ignora errori se Firebase non è inizializzato
    if (__DEV__) {
      console.warn('Firebase Analytics not available for logEvent:', error);
    }
    isFirebaseAvailable = false;
  }
}

/**
 * Imposta una proprietà utente personalizzata
 * @param name Nome della proprietà
 * @param value Valore della proprietà
 */
export async function setUserProperty(
  name: string,
  value: string | null
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !analyticsModule) return;
  
  try {
    await analyticsModule().setUserProperty(name, value);
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Analytics not available for setUserProperty:', error);
    }
    isFirebaseAvailable = false;
  }
}

/**
 * Imposta l'ID utente
 * @param userId ID utente (null per rimuoverlo)
 */
export async function setUserId(userId: string | null): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !analyticsModule) return;
  
  try {
    await analyticsModule().setUserId(userId);
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Analytics not available for setUserId:', error);
    }
    isFirebaseAvailable = false;
  }
}

/**
 * Registra la visualizzazione di uno schermo
 * @param screenName Nome dello schermo
 * @param screenClass Classe dello schermo (opzionale)
 */
export async function logScreenView(
  screenName: string,
  screenClass?: string
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !analyticsModule) return;
  
  try {
    await analyticsModule().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    // Silenziosamente ignora errori se Firebase non è inizializzato
    if (__DEV__) {
      console.warn('Firebase Analytics not available for screen view:', error);
    }
    isFirebaseAvailable = false;
  }
}

/**
 * Abilita o disabilita la raccolta dati Analytics
 * Utile per rispettare le preferenze di privacy dell'utente
 * @param enabled true per abilitare, false per disabilitare
 */
export async function setAnalyticsCollectionEnabled(
  enabled: boolean
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !analyticsModule) return;
  
  try {
    await analyticsModule().setAnalyticsCollectionEnabled(enabled);
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Analytics not available for setAnalyticsCollectionEnabled:', error);
    }
    isFirebaseAvailable = false;
  }
}

/**
 * Reset dell'ID Analytics (utile per logout)
 */
export async function resetAnalytics(): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !analyticsModule) return;
  
  try {
    await analyticsModule().resetAnalyticsData();
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Analytics not available for resetAnalytics:', error);
    }
    isFirebaseAvailable = false;
  }
}

// Eventi predefiniti comuni per l'app
export const AnalyticsEvents = {
  // Eventi di navigazione
  SCREEN_VIEW: 'screen_view',
  
  // Eventi di autenticazione
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  LOGOUT: 'logout',
  
  // Eventi di POI
  POI_VIEWED: 'poi_viewed',
  POI_PROXIMITY: 'poi_proximity',
  POI_FAVORITE_ADDED: 'poi_favorite_added',
  POI_FAVORITE_REMOVED: 'poi_favorite_removed',
  
  // Eventi di destinazione
  DESTINATION_VIEWED: 'destination_viewed',
  DESTINATION_SELECTED: 'destination_selected',
  
  // Eventi di notifiche
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_OPENED: 'notification_opened',
  
  // Eventi generici
  BUTTON_CLICK: 'button_click',
  SEARCH: 'search',
} as const;
