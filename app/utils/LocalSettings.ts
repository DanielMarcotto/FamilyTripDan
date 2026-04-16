import { storage_getStoredData, storage_saveStoredData } from "./Storage";

class PreferencesManager {
  static instance: PreferencesManager | null = null;

  private hapticKey!: string;
  private notificationKey!: string;
  private currentHapticSetting!: boolean | null;
  private currentNotificationSetting!: boolean | null;
  private eventListeners!: Map<string, Function[]>;

  static getInstance() {
    if (!PreferencesManager.instance) {
      PreferencesManager.instance = new PreferencesManager();
    }
    return PreferencesManager.instance;
  }

  constructor() {
    if (PreferencesManager.instance) {
      return PreferencesManager.instance; // Return existing instance if already created
    }
    this.hapticKey = 'hazel-settings-haptics';
    this.notificationKey = 'hazel-settings-notifications';
    this.currentHapticSetting = null;
    this.currentNotificationSetting = null;
    this.eventListeners = new Map();
    PreferencesManager.instance = this; // Set singleton instance
  }

  async initHapticPreferences() {
    this.currentHapticSetting = await storage_getStoredData(this.hapticKey);
    if (this.currentHapticSetting === undefined) {
      await storage_saveStoredData(this.hapticKey, false);
      this.currentHapticSetting = false;
    }
  }

  async toggleHapticPreference() {
    try {
      const opposite = !this.currentHapticSetting;
      await storage_saveStoredData(this.hapticKey, opposite);
      this.currentHapticSetting = opposite;
      this.emit('hapticPreferenceChanged', this.currentHapticSetting);
      return opposite;
    } catch (error) {
      console.error('Failed to toggle haptic preference:', error);
      throw error;
    }
  }

  async getHapticPreference() {
    try {
      const setting = await storage_getStoredData(this.hapticKey);
      this.currentHapticSetting = setting !== undefined ? setting : this.currentHapticSetting;
      return this.currentHapticSetting;
    } catch (error) {
      console.error('Failed to get haptic preference:', error);
      return this.currentHapticSetting; // Fallback to cached value
    }
  }

  async initNotificationPreferences() {
    let currentNotificationSetting = await storage_getStoredData(this.notificationKey);
    if (currentNotificationSetting === undefined) {
      await storage_saveStoredData(this.notificationKey, true);
      currentNotificationSetting = true;
    }
    this.currentNotificationSetting = currentNotificationSetting;
  }

  async toggleNotificationPreference() {
    try {
      const opposite = !this.currentNotificationSetting;
      await storage_saveStoredData(this.notificationKey, opposite);
      this.currentNotificationSetting = opposite;
      this.emit('notificationPreferenceChanged', this.currentNotificationSetting);
      return opposite;
    } catch (error) {
      console.error('Failed to toggle notification preference:', error);
      throw error;
    }
  }

  async getNotificationPreference() {
    try {
      const setting = await storage_getStoredData(this.notificationKey);
      this.currentNotificationSetting = setting !== undefined ? setting : this.currentNotificationSetting;
      return this.currentNotificationSetting;
    } catch (error) {
      console.error('Failed to get notification preference:', error);
      return this.currentNotificationSetting; // Fallback to cached value
    }
  }

  on(event: any, callback: any) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: any, callback: any) {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: any, data: any) {
    const callbacks = this.eventListeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  async initialize() {
    await Promise.all([
      this.initHapticPreferences(),
      this.initNotificationPreferences()
    ]);
  }
}

export default PreferencesManager;