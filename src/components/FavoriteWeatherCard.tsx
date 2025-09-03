import React, { useMemo } from 'react';
import { View, Image, AccessibilityRole } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { FavoriteWeatherData } from '../types/favorites';
import { useFavorites } from '../contexts/FavoritesContext';

type Props = {
  data: FavoriteWeatherData;
  units: 'metric' | 'imperial';
};

export function FavoriteWeatherCard({ data, units }: Props) {
  const { removeFavorite } = useFavorites();
  const icon = data.weather.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : undefined;
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  }), []);

  const handleRemoveFavorite = () => {
    removeFavorite(data.id);
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <LinearGradient
        colors={["#0ea5e9", "#22d3ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ color: 'white' }}>
              {data.weather.name}
            </Text>
            <Text variant="displaySmall" style={{ color: 'white', fontWeight: '700' }}>
              {Math.round(data.weather.main.temp)}{tempUnit}
            </Text>
            <Text style={{ color: 'white', opacity: 0.9 }}>
              {data.weather.weather?.[0]?.description || ''}
            </Text>
            <Text style={{ color: 'white', opacity: 0.7, fontSize: 12, marginTop: 4 }}>
              Updated {formatLastUpdated(data.lastUpdated)}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            {iconUrl ? (
              <Image 
                accessibilityRole={"image" as AccessibilityRole} 
                source={{ uri: iconUrl }} 
                style={{ width: 64, height: 64 }} 
              />
            ) : null}
            <IconButton
              icon="star"
              iconColor="white"
              size={20}
              onPress={handleRemoveFavorite}
              accessibilityLabel="Remove from favorites"
              style={{ marginTop: -8 }}
            />
          </View>
        </View>
      </LinearGradient>
      
      <Card.Content>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Chip icon="water">Humidity: {data.weather.main.humidity}%</Chip>
          <Chip icon="weather-windy">Wind: {data.weather.wind.speed} {windUnit}</Chip>
          {data.weather.main.feels_like != null && (
            <Chip icon="thermometer">
              Feels like: {Math.round(data.weather.main.feels_like)}{tempUnit}
            </Chip>
          )}
          {data.weather.sys?.sunrise && (
            <Chip icon="weather-sunset-up">
              Sunrise: {timeFmt.format(new Date(data.weather.sys.sunrise * 1000))}
            </Chip>
          )}
          {data.weather.sys?.sunset && (
            <Chip icon="weather-sunset-down">
              Sunset: {timeFmt.format(new Date(data.weather.sys.sunset * 1000))}
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
