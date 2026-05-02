import React from "react";
import { useSelector } from "react-redux";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from "recharts";
import Header from "../components/Header.jsx";
import WeatherWidget from "../components/WeatherWidget.jsx";
import { wmoCodeToCondition } from "../utils/helpers.js";

export default function WeatherPage() {
  const { daily, hourly, location, status } = useSelector(s => s.weather);

  const forecastData = daily ? daily.time.map((date, i) => ({
    day: new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    max: daily.temperature_2m_max[i],
    min: daily.temperature_2m_min[i],
    rain: daily.precipitation_sum[i],
    rainProb: daily.precipitation_probability_max[i],
    wind: daily.windspeed_10m_max[i],
    sun: Math.round((daily.sunshine_duration?.[i] || 0) / 3600),
    et0: daily.et0_fao_evapotranspiration?.[i]?.toFixed(1) || 0,
  })) : [];

  const soilData = hourly ? hourly.time.slice(0, 24).map((t, i) => ({
    hour: new Date(t).getHours() + ":00",
    soilTemp: hourly.soil_temperature_0cm?.[i],
    soilMoisture: hourly.soil_moisture_0_to_1cm?.[i]?.toFixed(3),
    humidity: hourly.relativehumidity_2m?.[i],
  })) : [];

  return (
    <div className="fade-in">
      <Header title="Weather & Forecast" subtitle="14-day forecast with soil data for smart crop planning" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <WeatherWidget />

        {/* Agro weather summary */}
        {daily && (
          <div className="card lg:col-span-2">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">14-Day Agronomic Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "🌡️", label: "Avg Max Temp", value: `${(daily.temperature_2m_max.reduce((a,b)=>a+b,0)/daily.temperature_2m_max.length).toFixed(1)}°C` },
                { icon: "🌧️", label: "Total Rainfall", value: `${daily.precipitation_sum.reduce((a,b)=>a+b,0).toFixed(1)} mm` },
                { icon: "💨", label: "Max Wind", value: `${Math.max(...daily.windspeed_10m_max)} km/h` },
                { icon: "💧", label: "Total ET₀", value: `${(daily.et0_fao_evapotranspiration || []).reduce((a,b)=>a+b,0).toFixed(1)} mm` },
              ].map(s => (
                <div key={s.label} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-200">{s.value}</p>
                  <p className="text-xs text-stone-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 14-day forecast cards */}
      {forecastData.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">14-Day Daily Forecast</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {forecastData.map((d, i) => (
              <div key={i} className="flex-shrink-0 w-24 bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-stone-500 mb-2">{d.day}</p>
                <p className="text-xl mb-1">
                  {d.rainProb > 60 ? "🌧️" : d.rainProb > 30 ? "🌦️" : d.max > 35 ? "☀️" : "⛅"}
                </p>
                <p className="text-sm font-bold text-soil-600 dark:text-soil-400">{d.max}°</p>
                <p className="text-xs text-leaf-600 dark:text-leaf-400">{d.min}°</p>
                <p className="text-xs text-stone-400 mt-1">{d.rain}mm</p>
                <div className="mt-1 bg-stone-200 dark:bg-stone-600 rounded-full h-1">
                  <div className="bg-sky-400 h-1 rounded-full" style={{ width: `${d.rainProb}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temperature + Rain combo chart */}
      {forecastData.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Temperature & Rainfall Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={forecastData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="temp" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
              <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="mm" />
              <Tooltip />
              <Bar yAxisId="rain" dataKey="rain" fill="#93c5fd" radius={[3, 3, 0, 0]} opacity={0.7} name="Rain (mm)" />
              <Line yAxisId="temp" type="monotone" dataKey="max" stroke="#e08b3a" strokeWidth={2} dot={false} name="Max °C" />
              <Line yAxisId="temp" type="monotone" dataKey="min" stroke="#22c528" strokeWidth={2} dot={false} name="Min °C" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Soil data */}
      {soilData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Today's Soil Temperature</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={soilData}>
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="°" />
                <Tooltip formatter={v => [`${v}°C`, "Soil Temp"]} />
                <Area type="monotone" dataKey="soilTemp" stroke="#c05718" fill="#f9e9d4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Today's Relative Humidity</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={soilData}>
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip formatter={v => [`${v}%`, "Humidity"]} />
                <Area type="monotone" dataKey="humidity" stroke="#38bdf8" fill="#e0f2fe" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!daily && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🌤️</p>
          <p className="text-stone-400">Search a city above to load weather data</p>
        </div>
      )}
    </div>
  );
}
