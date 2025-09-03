export type Coordinates = {
  lat: number;
  lon: number;
};

export type LocationSuggestion = {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  local_names?: Record<string, string>;
};

export type CurrentWeather = {
  name: string;
  coord?: {
    lat: number;
    lon: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like?: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  sys?: {
    sunrise?: number;
    sunset?: number;
  };
};
