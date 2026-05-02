import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCity } from "../store/weatherSlice.js";
import { useWeatherFetch, useDebounce } from "../hooks/useCustomHooks.js";
import { wmoCodeToCondition } from "../utils/helpers.js";

export default function WeatherWidget({ compact = false }) {
  const dispatch = useDispatch();
  const { city, current, daily, location, status, error } = useSelector(s => s.weather);
  const [input, setInput] = useState(city);
  const fetchForCity = useWeatherFetch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(setCity(input.trim()));
      fetchForCity(input.trim());
    }
  };

  const condition = current ? wmoCodeToCondition(current.weathercode) : null;

  return (
    <div className="card fade-in">
      <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4 flex items-center gap-2">
        <span>🌤️</span> Weather Lookup
      </h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter city name..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-3">⚠️ {error}</p>}

      {current && location && (
        <div className="space-y-3 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">{current.temperature}°C</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">{condition?.label}</p>
            </div>
            <span className="text-5xl">{condition?.icon}</span>
          </div>

          {!compact && daily && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-stone-700">
              <div className="text-center">
                <p className="text-xs text-stone-400 mb-1">Wind</p>
                <p className="font-medium text-stone-700 dark:text-stone-300 text-sm">{daily.windspeed_10m_max[0]} km/h</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-400 mb-1">Rain</p>
                <p className="font-medium text-stone-700 dark:text-stone-300 text-sm">{daily.precipitation_sum[0]} mm</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-400 mb-1">Rain %</p>
                <p className="font-medium text-stone-700 dark:text-stone-300 text-sm">{daily.precipitation_probability_max[0]}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {status === "idle" && !current && (
        <p className="text-stone-400 text-sm text-center py-4">Search a city to see weather data</p>
      )}
    </div>
  );
}
