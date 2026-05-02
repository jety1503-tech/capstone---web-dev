import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { SkeletonCard } from "./components/Skeleton.jsx";

// Lazy loaded pages
const Dashboard   = lazy(() => import("./pages/Dashboard.jsx"));
const CropExplorer = lazy(() => import("./pages/CropExplorer.jsx"));
const CropDetail  = lazy(() => import("./pages/CropDetail.jsx"));
const WeatherPage = lazy(() => import("./pages/WeatherPage.jsx"));
const MyFarm      = lazy(() => import("./pages/MyFarm.jsx"));
const Advisor     = lazy(() => import("./pages/Advisor.jsx"));
const Journal     = lazy(() => import("./pages/Journal.jsx"));
const Calculator  = lazy(() => import("./pages/Calculator.jsx"));

function PageLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[1,2,3].map(i => <SkeletonCard key={i} />)}
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"            element={<Dashboard />} />
                <Route path="/crops"       element={<CropExplorer />} />
                <Route path="/crops/:id"   element={<CropDetail />} />
                <Route path="/weather"     element={<WeatherPage />} />
                <Route path="/my-farm"     element={<MyFarm />} />
                <Route path="/advisor"     element={<Advisor />} />
                <Route path="/journal"     element={<Journal />} />
                <Route path="/calculator"  element={<Calculator />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
