import 'dotenv/config';
import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Global Weather Navigator',
  slug: 'global-weather-navigator',
  extra: {
    openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY,
  },
  experiments: {
    typedRoutes: true,
  },
});
