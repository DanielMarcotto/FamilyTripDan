"use client";

import React, { useRef, useState, useMemo, useCallback, useEffect } from "react";
import Page from "@/components/templates/Page";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import Header from "@/components/templates/Header";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { router, useLocalSearchParams } from "expo-router";
import destinations from "../../mocks/destinations.json";
import activities from "../../mocks/activities.json";
import { extractImageUrl } from "@/context/NavigationContext";
import { logScreenView, logEvent, AnalyticsEvents } from "@/services/analytics";

const MAIN_COLOR = "#FF7A00";
const { width } = Dimensions.get("window");

// Helper function to get category info from destination tags
const getDestinationCategoryInfo = (tags: string[]) => {
  if (tags.includes("lago") || tags.includes("lake")) {
    return {
      name: "Lago",
      icon: "water-outline" as keyof typeof Ionicons.glyphMap,
      color: "#2196F3", // Blue
    };
  }
  if (tags.includes("montagna") || tags.includes("mountain")) {
    return {
      name: "Montagna",
      icon: "mountain-outline" as keyof typeof Ionicons.glyphMap,
      color: "#4CAF50", // Green
    };
  }
  if (tags.includes("città") || tags.includes("city")) {
    return {
      name: "Città",
      icon: "business-outline" as keyof typeof Ionicons.glyphMap,
      color: "#9C27B0", // Purple
    };
  }
  if (tags.includes("mare") || tags.includes("sea")) {
    return {
      name: "Mare",
      icon: "boat-outline" as keyof typeof Ionicons.glyphMap,
      color: "#00BCD4", // Cyan
    };
  }
  // Default
  return {
    name: "Destinazione",
    icon: "location-outline" as keyof typeof Ionicons.glyphMap,
    color: MAIN_COLOR,
  };
};

// Helper function to get category info from activity tags (same as activity.tsx)
const getActivityCategoryInfo = (tags: string[]) => {
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
  return {
    name: "Attività",
    icon: "star-outline" as keyof typeof Ionicons.glyphMap,
    color: MAIN_COLOR,
  };
};

// Helper function to get difficulty info
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

