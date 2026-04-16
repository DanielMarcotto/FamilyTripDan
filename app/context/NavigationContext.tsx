import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import * as Location from "expo-location";
import { Platform, AppState } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDistance } from "@/utils/Navigation";
import { getCategories, getDestinations, getPOIs } from "@/services/api";
import { checkPOIProximity } from "@/services/poiNotifications";
import { BACKGROUND_LOCATION_TASK, updatePOIListInTask } from "@/tasks/backgroundLocation";
import BackgroundLocationDisclosure from "@/components/organisms/BackgroundLocationDisclosure";



export const CATEGORY_IT: Record<string, string> = {
  museum: "Museo",
  playground: "Parco giochi",
  park: "Parco",
  adventure_park: "Parco avventura",
  restaurant: "Ristorante",
  observatory: "Osservatorio",
  nature: "Natura",
  water_park: "Parco acquatico",
  theme_park: "Parco divertimenti",
};

export const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Museo: "business",
  "Parco giochi": "happy",
  Parco: "leaf",
  "Parco avventura": "trail-sign",
  Ristorante: "restaurant",
  Osservatorio: "planet",
  Natura: "flower",
  "Parco acquatico": "water",
  "Parco divertimenti": "ticket",
};

// Colors aligned with activity categories
export const CATEGORY_COLOR: Record<string, string> = {
  Museo: "#9C27B0", // Purple
  "Parco giochi": "#E91E63", // Pink
  Parco: "#4CAF50", // Green
  "Parco avventura": "#FF5722", // Deep Orange
  Ristorante: "#FF9800", // Orange
  Osservatorio: "#2196F3", // Blue
  Natura: "#8BC34A", // Light Green
  "Parco acquatico": "#00BCD4", // Cyan
  "Parco divertimenti": "#FFC107", // Amber
};

/* ------------------- Types ------------------- */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RawPOI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  destination_id: string;
  pictures: string[] | { url: string }[];
  address: string;
  category: string;
  tags: string[];
  age_min?: number;
  age_max?: number;
  location?: string;
  environment?: string;
}

export interface RawDestination {
  id: string;
  name: string;
  avg_cost_level: number;
}

export interface POI {
  id: string;
  title: string;
  location: string | undefined;
  price: number | undefined;
  image: string | undefined;
  status: string;
  category: string;
  icon: string;
  coordinates: Coordinates;
  distance: number;
  address: string;
  tags: string[];
  age_min?: number;
  age_max?: number;
}

/* ------------------- Helper Functions ------------------- */

// Cache per evitare operazioni ridondanti di encoding/decoding
const imageUrlCache = new Map<string, string>();

/**
 * Extracts the first image URL from a pictures array.
 * Handles both formats: string[] or {url: string}[]
 * Ottimizzato con cache per evitare operazioni costose ripetute.
 */
export const extractImageUrl = (pictures: string[] | { url: string }[] | undefined): string | undefined => {
  if (!pictures || pictures.length === 0) {
    return undefined;
  }
  
  const firstPicture = pictures[0];
  if (typeof firstPicture === "string") {
    // Controlla cache prima di processare
    if (imageUrlCache.has(firstPicture)) {
      return imageUrlCache.get(firstPicture);
    }
    
    const isPoiImagePath = /^poi_images(\/|%2F)/i.test(firstPicture);
    if (isPoiImagePath) {
      const firebaseStorageBaseUrl =
        "https://firebasestorage.googleapis.com/v0/b/familytrip-6a128.firebasestorage.app/o/";
      
      // Ottimizzazione: evita decode/encode se il path è già encoded correttamente
      let encodedPath: string;
      if (firstPicture.includes('%')) {
        // Se contiene già caratteri encoded, prova a decodificare e ri-encodare
        try {
          const decodedPath = decodeURIComponent(firstPicture);
          encodedPath = encodeURIComponent(decodedPath);
        } catch {
          // Se decode fallisce, usa il path originale
          encodedPath = encodeURIComponent(firstPicture);
        }
      } else {
        // Se non contiene caratteri encoded, encoda direttamente
        encodedPath = encodeURIComponent(firstPicture);
      }
      
      const queryParams = "?alt=media";
      const result = `${firebaseStorageBaseUrl}${encodedPath}${queryParams}`;
      
      // Salva in cache (limita dimensione cache a 1000 entry per evitare memory leak)
      if (imageUrlCache.size < 1000) {
        imageUrlCache.set(firstPicture, result);
      }
      
      return result;
    }
    
    // Salva anche URL non processati in cache
    if (imageUrlCache.size < 1000) {
      imageUrlCache.set(firstPicture, firstPicture);
    }
    return firstPicture;
  } else if (firstPicture && typeof firstPicture === "object" && "url" in firstPicture) {
    return firstPicture.url;
  }
  
  return undefined;
};

