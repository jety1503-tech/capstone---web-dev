import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToFarm, removeFromFarm, CROP_DB } from "../store/cropSlice.js";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { computeSuitability, suitabilityLabel, npkLabel, getMonthName } from "../utils/helpers.js";
import toast from "react-hot-toast";

export default function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const crop = CROP_DB.find(c => c.id === id);
  const myFarm = useSelector(s => s.crops.myFarm);
  const daily = useSelector(s => s.weather.daily);
  const inFarm = myFarm.some(c => c.id === id);

  if (!crop) return (
    <div className="card text-center py-16">
      <p className="text-4xl mb-3">🌿</p>
      <p className="text-stone-400">Crop not found</p>
      <button className="btn-primary mt-4" onClick={() => navigate("/crops")}>Back to Explorer</button>
    </div>
  );

  const score = computeSuitability(crop, daily);
  const suit = suitabilityLabel(score);

  const radarData = [
    { subject: "Temp Fit", value: score ?? 50 },
    { subject: "Water", value: crop.waterNeed === "Low" ? 30 : crop.waterNeed === "Moderate" ? 60 : 90 },
    { subject: "Yield", value: parseInt(crop.yield) * 10 || 50 },
    { subject: "Market", value: crop.category === "Cash Crop" ? 85 : crop.category === "Cereal" ? 70 : 60 },
    { subject: "Duration", value: 100 - (parseInt(crop.duration) || 100) / 2 },
  ];

  const handleFarm = () => {
    if (inFarm) {
      dispatch(removeFromFarm(crop.id));
      toast.success(`${crop.name} removed from My Farm`);
    } else {
      dispatch(addToFarm(crop));
      toast.success(`${crop.name} added to My Farm! 🌱`);
    }
  };

  return (
    <div className="fade-in max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-sm mb-6 transition">
        ← Back
      </button>

      {/* Hero */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{crop.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">{crop.name}</h1>
              <p className="text-stone-500 mt-1">{crop.category} • {crop.season} • {crop.duration}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {crop.soilTypes.map(s => (
                  <span key={s} className="badge bg-soil-100 text-soil-700 dark:bg-soil-900/40 dark:text-soil-300">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {score !== null && (
              <span className={`badge ${suit.bg} ${suit.color} text-sm px-3 py-1`}>
                Suitability: {score}% ({suit.label})
              </span>
            )}
            <button onClick={handleFarm} className={inFarm ? "btn-secondary" : "btn-primary"}>
              {inFarm ? "✓ In My Farm" : "+ Add to My Farm"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Key stats */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Growing Requirements</h2>
          <div className="space-y-3 text-sm">
            {[
              ["🌡️ Temperature", `${crop.tempMin}–${crop.tempMax}°C (ideal ${crop.tempIdeal}°C)`],
              ["🌧️ Rainfall", `${crop.rainMin}–${crop.rainMax} mm/year`],
              ["💧 Water Need", crop.waterNeed],
              ["🧪 NPK (kg/ha)", npkLabel(crop.npk)],
              ["📅 Sow Months", crop.sowingMonths.map(getMonthName).join(", ")],
              ["🌾 Harvest", crop.harvestMonths.map(getMonthName).join(", ")],
              ["📊 Avg Yield", crop.yield],
              ["💰 Price", crop.marketPrice],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-stone-400">{k}</span>
                <span className="text-stone-700 dark:text-stone-300 font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Crop Profile</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="#22c528" fill="#22c528" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth stages */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">Growth Stages</h2>
          <div className="space-y-2">
            {crop.stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-leaf-100 text-leaf-700" :
                  i === crop.stages.length - 1 ? "bg-soil-100 text-soil-700" :
                  "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                }`}>{i + 1}</div>
                <p className="text-sm text-stone-600 dark:text-stone-300">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tips */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">💡 Agronomic Tips</h2>
          <ul className="space-y-3">
            {crop.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-stone-600 dark:text-stone-300">
                <span className="text-leaf-500 flex-shrink-0">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Diseases */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">🦠 Common Diseases</h2>
          <div className="flex flex-wrap gap-2">
            {crop.diseases.map(d => (
              <span key={d} className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-3 py-1">{d}</span>
            ))}
          </div>
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mt-5 mb-3">🐛 Common Pests</h2>
          <div className="flex flex-wrap gap-2">
            {crop.pests.map(p => (
              <span key={p} className="badge bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm px-3 py-1">{p}</span>
            ))}
          </div>
        </div>

        {/* Market info */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">💰 Market Information</h2>
          <div className="space-y-3">
            <div className="p-4 bg-leaf-50 dark:bg-leaf-900/20 rounded-xl">
              <p className="text-xs text-leaf-600 dark:text-leaf-400 mb-1">Support Price / Market Rate</p>
              <p className="text-lg font-bold text-leaf-700 dark:text-leaf-300">{crop.marketPrice}</p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
              <p className="text-xs text-stone-400 mb-1">Expected Yield</p>
              <p className="font-bold text-stone-700 dark:text-stone-200">{crop.yield}</p>
            </div>
            <p className="text-xs text-stone-400">* MSP = Minimum Support Price set by Government of India. Market prices vary by mandi and season.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
