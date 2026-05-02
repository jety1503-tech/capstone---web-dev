import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import WeatherWidget from "../components/WeatherWidget.jsx";
import { computeSuitability, suitabilityLabel } from "../utils/helpers.js";
import { CROP_DB } from "../store/cropSlice.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SEASON_FILTER = ["All", "Kharif", "Rabi", "Annual"];

export default function Advisor() {
  const daily = useSelector(s => s.weather.daily);
  const location = useSelector(s => s.weather.location);
  const navigate = useNavigate();
  const [seasonF, setSeasonF] = useState("All");

  const ranked = useMemo(() => {
    let list = CROP_DB;
    if (seasonF !== "All") list = list.filter(c => c.season.includes(seasonF));
    return list
      .map(c => ({ ...c, score: computeSuitability(c, daily) }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [daily, seasonF]);

  const chartData = ranked.slice(0, 8).map(c => ({ name: c.name, score: c.score || 0, emoji: c.emoji }));

  const getBarColor = (score) => {
    if (score >= 80) return "#22c528";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="fade-in">
      <Header title="Crop Advisor" subtitle="AI-ranked crop suitability based on real weather data" />

      {!daily ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
          <div className="lg:col-span-2 card flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-4xl mb-4">🧠</p>
              <p className="text-stone-600 dark:text-stone-300 font-medium mb-2">Set your location first</p>
              <p className="text-stone-400 text-sm">The advisor analyzes live weather data to rank crops for your area</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-sm text-stone-500">Filter by Season:</span>
            {SEASON_FILTER.map(s => (
              <button key={s}
                onClick={() => setSeasonF(s)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${seasonF === s ? "bg-leaf-600 text-white" : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600"}`}>
                {s}
              </button>
            ))}
            <span className="ml-auto text-xs text-stone-400">📍 {location?.name}</span>
          </div>

          {/* Chart */}
          <div className="card mb-6">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Top 8 Crops by Suitability Score</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={v => [`${v}%`, "Suitability"]} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Full ranked list */}
          <div className="card">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Complete Ranking ({ranked.length} crops)</h2>
            <div className="space-y-2">
              {ranked.map((crop, i) => {
                const suit = suitabilityLabel(crop.score);
                return (
                  <div key={crop.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/50 cursor-pointer transition"
                    onClick={() => navigate(`/crops/${crop.id}`)}>
                    <span className="text-sm font-bold text-stone-400 w-6 text-right">{i + 1}</span>
                    <span className="text-2xl">{crop.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-700 dark:text-stone-200 text-sm">{crop.name}</p>
                      <p className="text-xs text-stone-400">{crop.category} • {crop.season}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-stone-200 dark:bg-stone-600 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${crop.score}%`, backgroundColor: getBarColor(crop.score) }} />
                      </div>
                      <span className={`badge ${suit.bg} ${suit.color} w-16 justify-center text-xs`}>{crop.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-stone-400 text-center mt-4">
            Suitability is calculated from 14-day temperature and rainfall data vs. each crop's agronomic requirements.
          </p>
        </>
      )}
    </div>
  );
}
