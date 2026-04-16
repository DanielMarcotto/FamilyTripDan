import React, { useState, useEffect, useCallback } from 'react';
import Page from '@/components/templates/Page';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
    RefreshControl,
} from 'react-native';
import Header from '@/components/templates/Header';
import PoiCard from "@/components/organisms/chat/poi-card";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import SpinnerLoader from '@/components/atoms/loaders/Spinner';
import { extractImageUrl } from '@/context/NavigationContext';

const Favorites = () => {
    const { userData } = React.useContext(AuthContext);
    const isLoggedIn = !!userData;
    const { favorites: favoriteIds, refreshFavorites } = useFavorites();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Load favorites data when favoriteIds change
    useEffect(() => {
        if (!isLoggedIn) {
            setFavorites([]);
            setLoadingData(false);
            return;
        }

        const loadFavoritesData = async () => {
            setLoadingData(true);
            try {
                const { getFavorites } = await import('@/services/api');
                const response = await getFavorites();
                if (response.success) {
                    setFavorites(response.items || []);
                }
            } catch (error) {
                console.error('Error loading favorites:', error);
            } finally {
                setLoadingData(false);
            }
        };

        loadFavoritesData();
    }, [isLoggedIn, favoriteIds]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshFavorites();
        setRefreshing(false);
    }, [refreshFavorites]);

    const renderPOI = useCallback(({ item }: { item: any }) => {
        // Transform POI data to match PoiCard expected format
        const transformedItem = {
            id: item.id,
            title: item.name,
            location: item.location || item.address,
            price: item.avg_cost_level || 0,
            image: extractImageUrl(item.pictures),
            status: item.environment || item.status || 'outdoor',
            category: item.category,
            icon: item.icon || 'location',
            coordinates: {
                latitude: item.latitude,
                longitude: item.longitude,
            },
            distance: 0, // Favorites don't have distance
            address: item.address,
            tags: item.tags || [],
            age_min: item.age_min,
            age_max: item.age_max,
        };
        return <PoiCard destination={transformedItem} />;
    }, []);

    if (!isLoggedIn) {
        return (
            <Page noPaddingTop noBottomBar alignItems="center" justifyContent="center" page="home">
                <Header text='' buttonBack={true} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-outline" size={64} color="#FF7A00" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>Accedi per vedere i tuoi preferiti</Text>
                    <Text style={styles.emptyText}>
                        Effettua il login per salvare e visualizzare i tuoi punti di interesse preferiti
                    </Text>
                </View>
            </Page>
        );
    }

    const listHeader = (
        <View style={styles.descriptionContainer}>
            <Ionicons name="heart" size={32} color="#FF7A00" style={{ marginBottom: 8 }} />
            <Text style={styles.descriptionText}>
                I tuoi punti di interesse preferiti
            </Text>
            {favorites.length > 0 && (
                <Text style={styles.countText}>
                    {favorites.length} {favorites.length === 1 ? 'preferito' : 'preferiti'}
                </Text>
            )}
        </View>
    );

    // Show loading spinner on initial load
    if (loadingData && favorites.length === 0) {
        return (
            <Page noPaddingTop noBottomBar alignItems="center" justifyContent="center" page="home">
                <Header text='' buttonBack={true} />
                <View style={styles.loadingContainer}>
                    <SpinnerLoader />
                    <Text style={styles.loadingText}>Caricamento preferiti...</Text>
                </View>
            </Page>
        );
    }

    return (
        <Page noPaddingTop noBottomBar alignItems="center" justifyContent="space-between" page="home">
            <Header text='' buttonBack={true} />
            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                renderItem={renderPOI}
                ListHeaderComponent={listHeader}
                contentContainerStyle={styles.gridContainer}
                style={styles.listStyle}
                ListEmptyComponent={
                    !loadingData ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color="#FF7A00" style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyTitle}>Nessun preferito ancora</Text>
                            <Text style={styles.emptyText}>
                                Aggiungi punti di interesse ai preferiti per vederli qui
                            </Text>
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FF7A00"
                    />
                }
                ListFooterComponent={<View style={{ height: 200 }} />}
            />
        </Page>
    );
};

export default Favorites;

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
        marginTop: 20,
        width: '100%',
    },
    listStyle: {
        paddingTop: 90,
    },
    gridContainer: { 
        flexDirection: "column", 
        paddingHorizontal: 10, 
        gap: 12, 
        paddingBottom: 200 
    },
    descriptionText: { 
        fontSize: 16, 
        fontWeight: '600',
        color: '#333', 
        lineHeight: 22, 
        textAlign: 'center', 
        marginBottom: 4 
    },
    countText: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    emptyContainer: { 
        padding: 40, 
        alignItems: 'center',
        marginTop: 100,
    },
    emptyTitle: { 
        fontSize: 20, 
        fontWeight: '700',
        color: '#333', 
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: { 
        textAlign: 'center', 
        fontSize: 14, 
        color: '#888',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Montserrat',
    },
});

