import React, { useMemo } from 'react';
import { View, Image, AccessibilityRole } from 'react-native';
import { Card, Text, Chip, Divider, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import type { CurrentWeather } from '../types/weather';
import { useFavorites } from '../contexts/FavoritesContext';
import { FavoriteLocation } from '../types/favorites';

type Props = {
  data: CurrentWeather;
  units: 'metric' | 'imperial';
};

export function WeatherCard({ data, units }: Props) {
  const { addFavorite, removeFavoriteByName, isFavorite } = useFavorites();
  const icon = data.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : undefined;
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';
  const sunrise = data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : undefined;
  const sunset = data.sys?.sunset ? new Date(data.sys.sunset * 1000) : undefined;
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }), []);
  
  const isLocationFavorite = isFavorite(data.name);

  const handleToggleFavorite = () => {
    if (isLocationFavorite) {
      removeFavoriteByName(data.name);
    } else {
      // Add as favorite
      const favorite: FavoriteLocation = {
        id: `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: data.name,
        coordinates: {
          lat: data.coord?.lat || 0,
          lon: data.coord?.lon || 0,
        },
        addedAt: new Date(),
      };
      addFavorite(favorite);
    }
  };

  return (
    <Card className="mt-4 overflow-hidden">
      <LinearGradient
        colors={["#0ea5e9", "#22d3ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="titleLarge" style={{ color: 'white' }}>{data.name}</Text>
          <Text variant="displaySmall" style={{ color: 'white', fontWeight: '700' }}>
            {Math.round(data.main.temp)}{tempUnit}
          </Text>
          <Text style={{ color: 'white', opacity: 0.9 }}>{data.weather?.[0]?.description || ''}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          {iconUrl ? (
            <Image accessibilityRole={"image" as AccessibilityRole} source={{ uri: iconUrl }} style={{ width: 96, height: 96 }} />
          ) : null}
          <IconButton
            icon={isLocationFavorite ? 'star' : 'star-outline'}
            iconColor="white"
            size={24}
            onPress={handleToggleFavorite}
            accessibilityLabel={isLocationFavorite ? 'Remove from favorites' : 'Add to favorites'}
            style={{ marginTop: -8 }}
          />
        </View>
      </LinearGradient>
      <Card.Content>
        <View className="flex-row gap-2 mt-3 flex-wrap">
          <Chip icon="water">Humidity: {data.main.humidity}%</Chip>
          <Chip icon="weather-windy">Wind: {data.wind.speed} {windUnit}</Chip>
          {data.main.feels_like != null && (
            <Chip icon="thermometer">Feels like: {Math.round(data.main.feels_like)}{tempUnit}</Chip>
          )}
          {sunrise && <Chip icon="weather-sunset-up">Sunrise: {timeFmt.format(sunrise)}</Chip>}
          {sunset && <Chip icon="weather-sunset-down">Sunset: {timeFmt.format(sunset)}</Chip>}
        </View>
      </Card.Content>
    </Card>
  );
}
