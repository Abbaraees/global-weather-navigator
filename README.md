# Global Weather Navigator

Cross-platform weather app built with Expo (React Native + TypeScript), NativeWind (Tailwind), and React Native Paper. Fetches current weather via OpenWeatherMap and supports GPS-based location.

## Setup

1. Copy `.env.example` to `.env` and set your OpenWeatherMap key:

```
OPEN_WEATHER_API_KEY=YOUR_API_KEY_HERE
```

2. Install dependencies (already installed if scaffolded):
```
npm install
```

3. Start the app:
```
npm run android
# or
npm run web
```

## Features
- Search by city
- Unit toggle (°C/°F)
- GPS location (permission required)
- Error handling with snackbars

## Tech
- Expo SDK 53, React Native 0.79, React 19
- React Native Paper (MD3)
- NativeWind + Tailwind configured
- Expo Location
