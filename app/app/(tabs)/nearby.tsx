import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Page from '@/components/templates/Page';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Header from '@/components/templates/Header';
import PoiCard from "@/components/organisms/chat/poi-card";
import { useNavigation } from "@/context/NavigationContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logScreenView } from '@/services/analytics';

// Environment options con icone e traduzioni
const ENVIRONMENT_OPTIONS = [
    { value: "indoor", label: "Al Chiuso", icon: "home-outline" as const },
    { value: "outdoor", label: "All'Aperto", icon: "sunny-outline" as const },
    { value: "mixed", label: "Misto", icon: "swap-horizontal-outline" as const },
] as const;

const Index = React.memo(() => {
    const { paginatedPOI, loadMore, hasMore, userCoords, setMapMode } = useNavigation();
    const insets = useSafeAreaInsets();
    
    // Calculate bottom padding for iOS tab bar (49px tab bar + safe area bottom)
    const bottomPadding = Platform.OS === 'ios' ? 49 + insets.bottom + 20 : 200;
    
    // Ensure map mode is disabled when on this tab (cleanup POI)
    useFocusEffect(
        React.useCallback(() => {
            setMapMode(false);
            logScreenView('Nearby');
            return () => {
                // Optional: cleanup on unfocus if needed
            };
        }, [setMapMode])
    );
    
    // Calculate initial radius based on closest POI, or default to 10km
    const MIN_RADIUS = 10000; // 10km
    const MAX_RADIUS = 30000; // 30km
    
    // Refs
    const flatListRef = useRef<FlatList>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const scrollToTopButtonOpacity = useRef(new Animated.Value(0)).current;
    const scrollToTopButtonScale = useRef(new Animated.Value(0.8)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);
    
    const initialRadius = useMemo(() => {
        if (paginatedPOI.length > 0 && userCoords) {
            const closestPOI = paginatedPOI.find(p => isFinite(p.distance));
            if (closestPOI && closestPOI.distance > 0) {
                // Set initial radius to 1.5x the closest POI distance, clamped between 10km and 30km
                const calculated = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, closestPOI.distance * 1.5));
                return calculated;
            }
        }
        return MIN_RADIUS; // Default 10km
    }, [paginatedPOI, userCoords]);
    
    const [radius, setRadius] = useState(initialRadius);
    const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
    
    // Clamp radius to valid range
    const setRadiusClamped = useCallback((value: number) => {
        setRadius(Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, value)));
    }, []);

    const toggleEnvironment = useCallback((env: string) => {
        setSelectedEnvironments((prev) => {
            if (prev.includes(env)) {
                return prev.filter((e) => e !== env);
            } else {
                return [...prev, env];
            }
        });
    }, []);
    
    // Update radius when initialRadius changes (when POI are loaded)
    React.useEffect(() => {
        if (initialRadius > radius) {
            setRadius(initialRadius);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRadius]);


    const filteredPOI = useMemo(() => {
        // Deduplicate by ID first to prevent duplicate keys
        const seen = new Map<string, typeof paginatedPOI[0]>();
        paginatedPOI.forEach((p) => {
            if (!seen.has(p.id)) {
                seen.set(p.id, p);
            }
        });
        const uniquePOI = Array.from(seen.values());
        
        // Filter out POI with invalid distances (Infinity or NaN)
        const validPOI = uniquePOI.filter((p: any) => isFinite(p.distance));
        const withinRadius = validPOI.filter((p: any) => p.distance <= radius);
        
        // Filter by environment if any is selected
        let filtered = withinRadius;
        if (selectedEnvironments.length > 0) {
            filtered = withinRadius.filter((p: any) => {
                const poiEnvironment = p.status?.toLowerCase() || "";
                return selectedEnvironments.some(env => env.toLowerCase() === poiEnvironment);
            });
        }
        
        // Sort by distance to ensure closest POI are shown first
        // (paginatedPOI is already sorted, but after filtering we should re-sort to maintain order)
        return filtered.sort((a: any, b: any) => a.distance - b.distance);
    }, [paginatedPOI, radius, selectedEnvironments]);

    // Show all filtered POI (no artificial limit)
    // The FlatList will handle virtualization for performance
    const visiblePOI = filteredPOI;

    const handleLoadMore = useCallback(() => {
        // Load more POI from server if there are more available
        // The FlatList will call this when user scrolls near the end
        // We should load more to ensure we have all POI within the selected radius
        if (hasMore) {
            loadMore();
        }
    }, [hasMore, loadMore]);

    const renderPOI = useCallback(({ item }: { item: any }) =>
        <PoiCard destination={item} />,
        []
    );

    // Throttle scroll handler to reduce re-renders
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastScrollYRef = useRef(0);
    const showScrollToTopRef = useRef(false);
    
    // Sync ref with state to avoid stale closures
    React.useEffect(() => {
        showScrollToTopRef.current = showScrollToTop;
    }, [showScrollToTop]);
    
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
                
                // Stop any ongoing animation
                if (animationRef.current) {
                    animationRef.current.stop();
                    animationRef.current = null;
                }
                
                // Start new animation
                animationRef.current = Animated.parallel([
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
                
                animationRef.current.start(() => {
                    animationRef.current = null;
                });
            }
        }, 100); // Throttle to 100ms
    }, [scrollToTopButtonOpacity, scrollToTopButtonScale]);
    
    // Cleanup scroll timeout and animations on unmount
    React.useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
                scrollTimeoutRef.current = null;
            }
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };
    }, []);

    const scrollToTop = useCallback(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);


    // Memoize environment options rendering
    const environmentOptions = useMemo(() => (
        ENVIRONMENT_OPTIONS.map((env) => {
            const isSelected = selectedEnvironments.includes(env.value);
            return (
                <TouchableOpacity
                    key={env.value}
                    style={[
                        styles.environmentChip,
                        isSelected && styles.environmentChipActive,
                    ]}
                    onPress={() => toggleEnvironment(env.value)}
                >
                    <Ionicons
                        name={env.icon}
                        size={14}
                        color={isSelected ? "#1A1A1A" : "#FF7A00"}
                    />
                    <Text
                        style={[
                            styles.environmentChipText,
                            isSelected && styles.environmentChipTextActive,
                        ]}
                    >
                        {env.label}
                    </Text>
                </TouchableOpacity>
            );
        })
    ), [selectedEnvironments, toggleEnvironment]);

    const listHeader = useMemo(() => (
        <View style={styles.descriptionContainer}>
            <Ionicons name="location-outline" size={32} color="#FF7A00" style={{ marginBottom: 8 }} />
            <Text style={styles.descriptionText}>
                {userCoords 
                    ? "Scopri le attività e i punti di interesse vicino a te."
                    : "Attendere il caricamento della posizione..."}
            </Text>
            {userCoords && (
                <>
                    <View style={styles.sliderWrapper}>
                        <Text style={styles.sliderLabel}>
                            Distanza - {(radius / 1000).toFixed(0)} km
                        </Text>
                        <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={MIN_RADIUS}
                            maximumValue={MAX_RADIUS}
                            step={1000}
                            value={radius}
                            onValueChange={setRadiusClamped}
                            minimumTrackTintColor="#FF7A00"
                            maximumTrackTintColor="#d3d3d3"
                            thumbTintColor="#FF7A00"
                        />
                    </View>
                    
                    {/* Environment Filters - Compact inline layout */}
                    <View style={styles.environmentSection}>
                        <View style={styles.environmentRow}>
                            <Text style={styles.environmentLabel}>Ambiente:</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.environmentScrollContent}
                            >
                                {environmentOptions}
                            </ScrollView>
                        </View>
                    </View>
                </>
            )}
            {!userCoords && (
                <Text style={styles.loadingText}>Caricamento posizione...</Text>
            )}
        </View>
    ), [radius, userCoords, setRadiusClamped, environmentOptions]);

    return (
        <Page noPaddingTop noBottomBar alignItems="center" justifyContent="space-between" page="home">
            <Header text='' />
            <FlatList
                ref={flatListRef}
                data={visiblePOI}
                keyExtractor={(item) => item.id}
                renderItem={renderPOI}
                ListHeaderComponent={listHeader}
                contentContainerStyle={[styles.gridContainer, { paddingBottom: bottomPadding }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {!userCoords 
                                ? "Attendere il caricamento della posizione..."
                                : filteredPOI.length === 0 && paginatedPOI.length > 0
                                ? selectedEnvironments.length > 0
                                    ? "Nessun luogo trovato con i filtri selezionati. Prova ad aumentare la distanza o modificare l'ambiente."
                                    : "Nessun luogo trovato nel raggio selezionato. Prova ad aumentare la distanza."
                                : "Nessun luogo trovato"}
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                initialNumToRender={8}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                windowSize={10}
                removeClippedSubviews={true}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                onScroll={handleScroll}
                scrollEventThrottle={100}
                ListFooterComponent={<View style={{ height: 200 }} />}
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
        </Page>
    );
});

