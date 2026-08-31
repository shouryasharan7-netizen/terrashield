"use client";

import React, { useState, useEffect } from "react";
import { fetchEvacuationRoute } from "@/lib/api";
import {
  Navigation,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MapPin,
  Flame,
  ArrowRight,
  Route,
  Compass,
  AlertTriangle
} from "lucide-react";

export const EvacuationOptimizer: React.FC = () => {
  const [startLoc, setStartLoc] = useState({ name: "Santa Rosa Fire Boundary", lat: 38.4404, lon: -122.7141 });
  const [destLoc, setDestLoc] = useState({ name: "San Francisco Safe Harbor", lat: 37.7749, lon: -122.4194 });
  const [safetyBuffer, setSafetyBuffer] = useState(10.0);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateRoute = () => {
    setLoading(true);
    fetchEvacuationRoute(startLoc.lat, startLoc.lon, destLoc.lat, destLoc.lon, safetyBuffer)
      .then((data) => {
        setRouteResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Evacuation routing error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    calculateRoute();
  }, [safetyBuffer]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide">
              EVACUATION ROUTE OPTIMIZER
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Dynamic pathfinding with automatic 10km wildfire buffer deflection and safety scoring.
          </p>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Origin & Destination Config */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Route className="w-4 h-4 text-sky-400" />
            <span>Evacuation Corridor Config</span>
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 font-medium">Start Location (Hazard Zone)</label>
              <div className="font-bold text-slate-200">{startLoc.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                [{startLoc.lat}, {startLoc.lon}]
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-slate-500 rotate-90" />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <label className="block text-slate-400 font-medium">Safe Destination (Shelter / Coastal)</label>
              <div className="font-bold text-slate-200">{destLoc.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                [{destLoc.lat}, {destLoc.lon}]
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 font-medium">
                <span>Wildfire Avoidance Buffer</span>
                <span className="font-mono text-emerald-400 font-bold">{safetyBuffer} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="2.5"
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              onClick={calculateRoute}
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <Compass className="w-4 h-4" />
              <span>{loading ? "Optimizing Detours..." : "Recalculate Corridor"}</span>
            </button>
          </div>
        </div>

        {/* Route Assessment Summary */}
        <div className="lg:col-span-2 space-y-4">
          {routeResult && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" style={{ color: routeResult.status_color }} />
                    <span>Safety Score</span>
                  </div>
                  <div className="text-3xl font-black font-mono" style={{ color: routeResult.status_color }}>
                    {routeResult.safety_score}%
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: routeResult.status_color }}>
                    {routeResult.safety_tier}
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                    <Route className="w-4 h-4 text-sky-400" />
                    <span>Evac Distance</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-100">
                    {routeResult.distance_km} km
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Includes fire detour margins
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Est. Transit Time</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-100">
                    {routeResult.estimated_minutes} min
                  </div>
                  <div className="text-[11px] text-slate-400">
                    At 60 km/h emergency speed
                  </div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>TACTICAL ROUTE DIRECTIVE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {routeResult.recommendation}
                </p>

                {routeResult.closest_threat_km && (
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Nearest Active NASA Satellite Detection:</span>
                    <span className="font-mono text-rose-400 font-bold">
                      {routeResult.closest_threat_km} km
                    </span>
                  </div>
                )}

                {/* Waypoint Coordinates Preview */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-500 font-mono block mb-2">
                    Waypoints Discretized ({routeResult.geojson.geometry.coordinates.length} Spatial Nodes):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
                    {routeResult.geojson.geometry.coordinates.map((pt: [number, number], idx: number) => (
                      <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {pt[1].toFixed(2)}, {pt[0].toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
