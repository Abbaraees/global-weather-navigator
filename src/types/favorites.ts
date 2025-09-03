import { CurrentWeather } from './weather';

export type FavoriteLocation = {
  id: string;
  name: string;
  country?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  addedAt: Date;
};

export type FavoriteWeatherData = FavoriteLocation & {
  weather: CurrentWeather;
  lastUpdated: Date;
};