Index.displayName = 'NearbyTab';

export default Index;

const styles = StyleSheet.create({
    scrollContent: { width: '100%', paddingBottom: 80, paddingHorizontal: 10 },
    descriptionContainer: {
        backgroundColor: '#f0f4f7',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginTop: 75,
        width: '100%',
    },
    gridContainer: { 
        flexDirection: "column", 
        paddingHorizontal: 10, 
        gap: 12,
    },
    descriptionText: { fontSize: 13, color: '#333', lineHeight: 18, textAlign: 'center', marginBottom: 12 },
    sliderWrapper: { width: '100%', marginBottom: 10 },
    sliderLabel: { fontSize: 15, fontWeight: '600', color: '#555', marginBottom: 5, textAlign: 'center' },
    environmentSection: { width: '100%', marginTop: 2 },
    environmentRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 8 },
    environmentLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
    environmentScrollContent: { flexDirection: 'row', gap: 6, paddingRight: 10 },
    environmentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 0.5,
        borderWidth: 1.5,
        borderColor: '#F0F0F0',
    },
    environmentChipActive: {
        backgroundColor: '#8ECDF0',
        borderColor: '#1A1A1A',
    },
    environmentChipText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        fontFamily: 'Montserrat',
    },
    environmentChipTextActive: {
        color: '#1A1A1A',
        fontWeight: '700',
    },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#888' },
    loadingText: { fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' },
    scrollToTopButton: {
        position: 'absolute',
        right: 20,
        zIndex: 1000,
    },
    scrollToTopButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#8ECDF0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#1A1A1A',
    },
});