/**
 * Servizio per gestire Firebase Crashlytics
 */

// Lazy-loaded Firebase modules
// TEMPORANEAMENTE DISABILITATO: Crashlytics disattivato
let crashlyticsModule: typeof import('@react-native-firebase/crashlytics').default | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let firebaseAppModule: typeof import('@react-native-firebase/app') | null = null;

// Flag per tracciare se Firebase Crashlytics è disponibile
let isCrashlyticsAvailable = false;
let crashlyticsCheckAttempted = false;

/**
 * Verifica se i moduli nativi Firebase sono disponibili
 * TEMPORANEAMENTE DISABILITATO: Crashlytics disattivato
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function areNativeModulesAvailable(): boolean {
  // Funzione disabilitata - ritorna sempre false
  return false;
  // CODICE ORIGINALE COMMENTATO:
  // try {
  //   // eslint-disable-next-line @typescript-eslint/no-require-imports
  //   const { NativeModules } = require('react-native');
  //   
  //   // Verifica se i moduli nativi Firebase sono disponibili
  //   // Se non sono presenti, significa che non sono stati linkati correttamente
  //   return NativeModules && NativeModules.RNFBApp && NativeModules.RNFBCrashlytics;
  // } catch {
  //   return false;
  // }
}

/**
 * Carica i moduli Firebase in modo lazy
 * TEMPORANEAMENTE DISABILITATO: Crashlytics disattivato per risolvere crash all'avvio
 * Ritorna sempre false senza tentare di caricare i moduli
 */
async function loadFirebaseModules(): Promise<boolean> {
  if (crashlyticsCheckAttempted) {
    return isCrashlyticsAvailable;
  }

  crashlyticsCheckAttempted = true;
  isCrashlyticsAvailable = false;

  // Crashlytics temporaneamente disabilitato
  // Non tentare di caricare i moduli per evitare crash all'avvio
  if (__DEV__) {
    console.info(
      '🔥 Firebase Crashlytics temporaneamente disabilitato. ' +
      'L\'app continuerà a funzionare normalmente senza Crashlytics.'
    );
  }

  return false;

  // CODICE ORIGINALE COMMENTATO - da riattivare quando Crashlytics sarà configurato correttamente
  /*
  // Verifica prima se i moduli nativi sono disponibili
  // Questo evita di fare require dei moduli JS se i moduli nativi non sono linkati
  if (!areNativeModulesAvailable()) {
    // I moduli nativi non sono disponibili
    if (__DEV__) {
      console.info(
        '🔥 Firebase Crashlytics non disponibile (moduli nativi non linkati). ' +
        'Per abilitarlo, esegui: npx expo prebuild --clean e poi ricostruisci l\'app. ' +
        'L\'app continuerà a funzionare normalmente senza Crashlytics.'
      );
    }
    isCrashlyticsAvailable = false;
    return false;
  }

  try {
    // Usa require statici (non dinamici) per compatibilità con Metro bundler
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crashlyticsModuleRaw = require('@react-native-firebase/crashlytics');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const firebaseAppModuleRaw = require('@react-native-firebase/app');
    
    if (!crashlyticsModuleRaw || !firebaseAppModuleRaw) {
      throw new Error('Firebase JS modules not available');
    }

    crashlyticsModule = crashlyticsModuleRaw.default;
    firebaseAppModule = firebaseAppModuleRaw;
    
    // Verifica se Firebase App è inizializzato
    try {
      if (firebaseAppModule) {
        firebaseAppModule.getApp();
        isCrashlyticsAvailable = true;
        return true;
      }
      isCrashlyticsAvailable = false;
      return false;
    } catch {
      // Firebase non è inizializzato, ma i moduli sono disponibili
      isCrashlyticsAvailable = false;
      return false;
    }
  } catch {
    // I moduli Firebase non sono disponibili (es. in Expo Go o senza rebuild)
    if (__DEV__) {
      console.info(
        '🔥 Firebase Crashlytics non disponibile. ' +
        'Per abilitarlo, esegui: npx expo prebuild --clean e poi ricostruisci l\'app. ' +
        'L\'app continuerà a funzionare normalmente senza Crashlytics.'
      );
    }
    isCrashlyticsAvailable = false;
    return false;
  }
  */
}

