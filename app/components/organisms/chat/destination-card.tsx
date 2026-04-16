"use client"

import { StyleSheet, Text, View, Image, Pressable } from "react-native";

import { useState } from "react";
import { router } from "expo-router";
import {useNavigation} from "@/context/NavigationContext";
import {getDistance} from "@/utils/Navigation";
import { logEvent, AnalyticsEvents } from "@/services/analytics";

interface DestinationCardProps {
    destination: any;
}

// Mappatura degli ID delle destinazioni alle immagini locali
const getDestinationImage = (destinationId: string) => {
    const imageMap: { [key: string]: any } = {
        "lago_di_garda_lombardia": require("@/assets/images/activities/attivita_garda_lombardia.png"),
        "lago_di_garda_trentino": require("@/assets/images/activities/attivita_garda_trentino.png"),
        "lago_di_garda_veneto": require("@/assets/images/activities/attivita_garda_veneto.png"),
        "trentino": require("@/assets/images/activities/attivita_trentino.png"),
        "verona_provincia": require("@/assets/images/activities/attivita_verona_provincia.png"),
        "veneto": require("@/assets/images/activities/attivita_verona_provincia.png"), // fallback a verona_provincia
    };
    return imageMap[destinationId] || null;
};

const FallbackImage = ({ uri, style, localImage }: { uri: string; style: any; localImage?: any }) => {
    // Priorità all'immagine locale se disponibile, altrimenti usa l'URI
    const initialSource = localImage || (uri ? { uri } : require("../../../assets/fallbacks/nopic.png"));
    const [src, setSrc] = useState(initialSource);

    return (
        <Image
            source={src}
            style={style}
            resizeMode="cover"
            onError={() => {
                // Solo se non è già un'immagine locale, fallback a nopic
                if (!localImage) {
                    setSrc(require("../../../assets/fallbacks/nopic.png"));
                }
            }}
        />
    );
};

const DestinationCard = ({ destination }: DestinationCardProps) => {
    const { userCoords } = useNavigation()

    if (!destination) return

    // Ottieni l'immagine locale se disponibile, altrimenti usa destination.image
    const localImage = getDestinationImage(destination.id);
    const imageUri = destination.image || "";

    return (
        <Pressable
            style={styles.cardContainer}
            onPress={() => {
                logEvent(AnalyticsEvents.DESTINATION_SELECTED, {
                    destination_id: destination.id,
                    destination_name: destination.name,
                    destination_region: destination.region,
                });
                router.push({
                    pathname: "/destinations/destination",
                    params: { destinationId: destination.id },
                });
            }}
        >
            {/* Destination Image */}
            <FallbackImage uri={imageUri} localImage={localImage} style={styles.coverImage} />

            {/* Overlay: Status & Favorite */}
            <View style={styles.overlay}>

            </View>

            {/* Info Section */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{destination.name}</Text>
                <Text style={styles.subtitle}>{destination.region}, {destination.country}</Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.distance}>
                        {
                            destination &&
                            userCoords &&
                            (getDistance(
                                {
                                    latitude: destination.coordinates.latitude,
                                    longitude: destination.coordinates.longitude,
                                },
                                userCoords
                            ) / 1000).toFixed(2)
                        } km
                    </Text>
                    <Text style={styles.priceLevel}>
                        {'€'.repeat(destination.avg_cost_level ?? 1)}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

export default DestinationCard;

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        borderRadius: 20,
        backgroundColor: "#00000020",
        overflow: "hidden",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    coverImage: {
        width: "100%",
        height: 240,
    },
    overlay: {
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusBadge: {
        paddingHorizontal: 12,
        height: 28,
        borderRadius: 14,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.07)",
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#000",
    },
    favoriteButton: {
        width: 30,
        height: 30,
        borderRadius: 22,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    infoContainer: {
        padding: 14,
        backgroundColor: "#00000020",
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    distance: {
        fontSize: 12,
        color: "#999",
    },
    priceLevel: {
        fontSize: 12,
        color: "#FF7A00",
        fontWeight: "600",
    },
});
