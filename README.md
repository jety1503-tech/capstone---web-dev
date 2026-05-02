# 🌾 AgroAdvisor — Smart Crop Intelligence Platform

A React-based agricultural advisory dashboard that helps farmers make data-driven decisions about crop selection, fertilizer planning, and field management using real-time weather data.

## 🚀 Tech Stack
- **Frontend:** React 18 + Vite
- **State Management:** Redux Toolkit + Context
- **Routing:** React Router v6 (with lazy loading)
- **API:** Open-Meteo (free, no API key needed)
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **Notifications:** react-hot-toast

## 📦 Setup & Run

```bash
cd agro-advisor
npm install
npm run dev
```

Open http://localhost:5173

## 🌟 Features

| Feature | Details |
|---|---|
| Dashboard | Live weather stats, top crop rankings, journal feed |
| Crop Explorer | 9 crops with search, filter, sort, pagination |
| Crop Detail | Full agronomic data, radar chart, growth stages, pests/diseases |
| Weather Page | 14-day forecast charts, soil temp & humidity from Open-Meteo |
| Crop Advisor | AI-ranked suitability scores using live weather vs crop requirements |
| My Farm | CRUD — add crops, set sow dates, track harvest progress |
| Field Journal | Full CRUD diary with type filters (observation/activity/treatment/harvest) |
| NPK Calculator | Fertilizer quantity calculator with recommendations |
| Dark Mode | Full dark/light mode with localStorage persistence |
| Error Boundary | Graceful error handling across all pages |
| Lazy Loading | All pages are code-split for performance |
| Debounced Search | 350ms debounce on crop search input |

## 🌐 API Used
**Open-Meteo** (https://open-meteo.com/) — Free weather API, no registration required.
- Geocoding: city name → lat/lon
- 14-day forecast: temperature, rainfall, wind, ET₀, sunshine, soil temp, humidity

## 📁 Project Structure
```
src/
├── components/     # Sidebar, Header, CropCard, WeatherWidget, ErrorBoundary, Skeleton
├── pages/          # Dashboard, CropExplorer, CropDetail, WeatherPage, MyFarm, Advisor, Journal, Calculator
├── store/          # Redux slices: weather, crops, journal, ui
├── hooks/          # useDebounce, useWeatherFetch, useInfiniteScroll, useLocalState
├── utils/          # helpers: suitability calc, weather codes, formatters
└── index.css       # Tailwind + custom components
```

## 🏗️ Deployment
```bash
npm run build
# Deploy /dist to Vercel or Netlify
```

## Domain
**Agriculture** — Unique domain with real public API, custom feature set including suitability scoring algorithm, fertilizer planning engine, and farmer's field journal.
