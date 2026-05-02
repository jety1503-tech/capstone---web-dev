import { createSlice } from "@reduxjs/toolkit";

const saved = () => { try { return JSON.parse(localStorage.getItem("fieldJournal") || "[]"); } catch { return []; } };

const journalSlice = createSlice({
  name: "journal",
  initialState: { entries: saved(), filter: "All" },
  reducers: {
    addEntry(state, { payload }) {
      const entry = { id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
      state.entries.unshift(entry);
      localStorage.setItem("fieldJournal", JSON.stringify(state.entries));
    },
    deleteEntry(state, { payload }) {
      state.entries = state.entries.filter(e => e.id !== payload);
      localStorage.setItem("fieldJournal", JSON.stringify(state.entries));
    },
    updateEntry(state, { payload }) {
      const idx = state.entries.findIndex(e => e.id === payload.id);
      if (idx !== -1) { state.entries[idx] = { ...state.entries[idx], ...payload }; }
      localStorage.setItem("fieldJournal", JSON.stringify(state.entries));
    },
    setFilter(state, { payload }) { state.filter = payload; },
  },
});

export const { addEntry, deleteEntry, updateEntry, setFilter } = journalSlice.actions;
export default journalSlice.reducer;