/**
 * Inizializza Firebase Crashlytics
 * Chiamare questa funzione all'avvio dell'app
 */
export async function initializeCrashlytics(): Promise<void> {
  try {
    const available = await loadFirebaseModules();
    if (!available || !crashlyticsModule) {
      return;
    }

    // Abilita Crashlytics
    await crashlyticsModule().setCrashlyticsCollectionEnabled(true);
    
    if (__DEV__) {
      console.log('🔥 Firebase Crashlytics initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firebase Crashlytics:', error);
    isCrashlyticsAvailable = false;
    // Non blocchiamo l'app se Crashlytics non funziona
  }
}

/**
 * Registra un crash non fatale (non-crash exception)
 * @param error L'errore da registrare
 * @param jsErrorName Nome personalizzato per l'errore (opzionale)
 */
export async function recordError(
  error: Error,
  jsErrorName?: string
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) {
    // In sviluppo, logga l'errore nella console
    if (__DEV__) {
      console.error('Crashlytics not available, logging error:', error);
    }
    return;
  }
  
  try {
    await crashlyticsModule().recordError(error);
    if (jsErrorName) {
      await crashlyticsModule().log(`${jsErrorName}: ${error.message}`);
    }
  } catch (err) {
    // Silenziosamente ignora errori se Crashlytics non è inizializzato
    if (__DEV__) {
      console.warn('Firebase Crashlytics not available for recordError:', err);
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Registra un messaggio di log
 * @param message Messaggio da registrare
 */
export async function log(message: string): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) return;
  
  try {
    await crashlyticsModule().log(message);
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Crashlytics not available for log:', error);
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Imposta un attributo personalizzato per i crash
 * @param key Chiave dell'attributo
 * @param value Valore dell'attributo
 */
export async function setAttribute(
  key: string,
  value: string
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) return;
  
  try {
    await crashlyticsModule().setAttribute(key, value);
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Crashlytics not available for setAttribute:', error);
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Imposta più attributi personalizzati per i crash
 * @param attributes Oggetto con chiavi e valori degli attributi
 */
export async function setAttributes(
  attributes: { [key: string]: string }
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) return;
  
  try {
    if (!crashlyticsModule) return;
    const module = crashlyticsModule;
    await Promise.all(
      Object.entries(attributes).map(([key, value]) =>
        module().setAttribute(key, value)
      )
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Crashlytics not available for setAttributes:', error);
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Imposta l'ID utente per i crash
 * @param userId ID utente (null per rimuoverlo)
 */
export async function setUserId(userId: string | null): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) return;
  
  try {
    await crashlyticsModule().setUserId(userId || '');
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Crashlytics not available for setUserId:', error);
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Forza un crash di test (solo per testing)
 * ATTENZIONE: Usa solo in sviluppo per testare Crashlytics
 */
export async function crash(): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) {
    if (__DEV__) {
      console.warn('Crashlytics not available, cannot crash');
    }
    return;
  }
  
  try {
    await crashlyticsModule().crash();
  } catch (error) {
    if (__DEV__) {
      console.warn('Firebase Crashlytics not available for crash:', error);
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Abilita o disabilita la raccolta dati Crashlytics
 * Utile per rispettare le preferenze di privacy dell'utente
 * @param enabled true per abilitare, false per disabilitare
 */
export async function setCrashlyticsCollectionEnabled(
  enabled: boolean
): Promise<void> {
  const available = await loadFirebaseModules();
  if (!available || !crashlyticsModule) return;
  
  try {
    await crashlyticsModule().setCrashlyticsCollectionEnabled(enabled);
  } catch (error) {
    if (__DEV__) {
      console.warn(
        'Firebase Crashlytics not available for setCrashlyticsCollectionEnabled:',
        error
      );
    }
    isCrashlyticsAvailable = false;
  }
}

/**
 * Verifica se Crashlytics è disponibile
 */
export function isAvailable(): boolean {
  return isCrashlyticsAvailable;
}
