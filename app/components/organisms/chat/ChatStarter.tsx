import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  // AppState,
} from "react-native";
// import * as Notifications from 'expo-notifications';
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { AuthContext } from "@/context/AuthContext";
import { CATEGORY_ICON, POI, useNavigation } from "@/context/NavigationContext";
import { Ionicons } from "@expo/vector-icons";
import PoiCard from "@/components/organisms/chat/poi-card";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SpinnerLoader from "@/components/atoms/loaders/Spinner";
// import { sendPOIProximityNotification } from "@/services/poiNotifications";
// import { sendPOIProximityNotification } from '@/services/poiNotifications';

const ITEM_HEIGHT = 260;

// Environment options con icone e traduzioni
const ENVIRONMENT_OPTIONS = [
  { value: "indoor", label: "Al Chiuso", icon: "home-outline" as const },
  { value: "outdoor", label: "All'Aperto", icon: "sunny-outline" as const },
  { value: "mixed", label: "Misto", icon: "swap-horizontal-outline" as const },
] as const;

const ChatStarter = () => {
  const { userData } = useContext(AuthContext);
  const { paginatedPOI, categories, loadMore, hasMore, isLoadingPOI } = useNavigation();
  const insets = useSafeAreaInsets();

  // Selezione singola per categorie
  const [activeTab, setActiveTab] = useState("Tutte le categorie");
  const [searchQuery, setSearchQuery] = useState("");
  // Selezione multipla per filtri ambiente (al chiuso / all'aperto / misto)
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  // Ref per tracciare se stiamo caricando tutte le pagine per i filtri
  const isAutoLoadingAllRef = useRef(false);
  
  // Animation refs
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;
  const scrollToTopButtonOpacity = useRef(new Animated.Value(0)).current;
  const scrollToTopButtonScale = useRef(new Animated.Value(0.8)).current;
  
  // Ref to track ongoing scroll button animations for cleanup
  const scrollButtonAnimationsRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Throttle scroll handler refs
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);
  const showScrollToTopRef = useRef(false);
  const headerAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Sync ref with state to avoid stale closures
  useEffect(() => {
    showScrollToTopRef.current = showScrollToTop;
  }, [showScrollToTop]);

  // Calcola se ci sono filtri attivi
  // IMPORTANTE: Se "Tutte le categorie" è selezionata e non ci sono altri filtri,
  // hasActiveFilters sarà false e manterremo la paginazione normale per le performance
  const hasActiveFilters = useMemo(() => {
    return searchQuery.length > 0 || 
           activeTab !== "Tutte le categorie" || 
           selectedEnvironments.length > 0;
  }, [searchQuery, activeTab, selectedEnvironments]);

  // Quando ci sono filtri attivi, carica automaticamente tutte le pagine disponibili
  // per assicurarsi che i filtri vengano applicati a tutti i POI, non solo a quelli già caricati.
  // Se non ci sono filtri attivi, manteniamo la paginazione normale per evitare problemi di performance.
  useEffect(() => {
    if (!hasActiveFilters) {
      // Reset il flag quando i filtri vengono rimossi - manteniamo la paginazione normale
      isAutoLoadingAllRef.current = false;
      return;
    }

    // Avvia il caricamento automatico quando vengono attivati i filtri
    isAutoLoadingAllRef.current = true;
  }, [hasActiveFilters]);

  // Questo effect gestisce il caricamento sequenziale di tutte le pagine quando i filtri sono attivi.
  // Si attiva ogni volta che:
  // - I filtri cambiano e sono attivi
  // - Il caricamento di una pagina finisce (isLoadingPOI diventa false)
  // - Lo stato hasMore cambia
  // Crea una catena di caricamenti che continua finché non ci sono più pagine disponibili.
  useEffect(() => {
    // Solo se i filtri sono attivi (controllo diretto per evitare problemi di timing con il ref)
    if (!hasActiveFilters) {
      return;
    }

    // Se non ci sono più pagine da caricare, ferma il caricamento automatico
    if (!hasMore) {
      isAutoLoadingAllRef.current = false;
      return;
    }

    // Se stiamo già caricando, aspetta che finisca (questo effect si riattiverà quando isLoadingPOI diventa false)
    if (isLoadingPOI) {
      return;
    }

    // Carica la prossima pagina
    // Quando il caricamento finisce, isLoadingPOI diventa false e questo effect si riattiva,
    // creando una catena che continua finché non ci sono più pagine
    loadMore();
  }, [hasActiveFilters, hasMore, isLoadingPOI, loadMore]);

  useEffect(() => {
    const animations = Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
    
    headerAnimationRef.current = animations;
    animations.start(() => {
      headerAnimationRef.current = null;
    });
    
    // Cleanup: stop header animations on unmount
    return () => {
      if (headerAnimationRef.current) {
        headerAnimationRef.current.stop();
        headerAnimationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TEST: Funzione per testare notifiche POI in background
  // Per attivare il test, decommenta il useEffect qui sotto
  // IMPORTANTE: Rimuovi questo codice prima del deploy in produzione!
  /*
  const testPOINotification = useCallback(async (forceBackground: boolean = false) => {
    const testPOI: POI = {
      id: 'test-poi-notification',
      title: 'Museo del Vaticano',
      address: 'Viale Vaticano, 00165 Roma RM',
      category: 'museum',
      coordinates: { latitude: 41.9028, longitude: 12.4964 },
      distance: 100,
      location: 'Roma',
      price: 20,
      image: undefined,
      status: 'open',
      icon: 'business',
      tags: [],
    };

    console.log('🧪 ========================================');
    const currentAppState = AppState.currentState;
    const isInForeground = currentAppState === 'active';

    try {
      console.log('\n🧪 ========================================');
      console.log('🧪 === TEST NOTIFICA POI PROXIMITY ===');
      console.log('🧪 ========================================\n');
      console.log(`📱 Piattaforma: ${Platform.OS}`);
      console.log(`📱 Stato app corrente: ${currentAppState} (${isInForeground ? 'foreground' : 'background'})`);
      console.log(`📱 Forza background: ${forceBackground ? 'Sì' : 'No'}\n`);
      
      // Monitora i cambiamenti di stato dell'app
      const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
        console.log(`🔄 App state cambiato: ${currentAppState} -> ${nextAppState}`);
      });
      
      if (forceBackground && isInForeground) {
        console.log('⏳ Invio notifica tra 3 secondi...');
        console.log('💡 IMPORTANTE: Metti l\'app in background ORA!');
        console.log('   - iOS Simulator: Cmd+Shift+H (Home)');
        console.log('   - Android Emulator: Click Home button o swipe up\n');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newAppState = AppState.currentState;
        console.log(`📱 Nuovo stato app dopo delay: ${newAppState}`);
        console.log(`📱 App è in background: ${newAppState !== 'active'}\n`);
      }
      
      const finalAppState = AppState.currentState;
      console.log(`📱 Stato app finale prima di inviare: ${finalAppState}`);
      console.log('📤 Invio notifica POI...\n');
      
      // Verifica permessi prima di inviare
      const { status: notificationStatus } = await Notifications.getPermissionsAsync();
      console.log(`🔐 Status permessi notifiche: ${notificationStatus}`);
      
      await sendPOIProximityNotification(testPOI);
      
      console.log('✅ Notifica inviata con successo!');
      console.log(`📱 Stato app dopo invio: ${AppState.currentState}\n`);
      
      // Verifica se la notifica è stata effettivamente programmata
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`📋 Notifiche programmate: ${scheduledNotifications.length}`);
      if (scheduledNotifications.length > 0) {
        const lastNotification = scheduledNotifications[scheduledNotifications.length - 1];
        console.log('   Ultima notifica:', {
          identifier: lastNotification.identifier,
          title: lastNotification.content.title,
          body: lastNotification.content.body,
        });
      }
      console.log('');
      
      // Rimuovi il listener dopo il test
      appStateSubscription.remove();
      
      // Istruzioni specifiche per piattaforma
      if (Platform.OS === 'ios') {
        console.log('📋 ISTRUZIONI PER iOS SIMULATOR:');
        console.log('   1. Le notifiche locali DOVREBBERO funzionare anche in background');
        console.log('   2. Se la notifica non appare:');
        console.log('      - Verifica permessi: Impostazioni > Notifiche > FamilyTrip');
        console.log('      - Verifica che le notifiche siano abilitate');
        console.log('   3. Per vedere le notifiche:');
        console.log('      - Clicca l\'icona delle notifiche in alto a destra');
        console.log('      - Oppure scorri verso il basso dalla parte superiore dello schermo');
        console.log('   4. IMPORTANTE: Le notifiche potrebbero non apparire se:');
        console.log('      - L\'app è in foreground (comportamento normale iOS)');
        console.log('      - I permessi non sono concessi');
        console.log('      - Le notifiche sono disabilitate nelle impostazioni\n');
      } else {
        console.log('📋 ISTRUZIONI PER ANDROID EMULATOR:');
        console.log('   1. Le notifiche locali DOVREBBERO funzionare anche in background');
        console.log('   2. Se la notifica non appare:');
        console.log('      - Verifica permessi: Impostazioni > App > FamilyTrip > Notifiche');
        console.log('      - Verifica che le notifiche siano abilitate');
        console.log('      - Verifica che il canale "Notifiche POI" sia configurato');
        console.log('   3. Per vedere le notifiche:');
        console.log('      - Scorri verso il basso dalla parte superiore dello schermo');
        console.log('      - Le notifiche dovrebbero essere visibili nel drawer');
        console.log('   4. IMPORTANTE: Le notifiche potrebbero non apparire se:');
        console.log('      - L\'app è in foreground (comportamento normale Android)');
        console.log('      - I permessi non sono concessi');
        console.log('      - Le notifiche sono disabilitate nelle impostazioni\n');
      }
      
      console.log('🧪 ========================================\n');
    } catch (error) {
      console.error('\n❌ Errore durante il test della notifica:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
      console.log('🧪 ========================================\n');
    }
  }, []);
*/
  // TEST: Decommenta questo useEffect per testare automaticamente all'avvio
  // Oppure chiama testPOINotification() manualmente da un pulsante di debug
  
/*
  useEffect(() => {
    // Test automatico dopo 3 secondi dall'avvio
    const timeout = setTimeout(() => {
      // Test in foreground (per vedere i log)
       //testPOINotification(false);
      
      // Dopo 5 secondi, test in background
      setTimeout(() => {
        testPOINotification(true);
      }, 8000);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [testPOINotification]);
  */
  const filteredPOI = useMemo(() => {
    if (!paginatedPOI.length) return [];

    const q = searchQuery.trim().toLowerCase();
    const isAll = activeTab === "Tutte le categorie";

    // Deduplicate by ID first to prevent duplicate keys
    const seen = new Map<string, typeof paginatedPOI[0]>();
    paginatedPOI.forEach((p) => {
      if (!seen.has(p.id)) {
        seen.set(p.id, p);
      }
    });
    const uniquePOI = Array.from(seen.values());

    const filtered = uniquePOI.filter((p) => {
      // Filtro per categoria (selezione singola)
      if (!isAll && p.category !== activeTab) return false;
      
      // Filtro per environment (selezione multipla: al chiuso / all'aperto / misto selezionabili contemporaneamente)
      if (selectedEnvironments.length > 0) {
        const poiEnvironment = p.status?.toLowerCase() || "";
        if (!selectedEnvironments.some(env => env.toLowerCase() === poiEnvironment)) {
          return false;
        }
      }
      
      // Filtro per ricerca (cerca in title, address, location, e tags)
      if (q) {
        const titleMatch = p.title?.toLowerCase().includes(q) ?? false;
        const addressMatch = p.address?.toLowerCase().includes(q) ?? false;
        const locationMatch = p.location?.toLowerCase().includes(q) ?? false;
        const tagsMatch = p.tags?.some(tag => tag.toLowerCase().includes(q)) ?? false;
        
        if (!titleMatch && !addressMatch && !locationMatch && !tagsMatch) {
          return false;
        }
      }
      
      return true;
    });

    return filtered;
  }, [paginatedPOI, activeTab, searchQuery, selectedEnvironments]);

  const renderPOI = useCallback(
    ({ item }: { item: any }) => <PoiCard destination={item} />,
    []
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore) loadMore();
  }, [hasMore, loadMore]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Toggle per selezione multipla degli environment (permette selezione contemporanea)
  const toggleEnvironment = useCallback((env: string) => {
    setSelectedEnvironments((prev) => {
      if (prev.includes(env)) {
        return prev.filter((e) => e !== env);
      } else {
        return [...prev, env];
      }
    });
  }, []);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    lastScrollYRef.current = offsetY;
    
    // Throttle updates to reduce animation calls
    if (scrollTimeoutRef.current) {
      return;
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
      const shouldShow = lastScrollYRef.current > 500;
      
      // Use ref to check current state without causing re-render
      if (shouldShow !== showScrollToTopRef.current) {
        setShowScrollToTop(shouldShow);
        
        // Stop any ongoing scroll button animations before starting new ones
        if (scrollButtonAnimationsRef.current) {
          scrollButtonAnimationsRef.current.stop();
          scrollButtonAnimationsRef.current = null;
        }
        
        const scrollAnimations = Animated.parallel([
          Animated.timing(scrollToTopButtonOpacity, {
            toValue: shouldShow ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scrollToTopButtonScale, {
            toValue: shouldShow ? 1 : 0.8,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]);
        
        scrollButtonAnimationsRef.current = scrollAnimations;
        scrollAnimations.start(() => {
          // Clear reference when animation completes
          if (scrollButtonAnimationsRef.current === scrollAnimations) {
            scrollButtonAnimationsRef.current = null;
          }
        });
      }
    }, 100); // Throttle to 100ms
  }, [scrollToTopButtonOpacity, scrollToTopButtonScale]);
  
  // Cleanup scroll timeout and animations on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      if (scrollButtonAnimationsRef.current) {
        scrollButtonAnimationsRef.current.stop();
        scrollButtonAnimationsRef.current = null;
      }
      if (headerAnimationRef.current) {
        headerAnimationRef.current.stop();
        headerAnimationRef.current = null;
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Ottieni il nome della categoria attiva per display compatto
  const activeCategoryName = useMemo(() => {
    return activeTab === "Tutte le categorie" ? null : activeTab;
  }, [activeTab]);

  // Ottieni le etichette degli environment selezionati
  const selectedEnvironmentLabels = useMemo(() => {
    return ENVIRONMENT_OPTIONS
      .filter(env => selectedEnvironments.includes(env.value))
      .map(env => env.label);
  }, [selectedEnvironments]);

  const listHeader = useMemo(() => (
    <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Scopri cosa fare oggi, vicino a te</Text>
          <Text style={styles.headerSubtitle}>
            Idee per famiglie e bambini nei dintorni
          </Text>
        </View>
        {/*<TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={20} color="#FF7A00" />
        </TouchableOpacity>*/}
        
        {/* DEBUG: Pulsante per testare notifiche POI (solo in sviluppo) */}
        {/*{__DEV__ && (
          <TouchableOpacity
            style={styles.debugTestButton}
            onPress={() => testPOINotification(false)}
            onLongPress={() => testPOINotification(true)}
          >
            <Ionicons name="notifications" size={16} color="#FFFFFF" />
            <Text style={styles.debugTestButtonText}>
              Test Notifica{'\n'}(Long press per background)
            </Text>
          </TouchableOpacity>
        )}*/}
      </View>

      {/* Compact Search & Active Filters Bar */}
      <View style={styles.compactFiltersBar}>
        {/* Search Row with Expand Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#666"
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Cerca luoghi, indirizzi, tag..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Expand/Collapse Filters Button */}
          <TouchableOpacity
            style={[styles.expandFiltersButton, filtersExpanded && styles.expandFiltersButtonActive]}
            onPress={() => setFiltersExpanded(!filtersExpanded)}
          >
            <Ionicons
              name={filtersExpanded ? "chevron-up" : "options-outline"}
              size={20}
              color={filtersExpanded ? "#1A1A1A" : "#FF7A00"}
            />
            {hasActiveFilters && !filtersExpanded && (
              <View style={styles.expandButtonBadge}>
                <View style={styles.expandButtonBadgeDot} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Display - Compact */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {/* Active Category */}
              {activeCategoryName && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  onPress={() => setActiveTab("Tutte le categorie")}
                >
                  <Ionicons
                    name={CATEGORY_ICON[activeCategoryName] ?? "grid-outline"}
                    size={14}
                    color="#1A1A1A"
                  />
                  <Text style={styles.activeFilterTagText}>{activeCategoryName}</Text>
                  <Ionicons name="close" size={14} color="#1A1A1A" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}

              {/* Active Environments */}
              {selectedEnvironmentLabels.map((label) => {
                const envValue = ENVIRONMENT_OPTIONS.find(e => e.label === label)?.value;
                return (
                  <TouchableOpacity
                    key={envValue}
                    style={styles.activeFilterTag}
                    onPress={() => envValue && toggleEnvironment(envValue)}
                  >
                    <Ionicons
                      name={ENVIRONMENT_OPTIONS.find(e => e.label === label)?.icon ?? "location-outline"}
                      size={14}
                      color="#1A1A1A"
                    />
                    <Text style={styles.activeFilterTagText}>{label}</Text>
                    <Ionicons name="close" size={14} color="#1A1A1A" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Expanded Filters Section */}
      {filtersExpanded && (
        <View style={styles.expandedFiltersSection}>
          {/* Category Filters */}
          <View style={styles.filterGroup}>
            <View style={styles.filterGroupHeader}>
              <Ionicons name="grid-outline" size={16} color="#666" />
              <Text style={styles.filterGroupTitle}>Categorie</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                style={[styles.filterChip, activeTab === "Tutte le categorie" && styles.filterChipActive]}
                onPress={() => setActiveTab("Tutte le categorie")}
              >
                <Ionicons
                  name="apps-outline"
                  size={16}
                  color={activeTab === "Tutte le categorie" ? "#1A1A1A" : "#FF7A00"}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    activeTab === "Tutte le categorie" && styles.filterChipTextActive,
                  ]}
                >
                  Tutte
                </Text>
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.filterChip, activeTab === category && styles.filterChipActive]}
                  onPress={() => setActiveTab(category)}
                >
                  <Ionicons
                    name={CATEGORY_ICON[category] ?? "help-circle-outline"}
                    size={16}
                    color={activeTab === category ? "#1A1A1A" : "#FF7A00"}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      activeTab === category && styles.filterChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Environment Filters */}
          <View style={styles.filterGroup}>
            <View style={styles.filterGroupHeader}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.filterGroupTitle}>Ambiente</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {ENVIRONMENT_OPTIONS.map((env) => {
                const isSelected = selectedEnvironments.includes(env.value);
                return (
                  <TouchableOpacity
                    key={env.value}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipActive,
                    ]}
                    onPress={() => toggleEnvironment(env.value)}
                  >
                    <Ionicons
                      name={env.icon}
                      size={16}
                      color={isSelected ? "#1A1A1A" : "#FF7A00"}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {env.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#1A1A1A"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </Animated.View>
  ), [headerOpacity, headerTranslateY, searchQuery, activeTab, categories, userData, selectedEnvironments, toggleEnvironment, filtersExpanded, hasActiveFilters, activeCategoryName, selectedEnvironmentLabels]);



  return (
    <>
      <FlatList
        ref={flatListRef}
        data={filteredPOI}
        keyExtractor={(item) => item.id}
        renderItem={renderPOI}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.gridContainer,
          { paddingBottom: Platform.OS === 'ios' ? 49 + insets.bottom + 20 : 40 + insets.bottom },
        ]}
        ListEmptyComponent={
          isLoadingPOI && paginatedPOI.length === 0 ? (
            <View style={styles.emptyContainer}>
              <SpinnerLoader />
            </View>
          ) : (
            <Text style={styles.emptyText}>Nessun luogo trovato</Text>
          )
        }
        showsVerticalScrollIndicator={false}
        // Performance tuning for smoother scroll
        initialNumToRender={Platform.OS === "android" ? 8 : 12}
        maxToRenderPerBatch={Platform.OS === "android" ? 8 : 12}
        windowSize={Platform.OS === "android" ? 7 : 15}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={Platform.OS === "android"}
        getItemLayout={getItemLayout}
        // Fase di rallentamento più morbida
        decelerationRate={Platform.OS === "ios" ? "normal" : 0.985}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      />
      
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Animated.View
          style={[
            styles.scrollToTopButton,
            {
              opacity: scrollToTopButtonOpacity,
              transform: [{ scale: scrollToTopButtonScale }],
              bottom: 105 + insets.bottom, // 85px (bottom menu) + 20px (padding)
            },
          ]}
        >
          <TouchableOpacity
            onPress={scrollToTop}
            style={styles.scrollToTopButtonInner}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
};

// Export ChatStarter - memoization handled internally via useMemo/useCallback
export default ChatStarter;

const styles = StyleSheet.create({
  container: { flex: 1 },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  compactFiltersBar: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 0.5,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: "Montserrat",
    padding: 0,
  },
  clearButton: {
    marginLeft: 6,
    padding: 2,
  },
  activeFiltersRow: {
    minHeight: 32,
  },
  activeFiltersContent: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8ECDF0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  activeFilterTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: "Montserrat",
  },
  expandFiltersButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 0.5,
    position: "relative",
  },
  expandFiltersButtonActive: {
    backgroundColor: "#8ECDF0",
    borderColor: "#1A1A1A",
  },
  expandButtonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF7A00",
  },
  expandButtonBadgeDot: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#FF7A00",
  },
  expandedFiltersSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 14,
  },
  filterGroup: {
    gap: 8,
  },
  filterGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  filterGroupTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Montserrat",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterBadge: {
    backgroundColor: "#FF7A00",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Montserrat",
  },
  filterScrollContent: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 40,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    gap: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 0.5,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
  },
  filterChipActive: {
    backgroundColor: "#8ECDF0",
    borderColor: "#1A1A1A",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    fontFamily: "Montserrat",
  },
  filterChipTextActive: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  gridContainer: { flexDirection: "column", paddingHorizontal: 10, gap: 12 },
  promotionsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  promotionsTitle: { fontSize: 24, fontWeight: "700", color: "#1A1A1A", fontFamily: "Montserrat" },
  seeAllText: { fontSize: 14, fontWeight: "600", color: "#666" },
  spacer: { height: 140 },
  debugTestButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  debugTestButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Montserrat',
  },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 60, marginTop: 40, paddingBottom: 20 },
  headerTextContainer: { flex: 1, marginRight: 12, paddingRight: 8 },
  headerTitle: { fontSize: 34, fontWeight: "700", color: "#1A1A1A", fontFamily: "Montserrat" },
  headerSubtitle: { fontSize: 20, fontWeight: "500", color: "#1A1A1A", marginTop: 4, fontFamily: "Montserrat" },
  scrollToTopButton: {
    position: "absolute",
    right: 20,
    zIndex: 1000,
  },
  scrollToTopButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8ECDF0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#666",
    fontFamily: "Montserrat",
  },
});