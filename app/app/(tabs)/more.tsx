import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Page from '@/components/templates/Page';
import Header from '@/components/templates/Header';
import { logScreenView, logEvent, AnalyticsEvents } from '@/services/analytics';

const More = React.memo(() => {
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      logScreenView('More');
    }, [])
  );

  const handleNavigateToFavorites = () => {
    logEvent(AnalyticsEvents.BUTTON_CLICK, {
      button_name: 'favorites_button',
      screen_name: 'More',
    });
    router.push('/favorites');
  };

  const handleNavigateToSettings = () => {
    logEvent(AnalyticsEvents.BUTTON_CLICK, {
      button_name: 'settings_button',
      screen_name: 'More',
    });
    router.push('/settings');
  };

  return (
    <Page noPaddingTop noBottomBar alignItems="center" justifyContent="flex-start" page="home">
      <Header text="Altro" />
      
      <View style={[styles.container, { paddingTop: insets.top + 80 }]}>
        <View style={styles.optionsContainer}>
          {/* Preferiti */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleNavigateToFavorites}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FF7A0015' }]}>
              <Ionicons name="heart" size={32} color="#FF7A00" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Preferiti</Text>
              <Text style={styles.optionDescription}>
                Visualizza i tuoi punti di interesse preferiti
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>

          {/* Impostazioni */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleNavigateToSettings}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#66666615' }]}>
              <Ionicons name="settings" size={32} color="#666" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>Impostazioni</Text>
              <Text style={styles.optionDescription}>
                Gestisci le tue preferenze e account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </Page>
  );
});

More.displayName = 'MoreTab';

export default More;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

