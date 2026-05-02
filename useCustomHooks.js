import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchCoords, fetchWeather } from "../store/weatherSlice.js";

// Debounced search hook
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Weather fetch hook
export function useWeatherFetch() {
  const dispatch = useDispatch();
  const fetchForCity = useCallback(async (city) => {
    const coordResult = await dispatch(fetchCoords(city));
    if (fetchCoords.fulfilled.match(coordResult)) {
      const { latitude, longitude } = coordResult.payload;
      dispatch(fetchWeather({ latitude, longitude }));
    }
  }, [dispatch]);
  return fetchForCity;
}

// Infinite scroll hook
export function useInfiniteScroll(callback, hasMore) {
  const observer = useRef();
  const lastRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) callback();
    });
    if (node) observer.current.observe(node);
  }, [callback, hasMore]);
  return lastRef;
}

// Local storage state
export function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; }
    catch { return initial; }
  });
  const set = useCallback(v => {
    setState(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [state, set];
}
