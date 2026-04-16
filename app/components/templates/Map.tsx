import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import {
    Alert,
    StyleSheet,
    View,
    Platform,
    TouchableOpacity,
    Text,
    Image,
    ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, CATEGORY_ICON, CATEGORY_IT, CATEGORY_COLOR } from "@/context/NavigationContext";
import { useBottomSheet } from '@/context/BottomSheetContext';
import { router } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const MAIN_COLOR = '#FF7A00';

// Debounce delay for region changes (ms)
// Reduced for smoother updates while still preventing excessive re-renders
// iOS: higher debounce to reduce re-renders during pan/zoom and avoid MapKit texture atlas / crash
const REGION_CHANGE_DEBOUNCE = Platform.OS === 'ios' ? 400 : 150;

// iOS: max markers to render (MapKit texture atlas limit; keep under 100 to avoid insertObject:nil crash)
const IOS_MAX_MARKERS = 80;

// Padding factor to show POI slightly outside viewport (1.2 = 20% margin)
const VIEWPORT_PADDING = 1.2;

// Distance threshold for considering POIs as "close" (in degrees)
// This is approximately 400-600 meters depending on latitude
const CLOSE_POI_THRESHOLD = 0.006;

interface MapProps {
    noCenterButton?: boolean;
    polylines?: { latitude: number; longitude: number }[];
}

