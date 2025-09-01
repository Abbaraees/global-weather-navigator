import Constants from 'expo-constants';
import type { Coordinates, CurrentWeather } from '../types/weather';

const API_BASE = 'https://api.openweathermap.org/data/2.5';
const API_KEY = Constants?.expoConfig?.extra?.openWeatherApiKey || Constants?.manifest?.extra?.openWeatherApiKey;

function buildUrl(path: string, params: Record<string, string | number>) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  url.searchParams.set('appid', String(API_KEY));
  return url.toString();
}

export async function getCurrentWeatherByCity(city: string, units: 'metric' | 'imperial' = 'metric'): Promise<CurrentWeather> {
  if (!API_KEY) throw new Error('Missing OpenWeather API key. Set OPEN_WEATHER_API_KEY in .env');
  const url = buildUrl('/weather', { q: city, units });
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch weather: ${res.status} ${msg}`);
  }
  return (await res.json()) as CurrentWeather;
}

export async function getCurrentWeatherByCoords(coords: Coordinates, units: 'metric' | 'imperial' = 'metric'): Promise<CurrentWeather> {
  if (!API_KEY) throw new Error('Missing OpenWeather API key. Set OPEN_WEATHER_API_KEY in .env');
  const url = buildUrl('/weather', { lat: coords.lat, lon: coords.lon, units });
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to fetch weather: ${res.status} ${msg}`);
  }
  return (await res.json()) as CurrentWeather;
}
