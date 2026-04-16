import React, { useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';

import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { triggerSelectionHaptic } from '@/utils/Haptics';
import PreferencesManager from '@/utils/LocalSettings';

import Page from '@/components/templates/Page';
import Header from '@/components/templates/Header';

import { removeToken } from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ArrowSquare from '@/components/atoms/icons/ArrowSquare';
import SpinnerLoaderSmall from '@/components/atoms/loaders/SpinnerSmall';
import ButtonSettings from '@/components/atoms/buttons/ButtonSettings';
import ButtonSettingsToggle from '@/components/atoms/buttons/ButtonSettingsToggle';
import ButtonIcon from '@/components/atoms/buttons/ButtonIcon';
import i18n from '@/i18n/i18n';


const Index = React.memo(() => {
  const version = Constants;
  const insets = useSafeAreaInsets();
  const { userData, logout } = useContext(AuthContext);
  const [haptics, setHaptics] = useState<any>(false);
  const [notifications, setNotifications] = useState<any>(true);
  const isLoggedIn = useMemo(() => !!userData, [userData]);

  const handleLogout = useCallback(async () => {
    logout();
    await removeToken();
  }, [logout]);


  /* User Picture Logics */
  const [isImageLoading, setIsImageLoading] = useState(true);
  useEffect(() => {
    if (userData?.user.profile_picture) {
      Image.prefetch(userData.user.profile_picture)
        .then(() => setIsImageLoading(false))
        .catch(() => setIsImageLoading(false));
    } else {
      setIsImageLoading(false);
    }
  }, [userData?.user.profile_picture]);

  // Create stable callbacks using useCallback to prevent recreation on every render
  // setHaptics and setNotifications are stable setState functions, so they don't need to be in deps
  const hapticCallback = useCallback((newValue: any) => {
    setHaptics(newValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notificationCallback = useCallback((newValue: any) => {
    setNotifications(newValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Initialize PreferencesManager and sync states */
  useEffect(() => {
    const initializePrefs = async () => {
      try {
        const manager = PreferencesManager.getInstance(); // Use singleton
        await manager.initialize();

        // Set initial states
        setHaptics(await manager.getHapticPreference());
        setNotifications(await manager.getNotificationPreference());

        // Subscribe to preference changes using stable callbacks
        manager.on('hapticPreferenceChanged', hapticCallback);
        manager.on('notificationPreferenceChanged', notificationCallback);
      } catch (error) {
        console.error('Failed to initialize preferences:', error);
      }
    };

    initializePrefs();

    // Cleanup listeners when component unmounts
    return () => {
      const manager = PreferencesManager.getInstance();
      manager.off('hapticPreferenceChanged', hapticCallback);
      manager.off('notificationPreferenceChanged', notificationCallback);
    };
  }, [hapticCallback, notificationCallback]);

  /* Handle toggle actions with haptic feedback */
  const handleToggleHaptics = useCallback(async () => {
    try {
      const manager = PreferencesManager.getInstance();
      await manager.toggleHapticPreference();
      await triggerSelectionHaptic(); // Trigger haptic feedback if enabled
    } catch (error) {
      console.error('Failed to toggle haptics:', error);
    }
  }, []);
  
  const handleToggleNotifications = useCallback(async () => {
    try {
      const manager = PreferencesManager.getInstance();
      await manager.toggleNotificationPreference();
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  }, []);


  return (
    <Page noPaddingTop alignItems="center" justifyContent="space-between" page="settings">
      <Header text=" " />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={useMemo(() => ({
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
        }), [insets.top])}
      >
        {/* Profile Data - Only show if logged in */}
        {isLoggedIn && (
          <View
            style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 20, width: '100%', marginTop: 30 }}
          >
            <TouchableOpacity style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={userData?.user.profile_picture ? { uri: userData.user.profile_picture } : require('@/assets/fallbacks/pfp.webp')}
                style={{ height: '100%', width: '100%', borderRadius: 50, opacity: isImageLoading ? 0 : 1 }}
              />
              {isImageLoading && (
                <View style={{ height: '100%', width: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                  <SpinnerLoaderSmall />
                </View>
              )}
            </TouchableOpacity>

            <View style={{ gap: 5, alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'column', width: '100%' }}>
              <Text style={{ fontSize: 22, fontWeight: 500, textTransform: 'capitalize' }}>{userData?.user.name ?? 'User'}</Text>
              <View style={styles.memberSince}>
                <Ionicons name="calendar" size={16} color="#666" />
                <View style={{ flexDirection: 'row', gap: 0 }}>

                  <Text style={styles.memberSinceText}>
                    {i18n.t('settings.memberSince')}{' '}
                  </Text>
                  <Text style={[styles.memberSinceText, { textTransform: 'capitalize' }]}>
                    {new Date(userData?.createdAt ?? '').toLocaleDateString(i18n.t('common.id'), { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Login Button - Only show if not logged in */}
        {!isLoggedIn && (
          <View style={{ marginTop: 50, marginBottom: 40, width: '100%', alignItems: 'center' }}>
            <ButtonIcon
              text="Accedi"
              onPress={() => router.push('/auth/login')}
              style={{ width: '90%', backgroundColor: '#FF7A00' }}
              styleText={{ fontSize: 15, color: 'white', fontWeight: '600' }}
              icon={<Ionicons name="log-in-outline" size={20} color="white" />}
            />
            <TouchableOpacity
              style={{ marginTop: 15 }}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={{ color: '#00000080', fontFamily: 'Montserrat' }}>Crea un account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Container Buttons */}
        <View style={{ marginTop: isLoggedIn ? 50 : 0 }}>
          
          {/* ACCOUNT - Only show if logged in */}
          {isLoggedIn && (
            <View style={{ marginBottom: 40 }}>
              <Text style={{ color: '#00000080', marginBottom: 15, textTransform: 'uppercase' }}>{i18n.t('settings.account')}</Text>
              <View>
                <ButtonSettings
                  icon={<Ionicons name="man-outline" size={18} />}
                  text={i18n.t('settings.account')}
                  onPress={() => router.push('/settings/account')}
                />
                {/*<ButtonSettings
                  icon={<Ionicons name="shield-outline" size={18} />}
                  text={i18n.t('settings.security')}
                  onPress={() => { router.push('/settings/security') }}
                />*/}
              </View>
            </View>
          )}

          {/* GENERAL */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ color: '#00000080', marginBottom: 15, textTransform: 'uppercase' }}>{i18n.t('settings.general')}</Text>
            <View>
              {/* Family settings only if logged in */}
              {isLoggedIn && (
                <ButtonSettings icon={<Ionicons name="people-circle-outline" size={18} />} text={'Impostazioni Famiglia'} onPress={() => { router.push('/settings/family') }} />
              )}
              <ButtonSettingsToggle icon={<Ionicons name="radio-button-on-outline" size={18} />} value={haptics} onClick={handleToggleHaptics} text={i18n.t('settings.haptics')} />
              <ButtonSettingsToggle icon={<Ionicons name="notifications-outline" size={18} />} value={notifications} onClick={handleToggleNotifications} text={i18n.t('settings.notifications')} />
              <ButtonSettings icon={<Ionicons name="language-outline" size={18} />} text={i18n.t('settings.language')} onPress={() => { router.push('/settings/language') }} />
            </View>
          </View>

          {/* INFO */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ color: '#00000080', marginBottom: 15, textTransform: 'uppercase' }}>{i18n.t('settings.info')}</Text>
            <View>
              <ButtonSettings
                icon={<Ionicons name="reader-outline" size={18} />}
                text={i18n.t('settings.t&s')}
                onPress={() => router.push('/settings/terms')}
              />
              <ButtonSettings
                icon={<Ionicons name="lock-closed-outline" size={18} />}
                text={i18n.t('settings.privacypolicy')}
                onPress={() => router.push('/settings/policy')}
              />
              <ButtonSettings
                icon={<Ionicons name="phone-portrait-outline" size={18} />}
                text={i18n.t('settings.version')}
                noChevron
                extra={
                  <Text style={{ color: '#00000080' }}>
                    v{version.expoConfig?.version} ({version.expoConfig?.ios?.buildNumber ?? 'internal'}) </Text>
                }
                onPress={() => router.push('/settings/version')}
              />
              {/* Logout only if logged in */}
              {isLoggedIn && (
                <ButtonSettings
                  text={i18n.t('settings.logout')}
                  noChevron
                  icon={<ArrowSquare color="tomato" />}
                  iconStyle={{
                    backgroundColor: '#e03d0740',
                    borderColor: '#e03d0740',
                  }}
                  onPress={handleLogout}
                />
              )}
            </View>
          </View>

        </View>
        <View
          style={{
            height: Platform.OS == 'ios' ? 40 : 140
          }}
        />
      </ScrollView>
    </Page>
  );
});

Index.displayName = 'SettingsTab';

export default Index;

const styles = StyleSheet.create({
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberSinceText: {
    fontSize: 12,
    color: '#666',
  },
});