// Single POI Marker Component - separate component for better rendering
// Increased size and visibility for better rendering on Android
// Memoized with custom comparison for better performance
const POIMarkerView = React.memo(({ icon, color }: { icon: keyof typeof Ionicons.glyphMap; color: string }) => {
    const markerSize = 32; // Increased from 22 to 32 for better visibility
    const borderRadius = markerSize / 2;
    const iconSize = 18; // Increased from 15 to 18
    
    // Validate props
    const validIcon = icon && typeof icon === 'string' ? icon : 'location';
    const validColor = color && typeof color === 'string' ? color : MAIN_COLOR;
    
    return (
        <View
            style={{
                width: markerSize,
                height: markerSize,
                borderRadius: borderRadius,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: validColor,
                borderWidth: 2.5, // Increased from 1.5 to 2.5 for better visibility
                backgroundColor: '#FFFFFF', // Fully opaque white background
                overflow: 'hidden',
                // Add shadow/elevation for better visibility on Android
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4, // Android elevation for depth
            }}
        >
            <Ionicons
                name={validIcon}
                size={iconSize}
                color={validColor}
            />
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if icon or color changes
    return prevProps.icon === nextProps.icon && prevProps.color === nextProps.color;
});
POIMarkerView.displayName = 'POIMarkerView';

// Cluster Marker Component using SVG to avoid clipping issues
// Using smaller dimensions to prevent react-native-maps clipping
// Memoized for better performance
const ClusterMarkerSVG = React.memo(({ count, color }: { count: number; color: string }) => {
    const size = 40;
    const center = size / 2;
    const radius = 15;
    const borderWidth = 2;
    
    // Validate props
    const validCount = isFinite(count) && count > 0 ? Math.floor(count) : 1;
    const validColor = color && typeof color === 'string' ? color : MAIN_COLOR;
    
    return (
        <Svg 
            width={size} 
            height={size} 
            viewBox={`0 0 ${size} ${size}`}
        >
            {/* White border circle */}
            <Circle
                cx={center}
                cy={center}
                r={radius + borderWidth}
                fill="#fff"
            />
            {/* Colored circle */}
            <Circle
                cx={center}
                cy={center}
                r={radius}
                fill={validColor}
            />
            {/* Text */}
            <SvgText
                x={center}
                y={center + 3}
                fontSize="12"
                fontWeight="800"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
            >
                {validCount}
            </SvgText>
        </Svg>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if count or color changes
    return prevProps.count === nextProps.count && prevProps.color === nextProps.color;
});
ClusterMarkerSVG.displayName = 'ClusterMarkerSVG';

// iOS-only: cluster marker using View+Text (no SVG) to avoid MapKit snapshot/SVG crashes
const ClusterMarkerViewIOS = React.memo(({ count, color }: { count: number; color: string }) => {
    const size = 40;
    const validCount = isFinite(count) && count > 0 ? Math.floor(count) : 1;
    const validColor = color && typeof color === 'string' ? color : MAIN_COLOR;
    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: validColor,
                borderWidth: 2,
                borderColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{validCount}</Text>
        </View>
    );
}, (prevProps, nextProps) => prevProps.count === nextProps.count && prevProps.color === nextProps.color);
ClusterMarkerViewIOS.displayName = 'ClusterMarkerViewIOS';

// Helper function to get marker icon and color based on POI category
const getPOIMarkerInfo = (poi: any) => {
    const rawCategory = poi?.category || '';
    const tags = poi?.tags || [];

    // First, translate category if needed (from English to Italian)
    const category = CATEGORY_IT[rawCategory] || rawCategory;

    // Check tags first (same logic as activities) - priority
    if (tags.includes('walk') || tags.includes('passeggiata')) {
        return {
            icon: 'walk' as keyof typeof Ionicons.glyphMap,
            color: '#4CAF50', // Green
        };
    }
    if (tags.includes('playground') || tags.includes('parco giochi')) {
        return {
            icon: 'happy' as keyof typeof Ionicons.glyphMap,
            color: '#E91E63', // Pink
        };
    }
    if (tags.includes('tour') || tags.includes('visita')) {
        return {
            icon: 'map' as keyof typeof Ionicons.glyphMap,
            color: '#FF7A00', // Orange
        };
    }
    if (tags.includes('museum') || tags.includes('museo')) {
        const icon = CATEGORY_ICON['Museo'] || 'business';
        const color = CATEGORY_COLOR['Museo'] || '#9C27B0';
        return {
            icon: (icon || 'location') as keyof typeof Ionicons.glyphMap,
            color: color || MAIN_COLOR,
        };
    }
    if (tags.includes('adventure') || tags.includes('avventura')) {
        const icon = CATEGORY_ICON['Parco avventura'] || 'trail-sign';
        const color = CATEGORY_COLOR['Parco avventura'] || '#FF5722';
        return {
            icon: (icon || 'location') as keyof typeof Ionicons.glyphMap,
            color: color || MAIN_COLOR,
        };
    }

    // Fallback to category mapping using centralized constants
    const categoryIcon = CATEGORY_ICON[category] || 'location';
    const categoryColor = CATEGORY_COLOR[category] || MAIN_COLOR;

    return {
        icon: (categoryIcon || 'location') as keyof typeof Ionicons.glyphMap,
        color: categoryColor || MAIN_COLOR,
    };
};

// Helper function to check if a POI is within the visible region
const isPOIInRegion = (poi: any, region: Region | null): boolean => {
    if (!region) return true; // Show all if region not set yet
    
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    
    // Calculate bounds with padding
    const latPadding = latitudeDelta * VIEWPORT_PADDING;
    const lonPadding = longitudeDelta * VIEWPORT_PADDING;
    
    const minLat = latitude - latPadding;
    const maxLat = latitude + latPadding;
    const minLon = longitude - lonPadding;
    const maxLon = longitude + lonPadding;
    
    const poiLat = poi.coordinates?.latitude;
    const poiLon = poi.coordinates?.longitude;
    
    return (
        poiLat >= minLat &&
        poiLat <= maxLat &&
        poiLon >= minLon &&
        poiLon <= maxLon
    );
};

// Calculate distance between two coordinates (Haversine formula simplified for small distances)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    return Math.sqrt(dLat * dLat + dLon * dLon);
};

// Find POIs that are close to a given POI
// Uses dynamic threshold based on zoom level if region is provided
const findNearbyPOIs = (
    targetPOI: any, 
    allPOIs: any[], 
    threshold?: number,
    region?: Region | null
): any[] => {
    const targetLat = targetPOI.coordinates?.latitude;
    const targetLon = targetPOI.coordinates?.longitude;
    
    if (!targetLat || !targetLon) return [];
    
    // Use dynamic threshold based on zoom level if region is provided
    // When zoomed in (small latitudeDelta), use smaller threshold
    // When zoomed out (large latitudeDelta), use larger threshold
    let effectiveThreshold = threshold || CLOSE_POI_THRESHOLD;
    if (region) {
        // Scale threshold based on zoom: at zoom 0.001 (very zoomed in), use 0.0005
        // at zoom 0.01 (zoomed out), use 0.002
        const zoomFactor = Math.max(0.001, Math.min(0.01, region.latitudeDelta));
        effectiveThreshold = CLOSE_POI_THRESHOLD * (1 + zoomFactor * 2);
    }
    
    return allPOIs.filter((poi) => {
        if (poi.id === targetPOI.id) return false; // Exclude self
        const poiLat = poi.coordinates?.latitude;
        const poiLon = poi.coordinates?.longitude;
        if (!poiLat || !poiLon) return false;
        
        const distance = calculateDistance(targetLat, targetLon, poiLat, poiLon);
        return distance <= effectiveThreshold;
    });
};

