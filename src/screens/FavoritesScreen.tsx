import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Appbar, Text, ActivityIndicator, FAB, Snackbar, SegmentedButtons } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../contexts/FavoritesContext';
import { FavoriteWeatherCard } from '../components/FavoriteWeatherCard';

export function FavoritesScreen() {
  const { favorites, favoriteWeatherData, refreshFavorites, loading, error } = useFavorites();
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [refreshing, setRefreshing] = useState(false);

  // Load weather data for favorites when component mounts or units change
  useEffect(() => {
    if (favorites.length > 0) {
      refreshFavorites(units);
    }
  }, [favorites.length, units, refreshFavorites]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFavorites(units);
    setRefreshing(false);
  };

  const handleRefreshAll = async () => {
    await refreshFavorites(units);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0ea5e9", "#22d3ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBg}
      >
        <Appbar.Header style={{ backgroundColor: 'transparent', elevation: 0 }}>
          <Appbar.Content title="Favorite Locations" color="#ffffff" />
        </Appbar.Header>
      </LinearGradient>

      <View style={styles.content}>
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

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {loading && favoriteWeatherData.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8 }}>Loading favorites...</Text>
            </View>
          ) : null}

          {favorites.length === 0 ? (
            <View style={styles.emptyBox}>
              <Appbar.Action icon="star-outline" color="#94a3b8" />
              <Text style={styles.emptyText}>
                No favorite locations yet. Add some from the Home tab!
              </Text>
            </View>
          ) : null}

          {favoriteWeatherData.map((favoriteData) => (
            <FavoriteWeatherCard
              key={favoriteData.id}
              data={favoriteData}
              units={units}
            />
          ))}
        </ScrollView>
      </View>

      {favorites.length > 0 && (
        <FAB
          icon={loading ? 'progress-clock' : 'refresh'}
          onPress={handleRefreshAll}
          style={styles.fab}
          loading={loading}
          accessibilityLabel="Refresh all favorites"
        />
      )}

      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        duration={4000}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  headerBg: { 
    paddingBottom: 8 
  },
  content: { 
    flex: 1 
  },
  controlsRow: { 
    marginTop: 12, 
    paddingHorizontal: 16,
    gap: 12 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 16,
    paddingTop: 8 
  },
  center: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 24 
  },
  emptyBox: { 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 24 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#64748b' 
  },
  fab: { 
    position: 'absolute', 
    right: 16, 
    bottom: 24, 
    backgroundColor: '#0ea5e9' 
  },
});
