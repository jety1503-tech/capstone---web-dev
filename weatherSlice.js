import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Uses Open-Meteo (free, no API key needed) + Open-Meteo geocoding
export const fetchCoords = createAsyncThunk("weather/fetchCoords", async (city, { rejectWithValue }) => {
  try {
    const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geo.data.results?.length) throw new Error("City not found");
    const { latitude, longitude, name, country } = geo.data.results[0];
    return { latitude, longitude, name, country };
  } catch (e) {
    return rejectWithValue(e.message || "Geocoding failed");
  }
});

export const fetchWeather = createAsyncThunk("weather/fetchWeather", async ({ latitude, longitude }, { rejectWithValue }) => {
  try {
    const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,et0_fao_evapotranspiration,sunshine_duration,precipitation_probability_max",
        hourly: "soil_temperature_0cm,soil_moisture_0_to_1cm,relativehumidity_2m",
        current_weather: true,
        forecast_days: 14,
        timezone: "auto",
      },
    });
    return res.data;
  } catch (e) {
    return rejectWithValue("Weather fetch failed");
  }
});

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    location: null,
    current: null,
    daily: null,
    hourly: null,
    status: "idle",   // idle | loading | success | error
    error: null,
    city: "",
  },
  reducers: {
    setCity(state, { payload }) { state.city = payload; },
    clearWeather(state) { state.location = null; state.current = null; state.daily = null; state.status = "idle"; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoords.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchCoords.fulfilled, (state, { payload }) => { state.location = payload; })
      .addCase(fetchCoords.rejected, (state, { payload }) => { state.status = "error"; state.error = payload; })
      .addCase(fetchWeather.pending, (state) => { state.status = "loading"; })
      .addCase(fetchWeather.fulfilled, (state, { payload }) => {
        state.status = "success";
        state.current = payload.current_weather;
        state.daily = payload.daily;
        state.hourly = payload.hourly;
      })
      .addCase(fetchWeather.rejected, (state, { payload }) => { state.status = "error"; state.error = payload; });
  },
});

export const { setCity, clearWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
