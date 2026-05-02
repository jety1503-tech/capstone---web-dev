import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSearch, setFilterCategory, setFilterSeason, setSortBy, setPage } from "../store/cropSlice.js";
import { useDebounce } from "../hooks/useCustomHooks.js";
import Header from "../components/Header.jsx";
import CropCard from "../components/CropCard.jsx";
import { SkeletonCard } from "../components/Skeleton.jsx";
import { CROP_DB } from "../store/cropSlice.js";

const CATEGORIES = ["All", "Cereal", "Cash Crop", "Legume", "Oilseed", "Vegetable"];
const SEASONS = ["All", "Kharif", "Rabi", "Annual"];
const SORTS = [
  { value: "name", label: "Name A–Z" },
  { value: "tempIdeal", label: "Ideal Temp" },
  { value: "rainMin", label: "Rain Need" },
];

export default function CropExplorer() {
  const dispatch = useDispatch();
  const { searchQuery, filterCategory, filterSeason, sortBy, page, perPage } = useSelector(s => s.crops);
  const daily = useSelector(s => s.weather.daily);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounced = useDebounce(localSearch, 350);

  React.useEffect(() => { dispatch(setSearch(debounced)); }, [debounced, dispatch]);

  const filtered = useMemo(() => {
    let list = [...CROP_DB];
    if (searchQuery) list = list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterCategory !== "All") list = list.filter(c => c.category === filterCategory);
    if (filterSeason !== "All") list = list.filter(c => c.season.includes(filterSeason));
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "tempIdeal") return a.tempIdeal - b.tempIdeal;
      if (sortBy === "rainMin") return a.rainMin - b.rainMin;
      return 0;
    });
    return list;
  }, [searchQuery, filterCategory, filterSeason, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="fade-in">
      <Header title="Crop Explorer" subtitle={`Browse ${CROP_DB.length} crops with detailed agronomic data`} />

      {/* Search & Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="🔍 Search crops..."
            className="input flex-1 min-w-48"
          />
          <select className="select w-36" value={filterCategory} onChange={e => dispatch(setFilterCategory(e.target.value))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="select w-32" value={filterSeason} onChange={e => dispatch(setFilterSeason(e.target.value))}>
            {SEASONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select w-36" value={sortBy} onChange={e => dispatch(setSortBy(e.target.value))}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-stone-400 mt-2">{filtered.length} crops found</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {paginated.map(crop => (
          <CropCard key={crop.id} crop={crop} showSuitability={!!daily} />
        ))}
        {paginated.length === 0 && (
          <div className="col-span-3 text-center py-16 text-stone-400">
            <p className="text-4xl mb-3">🌿</p>
            <p>No crops match your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary text-sm" onClick={() => dispatch(setPage(page - 1))} disabled={page === 1}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => dispatch(setPage(p))}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition ${p === page ? "bg-leaf-600 text-white" : "btn-secondary"}`}
            >{p}</button>
          ))}
          <button className="btn-secondary text-sm" onClick={() => dispatch(setPage(page + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
