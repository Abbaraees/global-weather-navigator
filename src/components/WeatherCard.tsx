import React, { useMemo, useState } from 'react';
import { View, Image, AccessibilityRole } from 'react-native';
import { Card, Text, IconButton, Divider } from 'react-native-paper';
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
  const [showDetails, setShowDetails] = useState(false);
  
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
    <Card style={{ marginTop: 16, elevation: 4, borderRadius: 16 }}>
      {/* Main Weather Display */}
      <LinearGradient
        colors={["#0ea5e9", "#22d3ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          padding: 24, 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16 
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Location and Temperature */}
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text variant="headlineSmall" style={{ color: 'white', fontWeight: '600', marginBottom: 4 }}>
              {data.name}
            </Text>
            <Text variant="displayLarge" style={{ color: 'white', fontWeight: '300', lineHeight: 60 }}>
              {Math.round(data.main.temp)}°
            </Text>
            <Text variant="titleMedium" style={{ color: 'white', opacity: 0.9, textTransform: 'capitalize' }}>
              {data.weather?.[0]?.description || ''}
            </Text>
            {data.main.feels_like && (
              <Text variant="bodyMedium" style={{ color: 'white', opacity: 0.8, marginTop: 4 }}>
                Feels like {Math.round(data.main.feels_like)}{tempUnit}
              </Text>
            )}
          </View>

          {/* Weather Icon and Favorite Button */}
          <View style={{ alignItems: 'center' }}>
            {iconUrl && (
              <Image 
                accessibilityRole={"image" as AccessibilityRole} 
                source={{ uri: iconUrl }} 
                style={{ width: 80, height: 80, marginBottom: 8 }} 
              />
            )}
            <IconButton
              icon={isLocationFavorite ? 'star' : 'star-outline'}
              iconColor="white"
              size={24}
              onPress={handleToggleFavorite}
              accessibilityLabel={isLocationFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats Row */}
      <View style={{ 
        padding: 20, 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        backgroundColor: 'white'
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Humidity</Text>
          <Text variant="titleMedium" style={{ fontWeight: '600' }}>{data.main.humidity}%</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Wind</Text>
          <Text variant="titleMedium" style={{ fontWeight: '600' }}>{data.wind.speed} {windUnit}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <IconButton
            icon={showDetails ? 'chevron-up' : 'chevron-down'}
            size={20}
            onPress={() => setShowDetails(!showDetails)}
            accessibilityLabel={showDetails ? 'Hide details' : 'Show details'}
            style={{ margin: 0 }}
          />
        </View>
      </View>

      {/* Expandable Details Section */}
      {showDetails && (
        <>
          <Divider />
          <View style={{ padding: 20, backgroundColor: '#f8fafc' }}>
            <Text variant="titleSmall" style={{ marginBottom: 12, fontWeight: '600', color: '#374151' }}>
              Additional Details
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              {sunrise && (
                <View style={{ alignItems: 'center', minWidth: '45%' }}>
                  <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Sunrise</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{timeFmt.format(sunrise)}</Text>
                </View>
              )}
              {sunset && (
                <View style={{ alignItems: 'center', minWidth: '45%' }}>
                  <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Sunset</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{timeFmt.format(sunset)}</Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </Card>
  );
}
