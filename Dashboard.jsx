import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Header from "../components/Header.jsx";
import WeatherWidget from "../components/WeatherWidget.jsx";
import { computeSuitability, suitabilityLabel, getSeason, wmoCodeToCondition } from "../utils/helpers.js";
import { CROP_DB } from "../store/cropSlice.js";

export default function Dashboard() {
  const { daily, current, location, status } = useSelector(s => s.weather);
  const myFarm = useSelector(s => s.crops.myFarm);
  const entries = useSelector(s => s.journal.entries);

  const season = getSeason();
  const seasonCrops = CROP_DB.filter(c => c.season.includes(season) || c.season === "All seasons");

  const topCrops = useMemo(() => {
    if (!daily) return [];
    return CROP_DB
      .map(c => ({ ...c, score: computeSuitability(c, daily) }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 4);
  }, [daily]);

  const forecastChartData = useMemo(() => {
    if (!daily) return [];
    return daily.time.slice(0, 7).map((date, i) => ({
      day: new Date(date).toLocaleDateString("en-IN", { weekday: "short" }),
      max: daily.temperature_2m_max[i],
      min: daily.temperature_2m_min[i],
      rain: daily.precipitation_sum[i],
    }));
  }, [daily]);

  const condition = current ? wmoCodeToCondition(current.weathercode) : null;

  return (
    <div className="fade-in">
      <Header title="Dashboard" subtitle={`Welcome back • ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`} />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: "🌱", label: "My Farm Crops", value: myFarm.length, sub: "tracked crops", color: "text-leaf-600" },
          { icon: "📓", label: "Journal Entries", value: entries.length, sub: "field notes", color: "text-sky-600" },
          { icon: "🌾", label: "Season Crops", value: seasonCrops.length, sub: `${season} suitable`, color: "text-soil-600" },
          { icon: "🌡️", label: "Current Temp", value: current ? `${current.temperature}°C` : "--", sub: location?.name || "No location set", color: "text-orange-500" },
        ].map(stat => (
          <div key={stat.label} className="card fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-stone-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-stone-400 mt-1">{stat.sub}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 7-day forecast chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300">7-Day Temperature Forecast</h2>
            {location && <span className="text-xs text-stone-400">{location.name}</span>}
          </div>
          {forecastChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={forecastChartData}>
                <defs>
                  <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e08b3a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e08b3a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c528" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c528" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="°" />
                <Tooltip formatter={(v, n) => [`${v}°C`, n === "max" ? "Max Temp" : "Min Temp"]} />
                <Area type="monotone" dataKey="max" stroke="#e08b3a" fill="url(#maxGrad)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="min" stroke="#22c528" fill="url(#minGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center">
              <p className="text-stone-400 text-sm">Search a city in Weather to see forecast</p>
            </div>
          )}
        </div>

        {/* Weather widget */}
        <WeatherWidget compact />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Rain chart */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Rainfall Forecast (7 days)</h2>
          {forecastChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={forecastChartData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="mm" />
                <Tooltip formatter={(v) => [`${v} mm`, "Rainfall"]} />
                <Bar dataKey="rain" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-stone-400 text-sm">No data yet</p>
            </div>
          )}
        </div>

        {/* Top suited crops */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300">Top Suited Crops</h2>
            <Link to="/advisor" className="text-xs text-leaf-600 hover:underline">View all →</Link>
          </div>
          {topCrops.length > 0 ? (
            <div className="space-y-3">
              {topCrops.map(crop => {
                const suit = suitabilityLabel(crop.score);
                return (
                  <div key={crop.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{crop.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{crop.name}</p>
                        <p className="text-xs text-stone-400">{crop.season}</p>
                      </div>
                    </div>
                    <span className={`badge ${suit.bg} ${suit.color}`}>{crop.score}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-stone-400 text-sm text-center py-6">Set your location to see crop suitability</p>
          )}
        </div>
      </div>

      {/* Recent journal */}
      {entries.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300">Recent Journal Entries</h2>
            <Link to="/journal" className="text-xs text-leaf-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {entries.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-700/50">
                <span className="text-lg">{e.type === "observation" ? "👁️" : e.type === "activity" ? "⚒️" : "💊"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate">{e.title}</p>
                  <p className="text-xs text-stone-400">{new Date(e.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="text-xs text-stone-400 whitespace-nowrap">{e.cropName || "General"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
