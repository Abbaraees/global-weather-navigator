import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, SegmentedButtons, Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { WeatherCard } from '../components/WeatherCard';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { getCurrentWeatherByCity, getCurrentWeatherByCoords } from '../services/weatherApi';
import type { CurrentWeather } from '../types/weather';
import { SearchBar } from '../components/SearchBar';

export function HomeScreen() {
  const [query, setQuery] = useState('');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getLocation, loading: locLoading, error: locError } = useCurrentLocation();

  const canSearch = useMemo(() => query.trim().length > 0, [query]);

  const fetchByCity = useCallback(async () => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCurrentWeatherByCity(query.trim(), units);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load weather');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query, units, canSearch]);

  const fetchByGps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getLocation();
      if (!coords) return;
      const res = await getCurrentWeatherByCoords(coords, units);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load current location weather');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getLocation, units]);

  // Optionally auto-fetch a default city on first load
  useEffect(() => {
    // no-op; user can search or use GPS
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Global Weather Navigator" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SearchBar value={query} onChangeText={setQuery} onSubmit={fetchByCity} loading={loading} />

        <View style={styles.controlsRow}>
          <SegmentedButtons
            value={units}
            onValueChange={(v) => setUnits(v as 'metric' | 'imperial')}
            buttons={[
              { value: 'metric', label: '°C', icon: 'temperature-celsius' },
              { value: 'imperial', label: '°F', icon: 'temperature-fahrenheit' },
            ]}
          />
          <Button mode="contained" onPress={fetchByGps} loading={locLoading} style={styles.gpsBtn}>
            Use GPS
          </Button>
        </View>

        {loading ? (
          <View style={styles.center}> 
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading…</Text>
          </View>
        ) : null}

        {data ? <WeatherCard data={data} units={units} /> : null}

        {!data && !loading ? (
          <Text accessibilityRole="summary" style={{ marginTop: 16, textAlign: 'center' }}>
            Search for a city or use GPS to view current weather.
          </Text>
        ) : null}
      </ScrollView>

      <Snackbar visible={!!(error || locError)} onDismiss={() => { setError(null); }} duration={4000}>
        {error || locError}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  controlsRow: { marginTop: 12, gap: 12 },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  gpsBtn: { marginTop: 12 },
});
