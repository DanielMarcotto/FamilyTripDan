"use client";

import React, { useRef, useState, useContext, useEffect } from 'react';
import Page from '@/components/templates/Page';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Pressable,
    Animated,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import Header from '@/components/templates/Header';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import destinations from '../../mocks/destinations.json';
import POI from '../../mocks/poi.json';
import activities from '../../mocks/activities.json';
import { AuthContext } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import Toast from 'react-native-toast-message';
import { extractImageUrl } from '@/context/NavigationContext';
import { logScreenView, logEvent, AnalyticsEvents } from '@/services/analytics';

const MAIN_COLOR = '#FF7A00';

const POIDetailPage = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const params = useLocalSearchParams<{ destinationId: string }>();
    const { destinationId } = params;
    const { userData } = useContext(AuthContext);
    const isLoggedIn = !!userData;
    const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const isFavorite = checkIsFavorite(destinationId || '');

    const poi = POI.find(p => p.id === destinationId);

    // Log POI view
    useEffect(() => {
        if (poi) {
            logScreenView('POI Detail');
            logEvent(AnalyticsEvents.POI_VIEWED, {
                poi_id: poi.id,
                poi_name: poi.name,
                poi_category: poi.category,
                destination_id: poi.destination_id,
            });
        }
    }, [destinationId, poi]);

    if (!poi) return <Text>POI not found</Text>;

    const destination = destinations.find(d => d.id === poi.destination_id);

    // Filter activities that include this POI
    const relatedActivities = activities.filter(a =>
        a.stops?.some(s => s.poi_id === poi.id) ?? false
    );

    const handleFavoritePress = async () => {
        if (!isLoggedIn) {
            Toast.show({
                type: 'info',
                text1: 'Login richiesto',
                text2: 'Devi effettuare il login per aggiungere ai preferiti',
            });
            router.push('/auth/login');
            return;
        }

        if (isLoadingFavorite || !destinationId) {
            return;
        }

        setIsLoadingFavorite(true);
        const wasFavorite = isFavorite;

        // Animazione di feedback
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 0.85,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.7,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        try {
            const success = await toggleFavorite(destinationId);

            if (success) {
                // Log favorite event
                logEvent(
                    wasFavorite ? AnalyticsEvents.POI_FAVORITE_REMOVED : AnalyticsEvents.POI_FAVORITE_ADDED,
                    {
                        poi_id: destinationId,
                        poi_name: poi.name,
                        poi_category: poi.category,
                    }
                );

                Toast.show({
                    type: 'success',
                    text1: wasFavorite ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Errore',
                    text2: 'Impossibile aggiornare i preferiti',
                });
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Impossibile aggiornare i preferiti',
            });
        } finally {
            setIsLoadingFavorite(false);
        }
    };

    const handleOpenWebsite = () => {
        const rawUrl = poi.website || destination?.website;
        if (!rawUrl) return;

        const normalizedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

        Linking.openURL(normalizedUrl);
    };

    const handleOpenNavigation = () => {
        if (poi.latitude == null || poi.longitude == null || 
            !isFinite(poi.latitude) || !isFinite(poi.longitude)) {
            Toast.show({
                type: 'error',
                text1: 'Errore',
                text2: 'Coordinate non disponibili per la navigazione',
            });
            return;
        }

        const lat = poi.latitude;
        const lon = poi.longitude;
        let url = '';

        if (Platform.OS === 'ios') {
            // iOS: usa Apple Maps
            url = `maps://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`;
        } else {
            // Android: usa Google Maps
            url = `google.navigation:q=${lat},${lon}`;
        }

        Linking.openURL(url).catch(() => {
            // Fallback: usa URL generico che funziona su entrambe le piattaforme
            const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
            Linking.openURL(fallbackUrl);
        });
    };

    return (
        <Page noPaddingTop noBottomBar alignItems="center" justifyContent="flex-start">
            <Header text={''} buttonBack />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* POI Image */}
                {extractImageUrl(poi.pictures) && (
                    <Image
                        source={{ uri: extractImageUrl(poi.pictures)! }}
                        style={styles.coverImage}
                    />
                )}

                {/* Title and Category */}
                <View style={styles.titleContainer}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{poi.name}</Text>
                            <Text style={styles.category}>{poi.category.toUpperCase()}</Text>
                        </View>
                        <Animated.View
                            style={{
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                                backgroundColor: 'transparent',
                            }}
                        >
                            <TouchableOpacity 
                                style={[
                                    styles.favoriteButton,
                                    isFavorite && styles.favoriteButtonActive,
                                    isLoadingFavorite && styles.favoriteButtonLoading
                                ]}
                                onPress={handleFavoritePress}
                                activeOpacity={0.9}
                                disabled={isLoadingFavorite}
                            >
                                {isLoadingFavorite ? (
                                    <ActivityIndicator size="small" color={isFavorite ? "#FFFFFF" : MAIN_COLOR} />
                                ) : (
                                    <Ionicons 
                                        name={isFavorite ? "heart" : "heart-outline"} 
                                        size={32} 
                                        color={isFavorite ? "#FFFFFF" : MAIN_COLOR} 
                                    />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

                {/* Address */}
                {poi.address && (
                    <View style={[styles.card, styles.rowCard]}>
                        <Ionicons name="location-outline" size={20} color={MAIN_COLOR} style={{ marginRight: 8 }} />
                        <Text style={styles.cardText}>{poi.address}</Text>
                    </View>
                )}

                {/* POI Description */}
                {poi.description && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Descrizione</Text>
                        <Text style={styles.cardText}>{poi.description}</Text>
                    </View>
                )}

                {/* Age Range */}
                {poi.age_min != null && poi.age_max != null && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Età consigliata</Text>
                        <Text style={styles.cardText}>{poi.age_min} - {poi.age_max} anni</Text>
                    </View>
                )}

                {/* Destination Info */}
                {destination && (
                    <TouchableOpacity
                        style={[styles.card, styles.destinationCard]}
                        onPress={() => {
                            router.push({
                                pathname: '/destinations/destination',
                                params: { destinationId: destination.id }
                            });
                        }}
                    >
                        <Text style={styles.cardTitle}>Destinazione</Text>
                        <Text style={[styles.cardText, { fontWeight: '600', fontSize: 16 }]}>{destination.name}</Text>
                        <Text style={[styles.cardText, { marginTop: 8 }]}>{destination.description}</Text>
                    </TouchableOpacity>
                )}

                {/* Best Seasons & Extras */}
                {destination && (
                    <View style={styles.card}>
                        {destination.best_seasons && (
                            <View style={styles.extraItem}>
                                <Text style={styles.extraTitle}>Stagioni migliori</Text>
                                <Text style={styles.extraValue}>{destination.best_seasons.join(', ')}</Text>
                            </View>
                        )}
                        {/*destination.avg_cost_level && poi.category.toUpperCase() !== 'PLAYGROUND' && (
                            <View style={styles.extraItem}>
                                <Text style={styles.extraTitle}>Costo medio</Text>
                                <Text style={styles.extraValue}>{'€'.repeat(destination.avg_cost_level)}</Text>
                            </View>
                        ) */}
                        {destination.transport?.recommendations && (
                            <View style={styles.extraItem}>
                                <Text style={styles.extraTitle}>Trasporti</Text>
                                <Text style={styles.extraValue}>{destination.transport.recommendations}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* CTA finali – blocco unico */}
                {((poi.website || destination?.website) || (poi.latitude != null && poi.longitude != null)) && (
                    <View style={styles.ctaBlock}>
                        <Text style={styles.ctaIntro}>Tutto pronto? Parti quando vuoi 👇</Text>
                        <View style={styles.actionButtonsContainer}>
                            {(poi.website || destination?.website) && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.websiteButton]}
                                    onPress={handleOpenWebsite}
                                >
                                    <Ionicons name="globe-outline" size={20} color="#fff" />
                                    <Text style={styles.actionButtonText}>Visita il sito</Text>
                                </TouchableOpacity>
                            )}
                            {poi.latitude != null && 
                             poi.longitude != null && 
                             isFinite(poi.latitude) && 
                             isFinite(poi.longitude) && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.navigationButton]}
                                    onPress={handleOpenNavigation}
                                >
                                    <Ionicons name="navigate-outline" size={20} color="#fff" />
                                    <Text style={styles.actionButtonText}>Avvia navigazione</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Map Preview */}
                {poi.latitude != null && 
                 poi.longitude != null && 
                 isFinite(poi.latitude) && 
                 isFinite(poi.longitude) && (
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: poi.latitude,
                                longitude: poi.longitude,
                                latitudeDelta: 0.03,
                                longitudeDelta: 0.03,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
                                title={poi.name}
                                description={poi.address}
                            />
                        </MapView>
                    </View>
                )}

                {/* Related Activities */}
                {relatedActivities.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Attività che includono questo luogo</Text>
                        {relatedActivities.map(a => (
                            <Pressable
                                key={a.id}
                                style={styles.activityItem}
                                onPress={() => router.push({ pathname: '/destinations/activity', params: { activityId: a.id } })}
                            >
                                <Ionicons name="walk-outline" size={20} color={MAIN_COLOR} style={{ marginRight: 8 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.activityTitle}>{a.title}</Text>
                                    <Text style={styles.activitySubtitle}>
                                        ⏱ {a.duration_hours}h | ⚡ {a.difficulty}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={20} color={MAIN_COLOR} />
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </Page>
    );
};

export default POIDetailPage;

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, width: '100%', paddingTop: 100 },
    scrollContent: { width: '100%', alignItems: 'center', paddingBottom: 150, gap: 20 },

    coverImage: { width: '90%', height: 240, borderRadius: 18, marginTop: 15 },

    titleContainer: { width: '90%', alignItems: 'flex-start' },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: 10 },
    title: { fontSize: 26, fontWeight: '700', color: '#111' },
    category: { fontSize: 14, color: MAIN_COLOR, fontWeight: '700', marginTop: 4 },
    favoriteButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: MAIN_COLOR,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    favoriteButtonActive: {
        backgroundColor: MAIN_COLOR,
        borderColor: MAIN_COLOR,
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
    },
    favoriteButtonLoading: {
        opacity: 0.7,
    },

    card: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        flexDirection: 'column',
        gap: 10,
    },

    extraItem: { marginBottom: 10 },
    extraTitle: { fontWeight: '700', fontSize: 14, color: '#555', marginBottom: 3 },
    extraValue: { fontSize: 14, color: '#333', lineHeight: 20 },

    rowCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    destinationCard: { backgroundColor: '#FFF8F0' },

    cardTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 6 },
    cardText: { fontSize: 14, color: '#333', lineHeight: 22 },

    ctaBlock: {
        width: '90%',
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        gap: 16,
    },
    ctaIntro: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    actionButtonsContainer: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        gap: 10,
    },
    websiteButton: {
        backgroundColor: MAIN_COLOR,
    },
    navigationButton: {
        backgroundColor: '#4CAF50',
    },
    actionButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },

    mapContainer: { width: '90%', height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: 30 },
    map: { width: '100%', height: '100%' },

    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
        gap: 10,
    },
    activityTitle: { fontSize: 11.5, fontWeight: '600', color: '#333' },
    activitySubtitle: { fontSize: 11, color: '#555', marginTop: 6 },
});
