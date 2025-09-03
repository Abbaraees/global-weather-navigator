import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, SegmentedButtons, Text, ActivityIndicator, Snackbar, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
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
        </View>

        {loading ? (
          <View style={styles.center}> 
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading…</Text>
          </View>
        ) : null}

        {data ? <WeatherCard data={data} units={units} /> : null}

        {!data && !loading ? (
          <View style={styles.emptyBox}>
            <Appbar.Action icon="weather-partly-cloudy" color="#94a3b8" />
            <Text accessibilityRole="summary" style={{ textAlign: 'center', color: '#64748b' }}>
              Search for a city or tap the GPS button to view your current weather.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Snackbar visible={!!(error || locError)} onDismiss={() => { setError(null); }} duration={4000}>
        {error || locError}
      </Snackbar>

      <FAB
        icon={locLoading ? 'progress-clock' : 'crosshairs-gps'}
        onPress={fetchByGps}
        style={styles.fab}
        loading={locLoading}
        accessibilityLabel="Use current location"
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
