import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./weatherSlice.js";
import cropReducer from "./cropSlice.js";
import uiReducer from "./uiSlice.js";
import journalReducer from "./journalSlice.js";

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crops: cropReducer,
    ui: uiReducer,
    journal: journalReducer,
  },
});