// Cluster POIs together - returns array of clusters, each containing multiple POIs
interface POICluster {
    id: string;
    pois: any[];
    centerLat: number;
    centerLon: number;
    count: number;
}

const createPOIClusters = (pois: any[], threshold: number = CLOSE_POI_THRESHOLD): POICluster[] => {
    const clusters: POICluster[] = [];
    const processed = new Set<string>();
    
    pois.forEach((poi) => {
        if (processed.has(poi.id)) return;
        
        const poiLat = poi.coordinates?.latitude;
        const poiLon = poi.coordinates?.longitude;
        // Validate coordinates are not null/undefined and are finite numbers
        if (poiLat == null || poiLon == null || !isFinite(poiLat) || !isFinite(poiLon)) {
            return;
        }
        
        // Find all nearby POIs
        const nearbyPOIs = findNearbyPOIs(poi, pois, threshold);
        const clusterPOIs = [poi, ...nearbyPOIs];
        
        // Calculate cluster center (average of all POIs in cluster)
        const totalLat = clusterPOIs.reduce((sum, p) => {
            const lat = p.coordinates?.latitude;
            return sum + (lat != null && isFinite(lat) ? lat : 0);
        }, 0);
        const totalLon = clusterPOIs.reduce((sum, p) => {
            const lon = p.coordinates?.longitude;
            return sum + (lon != null && isFinite(lon) ? lon : 0);
        }, 0);
        const centerLat = totalLat / clusterPOIs.length;
        const centerLon = totalLon / clusterPOIs.length;
        
        // Validate cluster center coordinates
        if (!isFinite(centerLat) || !isFinite(centerLon)) {
            return;
        }
        
        // Mark all POIs in cluster as processed
        clusterPOIs.forEach(p => processed.add(p.id));
        
        clusters.push({
            id: `cluster-${poi.id}`,
            pois: clusterPOIs,
            centerLat,
            centerLon,
            count: clusterPOIs.length,
        });
    });
    
    return clusters;
};

