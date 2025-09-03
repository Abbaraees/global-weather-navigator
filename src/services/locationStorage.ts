import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredLocation = {
  name: string;
  country?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  isCurrentLocation: boolean;
  lastUpdated: Date;
};

const DEFAULT_LOCATION_KEY = '@global_weather_default_location';
const FIRST_LAUNCH_KEY = '@global_weather_first_launch';

export class LocationStorageService {
  static async saveDefaultLocation(location: StoredLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(DEFAULT_LOCATION_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Failed to save default location:', error);
      throw new Error('Failed to save location');
    }
  }

  static async getDefaultLocation(): Promise<StoredLocation | null> {
    try {
      const stored = await AsyncStorage.getItem(DEFAULT_LOCATION_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated)
      };
    } catch (error) {
      console.error('Failed to load default location:', error);
      return null;
    }
  }

  static async clearDefaultLocation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DEFAULT_LOCATION_KEY);
    } catch (error) {
      console.error('Failed to clear default location:', error);
    }
  }

  static async isFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      return hasLaunched === null;
    } catch (error) {
      console.error('Failed to check first launch:', error);
      return false;
    }
  }

  static async markFirstLaunchComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
    } catch (error) {
      console.error('Failed to mark first launch complete:', error);
    }
  }
}
