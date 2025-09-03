import Constants from 'expo-constants';
import type { Coordinates, CurrentWeather, LocationSuggestion } from '../types/weather';

const API_BASE = 'https://api.openweathermap.org/data/2.5';
const GEO_API_BASE = 'https://api.openweathermap.org/geo/1.0';
const API_KEY = Constants?.expoConfig?.extra?.openWeatherApiKey || Constants?.manifest?.extra?.openWeatherApiKey;

function buildUrl(path: string, params: Record<string, string | number>, useGeoApi = false) {
  const baseUrl = useGeoApi ? GEO_API_BASE : API_BASE;
  const url = new URL(baseUrl + path);
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

export async function searchLocations(query: string, limit: number = 5): Promise<LocationSuggestion[]> {
  if (!API_KEY) throw new Error('Missing OpenWeather API key. Set OPEN_WEATHER_API_KEY in .env');
  if (query.trim().length < 2) return [];
  
  const url = buildUrl('/direct', { q: query.trim(), limit }, true);
  const res = await fetch(url);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to search locations: ${res.status} ${msg}`);
  }
  return (await res.json()) as LocationSuggestion[];
}

export async function getCurrentWeatherByLocationSuggestion(location: LocationSuggestion, units: 'metric' | 'imperial' = 'metric'): Promise<CurrentWeather> {
  return getCurrentWeatherByCoords({ lat: location.lat, lon: location.lon }, units);
}
