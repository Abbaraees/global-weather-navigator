import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteLocation, FavoriteWeatherData } from '../types/favorites';
import { CurrentWeather } from '../types/weather';
import { getCurrentWeatherByCoords } from '../services/weatherApi';

type FavoritesContextType = {
  favorites: FavoriteLocation[];
  favoriteWeatherData: FavoriteWeatherData[];
  addFavorite: (location: FavoriteLocation) => Promise<void>;
  removeFavorite: (locationId: string) => Promise<void>;
  removeFavoriteByName: (locationName: string) => Promise<void>;
  isFavorite: (locationName: string) => boolean;
  refreshFavorites: (units: 'metric' | 'imperial') => Promise<void>;
  loading: boolean;
  error: string | null;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = '@global_weather_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [favoriteWeatherData, setFavoriteWeatherData] = useState<FavoriteWeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed.map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        })));
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteLocation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  };

  const addFavorite = useCallback(async (location: FavoriteLocation) => {
    const newFavorites = [...favorites, location];
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
  }, [favorites]);

  const removeFavorite = useCallback(async (locationId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== locationId);
    setFavorites(newFavorites);
    setFavoriteWeatherData(prev => prev.filter(data => data.id !== locationId));
    await saveFavorites(newFavorites);
  }, [favorites]);

  const removeFavoriteByName = useCallback(async (locationName: string) => {
    const newFavorites = favorites.filter(fav => fav.name.toLowerCase() !== locationName.toLowerCase());
    setFavorites(newFavorites);
    setFavoriteWeatherData(prev => prev.filter(data => data.name.toLowerCase() !== locationName.toLowerCase()));
    await saveFavorites(newFavorites);
  }, [favorites]);

  const isFavorite = useCallback((locationName: string) => {
    return favorites.some(fav => fav.name.toLowerCase() === locationName.toLowerCase());
  }, [favorites]);

  const refreshFavorites = useCallback(async (units: 'metric' | 'imperial') => {
    if (favorites.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const weatherPromises = favorites.map(async (favorite) => {
        try {
          const weather = await getCurrentWeatherByCoords(favorite.coordinates, units);
          return {
            ...favorite,
            weather,
            lastUpdated: new Date()
          };
        } catch (err) {
          console.error(`Failed to fetch weather for ${favorite.name}:`, err);
          return null;
        }
      });

      const results = await Promise.all(weatherPromises);
      const validResults = results.filter((result): result is FavoriteWeatherData => result !== null);
      setFavoriteWeatherData(validResults);
    } catch (err) {
      setError('Failed to refresh favorites weather data');
      console.error('Refresh favorites error:', err);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  const value: FavoritesContextType = {
    favorites,
    favoriteWeatherData,
    addFavorite,
    removeFavorite,
    removeFavoriteByName,
    isFavorite,
    refreshFavorites,
    loading,
    error
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
