import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import PreferencesManager from './LocalSettings';

// Singleton PreferencesManager instance
const prefsManager = PreferencesManager.getInstance();
let isHapticsEnabled = false; // Cache the haptic preference

// Initialize PreferencesManager and set up event listener
(async () => {
  try {
    await prefsManager.initialize();
    isHapticsEnabled = await prefsManager.getHapticPreference() as boolean;
    console.log('Initial haptic preference:', isHapticsEnabled);
    prefsManager.on('hapticPreferenceChanged', (newValue: any) => {
      console.log('Haptic preference changed:', newValue);
      isHapticsEnabled = newValue; // Update cached value when preference changes
    });
  } catch (error) {
    console.error('Failed to initialize PreferencesManager:', error);
  }
})();

export const triggerSelectionHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Selection haptic failed:', error);
    }
  }
};

export const triggerNotificationSuccessHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Notification success haptic failed:', error);
    }
  }
};

export const triggerNotificationErrorHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Notification error haptic failed:', error);
    }
  }
};

export const triggerNotificationWarningHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Notification warning haptic failed:', error);
    }
  }
};

export const triggerImpactLightHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Impact light haptic failed:', error);
    }
  }
};

export const triggerImpactMediumHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Impact medium haptic failed:', error);
    }
  }
};

export const triggerImpactHeavyHaptic = async () => {
  if (Platform.OS !== 'web' && isHapticsEnabled) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Impact heavy haptic failed:', error);
    }
  }
};

export const triggerImpactRigidHaptic = async () => {
  if (Platform.OS === 'ios' && isHapticsEnabled) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    } catch (error) {
      console.warn('Impact rigid haptic failed:', error);
    }
  }
};

export const triggerImpactSoftHaptic = async () => {
  if (Platform.OS === 'ios' && isHapticsEnabled) {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    } catch (error) {
      console.warn('Impact soft haptic failed:', error);
    }
  }
};