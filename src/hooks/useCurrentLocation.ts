import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export type LocationCoords = {
  lat: number;
  lon: number;
};

export type LocationWithName = LocationCoords & {
  name: string;
  country?: string;
};

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async (): Promise<LocationCoords | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({});
      return { lat: loc.coords.latitude, lon: loc.coords.longitude };
    } catch (e: any) {
      setError(e?.message || 'Failed to get location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocationWithName = useCallback(async (): Promise<LocationWithName | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        return null;
      }
      
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      
      // Try to get location name using reverse geocoding
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: coords.lat,
          longitude: coords.lon
        });
        const name = address.city || address.district || address.subregion || address.region || 'Current Location';
        const country = address.country || undefined;
        
        return {
          ...coords,
          name,
          country
        };
      } catch (reverseGeocodeError) {
        console.warn('Reverse geocoding failed, using coordinates only:', reverseGeocodeError);
        return {
          ...coords,
          name: 'Current Location'
        };
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to get location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getLocation, getLocationWithName, loading, error };
}