const MapInner = ({ polylines, noCenterButton }: MapProps, ref: React.Ref<MapView>) => {
    const mapRef = useRef<MapView | null>(null);
    const { paginatedPOI } = useNavigation();
    const { handleToggleBottomSheet } = useBottomSheet();

    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [visibleRegion, setVisibleRegion] = useState<Region | null>(null);
    const debounceTimerRef = useRef<number | null>(null);
    const isUserInteractingRef = useRef<boolean>(false);
    const [markerTracksViewChanges, setMarkerTracksViewChanges] = useState<boolean>(Platform.OS === 'android');
    const markerViewChangesTimerRef = useRef<NodeJS.Timeout | null>(null);

    // All unique POIs (for finding nearby POIs) - not filtered by region
    const allUniquePOI = React.useMemo(() => {
        if (!paginatedPOI || paginatedPOI.length === 0) return [];
        
        const seenMap: Record<string, any> = {};
        const uniquePOI: any[] = [];
        
        // Filter and deduplicate - only include POI with valid coordinates
        // Note: distance is not required for map display, only coordinates are needed
        paginatedPOI.forEach((poi) => {
            const hasValidCoords = poi.coordinates?.latitude != null && 
                                   poi.coordinates?.longitude != null &&
                                   isFinite(poi.coordinates.latitude) &&
                                   isFinite(poi.coordinates.longitude);
            
            if (!seenMap[poi.id] && hasValidCoords) {
                seenMap[poi.id] = true;
                uniquePOI.push(poi);
            }
        });
        
        // Sort by distance (if available), otherwise keep original order
        return uniquePOI.sort((a, b) => {
            const distA = isFinite(a.distance) ? a.distance : Infinity;
            const distB = isFinite(b.distance) ? b.distance : Infinity;
            return distA - distB;
        });
    }, [paginatedPOI]);

    // Create clusters from POIs - groups nearby POIs together
    // Throttled to prevent excessive recalculations during pan/zoom
    const poiClusters = React.useMemo(() => {
        if (allUniquePOI.length === 0) {
            console.log('[Map] No POIs available to display');
            return [];
        }
        
        // Filter by visible region to improve performance
        // The debounce already handles interaction throttling
        const regionFiltered = visibleRegion
            ? allUniquePOI.filter((poi) => isPOIInRegion(poi, visibleRegion))
            : allUniquePOI;
        
        // Create clusters with dynamic threshold based on zoom
        // Use a more conservative threshold to avoid over-clustering
        // Max multiplier is 1.5x instead of 3x to preserve individual markers
        const threshold = visibleRegion 
            ? Math.min(CLOSE_POI_THRESHOLD * (1 + Math.min(visibleRegion.latitudeDelta * 5, 0.5)), CLOSE_POI_THRESHOLD * 1.5)
            : CLOSE_POI_THRESHOLD;
        
        const clusters = createPOIClusters(regionFiltered, threshold);
        
        // Debug: log cluster distribution
        const singleMarkers = clusters.filter(c => c.count === 1).length;
        const multiClusters = clusters.filter(c => c.count > 1).length;
        console.log(`[Map] Total POIs: ${allUniquePOI.length}, Region filtered: ${regionFiltered.length}, Clusters: ${clusters.length} (${singleMarkers} single markers, ${multiClusters} multi-POI clusters)`);
        
        return clusters;
    }, [allUniquePOI, visibleRegion]);

    // On Android, enable tracksViewChanges briefly whenever clusters change so
    // icons render, then disable to prevent bitmap regen / OOM.
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        // Re-enable to refresh icons for new POIs / clusters
        setMarkerTracksViewChanges(true);

        if (markerViewChangesTimerRef.current) {
            clearTimeout(markerViewChangesTimerRef.current);
        }
        markerViewChangesTimerRef.current = setTimeout(() => {
            setMarkerTracksViewChanges(false);
        }, 3000); // keep longer to ensure first render shows markers

        return () => {
            if (markerViewChangesTimerRef.current) {
                clearTimeout(markerViewChangesTimerRef.current);
            }
        };
    }, [poiClusters]);

    const initLocation = async () => {
        try {
            // First check existing permissions to avoid unnecessary requests
            let status = (await Location.getForegroundPermissionsAsync()).status;
            
            // Only request if not already granted
            if (status !== 'granted') {
                try {
                    const result = await Location.requestForegroundPermissionsAsync();
                    status = result.status;
                } catch (error: any) {
                    // Handle OutOfMemoryError gracefully
                    if (error?.message?.includes('OutOfMemoryError') || error?.cause?.message?.includes('OutOfMemoryError')) {
                        console.warn('[Map] OutOfMemoryError when requesting location permissions. Retrying after delay...');
                        // Wait a bit and try again with just checking permissions
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        status = (await Location.getForegroundPermissionsAsync()).status;
                    } else {
                        throw error;
                    }
                }
            }
            
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is required to show your position.');
                return;
            }

            const { coords } = await Location.getCurrentPositionAsync({
                accuracy: Platform.OS === 'android'
                    ? Location.Accuracy.Balanced
                    : Location.Accuracy.High,
            });

            const coordsObj = { latitude: coords.latitude, longitude: coords.longitude };
            setLocation(coordsObj);

            if (mapRef.current) {
                mapRef.current.animateCamera({ center: coordsObj });
            }
        } catch (e: any) {
            // Handle OutOfMemoryError specifically
            if (e?.message?.includes('OutOfMemoryError') || e?.cause?.message?.includes('OutOfMemoryError')) {
                console.warn('[Map] OutOfMemoryError getting location. App may be low on memory.');
            } else {
                console.warn('Error getting location', e);
            }
        }
    };

    useEffect(() => {
        initLocation();
    }, []);

    const recenterOnUser = async () => {
        if (!mapRef.current) return;
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }
            const { coords } = await Location.getCurrentPositionAsync({
                accuracy: Platform.OS === 'android'
                    ? Location.Accuracy.Balanced
                    : Location.Accuracy.High,
            });
            const coordsObj = { latitude: coords.latitude, longitude: coords.longitude };
            setLocation(coordsObj);
            mapRef.current.animateCamera({ center: coordsObj });
        } catch (e: any) {
            // Handle OutOfMemoryError specifically
            if (e?.message?.includes('OutOfMemoryError') || e?.cause?.message?.includes('OutOfMemoryError')) {
                console.warn('[Map] OutOfMemoryError recentering on user. App may be low on memory.');
            } else {
                console.warn('Error recentering on user', e);
            }
        }
    };

    // Handle region changes with debouncing to avoid excessive re-renders
    // Use onRegionChange for smoother updates during interaction
    const handleRegionChange = useCallback((region: Region) => {
        isUserInteractingRef.current = true;
        
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Set new timer to update region after debounce delay
        debounceTimerRef.current = setTimeout(() => {
            setVisibleRegion(region);
            isUserInteractingRef.current = false;
        }, REGION_CHANGE_DEBOUNCE);
    }, []);

    // Handle region change complete for final update
    const handleRegionChangeComplete = useCallback((region: Region) => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Immediately update when user stops interacting
        setVisibleRegion(region);
        isUserInteractingRef.current = false;
    }, []);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleClusterPress = (cluster: POICluster) => {
        // Show list of all POIs in cluster
        const sortedPOIs = cluster.pois.sort((a, b) => a.distance - b.distance);
        
        handleToggleBottomSheet(
            <View style={styles.poiListContainer}>
                <Text style={styles.poiListTitle}>
                    {cluster.count} POI nelle vicinanze
                </Text>
                <ScrollView style={styles.poiListScroll} showsVerticalScrollIndicator={false}>
                    {sortedPOIs.map((poi) => {
                        const markerInfo = getPOIMarkerInfo(poi);
                        return (
                            <TouchableOpacity
                                key={poi.id}
                                style={styles.poiListItem}
                                onPress={() => {
                                    handleToggleBottomSheet(null);
                                    router.push({ 
                                        pathname: '/destinations/poi', 
                                        params: { destinationId: poi.id } 
                                    });
                                }}
                            >
                                <View style={[styles.poiListIcon, { borderColor: markerInfo.color }]}>
                                    <Ionicons
                                        name={markerInfo.icon}
                                        size={20}
                                        color={markerInfo.color}
                                    />
                                </View>
                                <View style={styles.poiListContent}>
                                    <Text style={styles.poiListName} numberOfLines={1}>
                                        {poi.title}
                                    </Text>
                                    <Text style={styles.poiListCategory} numberOfLines={1}>
                                        {poi.category}
                                    </Text>
                                    {poi.distance != null && isFinite(poi.distance) && (
                                        <Text style={styles.poiListDistance}>
                                            {poi.distance < 1000 
                                                ? `${Math.round(poi.distance)}m`
                                                : `${(poi.distance / 1000).toFixed(1)}km`
                                            }
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>,
            Math.min(400 + sortedPOIs.length * 80, 600)
        );
    };

    const handlePOIPress = (poi: any) => {
        // Single POI - show normal card
        handleToggleBottomSheet(
            <View style={styles.poiCard}>
                {poi.image && <Image
                    source={{ uri: poi.image }}
                    style={styles.poiImage}
                />}
                <Text style={styles.poiTitle}>{poi.title}</Text>
                <Text style={styles.poiCategory}>{poi.category.toUpperCase()}</Text>
                {poi.age_min != null && poi.age_max != null && (
                    <Text style={styles.poiAge}>Età consigliata: {poi.age_min} - {poi.age_max} anni</Text>
                )}
                <TouchableOpacity
                    style={styles.goButton}
                    onPress={() => {
                        handleToggleBottomSheet(null); // close sheet
                        router.push({ pathname: '/destinations/poi', params: { destinationId: poi.id } });
                    }}
                >
                    <Text style={styles.goButtonText}>Vai al dettaglio</Text>
                </TouchableOpacity>
            </View>,
            320
        );
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={(node) => {
                    mapRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                showsUserLocation
                showsMyLocationButton={false}
                initialRegion={(() => {
                    // Try to get initial coordinates from polylines first, then location, then default
                    let lat = 0;
                    let lon = -69.89;
                    
                    if (polylines && polylines.length > 0 && polylines[0]) {
                        const firstPoly = polylines[0];
                        if (firstPoly.latitude != null && isFinite(firstPoly.latitude) &&
                            firstPoly.longitude != null && isFinite(firstPoly.longitude)) {
                            lat = firstPoly.latitude;
                            lon = firstPoly.longitude;
                        }
                    } else if (location) {
                        if (location.latitude != null && isFinite(location.latitude) &&
                            location.longitude != null && isFinite(location.longitude)) {
                            lat = location.latitude;
                            lon = location.longitude;
                        }
                    }
                    
                    return {
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                })()}
                onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChangeComplete}
            >
                {
                    polylines &&
                    polylines?.length > 0 &&
                    polylines[0]?.latitude != null &&
                    polylines[0]?.longitude != null &&
                    isFinite(polylines[0].latitude) &&
                    isFinite(polylines[0].longitude) &&
                    polylines[polylines.length - 1]?.latitude != null &&
                    polylines[polylines.length - 1]?.longitude != null &&
                    isFinite(polylines[polylines.length - 1].latitude) &&
                    isFinite(polylines[polylines.length - 1].longitude) && (
                    <>
                        <Marker coordinate={polylines[0]}>
                            <View style={styles.pickupMarker}><Text>🚩</Text></View>
                        </Marker>
                        <Marker coordinate={polylines[polylines.length - 1]}>
                            <View style={styles.dropoffMarker}><Text>🏁</Text></View>
                        </Marker>
                        <Polyline 
                            coordinates={polylines.filter(coord => 
                                coord?.latitude != null && 
                                coord?.longitude != null &&
                                isFinite(coord.latitude) &&
                                isFinite(coord.longitude)
                            )} 
                            strokeWidth={4} 
                            strokeColor="#3b82f6" 
                        />
                    </>
                )}

                {(() => {
                    if (!Array.isArray(poiClusters) || poiClusters.length === 0) {
                        return null;
                    }
                    
                    const validMarkers: React.ReactElement[] = [];
                    
                    poiClusters.forEach((cluster) => {
                        // Validate cluster exists and has required properties
                        if (!cluster || !cluster.id) return;
                        
                        // If cluster has only one POI, show it as a normal marker
                        if (cluster.count === 1) {
                            const poi = cluster.pois?.[0];
                            if (!poi || !poi.id) return;
                            
                            const lat = poi.coordinates?.latitude;
                            const lon = poi.coordinates?.longitude;
                            if (lat == null || lon == null || !isFinite(lat) || !isFinite(lon)) {
                                console.warn(`[Map] Skipping POI ${poi.id} with invalid coordinates`);
                                return;
                            }
                            
                            const markerInfo = getPOIMarkerInfo(poi);
                            if (!markerInfo || !markerInfo.icon || !markerInfo.color) {
                                console.warn(`[Map] Skipping POI ${poi.id} with invalid marker info`);
                                return;
                            }
                            
                            validMarkers.push(
                                <Marker
                                    key={`poi-${poi.id}`}
                                    coordinate={{
                                        latitude: lat,
                                        longitude: lon,
                                    }}
                                    onPress={() => handlePOIPress(poi)}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    tracksViewChanges={markerTracksViewChanges}
                                >
                                    <POIMarkerView icon={markerInfo.icon} color={markerInfo.color} />
                                </Marker>
                            );
                        } else {
                            // If cluster has multiple POIs, show cluster marker
                            // Validate cluster center coordinates
                            if (!isFinite(cluster.centerLat) || !isFinite(cluster.centerLon)) {
                                console.warn(`[Map] Skipping cluster ${cluster.id} with invalid center coordinates`);
                                return;
                            }
                            
                            // Validate cluster has POIs
                            if (!cluster.pois || cluster.pois.length === 0) {
                                console.warn(`[Map] Skipping cluster ${cluster.id} with no POIs`);
                                return;
                            }
                            
                            // Validate cluster color
                            const firstPOI = cluster.pois[0];
                            if (!firstPOI) return;
                            
                            const clusterColor = getPOIMarkerInfo(firstPOI).color;
                            if (!clusterColor) {
                                console.warn(`[Map] Skipping cluster ${cluster.id} with invalid color`);
                                return;
                            }
                            
                            // Validate count
                            if (!isFinite(cluster.count) || cluster.count < 1) {
                                console.warn(`[Map] Skipping cluster ${cluster.id} with invalid count`);
                                return;
                            }
                            
                            validMarkers.push(
                                <Marker
                                    key={`cluster-${cluster.id}`}
                                    coordinate={{ latitude: cluster.centerLat, longitude: cluster.centerLon }}
                                    onPress={() => handleClusterPress(cluster)}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    tracksViewChanges={markerTracksViewChanges}
                                >
                                    {Platform.OS === 'ios' ? (
                                        <ClusterMarkerViewIOS count={cluster.count} color={clusterColor} />
                                    ) : (
                                        <ClusterMarkerSVG count={cluster.count} color={clusterColor} />
                                    )}
                                </Marker>
                            );
                        }
                    });

                    // iOS: cap marker count to avoid MapKit texture atlas limit and insertObject:nil crash
                    const rawMarkers = Platform.OS === 'ios'
                        ? validMarkers.slice(0, IOS_MAX_MARKERS)
                        : validMarkers;
                    if (Platform.OS === 'ios' && validMarkers.length > IOS_MAX_MARKERS) {
                        console.log(`[Map] iOS: limiting markers from ${validMarkers.length} to ${IOS_MAX_MARKERS} to prevent crash`);
                    }
                    // Ensure no null/undefined in array (prevents AIRMap insertReactSubview: nil crash)
                    const markersToRender = rawMarkers.filter((m): m is React.ReactElement => m != null && React.isValidElement(m));
                    if (markersToRender.length === 0) return null;
                    // Key forces full remount when marker set changes, avoiding incremental insert that can trigger nil in AIRMap
                    return (
                        <React.Fragment key={`poi-markers-${poiClusters.length}-${markersToRender.length}`}>
                            {markersToRender}
                        </React.Fragment>
                    );
                })()}
            </MapView>

            {!noCenterButton && (
                <View style={styles.recenterButton}>
                    <TouchableOpacity onPress={recenterOnUser} style={styles.button}>
                        <Ionicons
                            name={'locate'}
                            size={24}
                            color={'#FF7A00'}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const Map = forwardRef<MapView, MapProps>(MapInner);
Map.displayName = 'Map';

export default Map;

const styles = StyleSheet.create({
    container: { height: '100%', width: '100%', borderRadius: 20 },
    map: { width: '100%', height: '100%', borderRadius: 20 },
    pickupMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#10b981', elevation: 4 },
    dropoffMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ef4444', elevation: 4 },

    recenterButton: { position: 'absolute', bottom: 120, right: 20, borderRadius: 20, overflow: 'hidden' },
    button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 3 },

    poiCard: { padding: 15, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', gap: 10 },
    poiImage: { width: '100%', height: 180, borderRadius: 12 },
    poiTitle: { fontWeight: '700', fontSize: 16, color: '#111' },
    poiCategory: { fontSize: 13, color: '#FF7A00', fontWeight: '600' },
    poiAge: { fontSize: 14, color: '#555' },
    goButton: { marginTop: 12, backgroundColor: '#FF7A00', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 20 },
    goButtonText: { color: '#fff', fontWeight: '600' },

    poiMarker: { backgroundColor: '#fff', paddingHorizontal: 3, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FF7A00' },
    poiMarkerText: { color: '#000000', fontWeight: '600', fontSize: 12 },
    
    markerContainer: { alignItems: 'center', justifyContent: 'center' },
    
    poiListContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: 500,
    },
    poiListTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 12,
    },
    poiListScroll: {
        maxHeight: 400,
    },
    poiListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    poiListIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        marginRight: 12,
        backgroundColor: '#f9f9f9',
    },
    poiListContent: {
        flex: 1,
        marginRight: 8,
    },
    poiListName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    poiListCategory: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    poiListDistance: {
        fontSize: 12,
        color: '#999',
    },
});