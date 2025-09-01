import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async () => {
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

  return { getLocation, loading, error };
}
