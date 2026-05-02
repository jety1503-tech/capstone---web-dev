import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("darkMode") === "true";
if (saved) document.documentElement.classList.add("dark");

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode: saved,
    sidebarOpen: true,
    activeTab: "dashboard",
  },
  reducers: {
    toggleDark(state) {
      state.darkMode = !state.darkMode;
      document.documentElement.classList.toggle("dark", state.darkMode);
      localStorage.setItem("darkMode", state.darkMode);
    },
    setSidebar(state, { payload }) { state.sidebarOpen = payload; },
    setTab(state, { payload }) { state.activeTab = payload; },
  },
});

export const { toggleDark, setSidebar, setTab } = uiSlice.actions;
export default uiSlice.reducer;
