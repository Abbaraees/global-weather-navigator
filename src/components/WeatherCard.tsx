import React from 'react';
import { View, Image, AccessibilityRole } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import type { CurrentWeather } from '../types/weather';

type Props = {
  data: CurrentWeather;
  units: 'metric' | 'imperial';
};

export function WeatherCard({ data, units }: Props) {
  const icon = data.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : undefined;
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  return (
    <Card className="mt-4">
      <Card.Content>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text variant="titleLarge">{data.name}</Text>
            <Text variant="titleMedium" className="text-primary-600">
              {Math.round(data.main.temp)}{tempUnit}
            </Text>
            <Text>{data.weather?.[0]?.description || ''}</Text>
          </View>
          {iconUrl ? (
            <Image accessibilityRole={"image" as AccessibilityRole} source={{ uri: iconUrl }} style={{ width: 100, height: 100 }} />
          ) : null}
        </View>
        <View className="flex-row gap-2 mt-3 flex-wrap">
          <Chip icon="water">Humidity: {data.main.humidity}%</Chip>
          <Chip icon="weather-windy">Wind: {data.wind.speed} {windUnit}</Chip>
          {data.main.feels_like != null && (
            <Chip icon="thermometer">Feels like: {Math.round(data.main.feels_like)}{tempUnit}</Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
