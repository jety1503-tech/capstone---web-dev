import React from "react";
import { useSelector } from "react-redux";
import { getSeason } from "../utils/helpers.js";

export default function Header({ title, subtitle }) {
  const location = useSelector(s => s.weather.location);
  const season = getSeason();

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{title}</h1>
        {subtitle && <p className="text-stone-500 dark:text-stone-400 mt-0.5 text-sm">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="badge bg-leaf-100 dark:bg-leaf-900/40 text-leaf-700 dark:text-leaf-400 text-sm px-3 py-1">
          <span>🌿</span> {season} Season
        </div>
        {location && (
          <div className="badge bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 text-sm px-3 py-1">
            <span>📍</span> {location.name}, {location.country}
          </div>
        )}
      </div>
    </header>
  );
}
