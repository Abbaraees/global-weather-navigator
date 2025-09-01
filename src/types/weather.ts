export type Coordinates = {
  lat: number;
  lon: number;
};

export type CurrentWeather = {
  name: string;
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
