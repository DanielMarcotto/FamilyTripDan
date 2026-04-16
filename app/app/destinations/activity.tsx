"use client";

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    Dimensions,
} from "react-native";
import Page from "@/components/templates/Page";
import Header from "@/components/templates/Header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import activities from "../../mocks/activities.json";
import POI from "../../mocks/poi.json";
import { extractImageUrl } from '@/context/NavigationContext';
import { logScreenView, logEvent, AnalyticsEvents } from "@/services/analytics";

const MAIN_COLOR = "#FF7A00";
const { width } = Dimensions.get("window");

// Helper function to get category info from activity tags
const getCategoryInfo = (tags: string[]) => {
    // Priority order: walk, playground, tour, museum, adventure, etc.
    if (tags.includes("walk") || tags.includes("passeggiata")) {
        return {
            name: "Passeggiata",
            icon: "walk-outline" as keyof typeof Ionicons.glyphMap,
            color: "#4CAF50", // Green
        };
    }
    if (tags.includes("playground") || tags.includes("parco giochi")) {
        return {
            name: "Parco giochi",
            icon: "happy-outline" as keyof typeof Ionicons.glyphMap,
            color: "#E91E63", // Pink
        };
    }
    if (tags.includes("tour") || tags.includes("visita")) {
        return {
            name: "Tour",
            icon: "map-outline" as keyof typeof Ionicons.glyphMap,
            color: "#FF7A00", // Orange
        };
    }
    if (tags.includes("museum") || tags.includes("museo")) {
        return {
            name: "Museo",
            icon: "business-outline" as keyof typeof Ionicons.glyphMap,
            color: "#9C27B0", // Purple
        };
    }
    if (tags.includes("adventure") || tags.includes("avventura")) {
        return {
            name: "Avventura",
            icon: "trail-sign-outline" as keyof typeof Ionicons.glyphMap,
            color: "#FF5722", // Deep Orange
        };
    }
    // Default
    return {
        name: "Attività",
        icon: "star-outline" as keyof typeof Ionicons.glyphMap,
        color: MAIN_COLOR,
    };
};

// Helper function to get difficulty emoji and text
const getDifficultyInfo = (difficulty: string) => {
    const diff = difficulty.toLowerCase();
    if (diff === "easy" || diff === "facile") {
        return { emoji: "😊", text: "facile" };
    }
    if (diff === "medium" || diff === "media") {
        return { emoji: "😐", text: "media" };
    }
    if (diff === "hard" || diff === "difficile") {
        return { emoji: "😅", text: "difficile" };
    }
    return { emoji: "😊", text: "facile" };
};