interface NavContextShape {
  paginatedPOI: POI[];
  listedDestinations: RawDestination[];
  categories: string[];
  userCoords: Coordinates | null;
  loadMore: () => void;
  hasMore: boolean;
  setMapMode: (enabled: boolean) => void;
  isLoadingPOI: boolean;
}

export const NavigationContext = createContext<NavContextShape>({
  paginatedPOI: [],
  listedDestinations: [],
  categories: [],
  userCoords: null,
  loadMore: () => { },
  hasMore: false,
  setMapMode: () => { },
  isLoadingPOI: false,
});


export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [paginatedPOI, setPaginatedPOI] = useState<POI[]>([]);
  const [listedDestinations, setListedDestinations] = useState<
    RawDestination[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isMapMode, setIsMapMode] = useState(false);
  const [isLoadingPOI, setIsLoadingPOI] = useState(true);
  const [showBackgroundLocationDisclosure, setShowBackgroundLocationDisclosure] = useState(false);
  const pendingBackgroundPermissionRequest = useRef<(() => void) | null>(null);

  const pageSize = 40;
  // Maximum POI to keep in memory to prevent performance degradation
  // When limit is reached, we keep the closest POI and remove the farthest
  // Map mode allows unlimited POI for map display
  const MAX_POI_IN_MEMORY = 500;


  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    // Periodic cleanup: every 60 seconds (reduced frequency), if not in map mode and POI exceed limit, clean up
    // Use longer interval to reduce overhead and prevent UI blocking
    cleanupIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      const currentMapMode = isMapModeRef.current;
      if (!currentMapMode) {
        // Use requestAnimationFrame to batch state updates and avoid blocking UI
        requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          
          setPaginatedPOI((prev) => {
            if (prev.length <= MAX_POI_IN_MEMORY) {
              return prev;
            }
            // Sort by distance and keep only the closest
            // Use a more efficient approach: only sort if we need to remove items
            const sorted = [...prev].sort((a, b) => a.distance - b.distance);
            return sorted.slice(0, MAX_POI_IN_MEMORY);
          });
        });
      }
    }, 60000) as ReturnType<typeof setInterval>; // Cleanup every 60 seconds (reduced from 30)
    
    return () => {
      mountedRef.current = false;
      // Cancel any ongoing map mode loading
      mapModeLoadingRef.current.cancelled = true;
      // Clear cleanup interval
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, []);

  
  const destMap = useMemo(
    () => new Map(listedDestinations.map((d) => [d.id, d] as const)),
    [listedDestinations]
  );

  
  const normalizePOI = useCallback(
    (poi: RawPOI, coords: Coordinates | null): POI => {
      const destination = destMap.get(poi.destination_id);
      const category = CATEGORY_IT[poi.category] ?? poi.category;
      const icon = CATEGORY_ICON[category] ?? "help-circle";

      const poiCoords = { latitude: poi.latitude, longitude: poi.longitude };
      let distance: number;
      
      if (coords) {
        distance = getDistance(coords, poiCoords);
      } else {
        distance = Infinity;
      }

      // Extract image URL from pictures array
      const imageUrl = extractImageUrl(poi.pictures);

      return {
        id: poi.id,
        title: poi.name,
        location: poi.location,
        price: destination?.avg_cost_level,
        image: imageUrl,
        status: poi.environment ?? "",
        category,
        icon,
        coordinates: poiCoords,
        distance,
        address: poi.address,
        tags: poi.tags,
        age_min: poi.age_min,
        age_max: poi.age_max,
      };
    },
    [destMap]
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  
  const hasMore = useMemo(
    () => (currentPage + 1) * pageSize < total,
    [currentPage, total] 
  );

  const controllersRef = useRef<Set<AbortController>>(new Set());

  const abortAll = useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      abortAll();
    };
  }, [abortAll]);

  const fetchCategories = useCallback(async () => {
    const ctrl = new AbortController();
    controllersRef.current.add(ctrl);
    try {
      const res = await getCategories();
      if (!mountedRef.current) return;

      if (res?.success) {
        const rawItems: string[] = res.items ?? res.data?.items ?? [];
        const translated = rawItems.map(c => CATEGORY_IT[c] ?? c);
        setCategories(translated);
      }
    } finally {
      controllersRef.current.delete(ctrl);
    }
  }, []);

  const fetchDestinations = useCallback(async () => {
    const ctrl = new AbortController();
    controllersRef.current.add(ctrl);
    try {
      const res = await getDestinations(0);
      if (!mountedRef.current) return;
      
      const items: RawDestination[] =
        (res?.items as RawDestination[]) ?? [];
      // Temporarily hide "Veneto" until it has real activities
      const filtered = items.filter((d) => (d as { id?: string }).id !== 'veneto');
      if (res?.success) {
        setListedDestinations(filtered);
        setTotal((prev) => res?.data?.total ?? prev);
      }
    } catch {
      // ignore
    } finally {
      controllersRef.current.delete(ctrl);
    }
  }, []);

  // Use ref to access current isMapMode value without causing re-renders
  const isMapModeRef = useRef(false);
  useEffect(() => {
    isMapModeRef.current = isMapMode;
  }, [isMapMode]);

  const fetchPOI = useCallback(
    async (page = 0) => {
      const ctrl = new AbortController();
      controllersRef.current.add(ctrl);
      setIsLoadingPOI(true);
      try {
        const res = await getPOIs(page);
        if (!mountedRef.current) return;

        
        const items: RawPOI[] =
        (res?.items as RawPOI[]) ?? [];

    
        if (!res?.success || !items) {
          setIsLoadingPOI(false);
          return;
        }
        
        // Ottimizzazione: processa i POI in batch per non bloccare il thread principale
        // Per piccole quantità (< 20), processa direttamente
        // Per quantità maggiori, usa requestAnimationFrame per batch processing
        const processBatch = (batch: RawPOI[]): POI[] => {
          return batch.map((p) => normalizePOI(p, userCoords));
        };

        let normalized: POI[];
        if (items.length <= 20) {
          // Processa direttamente per piccole quantità
          normalized = processBatch(items);
        } else {
          // Processa in batch usando requestAnimationFrame per non bloccare UI
          normalized = [];
          const BATCH_SIZE = 10; // Processa 10 POI per frame
          
          // Usa Promise per processare in batch asincrono
          await new Promise<void>((resolve) => {
            let index = 0;
            
            const processNextBatch = () => {
              if (!mountedRef.current || ctrl.signal.aborted) {
                resolve();
                return;
              }
              
              const end = Math.min(index + BATCH_SIZE, items.length);
              const batch = items.slice(index, end);
              const processed = processBatch(batch);
              normalized.push(...processed);
              
              index = end;
              
              if (index < items.length) {
                // Usa requestAnimationFrame per il prossimo batch
                requestAnimationFrame(processNextBatch);
              } else {
                resolve();
              }
            };
            
            requestAnimationFrame(processNextBatch);
          });
        }

        if (!mountedRef.current || ctrl.signal.aborted) {
          setIsLoadingPOI(false);
          return;
        }

      setPaginatedPOI((prev) => {
        const currentMapMode = isMapModeRef.current;
        if (page === 0) {
          // Reset to first page data - deduplicate by ID
          // Ottimizzazione: usa Set per deduplicazione più efficiente
          const seen = new Set<string>();
          const result: POI[] = [];
          
          // Itera una sola volta invece di creare Map e poi Array.from
          for (const poi of normalized) {
            if (!seen.has(poi.id)) {
              seen.add(poi.id);
              result.push(poi);
            }
          }
          
          // Sort by distance solo se necessario (quando abbiamo coordinate valide)
          const sorted = userCoords 
            ? result.sort((a, b) => a.distance - b.distance)
            : result;
          // Only limit if not in map mode
          return currentMapMode ? sorted : sorted.slice(0, MAX_POI_IN_MEMORY);
        }
        // Append new page data - deduplicate against existing POI
        // Ottimizzazione: usa Set per lookup più veloce
        const existingIds = new Set(prev.map((p) => p.id));
        const newPOI = normalized.filter((poi) => !existingIds.has(poi.id));
        const combined = [...prev, ...newPOI];
        
        // If we exceed the limit and not in map mode, keep only the closest POI
        if (!currentMapMode && combined.length > MAX_POI_IN_MEMORY) {
          // Sort by distance and keep only the closest
          // Solo se abbiamo coordinate valide
          const sorted = userCoords
            ? [...combined].sort((a, b) => a.distance - b.distance)
            : combined;
          return sorted.slice(0, MAX_POI_IN_MEMORY);
        }
        return combined;
      });
        setCurrentPage(page);
        setTotal((prev) => {
          const newTotal = res?.total ?? res?.data?.total ?? prev;
          return newTotal > 0 ? newTotal : prev;
        });
        setIsLoadingPOI(false);
      } catch (e) {
        if ((e as any)?.name === "AbortError") {
        
        }
        setIsLoadingPOI(false);
      } finally {
        controllersRef.current.delete(ctrl);
      }
    },
    [normalizePOI, userCoords]
  );

  // Location watch subscription ref
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  
  // Ref to keep current POI list accessible in location callback (for background checks)
  const paginatedPOIRef = useRef<POI[]>([]);
  useEffect(() => {
    paginatedPOIRef.current = paginatedPOI;
    // Aggiorna anche la lista nel task manager per il background tracking
    updatePOIListInTask(paginatedPOI);
  }, [paginatedPOI]);

  // Function to handle background location tracking setup after permission is granted
  const handleBackgroundPermissionGranted = useCallback(async () => {
    try {
      // Check final background permission status
      const finalBgStatus = (await Location.getBackgroundPermissionsAsync()).status;
      
      if (finalBgStatus === 'granted') {
        // Start background location updates using TaskManager
        // This is the ONLY reliable way to track location when app is completely in background
        try {
          await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: Platform.OS === 'android'
              ? Location.Accuracy.Balanced
              : Location.Accuracy.High,
            // Distance filter: only update when user moves at least 50 meters
            distanceInterval: 50,
            // Time interval: update at most every 30 seconds (for battery optimization)
            timeInterval: 30000,
            // Enable deferred updates for better battery life (iOS only)
            ...(Platform.OS === 'ios' && {
              deferredUpdatesInterval: 30000,
              deferredUpdatesDistance: 50,
            }),
            // Android foreground service configuration
            ...(Platform.OS === 'android' && {
              foregroundService: {
                notificationTitle: 'FamilyTrip sta monitorando la tua posizione',
                notificationBody: 'Per inviarti notifiche quando sei vicino a punti di interesse',
              },
            }),
          });

          if (__DEV__) {
            console.log('[NavigationContext] ✅ Background location task started');
          }
        } catch (taskError: any) {
          if (__DEV__) {
            console.error('[NavigationContext] Error starting background location task:', taskError);
            console.error('  Falling back to watchPositionAsync...');
          }
          
          // Fallback a watchPositionAsync se il task manager non funziona
          locationSubscriptionRef.current = await Location.watchPositionAsync(
            {
              accuracy: Platform.OS === 'android'
                ? Location.Accuracy.Balanced
                : Location.Accuracy.High,
              distanceInterval: 50,
              timeInterval: 30000,
              mayShowUserSettingsDialog: false,
            },
            async (location) => {
              if (!mountedRef.current) {
                return;
              }
              
              const coords = { 
                latitude: location.coords.latitude, 
                longitude: location.coords.longitude 
              };
              
              const appState = AppState.currentState;
              
              if (__DEV__) {
                console.log(`📍 Location updated (app state: ${appState}):`, coords);
              }
              
              setUserCoords(coords);
              
              const currentPOI = paginatedPOIRef.current;
              if (currentPOI && currentPOI.length > 0) {
                try {
                  await checkPOIProximity(coords, currentPOI);
                } catch (error) {
                  if (__DEV__) {
                    console.error('[NavigationContext] Error checking POI proximity:', error);
                  }
                }
              }
            }
          );
        }

        // Also start watchPositionAsync for foreground updates (for UI updates)
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Platform.OS === 'android'
              ? Location.Accuracy.Balanced
              : Location.Accuracy.High,
            distanceInterval: 50,
            timeInterval: 30000,
            mayShowUserSettingsDialog: false,
          },
          async (location) => {
            if (!mountedRef.current) {
              return;
            }
            
            const coords = { 
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude 
            };
            
            // Update state for UI (only works in foreground)
            setUserCoords(coords);
            
            // Check proximity in foreground (background is handled by TaskManager)
            const appState = AppState.currentState;
            if (appState === 'active') {
              const currentPOI = paginatedPOIRef.current;
              if (currentPOI && currentPOI.length > 0) {
                try {
                  await checkPOIProximity(coords, currentPOI);
                } catch (error) {
                  if (__DEV__) {
                    console.error('[NavigationContext] Error checking POI proximity:', error);
                  }
                }
              }
            }
          }
        );

        if (__DEV__) {
          console.log('[NavigationContext] ✅ Background location tracking started (TaskManager + watchPositionAsync)');
        }
      } else {
        if (__DEV__) {
          console.warn('[NavigationContext] ⚠️ Background location permission not granted. POI notifications will only work when app is in foreground.');
        }
      }
    } catch (error: any) {
      if (__DEV__) {
        console.warn('[NavigationContext] Could not start background location tracking:', error.message);
        console.warn('  POI proximity notifications will work in foreground only.');
      }
    }
  }, []);

  // Handlers for background location disclosure
  const handleDisclosureAccept = useCallback(async () => {
    setShowBackgroundLocationDisclosure(false);
    // Call the pending permission request
    if (pendingBackgroundPermissionRequest.current) {
      await pendingBackgroundPermissionRequest.current();
      pendingBackgroundPermissionRequest.current = null;
    }
  }, []);

  const handleDisclosureDecline = useCallback(() => {
    setShowBackgroundLocationDisclosure(false);
    pendingBackgroundPermissionRequest.current = null;
    if (__DEV__) {
      console.log('[NavigationContext] User declined background location disclosure');
    }
  }, []);

  // initialize location + lists (no cascading setState loops)
  useEffect(() => {
    let didCancel = false;

    (async () => {
      try {
        // First check existing foreground permissions
        let foregroundStatus = (await Location.getForegroundPermissionsAsync()).status;
        
        // Request foreground permissions if not already granted
        if (foregroundStatus !== "granted") {
          try {
            const result = await Location.requestForegroundPermissionsAsync();
            foregroundStatus = result.status;
          } catch (error: any) {
            // Handle OutOfMemoryError gracefully
            if (error?.message?.includes('OutOfMemoryError') || error?.cause?.message?.includes('OutOfMemoryError')) {
              console.warn('[NavigationContext] OutOfMemoryError when requesting location permissions. Retrying after delay...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              foregroundStatus = (await Location.getForegroundPermissionsAsync()).status;
            } else {
              throw error;
            }
          }
        }
        
        if (!mountedRef.current || didCancel) {
          return;
        }

        // Get initial position with foreground permissions
        if (foregroundStatus === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Platform.OS === 'android' 
              ? Location.Accuracy.Balanced 
              : Location.Accuracy.High,
          });
          
          if (mountedRef.current && !didCancel) {
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setUserCoords(coords);
          }

          // Request background permissions for POI proximity notifications
          // IMPORTANT: On Android, we must show a prominent disclosure BEFORE requesting
          // the BACKGROUND_LOCATION permission (Play Store requirement)
          try {
            const backgroundStatus = await Location.getBackgroundPermissionsAsync();
            if (backgroundStatus.status !== 'granted') {
              // On Android, show prominent disclosure before requesting permission (Play Store requirement)
              if (Platform.OS === 'android') {
                // Store the permission request function to call after user accepts disclosure
                pendingBackgroundPermissionRequest.current = async () => {
                  try {
                    const bgResult = await Location.requestBackgroundPermissionsAsync();
                    if (__DEV__) {
                      console.log('[NavigationContext] Background location permission status:', bgResult.status);
                    }
                    // Continue with the rest of the permission flow
                    await handleBackgroundPermissionGranted();
                  } catch (error) {
                    if (__DEV__) {
                      console.error('[NavigationContext] Error requesting background permissions:', error);
                    }
                  }
                };
                // Show the prominent disclosure
                setShowBackgroundLocationDisclosure(true);
              } else {
                // On iOS, request directly (iOS handles disclosure in system dialog)
                const bgResult = await Location.requestBackgroundPermissionsAsync();
                if (__DEV__) {
                  console.log('[NavigationContext] Background location permission status:', bgResult.status);
                }
                // Continue with the rest of the permission flow
                await handleBackgroundPermissionGranted();
              }
            } else {
              // Permission already granted, continue with setup
              await handleBackgroundPermissionGranted();
            }
          } catch (bgError: any) {
            // Background permissions might not be available on all platforms/versions
            if (__DEV__) {
              console.warn('[NavigationContext] Could not request background permissions:', bgError.message);
              console.warn('  POI proximity notifications will work in foreground only.');
            }
          }
        }
      } catch (error) {
        console.error('[NavigationContext] Error getting location:', error);
      }

      if (!mountedRef.current || didCancel) {
        return;
      }
      
      await Promise.all([fetchCategories(), fetchDestinations()]);

  
      if (!mountedRef.current || didCancel) {
        return;
      }
      
      await fetchPOI(0);
    })();

    return () => {
      didCancel = true;
      // Cleanup location subscription
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
      // Stop background location task
      Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch((error) => {
        if (__DEV__) {
          console.warn('[NavigationContext] Error stopping background location task:', error);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optimized distance update logic - consolidated into a single useEffect
  const prevUserCoordsRef = useRef<Coordinates | null>(null);
  const isUpdatingDistancesRef = useRef(false);
  const lastPOICountRef = useRef(0);
  const lastUserCoordsRef = useRef<Coordinates | null>(null);
  const rafIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!userCoords) {
      prevUserCoordsRef.current = null;
      return;
    }
    
    // Check if userCoords actually changed (avoid unnecessary updates)
    const coordsChanged = 
      !lastUserCoordsRef.current ||
      Math.abs(lastUserCoordsRef.current.latitude - userCoords.latitude) > 0.0001 ||
      Math.abs(lastUserCoordsRef.current.longitude - userCoords.longitude) > 0.0001;
    
    const isFirstTimeCoordsAvailable = prevUserCoordsRef.current === null && userCoords !== null;
    const poiCountChanged = paginatedPOI.length !== lastPOICountRef.current;
    const hasInvalidDistances = paginatedPOI.some(p => !isFinite(p.distance));
    
    // Only update if something actually changed
    if (!coordsChanged && !poiCountChanged && !hasInvalidDistances) {
      return;
    }
    
    prevUserCoordsRef.current = userCoords;
    lastUserCoordsRef.current = userCoords;
    
    // Prevent concurrent updates
    if (isUpdatingDistancesRef.current) {
      return;
    }
    
    // If POI were loaded before coords were available, reload them
    if (isFirstTimeCoordsAvailable && paginatedPOI.length > 0 && hasInvalidDistances) {
      fetchPOI(0);
      return;
    }
    
    // Only update distances if POI exist
    if (paginatedPOI.length === 0) {
      lastPOICountRef.current = 0;
      return;
    }
    
    // Cancel any pending animation frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // Batch distance calculations using requestAnimationFrame for better performance
    isUpdatingDistancesRef.current = true;
    
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!mountedRef.current) {
        isUpdatingDistancesRef.current = false;
        return;
      }
      
      setPaginatedPOI((prev) => {
        if (prev.length === 0) {
          isUpdatingDistancesRef.current = false;
          lastPOICountRef.current = 0;
          return prev;
        }
        
        // Check if distances actually need updating (avoid unnecessary work)
        const needsUpdate = prev.some(p => {
          if (!isFinite(p.distance)) return true;
          const newDistance = getDistance(userCoords, p.coordinates);
          return Math.abs(p.distance - newDistance) > 1;
        });
        
        if (!needsUpdate) {
          isUpdatingDistancesRef.current = false;
          lastPOICountRef.current = prev.length;
          return prev;
        }
        
        // Update distances in batches to avoid blocking the UI
        const updated = prev.map((p) => {
          const newDistance = isFinite(p.distance) && coordsChanged
            ? getDistance(userCoords, p.coordinates)
            : !isFinite(p.distance)
            ? getDistance(userCoords, p.coordinates)
            : p.distance;
          return {
            ...p,
            distance: newDistance,
          };
        });

        // Only sort if we have valid distances and coords changed or POI were added
        let sorted = updated.every(p => isFinite(p.distance)) && (coordsChanged || poiCountChanged)
          ? updated.sort((a, b) => a.distance - b.distance)
          : updated;
        
        // Ensure we don't exceed MAX_POI_IN_MEMORY after updates (only if not in map mode)
        const currentMapMode = isMapModeRef.current;
        if (!currentMapMode && sorted.length > MAX_POI_IN_MEMORY) {
          // Keep only the closest POI
          sorted = sorted.slice(0, MAX_POI_IN_MEMORY);
        }
        
        isUpdatingDistancesRef.current = false;
        lastPOICountRef.current = sorted.length;
        return sorted;
      });
    });
    
    // Cleanup: cancel animation frame on unmount or when dependencies change
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isUpdatingDistancesRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoords, paginatedPOI.length]); // Only trigger when coords or POI count changes

  // Monitor POI proximity and send notifications - only when position changes significantly
  const lastProximityCheckCoordsRef = useRef<Coordinates | null>(null);
  const MIN_MOVEMENT_FOR_PROXIMITY_CHECK = 50; // metri - soglia minima di movimento per controllare prossimità
  
  useEffect(() => {
    if (!userCoords || paginatedPOI.length === 0) {
      return;
    }

    // Check if user moved significantly since last proximity check
    const shouldCheckProximity = 
      !lastProximityCheckCoordsRef.current ||
      getDistance(lastProximityCheckCoordsRef.current, userCoords) >= MIN_MOVEMENT_FOR_PROXIMITY_CHECK;

    if (shouldCheckProximity) {
      // Update last checked position
      lastProximityCheckCoordsRef.current = userCoords;
      
      // Check proximity only when position changed significantly
      // The checkPOIProximity function already has internal throttling (50m threshold)
      checkPOIProximity(userCoords, paginatedPOI);
    }
  }, [userCoords, paginatedPOI]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    fetchPOI(currentPage + 1);
  }, [hasMore, fetchPOI, currentPage]);

  // Ref to track loading state and allow cancellation
  const mapModeLoadingRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  
  // Cleanup interval ref for periodic POI cleanup when not in map mode
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Set map mode - when enabled, allows unlimited POI for map display
  // When disabled, cleans up excess POI to maintain performance
  const setMapMode = useCallback((enabled: boolean) => {
    setIsMapMode(enabled);
    
    // Cancel any ongoing loading when disabling map mode
    if (!enabled) {
      mapModeLoadingRef.current.cancelled = true;
      // When disabling map mode, immediately clean up excess POI
      setPaginatedPOI((prev) => {
        if (prev.length <= MAX_POI_IN_MEMORY) {
          return prev;
        }
        // Sort by distance and keep only the closest
        const sorted = [...prev].sort((a, b) => a.distance - b.distance);
        return sorted.slice(0, MAX_POI_IN_MEMORY);
      });
      return;
    }
    
    // Reset cancellation flag when enabling
    mapModeLoadingRef.current.cancelled = false;
    
    // When enabling map mode, load all available POI
    // Continue loading until we have all POI or no more are available
    const loadAllPOI = async () => {
      let page = currentPage;
      const timeoutIds: ReturnType<typeof setTimeout>[] = [];
      
      while (hasMore && page < 50 && !mapModeLoadingRef.current.cancelled && mountedRef.current) { // Safety limit of 50 pages (2000 POI max)
        page++;
        await fetchPOI(page);
        
        // Check if cancelled or unmounted before continuing
        if (mapModeLoadingRef.current.cancelled || !mountedRef.current) {
          // Clear any pending timeouts
          timeoutIds.forEach(id => clearTimeout(id));
          return;
        }
        
        // Small delay to avoid blocking UI
        await new Promise<void>((resolve) => {
          const id = setTimeout(() => {
            const index = timeoutIds.indexOf(id);
            if (index > -1) {
              timeoutIds.splice(index, 1);
            }
            resolve();
          }, 100);
          timeoutIds.push(id);
        });
        
        // Check if cancelled again after delay
        if (mapModeLoadingRef.current.cancelled || !mountedRef.current) {
          timeoutIds.forEach(id => clearTimeout(id));
          return;
        }
        
        // Check if we still have more to load
        if ((page + 1) * pageSize >= total) {
          break;
        }
      }
      
      // Clear any remaining timeouts
      timeoutIds.forEach(id => clearTimeout(id));
    };
    loadAllPOI();
  }, [currentPage, hasMore, total, fetchPOI]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      paginatedPOI,
      listedDestinations,
      categories,
      userCoords,
      loadMore,
      hasMore,
      setMapMode,
      isLoadingPOI,
    }),
    [paginatedPOI, listedDestinations, categories, userCoords, loadMore, hasMore, setMapMode, isLoadingPOI]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
      {/* Prominent disclosure for background location permission (Android Play Store requirement) */}
      {Platform.OS === 'android' && (
        <BackgroundLocationDisclosure
          visible={showBackgroundLocationDisclosure}
          onAccept={handleDisclosureAccept}
          onDecline={handleDisclosureDecline}
        />
      )}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => React.useContext(NavigationContext);
