import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCrop, addToFarm, removeFromFarm } from "../store/cropSlice.js";
import { useNavigate } from "react-router-dom";
import { computeSuitability, suitabilityLabel } from "../utils/helpers.js";

export default function CropCard({ crop, showSuitability = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myFarm = useSelector(s => s.crops.myFarm);
  const daily = useSelector(s => s.weather.daily);
  const inFarm = myFarm.some(c => c.id === crop.id);

  const score = showSuitability ? computeSuitability(crop, daily) : null;
  const suit = suitabilityLabel(score);

  const handleView = () => {
    dispatch(selectCrop(crop));
    navigate(`/crops/${crop.id}`);
  };

  const handleFarm = (e) => {
    e.stopPropagation();
    if (inFarm) dispatch(removeFromFarm(crop.id));
    else dispatch(addToFarm(crop));
  };

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer fade-in group" onClick={handleView}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl">{crop.emoji}</span>
        <div className="flex items-center gap-2">
          {showSuitability && score !== null && (
            <span className={`badge ${suit.bg} ${suit.color}`}>
              {score}% • {suit.label}
            </span>
          )}
          <button
            onClick={handleFarm}
            className={`text-lg transition-transform hover:scale-110 ${inFarm ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}
            title={inFarm ? "Remove from My Farm" : "Add to My Farm"}
          >
            {inFarm ? "🌱" : "➕"}
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-lg">{crop.name}</h3>
      <p className="text-stone-500 dark:text-stone-400 text-xs mb-3">{crop.category} • {crop.season}</p>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-stone-400">Temp Range</span>
          <span className="text-stone-600 dark:text-stone-300 font-medium">{crop.tempMin}–{crop.tempMax}°C</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-stone-400">Duration</span>
          <span className="text-stone-600 dark:text-stone-300 font-medium">{crop.duration}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-stone-400">Water Need</span>
          <span className="text-stone-600 dark:text-stone-300 font-medium">{crop.waterNeed}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-stone-400">Avg Yield</span>
          <span className="text-stone-600 dark:text-stone-300 font-medium">{crop.yield}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
        <p className="text-xs text-stone-400">MSP / Market</p>
        <p className="text-sm font-medium text-leaf-700 dark:text-leaf-400">{crop.marketPrice}</p>
      </div>
    </div>
  );
}