const DestinationPage = React.memo(() => {
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ destinationId: string }>();
  const { destinationId } = params;

  // Modal preview
  const [modalVisible, setModalVisible] = useState<any>(false);
  const [currentImage, setCurrentImage] = useState<any>("");

  // Memoize destination lookup
  const destination = useMemo(
    () => destinations.find((d) => d.id === destinationId),
    [destinationId]
  );

  // Memoize activities filter
  const destinationActivities = useMemo(
    () => activities.filter((a) => a.destination_id === destinationId),
    [destinationId]
  );

  // Memoize category info calculation
  const categoryInfo = useMemo(
    () => getDestinationCategoryInfo(destination?.tags || []),
    [destination?.tags]
  );

  // Memoize main image
  const mainImage = useMemo(
    () => destination?.image || (destination?.photos && destination.photos[0]) || "",
    [destination?.image, destination?.photos]
  );

  const openPreview = useCallback((img: string) => {
    setCurrentImage(img);
    setModalVisible(true);
  }, []);

  const handleMapPress = useCallback(() => {
    logEvent(AnalyticsEvents.BUTTON_CLICK, {
      button_name: 'map_button',
      screen_name: 'Destination Detail',
      destination_id: destinationId,
    });
    router.push("/(tabs)/map");
  }, [destinationId]);

  // Log destination view
  useEffect(() => {
    if (destination) {
      logScreenView('Destination Detail');
      logEvent(AnalyticsEvents.DESTINATION_VIEWED, {
        destination_id: destination.id,
        destination_name: destination.name,
        destination_region: destination.region,
      });
    }
  }, [destinationId]);

  if (!destination) return <Text>Destination not found</Text>;

  return (
    <Page
      noPaddingTop
      noBottomBar
      alignItems="center"
      justifyContent="flex-start"
    >
      <Header text={""} buttonBack={true} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Destination Image - Circular */}
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
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryInfo.color },
          ]}
        >
          <Ionicons name={categoryInfo.icon} size={16} color="#fff" />
          <Text style={styles.categoryText}>{categoryInfo.name}</Text>
        </View>

        {/* Destination Title */}
        <Text style={styles.destinationTitle}>{destination.name}</Text>

        {/* Destination Details - Icons */}
        <View style={styles.detailsContainer}>
          {/* Region */}
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.detailText}>{destination.region}</Text>
          </View>

          {/* Best Seasons */}
          {destination.best_seasons?.length > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="sunny-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {destination.best_seasons.join(", ")}
              </Text>
            </View>
          )}

          {/* Cost Level */}
          {destination.avg_cost_level && (
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {"€".repeat(destination.avg_cost_level)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{destination.description}</Text>
        </View>

        {/* Map Button */}
        <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
          <Text style={styles.mapButtonText}>Mappa</Text>
          <Ionicons name="arrow-forward" size={20} color={MAIN_COLOR} />
        </TouchableOpacity>

        {/* Activities List - Modern Style */}
        {destinationActivities.length > 0 && (
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attività da fare</Text>
              <Text style={styles.sectionSubtitle}>Idee facili da fare con i bambini, partendo da qui</Text>
            </View>
            {destinationActivities.map((activity) => {
              return (
                <ActivityCard key={activity.id} activity={activity} />
              );
            })}
          </View>
        )}

        {/* Photos Gallery: solo se ci sono immagini reali */}
        {destination.photos && destination.photos.length > 0 && destination.photos.some((url: string) => typeof url === 'string' && url.startsWith('http') && url.length > 20) && (
          <View style={styles.galleryContainer}>
            <Text style={styles.galleryTitle}>Foto</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.galleryScroll}
            >
              {destination.photos.filter((url: string) => typeof url === 'string' && url.startsWith('http') && url.length > 20).map((photo: string, idx: number) => (
                <TouchableOpacity key={idx} onPress={() => openPreview(photo)}>
                  <Image source={{ uri: photo }} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Map Preview */}
        {destination.coordinates?.latitude != null && 
         destination.coordinates?.longitude != null && 
         isFinite(destination.coordinates.latitude) && 
         isFinite(destination.coordinates.longitude) && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: destination.coordinates.latitude,
                longitude: destination.coordinates.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: destination.coordinates.latitude,
                  longitude: destination.coordinates.longitude,
                }}
                title={destination.name}
                description={destination.region}
              />
            </MapView>
          </View>
        )}

        {/* Extra Info */}
        {(destination.transport?.recommendations ||
          destination.best_seasons?.length > 0 ||
          destination.avg_cost_level) && (
          <View style={styles.extraInfoCard}>
            {destination.transport?.recommendations && (
              <View style={styles.extraItem}>
                <Ionicons name="car-outline" size={18} color={MAIN_COLOR} />
                <View style={styles.extraItemContent}>
                  <Text style={styles.extraTitle}>Trasporti</Text>
                  <Text style={styles.extraValue}>
                    {destination.transport.recommendations}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* CTA finali – blocco unico */}
        {destination.website && (
          <View style={styles.ctaBlock}>
            <Text style={styles.ctaIntro}>Tutto pronto? Parti quando vuoi 👇</Text>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => {
                logEvent(AnalyticsEvents.BUTTON_CLICK, {
                  button_name: 'website_button',
                  screen_name: 'Destination Detail',
                  destination_id: destinationId,
                  website_url: destination.website,
                });
                Linking.openURL(destination.website);
              }}
            >
              <Ionicons name="globe-outline" size={20} color="#fff" />
              <Text style={styles.websiteText}>Visita il sito</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Page>
  );
});

DestinationPage.displayName = 'DestinationPage';

// Memoized Activity Card component to prevent unnecessary re-renders
const ActivityCard = React.memo(({ activity }: { activity: any }) => {
  const activityCategory = useMemo(
    () => getActivityCategoryInfo(activity.tags || []),
    [activity.tags]
  );
  const difficultyInfo = useMemo(
    () => getDifficultyInfo(activity.difficulty),
    [activity.difficulty]
  );
  const activityImage = useMemo(
    () => extractImageUrl(activity.pictures) || "",
    [activity.pictures]
  );
  const ageRange = (activity as any).age_range;

  const handlePress = useCallback(() => {
    logEvent(AnalyticsEvents.BUTTON_CLICK, {
      button_name: 'activity_card',
      activity_id: activity.id,
      activity_title: activity.title,
      screen_name: 'Destination Detail',
    });
    router.push({
      pathname: "/destinations/activity",
      params: {
        activityId: activity.id,
      },
    });
  }, [activity.id]);

  const handleMapPress = useCallback((e: any) => {
    e.stopPropagation();
    router.push({
      pathname: "/destinations/activity",
      params: {
        activityId: activity.id,
      },
    });
  }, [activity.id]);

  return (
    <Pressable onPress={handlePress} style={styles.activityCard}>
      {/* Activity Image - Circular */}
      {activityImage && (
        <Image
          source={{ uri: activityImage }}
          style={styles.activityImage}
        />
      )}

      <View style={styles.activityContent}>
        {/* Category Badge */}
        <View
          style={[
            styles.activityCategoryBadge,
            { backgroundColor: activityCategory.color },
          ]}
        >
          <Ionicons
            name={activityCategory.icon}
            size={12}
            color="#fff"
          />
          <Text style={styles.activityCategoryText}>
            {activityCategory.name}
          </Text>
        </View>

        {/* Activity Title */}
        <Text style={styles.activityTitle}>{activity.title}</Text>

        {/* Activity Details */}
        <View style={styles.activityDetailsRow}>
          <View style={styles.activityDetailItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.activityDetailText}>
              {activity.duration_hours} h
            </Text>
          </View>
          <View style={styles.activityDetailItem}>
            <Text style={styles.difficultyEmoji}>
              {difficultyInfo.emoji}
            </Text>
            <Text style={styles.activityDetailText}>
              {difficultyInfo.text}
            </Text>
          </View>
          <View style={styles.activityDetailItem}>
            <Ionicons
              name="people-outline"
              size={14}
              color="#666"
            />
            <Text style={styles.activityDetailText}>
              {ageRange ? `${ageRange} anni` : "N/A"}
            </Text>
          </View>
        </View>

        {/* Activity Description */}
        <Text style={styles.activityDescription} numberOfLines={2}>
          {activity.description}
        </Text>

        {/* Map Button */}
        <TouchableOpacity
          style={styles.activityMapButton}
          onPress={handleMapPress}
        >
          <Text style={styles.activityMapButtonText}>Mappa</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={MAIN_COLOR}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
});

ActivityCard.displayName = 'ActivityCard';

export default DestinationPage;

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, width: "100%", paddingTop: 100 },
  scrollContent: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 150,
    gap: 20,
  },

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

  // Destination Title
  destinationTitle: {
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
    flexWrap: "wrap",
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

  // Activities Section
  activitiesSection: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginTop: 4,
    lineHeight: 20,
  },

  // Activity Card - Modern Style
  activityCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 16,
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: "cover",
  },
  activityContent: {
    flex: 1,
    gap: 8,
  },
  activityCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
    alignSelf: "flex-start",
  },
  activityCategoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MAIN_COLOR,
    marginTop: 4,
  },
  activityDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  activityDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityDetailText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  difficultyEmoji: {
    fontSize: 14,
  },
  activityDescription: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    marginTop: 4,
  },
  activityExtraInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  activityExtraText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    fontStyle: "italic",
  },
  activityExtraList: {
    flex: 1,
    gap: 4,
  },
  activityExtraListItem: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  activityMission: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
  },
  activityMissionText: {
    flex: 1,
    fontSize: 12,
    color: "#856404",
    lineHeight: 16,
    fontWeight: "600",
  },
  activityMapButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 8,
  },
  activityMapButtonText: {
    fontSize: 14,
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

  // Map Container
  mapContainer: {
    width: "90%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: { width: "100%", height: "100%" },

  // Extra Info Card
  extraInfoCard: {
    width: "90%",
    backgroundColor: "#f9f9f9",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  extraItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  extraItemContent: {
    flex: 1,
  },
  extraTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  extraValue: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },

  // Website Button
  ctaBlock: {
    width: "90%",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 16,
  },
  ctaIntro: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  websiteButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MAIN_COLOR,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 10,
    shadowColor: MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  websiteText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
