import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addEntry, deleteEntry, updateEntry, setFilter } from "../store/journalSlice.js";
import { CROP_DB } from "../store/cropSlice.js";
import Header from "../components/Header.jsx";
import toast from "react-hot-toast";

const TYPES = ["observation", "activity", "treatment", "harvest", "note"];
const TYPE_META = {
  observation: { icon: "👁️", label: "Observation", color: "bg-sky-100 text-sky-700" },
  activity:    { icon: "⚒️", label: "Activity",    color: "bg-amber-100 text-amber-700" },
  treatment:   { icon: "💊", label: "Treatment",   color: "bg-red-100 text-red-700" },
  harvest:     { icon: "🌾", label: "Harvest",     color: "bg-leaf-100 text-leaf-700" },
  note:        { icon: "📝", label: "Note",        color: "bg-stone-100 text-stone-700" },
};

function EntryForm({ onClose, editing = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: editing?.title || "",
    type: editing?.type || "observation",
    cropName: editing?.cropName || "",
    description: editing?.description || "",
    date: editing?.date || new Date().toISOString().split("T")[0],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error("Please add a title"); return; }
    if (editing) {
      dispatch(updateEntry({ id: editing.id, ...form }));
      toast.success("Entry updated");
    } else {
      dispatch(addEntry(form));
      toast.success("Journal entry saved! 📓");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-800 dark:text-stone-100">{editing ? "Edit Entry" : "New Journal Entry"}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Title *</label>
            <input className="input" placeholder="e.g., Spotted aphids on wheat field" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Type</label>
              <select className="select" value={form.type} onChange={e => set("type", e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Related Crop (optional)</label>
            <select className="select" value={form.cropName} onChange={e => set("cropName", e.target.value)}>
              <option value="">-- None --</option>
              {CROP_DB.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Description</label>
            <textarea rows={4} className="input resize-none" placeholder="Describe what you observed, did, or noted..."
              value={form.description} onChange={e => set("description", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="btn-primary flex-1" onClick={handleSubmit}>{editing ? "Update" : "Save Entry"}</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const dispatch = useDispatch();
  const { entries, filter } = useSelector(s => s.journal);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const filtered = filter === "All" ? entries : entries.filter(e => e.type === filter);

  const handleDelete = (id) => {
    if (confirm("Delete this entry?")) {
      dispatch(deleteEntry(id));
      toast.success("Entry deleted");
    }
  };

  return (
    <div className="fade-in">
      <Header title="Field Journal" subtitle="Log daily observations, activities, and treatments" />

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-3 mb-6">
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Entry</button>
        <div className="flex gap-2 flex-wrap">
          {["All", ...TYPES].map(t => (
            <button key={t}
              onClick={() => dispatch(setFilter(t))}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${filter === t ? "bg-leaf-600 text-white" : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200"}`}>
              {t === "All" ? "All" : `${TYPE_META[t].icon} ${TYPE_META[t].label}`}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-stone-400">{filtered.length} entries</span>
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4">📓</p>
          <p className="text-stone-600 dark:text-stone-300 font-medium mb-2">No entries yet</p>
          <p className="text-stone-400 text-sm mb-6">Start logging your field observations and activities</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Add First Entry</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const meta = TYPE_META[entry.type] || TYPE_META.note;
            return (
              <div key={entry.id} className="card fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-stone-800 dark:text-stone-100">{entry.title}</h3>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => setEditEntry(entry)} className="text-stone-400 hover:text-leaf-600 transition text-sm">✏️</button>
                        <button onClick={() => handleDelete(entry.id)} className="text-stone-400 hover:text-red-500 transition text-sm">🗑️</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`badge ${meta.color} text-xs`}>{meta.label}</span>
                      {entry.cropName && <span className="badge bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs">🌱 {entry.cropName}</span>}
                      <span className="text-xs text-stone-400">{entry.date || new Date(entry.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{entry.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <EntryForm onClose={() => setShowForm(false)} />}
      {editEntry && <EntryForm editing={editEntry} onClose={() => setEditEntry(null)} />}
    </div>
  );
}
