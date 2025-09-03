import React, { useMemo, useState } from 'react';
import { View, Image, AccessibilityRole } from 'react-native';
import { Card, Text, IconButton, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { FavoriteWeatherData } from '../types/favorites';
import { useFavorites } from '../contexts/FavoritesContext';

type Props = {
  data: FavoriteWeatherData;
  units: 'metric' | 'imperial';
};

export function FavoriteWeatherCard({ data, units }: Props) {
  const { removeFavorite } = useFavorites();
  const [showDetails, setShowDetails] = useState(false);
  
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
    <Card style={{ marginBottom: 12, elevation: 3, borderRadius: 12 }}>
      {/* Main Weather Display */}
      <LinearGradient
        colors={["#0ea5e9", "#22d3ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          padding: 20, 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12 
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Location and Temperature */}
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text variant="titleLarge" style={{ color: 'white', fontWeight: '600', marginBottom: 4 }}>
              {data.weather.name}
            </Text>
            <Text variant="displaySmall" style={{ color: 'white', fontWeight: '300', lineHeight: 45 }}>
              {Math.round(data.weather.main.temp)}°
            </Text>
            <Text variant="titleMedium" style={{ color: 'white', opacity: 0.9, textTransform: 'capitalize' }}>
              {data.weather.weather?.[0]?.description || ''}
            </Text>
            <Text style={{ color: 'white', opacity: 0.7, fontSize: 12, marginTop: 6 }}>
              Updated {formatLastUpdated(data.lastUpdated)}
            </Text>
          </View>
          
          {/* Weather Icon and Remove Button */}
          <View style={{ alignItems: 'center' }}>
            {iconUrl && (
              <Image 
                accessibilityRole={"image" as AccessibilityRole} 
                source={{ uri: iconUrl }} 
                style={{ width: 64, height: 64, marginBottom: 8 }} 
              />
            )}
            <IconButton
              icon="star"
              iconColor="white"
              size={20}
              onPress={handleRemoveFavorite}
              accessibilityLabel="Remove from favorites"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            />
          </View>
        </View>
      </LinearGradient>
      
      {/* Quick Stats Row */}
      <View style={{ 
        padding: 16, 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        backgroundColor: 'white'
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Humidity</Text>
          <Text variant="titleSmall" style={{ fontWeight: '600' }}>{data.weather.main.humidity}%</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Wind</Text>
          <Text variant="titleSmall" style={{ fontWeight: '600' }}>{data.weather.wind.speed} {windUnit}</Text>
        </View>
        {data.weather.main.feels_like && (
          <View style={{ alignItems: 'center' }}>
            <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Feels like</Text>
            <Text variant="titleSmall" style={{ fontWeight: '600' }}>{Math.round(data.weather.main.feels_like)}°</Text>
          </View>
        )}
        <View style={{ alignItems: 'center' }}>
          <IconButton
            icon={showDetails ? 'chevron-up' : 'chevron-down'}
            size={16}
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
          <View style={{ padding: 16, backgroundColor: '#f8fafc' }}>
            <Text variant="titleSmall" style={{ marginBottom: 8, fontWeight: '600', color: '#374151' }}>
              Sun Times
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {data.weather.sys?.sunrise && (
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Sunrise</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {timeFmt.format(new Date(data.weather.sys.sunrise * 1000))}
                  </Text>
                </View>
              )}
              {data.weather.sys?.sunset && (
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodySmall" style={{ color: '#64748b', marginBottom: 2 }}>Sunset</Text>
                  <Text variant="bodyMedium" style={{ fontWeight: '500' }}>
                    {timeFmt.format(new Date(data.weather.sys.sunset * 1000))}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </Card>
  );
}
