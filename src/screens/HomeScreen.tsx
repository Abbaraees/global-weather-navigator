import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Appbar, SegmentedButtons, Text, ActivityIndicator, Snackbar, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { WeatherCard } from '../components/WeatherCard';
import { LocationConfirmationDialog } from '../components/LocationConfirmationDialog';
import { useCurrentLocation, type LocationWithName } from '../hooks/useCurrentLocation';
import { getCurrentWeatherByCity, getCurrentWeatherByCoords } from '../services/weatherApi';
import { LocationStorageService, type StoredLocation } from '../services/locationStorage';
import type { CurrentWeather } from '../types/weather';
import { SearchBar } from '../components/SearchBar';

type DisplayMode = 'default' | 'searching' | 'weather';

export function HomeScreen() {
  const [query, setQuery] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('default');
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<LocationWithName | null>(null);
  const [defaultLocation, setDefaultLocation] = useState<StoredLocation | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const { getLocation, getLocationWithName, loading: locLoading, error: locError } = useCurrentLocation();
  const mountedRef = useRef(true);

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  // Load default location and check first launch
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isFirstLaunch = await LocationStorageService.isFirstLaunch();
        const storedLocation = await LocationStorageService.getDefaultLocation();
        
        if (storedLocation) {
          setDefaultLocation(storedLocation);
          // Auto-load weather for stored location
          await fetchWeatherForStoredLocation(storedLocation);
        } else if (isFirstLaunch) {
          // First launch - try to get current location
          await handleFirstLaunchLocationSetup();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsFirstLoad(false);
      }
    };

    initializeApp();
  }, []);

  // Handle units change - refresh current data
  useEffect(() => {
    if (!isFirstLoad && data && defaultLocation) {
      fetchWeatherForStoredLocation(defaultLocation);
    }
  }, [units]);

  const handleFirstLaunchLocationSetup = async () => {
    try {
      const locationWithName = await getLocationWithName();
      if (locationWithName && mountedRef.current) {
        setPendingLocation(locationWithName);
        setShowLocationDialog(true);
      }
    } catch (error) {
      console.error('Failed to get location on first launch:', error);
    }
  };

  const fetchWeatherForStoredLocation = async (location: StoredLocation) => {
    setLoading(true);
    setError(null);
    setDisplayMode('weather');
    try {
      const weather = await getCurrentWeatherByCoords(location.coordinates, units);
      if (mountedRef.current) {
        setData(weather);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e?.message ?? 'Failed to load weather');
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleLocationConfirm = async () => {
    if (!pendingLocation) return;
    
    try {
      const storedLocation: StoredLocation = {
        name: pendingLocation.name,
        country: pendingLocation.country,
        coordinates: pendingLocation,
        isCurrentLocation: true,
        lastUpdated: new Date()
      };
      
      await LocationStorageService.saveDefaultLocation(storedLocation);
      await LocationStorageService.markFirstLaunchComplete();
      
      setDefaultLocation(storedLocation);
      setShowLocationDialog(false);
      setPendingLocation(null);
      
      // Load weather for the confirmed location
      await fetchWeatherForStoredLocation(storedLocation);
    } catch (error) {
      setError('Failed to save location');
    }
  };

  const handleLocationDecline = async () => {
    setShowLocationDialog(false);
    setPendingLocation(null);
    await LocationStorageService.markFirstLaunchComplete();
  };

  const fetchByCity = useCallback(async () => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    setDisplayMode('weather');
    
    try {
      const res = await getCurrentWeatherByCity(query.trim(), units);
      if (mountedRef.current) {
        setData(res);
        
        // Save as new default location
        const newStoredLocation: StoredLocation = {
          name: res.name,
          country: undefined, // Weather API might not always provide country in current weather
          coordinates: res.coord ? { lat: res.coord.lat, lon: res.coord.lon } : { lat: 0, lon: 0 },
          isCurrentLocation: false,
          lastUpdated: new Date()
        };
        
        await LocationStorageService.saveDefaultLocation(newStoredLocation);
        setDefaultLocation(newStoredLocation);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e?.message ?? 'Failed to load weather');
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [query, units, canSearch]);

  const fetchByGps = useCallback(async () => {
    try {
      const locationWithName = await getLocationWithName();
      if (locationWithName && mountedRef.current) {
        setLoading(true);
        setError(null);
        setDisplayMode('weather');
        
        const res = await getCurrentWeatherByCoords(locationWithName, units);
        
        if (mountedRef.current) {
          setData(res);
          
          // Save as new default location
          const newStoredLocation: StoredLocation = {
            name: locationWithName.name,
            country: locationWithName.country,
            coordinates: locationWithName,
            isCurrentLocation: true,
            lastUpdated: new Date()
          };
          
          await LocationStorageService.saveDefaultLocation(newStoredLocation);
          setDefaultLocation(newStoredLocation);
        }
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e?.message ?? 'Failed to load current location weather');
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [getLocationWithName, units]);

  const handleRefresh = useCallback(async () => {
    if (!defaultLocation) return;
    
    setRefreshing(true);
    try {
      await fetchWeatherForStoredLocation(defaultLocation);
    } finally {
      setRefreshing(false);
    }
  }, [defaultLocation, units]);

  const handleSearchFocus = () => {
    if (displayMode === 'weather') {
      setDisplayMode('searching');
    }
  };

  const handleSearchBlur = async () => {
    if (displayMode === 'searching' && !query.trim()) {
      setDisplayMode('weather');
      // If we have a default location but no current weather data, reload it
      if (defaultLocation && !data) {
        await fetchWeatherForStoredLocation(defaultLocation);
      }
    }
  };

  const handleSearchClear = async () => {
    setQuery('');
    if (displayMode === 'searching') {
      setDisplayMode('weather');
      // If we have a default location and no current weather data, reload it
      if (defaultLocation && !data) {
        await fetchWeatherForStoredLocation(defaultLocation);
      }
    }
  };

  const handleQueryChange = async (text: string) => {
    setQuery(text);
    if (text.trim() && displayMode !== 'searching') {
      setDisplayMode('searching');
    } else if (!text.trim() && displayMode === 'searching') {
      setDisplayMode('weather');
      // If we have a default location but no current weather data, reload it
      if (defaultLocation && !data) {
        await fetchWeatherForStoredLocation(defaultLocation);
      }
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const showWeatherCard = displayMode === 'weather' && data && !loading;
  const showEmptyState = displayMode === 'default' || (displayMode === 'weather' && !data && !loading);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0ea5e9", "#22d3ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBg}
      >
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.Content title="Global Weather Navigator" color="#ffffff" />
        </Appbar.Header>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            enabled={!!defaultLocation}
          />
        }
      >
        <SearchBar 
          value={query} 
          onChangeText={handleQueryChange}
          onSubmit={fetchByCity} 
          loading={loading}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onClear={handleSearchClear}
        />

        <View style={styles.controlsRow}>
          <SegmentedButtons
            value={units}
            onValueChange={(v) => setUnits(v as 'metric' | 'imperial')}
            buttons={[
              { value: 'metric', label: '°C', icon: 'temperature-celsius' },
              { value: 'imperial', label: '°F', icon: 'temperature-fahrenheit' },
            ]}
          />
        </View>

        {loading ? (
          <View style={styles.center}> 
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading weather…</Text>
          </View>
        ) : null}

        {showWeatherCard ? (
          <WeatherCard data={data} units={units} />
        ) : null}

        {showEmptyState ? (
          <View style={styles.emptyBox}>
            <Appbar.Action icon="weather-partly-cloudy" color="#94a3b8" />
            <Text accessibilityRole="summary" style={{ textAlign: 'center', color: '#64748b' }}>
              {defaultLocation 
                ? `Pull down to refresh weather for ${defaultLocation.name}` 
                : 'Search for a city or tap the GPS button to view your current weather.'
              }
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Snackbar 
        visible={!!(error || locError)} 
        onDismiss={() => { setError(null); }} 
        duration={4000}
      >
        {error || locError}
      </Snackbar>

      <FAB
        icon={locLoading ? 'progress-clock' : 'crosshairs-gps'}
        onPress={fetchByGps}
        style={styles.fab}
        loading={locLoading}
        accessibilityLabel="Use current location"
      />

      <LocationConfirmationDialog
        visible={showLocationDialog}
        onDismiss={() => setShowLocationDialog(false)}
        onConfirm={handleLocationConfirm}
        onDecline={handleLocationDecline}
        locationName={pendingLocation?.name}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBg: { paddingBottom: 8 },
  content: { padding: 16 },
  controlsRow: { marginTop: 12, gap: 12 },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  emptyBox: { alignItems: 'center', gap: 8, marginTop: 24 },
  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#0ea5e9' },
});