const ActivityPage = React.memo(() => {
    const scrollViewRef = useRef<ScrollView>(null);
    const params = useLocalSearchParams<{ activityId: string }>();
    const { activityId } = params;

    // Modal preview
    const [modalVisible, setModalVisible] = useState<any>(false);
    const [currentImage, setCurrentImage] = useState<any>("");

    // Memoize activity lookup
    const activity = useMemo(
        () => activities.find((a) => a.id === activityId),
        [activityId]
    );

    // Memoize stops calculation
    const stops = useMemo(
        () => (activity?.stops || [])
            .map((s) => POI.find((p) => p.id === s.poi_id))
            .filter(Boolean),
        [activity?.stops]
    );

    // Memoize category info calculation
    const categoryInfo = useMemo(
        () => getCategoryInfo(activity?.tags || []),
        [activity?.tags]
    );

    // Memoize difficulty info calculation
    const difficultyInfo = useMemo(
        () => getDifficultyInfo(activity?.difficulty || ""),
        [activity?.difficulty]
    );

    // Memoize main image
    const mainImage = useMemo(
        () => extractImageUrl(activity?.pictures) || "",
        [activity?.pictures]
    );

    const openPreview = useCallback((img: string) => {
        setCurrentImage(img);
        setModalVisible(true);
    }, []);

    const handleMapPress = useCallback(() => {
        logEvent(AnalyticsEvents.BUTTON_CLICK, {
            button_name: 'map_button',
            screen_name: 'Activity Detail',
            activity_id: activityId,
        });
        router.push("/(tabs)/map");
    }, [activityId]);

    // Log activity view
    useEffect(() => {
        if (activity) {
            logScreenView('Activity Detail');
            logEvent('activity_viewed', {
                activity_id: activity.id,
                activity_title: activity.title,
                activity_difficulty: activity.difficulty,
                activity_duration: activity.duration_hours,
                destination_id: activity.destination_id,
            });
        }
    }, [activityId]);

    if (!activity) return <Text>Activity not found</Text>;

    return (
        <Page noPaddingTop noBottomBar alignItems="center" justifyContent="flex-start">
            <Header text={''} buttonBack />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Main Activity Image - Circular */}
                {mainImage && (
                    <TouchableOpacity onPress={() => openPreview(mainImage)}>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: mainImage }} style={styles.circularImage} />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Image Preview Modal */}
                <Modal visible={modalVisible} transparent>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            onPress={() => setModalVisible(false)}
                        >
                            <Image source={{ uri: currentImage }} style={styles.modalImage} />
                        </TouchableOpacity>
                    </View>
                </Modal>

                {/* Category Badge */}
                <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
                    <Ionicons name={categoryInfo.icon} size={16} color="#fff" />
                    <Text style={styles.categoryText}>{categoryInfo.name}</Text>
                </View>

                {/* Activity Title */}
                <Text style={styles.activityTitle}>{activity.title}</Text>

                {/* Activity Details - Icons */}
                <View style={styles.detailsContainer}>
                    {/* Duration */}
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>{activity.duration_hours} h</Text>
                    </View>

                    {/* Difficulty */}
                    <View style={styles.detailItem}>
                        <Text style={styles.difficultyEmoji}>{difficultyInfo.emoji}</Text>
                        <Text style={styles.detailText}>{difficultyInfo.text}</Text>
                    </View>

                    {/* Age */}
                    <View style={styles.detailItem}>
                        <Ionicons name="people-outline" size={18} color="#666" />
                        <Text style={styles.detailText}>
                            {(activity as any).age_range || "N/A"} anni
                        </Text>
                    </View>
                </View>

                {/* Breve descrizione pratica (2–3 righe) */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText} numberOfLines={3}>{activity.description}</Text>
                </View>

                {/* Pulsante Mappa */}
                <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
                    <Text style={styles.mapButtonText}>Mappa</Text>
                    <Ionicons name="arrow-forward" size={20} color={MAIN_COLOR} />
                </TouchableOpacity>

                {/* Curiosità e storia del luogo */}
                {(activity as any).curiosity && (
                    <View style={styles.extraInfoCard}>
                        <View style={styles.extraInfoHeader}>
                            <Ionicons name="bulb-outline" size={20} color="#FFA726" />
                            <Text style={styles.extraInfoTitle}>Curiosità e storia del luogo</Text>
                        </View>
                        <Text style={styles.extraInfoText}>{(activity as any).curiosity}</Text>
                    </View>
                )}

                {/* Ai bambini piace */}
                {(activity as any).kids_likes && (activity as any).kids_likes.length > 0 && (
                    <View style={styles.extraInfoCard}>
                        <View style={styles.extraInfoHeader}>
                            <Ionicons name="heart-outline" size={20} color="#E91E63" />
                            <Text style={styles.extraInfoTitle}>Ai bambini piace</Text>
                        </View>
                        <View style={styles.extraInfoList}>
                            {((activity as any).kids_likes as string[]).map((like: string, idx: number) => (
                                <View key={idx} style={styles.extraInfoListItem}>
                                    <Text style={styles.extraInfoBullet}>•</Text>
                                    <Text style={styles.extraInfoItemText}>{like}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Informazioni utili */}
                {(activity as any).extra_info && (activity as any).extra_info.length > 0 && (
                    <View style={styles.extraInfoCard}>
                        <View style={styles.extraInfoHeader}>
                            <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
                            <Text style={styles.extraInfoTitle}>Informazioni utili</Text>
                        </View>
                        <View style={styles.extraInfoList}>
                            {((activity as any).extra_info as string[]).map((info: string, idx: number) => (
                                <View key={idx} style={styles.extraInfoListItem}>
                                    <Text style={styles.extraInfoBullet}>•</Text>
                                    <Text style={styles.extraInfoItemText}>{info}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Missione Junior */}
                {(activity as any).junior_mission && (
                    <View style={styles.missionCard}>
                        <View style={styles.missionHeader}>
                            <Ionicons name="trophy-outline" size={20} color="#FFC107" />
                            <Text style={styles.missionTitle}>Missione Junior</Text>
                        </View>
                        <Text style={styles.missionText}>{(activity as any).junior_mission}</Text>
                    </View>
                )}

                {/* Altre foto: solo se ci sono immagini reali oltre alla principale */}
                {activity.pictures && activity.pictures.length > 1 && activity.pictures.slice(1).some((url: string) => typeof url === 'string' && url.startsWith('http') && url.length > 20) && (
                    <View style={styles.galleryContainer}>
                        <Text style={styles.galleryTitle}>Altre foto</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.galleryScroll}
                        >
                            {activity.pictures.slice(1).filter((url: string) => typeof url === 'string' && url.startsWith('http') && url.length > 20).map((pic: string, idx: number) => (
                                <TouchableOpacity key={idx} onPress={() => openPreview(pic)}>
                                    <Image source={{ uri: pic }} style={styles.galleryImage} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Percorso (Stops) */}
                {stops.length > 0 && (
                    <View style={styles.stopsContainer}>
                        <Text style={styles.stopsTitle}>Percorso</Text>
                        {stops.map((stop: any, idx) => (
                            <View key={stop.id} style={styles.stopWrapper}>
                                <TouchableOpacity
                                    style={styles.stopCard}
                                    onPress={() => {
                                        logEvent(AnalyticsEvents.BUTTON_CLICK, {
                                            button_name: 'poi_stop',
                                            poi_id: stop.id,
                                            poi_name: stop.name,
                                            screen_name: 'Activity Detail',
                                            activity_id: activityId,
                                        });
                                        router.push({
                                            pathname: "/destinations/poi",
                                            params: { destinationId: stop.id },
                                        });
                                    }}
                                >
                                    <View style={styles.dot} />
                                    <Text style={styles.stopText}>{stop.name}</Text>
                                </TouchableOpacity>
                                {idx < stops.length - 1 && <View style={styles.dashedLine} />}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </Page>
    );
});

ActivityPage.displayName = 'ActivityPage';

export default ActivityPage;

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, width: "100%", paddingTop: 100 },
    scrollContent: { width: "100%", alignItems: "center", paddingBottom: 150, gap: 20 },

    // Circular Image
    imageContainer: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        overflow: "hidden",
        marginTop: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    circularImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    // Category Badge
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },

    // Activity Title
    activityTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: MAIN_COLOR,
        textAlign: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },

    // Details Container
    detailsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    difficultyEmoji: {
        fontSize: 18,
    },

    // Description
    descriptionContainer: {
        width: "90%",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    descriptionText: {
        fontSize: 15,
        color: "#555",
        lineHeight: 24,
        textAlign: "center",
    },

    // Debug Container
    debugContainer: {
        width: "90%",
        backgroundColor: "#FFF3CD",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: "#FFC107",
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#856404",
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: "#856404",
        marginBottom: 4,
        fontFamily: "monospace",
    },

    // Extra Info Cards
    extraInfoCard: {
        width: "90%",
        backgroundColor: "#f8f8f8",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    extraInfoHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    extraInfoTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222",
    },
    extraInfoText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        fontStyle: "italic",
    },
    extraInfoList: {
        gap: 8,
    },
    extraInfoListItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    extraInfoBullet: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
    },
    extraInfoItemText: {
        flex: 1,
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },

    // Mission Card
    missionCard: {
        width: "90%",
        backgroundColor: "#FFF9E6",
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#FFC107",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    missionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    missionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#856404",
    },
    missionText: {
        fontSize: 14,
        color: "#856404",
        lineHeight: 20,
        fontWeight: "600",
    },

    // Map Button
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: MAIN_COLOR,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 28,
        gap: 8,
        marginBottom: 24,
        shadowColor: MAIN_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    mapButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: MAIN_COLOR,
    },

    // Gallery
    galleryContainer: {
        width: "100%",
        marginBottom: 20,
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#222",
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    galleryScroll: {
        paddingLeft: 20,
    },
    galleryImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginRight: 12,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: { width: width * 0.9, height: width * 0.7, borderRadius: 16 },

    // Stops Container
    stopsContainer: {
        width: "90%",
        flexDirection: "column",
        gap: 16,
        marginTop: 10,
        marginBottom: 30,
    },
    stopsTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 10 },

    stopWrapper: { flexDirection: "column", alignItems: "flex-start" },
    stopCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: MAIN_COLOR,
    },
    stopText: { fontSize: 15, fontWeight: "600", color: "#333", flexShrink: 1 },

    dashedLine: {
        width: 2,
        height: 30,
        borderLeftWidth: 2,
        borderColor: "#ccc",
        marginLeft: 9,
        borderStyle: "dashed",
    },
});
