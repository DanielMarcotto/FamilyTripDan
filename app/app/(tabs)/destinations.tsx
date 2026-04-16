import React, { useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Page from '@/components/templates/Page';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Header from '@/components/templates/Header';
import PoiCard from "@/components/organisms/chat/poi-card";
import { useNavigation } from "@/context/NavigationContext";
import { Ionicons } from "@expo/vector-icons";
import DestinationCard from "@/components/organisms/chat/destination-card";
import { logScreenView } from '@/services/analytics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Index = React.memo(() => {
    const { listedDestinations, setMapMode } = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);
    const [radius, setRadius] = useState(10000); // default 10000 meters
    const insets = useSafeAreaInsets();
    
    // Calculate bottom padding for iOS tab bar (49px tab bar + safe area bottom)
    const bottomPadding = Platform.OS === 'ios' ? 49 + insets.bottom + 20 : 80;

    // Ensure map mode is disabled when on this tab (cleanup POI)
    useFocusEffect(
        React.useCallback(() => {
            setMapMode(false);
            logScreenView('Destinations');
            return () => {
                // Optional: cleanup on unfocus if needed
            };
        }, [setMapMode])
    );

    return (
        <Page noPaddingTop noBottomBar alignItems="center" justifyContent="space-between" page="home">
            <Header text='' />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
            >

                {/* Description */}
                <View style={styles.descriptionContainer}>
                    <Ionicons name="map-outline" size={50} color="#FF7A00" style={{ marginBottom: 12 }} />
                    <Text style={styles.descriptionTitle}>
                        Esplora le destinazioni
                    </Text>
                    <Text style={styles.descriptionText}>
                        Scegli una zona per vedere attività e luoghi adatti alle famiglie
                    </Text>
                </View>
                {/* POI list */}
                <View style={styles.gridContainer}>
                     {listedDestinations.length > 0 ? (
                        listedDestinations
                            .map((destination: any) => (
                                <DestinationCard key={destination.id} destination={destination} />
                            ))
                    ) : (
                        <Text style={styles.emptyText}>
                            Nessun luogo trovato nel raggio selezionato
                        </Text>
                    )} 
                </View>
            </ScrollView>
        </Page>
    );
});

Index.displayName = 'DestinationsTab';

export default Index;

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, width: '100%', marginTop: 60 },
    scrollContent: { width: '100%', alignItems: 'center', gap: 15 },
    sliderWrapper: { width: '100%' },
    sliderLabel: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 5, textAlign: 'center' },
    gridContainer: { flexDirection: 'column', width: '100%', paddingHorizontal: 10, gap: 12, marginBottom: 20 },
    emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#888' },
    descriptionContainer: {
        width: '95%',
        backgroundColor: '#fff8f0',
        padding: 22,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 6,
        marginTop: 15,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF7A00',
        marginBottom: 8,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        textAlign: 'center',
    },
});
