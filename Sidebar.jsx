import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleDark } from "../store/uiSlice.js";

const NAV = [
  { to: "/", icon: "🏠", label: "Dashboard" },
  { to: "/crops", icon: "🌱", label: "Crop Explorer" },
  { to: "/weather", icon: "🌤️", label: "Weather" },
  { to: "/my-farm", icon: "🚜", label: "My Farm" },
  { to: "/advisor", icon: "🧠", label: "Crop Advisor" },
  { to: "/journal", icon: "📓", label: "Field Journal" },
  { to: "/calculator", icon: "🧮", label: "NPK Calculator" },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const darkMode = useSelector(s => s.ui.darkMode);

  return (
    <aside className="h-screen w-64 flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-100 dark:border-stone-800">
        <span className="text-3xl">🌾</span>
        <div>
          <p className="font-bold text-stone-800 dark:text-stone-100 text-lg leading-none">AgroAdvisor</p>
          <p className="text-xs text-stone-400 mt-0.5">Smart Crop Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-leaf-50 dark:bg-leaf-900/30 text-leaf-700 dark:text-leaf-400"
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div className="px-4 py-4 border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={() => dispatch(toggleDark())}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
        >
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>
          <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
        </button>
        <p className="text-center text-xs text-stone-400 mt-3">v1.0 • Agriculture Domain</p>
      </div>
    </aside>
  );
}
