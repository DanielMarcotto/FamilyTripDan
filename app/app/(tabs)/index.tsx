import React, { useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Page from '@/components/templates/Page';
import {
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import Header from '@/components/templates/Header';
import ChatStarter from '@/components/organisms/chat/ChatStarter';
import { useNavigation } from '@/context/NavigationContext';
import { logScreenView } from '@/services/analytics';






const Index = React.memo(() => {
  const scrollViewRef = useRef<View>(null);
  const { setMapMode } = useNavigation();

  // Ensure map mode is disabled when on this tab (cleanup POI)
  useFocusEffect(
    React.useCallback(() => {
      setMapMode(false);
      logScreenView('Home');
      return () => {
        // Optional: cleanup on unfocus if needed
      };
    }, [setMapMode])
  );

  // Animation values - memoized to prevent recreation
  const chatStarterOpacity = useRef(new Animated.Value(1)).current; // Start with Starter visible

  // Memoize animated style to prevent recreation
  const animatedStyle = React.useMemo(
    () => [{ opacity: chatStarterOpacity }, styles.chatContent],
    [chatStarterOpacity]
  );

  return (
    <Page noPaddingTop noBottomBar alignItems="center" justifyContent="space-between" page="home">
      <Header text=' ' />

      <View
        ref={scrollViewRef}
        style={styles.chatContainer}
      >
        <Animated.View style={animatedStyle}>
          <ChatStarter />
        </Animated.View>
      </View>
    </Page>
  );
});

Index.displayName = 'HomeTab';

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {

    flex: 1,
    width: '100%',

    paddingBottom: 30,
  },
  chatContent: {
    width: '100%',
    paddingBottom: 20,

  },
});