"use client"

import { StyleSheet, Text, View, Image, Pressable, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState, useMemo, useContext, useCallback } from "react";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import Toast from "react-native-toast-message";
import { logEvent, AnalyticsEvents } from "@/services/analytics";

interface PoiCardProps {
  destination: any;
}

// Gestione immagine con fallback
const FallbackImage = ({ uri, style }: { uri: string | undefined; style: any }) => {
  const [failed, setFailed] = useState(false);

  
  // Get fallback image URI
  let fallbackUri: string;
  try {
    fallbackUri = Image.resolveAssetSource(
      require("../../../assets/fallbacks/nopic.png")
    ).uri;
  } catch {
    // If fallback image doesn't exist, use empty string
    fallbackUri = '';
  }

  // Validate URI - check if it's a valid URL
  const isValidUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '') return false;
    try {
      const urlObj = new URL(trimmed);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Determine which image to use
  const hasValidUri = isValidUrl(uri) && !failed;
  const imageUri = hasValidUri ? uri! : (fallbackUri || null);

   console.log('imageUri', imageUri);

  return (
    <View style={[style, { backgroundColor: '#E0E0E0', overflow: 'hidden' }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={style}
          resizeMode={"cover"}
          onError={() => {
            setFailed(true);
          }}
        />
      ) : (
        <View style={[style, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]} />
      )}
    </View>
  );
};

const PoiCard = ({ destination }: PoiCardProps) => {
  const { userData } = useContext(AuthContext);
  const isLoggedIn = !!userData;
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  const isFavorite = checkIsFavorite(destination?.id || '');

  const priceDisplay = useMemo(
    () =>
      Array.from({ length: destination.price || 0 }, () => "€").join(""),
    [destination.price]
  );

  const handleFavoritePress = useCallback(async (e: any) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      Toast.show({
        type: 'info',
        text1: 'Login richiesto',
        text2: 'Devi effettuare il login per aggiungere ai preferiti',
      });
      router.push('/auth/login');
      return;
    }

    if (isLoadingFavorite || !destination?.id) {
      return;
    }

    setIsLoadingFavorite(true);
    const wasFavorite = isFavorite;

    try {
      const success = await toggleFavorite(destination.id);
      
      if (success) {
        // Log favorite event
        logEvent(
          wasFavorite ? AnalyticsEvents.POI_FAVORITE_REMOVED : AnalyticsEvents.POI_FAVORITE_ADDED,
          {
            poi_id: destination.id,
            poi_name: destination.title,
            poi_category: destination.category,
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
  }, [isLoggedIn, isFavorite, isLoadingFavorite, destination?.id, toggleFavorite]);

  const handleCardPress = useCallback(() => {
    logEvent(AnalyticsEvents.BUTTON_CLICK, {
      button_name: 'poi_card',
      poi_id: destination.id,
      poi_name: destination.title,
      poi_category: destination.category,
    });
    router.push({
      pathname: "/destinations/poi",
      params: { destinationId: destination.id },
    });
  }, [destination.id]);

  return (
    <Pressable
      style={styles.gridCard}
      onPress={handleCardPress}
    >
      <FallbackImage uri={destination.image} style={styles.gridImage} />
      <View style={styles.gridOverlay}>
        <View style={styles.statusBadge}>
          <Text style={styles.text}>{destination.status}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.liquidButton,
            isFavorite && styles.liquidButtonActive,
            isLoadingFavorite && styles.liquidButtonLoading
          ]}
          onPress={handleFavoritePress}
          disabled={isLoadingFavorite}
        >
          {isLoadingFavorite ? (
            <ActivityIndicator size="small" color="#FF7A00" />
          ) : (
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#FF7A00" : "#FF7A00"} 
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle}>{destination.title}</Text>
        <View style={styles.gridDetails}>
          <Text style={styles.featuredLocation}>
            {destination.location ?? "N/A"} (
            {destination.distance && isFinite(destination.distance)
              ? (destination.distance / 1000).toFixed(2)
              : "N/A"} km)
          </Text>
          <View style={styles.ratingContainerSmall}>
            <Text
              style={{
                fontSize: 12,
                color: "#FF7A00",
                fontWeight: "600",
              }}
            >
              {priceDisplay}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

PoiCard.displayName = "PoiCard";

// Custom comparison function for React.memo to prevent unnecessary re-renders
export default React.memo(PoiCard, (prevProps, nextProps) => {
  return prevProps.destination.id === nextProps.destination.id &&
         prevProps.destination.distance === nextProps.destination.distance &&
         prevProps.destination.image === nextProps.destination.image;
});

const styles = StyleSheet.create({
  liquidButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  liquidButtonActive: {
    backgroundColor: "rgba(255,255,255,1)",
    borderColor: "#FF7A00",
    borderWidth: 2,
  },
  liquidButtonLoading: {
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  featuredLocation: {
    fontSize: 12,
    color: "#666",
  },
  gridContainer: {
    flexDirection: "column",
    paddingHorizontal: 10,
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#00000020",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: 180,
  },
  gridImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#E0E0E0",
  },
  gridOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBadgeSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  favoriteButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIconSmall: {
    fontSize: 16,
  },
  gridInfo: {
    padding: 14,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 0,
    fontFamily: "Montserrat",
  },
  gridDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 2,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  ratingContainerSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});


