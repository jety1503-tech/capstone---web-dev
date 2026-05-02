import React, { useState, useMemo } from "react";
import { CROP_DB } from "../store/cropSlice.js";
import Header from "../components/Header.jsx";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const FERTILIZERS = [
  { name: "Urea (46% N)",      n: 46, p: 0,  k: 0 },
  { name: "DAP (18-46-0)",     n: 18, p: 46, k: 0 },
  { name: "MOP (0-0-60)",      n: 0,  p: 0,  k: 60 },
  { name: "SSP (0-16-0)",      n: 0,  p: 16, k: 0 },
  { name: "NPK 12-32-16",      n: 12, p: 32, k: 16 },
  { name: "NPK 10-26-26",      n: 10, p: 26, k: 26 },
  { name: "Ammonium Nitrate",  n: 34, p: 0,  k: 0 },
  { name: "Potassium Sulphate",n: 0,  p: 0,  k: 50 },
];

export default function Calculator() {
  const [cropId, setCropId] = useState("");
  const [area, setArea] = useState(1);
  const [unit, setUnit] = useState("acre");
  const [custom, setCustom] = useState({ n: "", p: "", k: "" });

  const selectedCrop = CROP_DB.find(c => c.id === cropId);
  const baseNpk = selectedCrop ? selectedCrop.npk : { n: Number(custom.n)||0, p: Number(custom.p)||0, k: Number(custom.k)||0 };

  const areaInHa = unit === "acre" ? area * 0.4047 : area;

  const required = {
    n: Math.round(baseNpk.n * areaInHa),
    p: Math.round(baseNpk.p * areaInHa),
    k: Math.round(baseNpk.k * areaInHa),
  };

  const recommendations = useMemo(() => {
    if (!required.n && !required.p && !required.k) return [];
    const plan = [];

    // DAP for P
    if (required.p > 0) {
      const dap = FERTILIZERS.find(f => f.name.includes("DAP"));
      const qty = Math.ceil(required.p / dap.p * 100);
      const nFromDap = Math.round(qty * dap.n / 100);
      plan.push({ fertilizer: dap.name, quantity: qty, purpose: `Provides ${required.p} kg/ha P₂O₅ + ${nFromDap} kg/ha N` });
      required.n = Math.max(0, required.n - nFromDap);
    }

    // Urea for remaining N
    if (required.n > 0) {
      const urea = FERTILIZERS.find(f => f.name.includes("Urea"));
      const qty = Math.ceil(required.n / urea.n * 100);
      plan.push({ fertilizer: urea.name, quantity: qty, purpose: `Provides remaining ${required.n} kg/ha N` });
    }

    // MOP for K
    if (required.k > 0) {
      const mop = FERTILIZERS.find(f => f.name.includes("MOP"));
      const qty = Math.ceil(required.k / mop.k * 100);
      plan.push({ fertilizer: mop.name, quantity: qty, purpose: `Provides ${required.k} kg/ha K₂O` });
    }

    return plan;
  }, [baseNpk, areaInHa]);

  const pieData = [
    { name: "Nitrogen (N)", value: baseNpk.n, color: "#22c528" },
    { name: "Phosphorus (P)", value: baseNpk.p, color: "#e08b3a" },
    { name: "Potassium (K)", value: baseNpk.k, color: "#38bdf8" },
  ].filter(d => d.value > 0);

  return (
    <div className="fade-in max-w-4xl">
      <Header title="NPK Calculator" subtitle="Calculate fertilizer requirements for your crop and area" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Input panel */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">1. Select Crop & Area</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Crop</label>
              <select className="select" value={cropId} onChange={e => setCropId(e.target.value)}>
                <option value="">-- Select a crop --</option>
                {CROP_DB.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>

            {!cropId && (
              <div className="border border-dashed border-stone-200 dark:border-stone-600 rounded-xl p-3">
                <p className="text-xs text-stone-400 mb-2">Or enter custom NPK (kg/ha):</p>
                <div className="grid grid-cols-3 gap-2">
                  {["n","p","k"].map(k => (
                    <div key={k}>
                      <label className="text-xs text-stone-400 uppercase">{k}</label>
                      <input type="number" min="0" className="input text-center" placeholder="0"
                        value={custom[k]} onChange={e => setCustom(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Field Area</label>
                <input type="number" min="0.1" step="0.1" className="input" value={area}
                  onChange={e => setArea(parseFloat(e.target.value) || 1)} />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Unit</label>
                <select className="select" value={unit} onChange={e => setUnit(e.target.value)}>
                  <option value="acre">Acres</option>
                  <option value="ha">Hectares</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* NPK donut chart */}
        <div className="card">
          <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">NPK Ratio</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} kg/ha`, n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-stone-400 text-sm">Select a crop to see NPK ratio</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {(baseNpk.n || baseNpk.p || baseNpk.k) > 0 && (
        <>
          <div className="card mb-6">
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">
              2. Required Nutrients for {area} {unit}(s)
              {selectedCrop && <span className="ml-2 text-sm font-normal text-stone-400">({selectedCrop.name})</span>}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Nitrogen (N)", value: required.n, color: "text-leaf-600", bg: "bg-leaf-50 dark:bg-leaf-900/20" },
                { label: "Phosphorus (P₂O₅)", value: required.p, color: "text-soil-600", bg: "bg-soil-50 dark:bg-soil-900/20" },
                { label: "Potassium (K₂O)", value: required.k, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/20" },
              ].map(n => (
                <div key={n.label} className={`${n.bg} rounded-xl p-4 text-center`}>
                  <p className={`text-3xl font-bold ${n.color}`}>{n.value}</p>
                  <p className="text-xs text-stone-500 mt-1">kg needed</p>
                  <p className="text-xs text-stone-400">{n.label}</p>
                </div>
              ))}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-stone-700 dark:text-stone-300 mb-4">3. Fertilizer Plan</h2>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-700/50 rounded-xl">
                    <div>
                      <p className="font-medium text-stone-700 dark:text-stone-200">{rec.fertilizer}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{rec.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-leaf-600">{rec.quantity}</p>
                      <p className="text-xs text-stone-400">kg total</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-4">
                * Recommendations are indicative. Actual doses depend on soil test results, previous crop, and local conditions.
                Always consult your local Krishi Vigyan Kendra (KVK) for soil-specific advice.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
