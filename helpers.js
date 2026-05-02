// Compute crop suitability score (0-100) based on weather data
export function computeSuitability(crop, weatherDaily) {
  if (!weatherDaily) return null;
  const temps = weatherDaily.temperature_2m_max;
  const rains = weatherDaily.precipitation_sum;
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const totalRain = rains.reduce((a, b) => a + b, 0) * 26; // 14-day projection → annual estimate

  let score = 100;

  // Temperature penalty
  if (avgTemp < crop.tempMin) score -= Math.min(40, (crop.tempMin - avgTemp) * 4);
  else if (avgTemp > crop.tempMax) score -= Math.min(40, (avgTemp - crop.tempMax) * 4);
  else {
    const diff = Math.abs(avgTemp - crop.tempIdeal);
    score -= diff * 2;
  }

  // Rainfall penalty
  if (totalRain < crop.rainMin) score -= Math.min(30, ((crop.rainMin - totalRain) / crop.rainMin) * 30);
  else if (totalRain > crop.rainMax) score -= Math.min(20, ((totalRain - crop.rainMax) / crop.rainMax) * 20);

  return Math.max(0, Math.round(score));
}

export function suitabilityLabel(score) {
  if (score === null) return { label: "Unknown", color: "text-stone-400", bg: "bg-stone-100" };
  if (score >= 80) return { label: "Excellent", color: "text-leaf-700", bg: "bg-leaf-100" };
  if (score >= 60) return { label: "Good", color: "text-yellow-700", bg: "bg-yellow-100" };
  if (score >= 40) return { label: "Fair", color: "text-orange-700", bg: "bg-orange-100" };
  return { label: "Poor", color: "text-red-700", bg: "bg-red-100" };
}

export function wmoCodeToCondition(code) {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if (code <= 3) return { label: "Partly cloudy", icon: "⛅" };
  if (code <= 49) return { label: "Foggy", icon: "🌫️" };
  if (code <= 67) return { label: "Rainy", icon: "🌧️" };
  if (code <= 77) return { label: "Snowy", icon: "❄️" };
  if (code <= 82) return { label: "Showers", icon: "🌦️" };
  return { label: "Thunderstorm", icon: "⛈️" };
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function getMonthName(n) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][n - 1] || "";
}

export function npkLabel(npk) {
  return `N:${npk.n} P:${npk.p} K:${npk.k} kg/ha`;
}

export function getSeason() {
  const m = new Date().getMonth() + 1;
  if ([6,7,8,9,10].includes(m)) return "Kharif";
  if ([11,12,1,2,3].includes(m)) return "Rabi";
  return "Zaid";
}
