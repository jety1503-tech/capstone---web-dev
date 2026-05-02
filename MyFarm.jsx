import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromFarm, updateFarmEntry } from "../store/cropSlice.js";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import toast from "react-hot-toast";

function FarmCard({ entry, onEdit }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = () => {
    dispatch(removeFromFarm(entry.id));
    toast.success(`${entry.name} removed from farm`);
  };

  const sowDate = entry.sowDate ? new Date(entry.sowDate) : null;
  const harvestEstimate = sowDate ? new Date(sowDate.getTime() + parseInt(entry.duration || 120) * 24 * 60 * 60 * 1000) : null;
  const daysLeft = harvestEstimate ? Math.max(0, Math.ceil((harvestEstimate - Date.now()) / 86400000)) : null;
  const progress = sowDate && harvestEstimate
    ? Math.min(100, Math.round(((Date.now() - sowDate.getTime()) / (harvestEstimate.getTime() - sowDate.getTime())) * 100))
    : 0;

  return (
    <div className="card fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{entry.emoji}</span>
          <div>
            <h3 className="font-semibold text-stone-800 dark:text-stone-100">{entry.name}</h3>
            <p className="text-xs text-stone-400">{entry.category} • {entry.season}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(entry)} className="text-stone-400 hover:text-leaf-600 transition text-sm">✏️</button>
          <button onClick={handleRemove} className="text-stone-400 hover:text-red-500 transition text-sm">🗑️</button>
          <button onClick={() => navigate(`/crops/${entry.id}`)} className="text-stone-400 hover:text-sky-500 transition text-sm">🔗</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
          <p className="text-stone-400">Field Size</p>
          <p className="font-medium text-stone-700 dark:text-stone-200">{entry.fieldSize || 1} acre(s)</p>
        </div>
        <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2">
          <p className="text-stone-400">Sow Date</p>
          <p className="font-medium text-stone-700 dark:text-stone-200">{entry.sowDate || "Not set"}</p>
        </div>
        {daysLeft !== null && (
          <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-2 col-span-2">
            <p className="text-stone-400 mb-1">{daysLeft > 0 ? `~${daysLeft} days to harvest` : "Ready to harvest!"}</p>
            <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all ${progress >= 80 ? "bg-soil-500" : "bg-leaf-500"}`}
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {entry.notes && (
        <p className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-700/50 p-2 rounded-lg">📝 {entry.notes}</p>
      )}

      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 text-xs text-stone-400">
        Added {new Date(entry.addedAt).toLocaleDateString("en-IN")}
      </div>
    </div>
  );
}

function EditModal({ entry, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    fieldSize: entry.fieldSize || 1,
    sowDate: entry.sowDate || "",
    notes: entry.notes || "",
  });

  const handleSave = () => {
    dispatch(updateFarmEntry({ id: entry.id, ...form }));
    toast.success("Farm entry updated!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-800 dark:text-stone-100">Edit {entry.name}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Field Size (acres)</label>
            <input type="number" min="0.1" step="0.1" className="input"
              value={form.fieldSize}
              onChange={e => setForm(f => ({ ...f, fieldSize: parseFloat(e.target.value) || 1 }))} />
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Sowing Date</label>
            <input type="date" className="input"
              value={form.sowDate}
              onChange={e => setForm(f => ({ ...f, sowDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Notes</label>
            <textarea rows={3} className="input resize-none"
              placeholder="Field observations, inputs used..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="btn-primary flex-1" onClick={handleSave}>Save</button>
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function MyFarm() {
  const myFarm = useSelector(s => s.crops.myFarm);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const totalAcres = myFarm.reduce((a, c) => a + (c.fieldSize || 1), 0);

  return (
    <div className="fade-in">
      <Header title="My Farm" subtitle="Track your planted crops with progress and notes" />

      {myFarm.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold text-leaf-600">{myFarm.length}</p>
            <p className="text-xs text-stone-400 mt-1">Active Crops</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-soil-600">{totalAcres.toFixed(1)}</p>
            <p className="text-xs text-stone-400 mt-1">Total Acres</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-sky-600">{myFarm.filter(c => c.sowDate).length}</p>
            <p className="text-xs text-stone-400 mt-1">With Sow Dates</p>
          </div>
        </div>
      )}

      {myFarm.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4">🚜</p>
          <p className="text-stone-600 dark:text-stone-300 font-medium mb-2">Your farm is empty</p>
          <p className="text-stone-400 text-sm mb-6">Browse crops and add them to track your farm</p>
          <button className="btn-primary" onClick={() => navigate("/crops")}>Browse Crops →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {myFarm.map(entry => (
            <FarmCard key={entry.id} entry={entry} onEdit={setEditing} />
          ))}
        </div>
      )}

      {editing && <EditModal entry={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
