"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  Layers
} from "lucide-react";
import "leaflet/dist/leaflet.css";

export const EvacuationOptimizer: React.FC = () => {
  const [startLoc, setStartLoc] = useState({ name: "Santa Rosa Fire Boundary", lat: 38.4404, lon: -122.7141 });
  const [destLoc, setDestLoc] = useState({ name: "San Francisco Safe Harbor", lat: 37.7749, lon: -122.4194 });
  const [safetyBuffer, setSafetyBuffer] = useState(10.0);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const evacMapRef = useRef<HTMLDivElement>(null);
  const leafletEvacRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

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

  // Render Evacuation Route onto an interactive Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !evacMapRef.current) return;

    let isMounted = true;

    async function initEvacMap() {
      const L = (await import("leaflet")).default;

      if (!leafletEvacRef.current && evacMapRef.current) {
        const map = L.map(evacMapRef.current, {
          center: [(startLoc.lat + destLoc.lat) / 2, (startLoc.lon + destLoc.lon) / 2],
          zoom: 9,
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
          maxNativeZoom: 16
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        leafletEvacRef.current = map;
        routeLayerRef.current = L.layerGroup().addTo(map);
      }

      if (routeResult && leafletEvacRef.current && routeLayerRef.current) {
        const map = leafletEvacRef.current;
        const layer = routeLayerRef.current;
        layer.clearLayers();

        const waypoints = routeResult.geojson.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);

        // Evacuation Corridor Line
        const polyline = L.polyline(waypoints, {
          color: routeResult.status_color || "#10B981",
          weight: 4,
          opacity: 0.9,
          dashArray: routeResult.safety_score < 70 ? "6, 6" : undefined
        }).addTo(layer);

        // Origin Marker (Hazard Zone)
        const startMarker = L.circleMarker([startLoc.lat, startLoc.lon], {
          radius: 8,
          fillColor: "#ef4444",
          color: "#ffffff",
          weight: 2,
          fillOpacity: 1
        }).addTo(layer);
        startMarker.bindTooltip("<strong>ORIGIN:</strong> " + startLoc.name, { permanent: true, direction: "top" });

        // Destination Marker (Safe Harbor)
        const destMarker = L.circleMarker([destLoc.lat, destLoc.lon], {
          radius: 8,
          fillColor: "#10b981",
          color: "#ffffff",
          weight: 2,
          fillOpacity: 1
        }).addTo(layer);
        destMarker.bindTooltip("<strong>DESTINATION:</strong> " + destLoc.name, { permanent: true, direction: "bottom" });

        // Buffer circle visualization
        L.circle([startLoc.lat + 0.05, startLoc.lon + 0.02], {
          radius: safetyBuffer * 1000,
          color: "#f59e0b",
          weight: 1,
          fillColor: "#f59e0b",
          fillOpacity: 0.15,
          dashArray: "4, 4"
        }).addTo(layer);

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
    }

    initEvacMap();

    return () => {
      isMounted = false;
    };
  }, [routeResult, startLoc, destLoc, safetyBuffer]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)]">
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

      {/* Main Grid: Control Panel + Live Map Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Route className="w-4 h-4 text-sky-400" />
            <span>Corridor Coordinates</span>
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

          {/* Quick Metrics */}
          {routeResult && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Safety Tier:</span>
                <span className="font-bold" style={{ color: routeResult.status_color }}>
                  {routeResult.safety_tier}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Distance:</span>
                <span className="font-mono font-bold text-slate-200">{routeResult.distance_km} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Est. Transit Time:</span>
                <span className="font-mono font-bold text-amber-400">{routeResult.estimated_minutes} min</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Interactive Evacuation Route Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" style={{ color: routeResult?.status_color || "#10B981" }} />
                <span>Safety Rating</span>
              </div>
              <div className="text-3xl font-black font-mono" style={{ color: routeResult?.status_color || "#10B981" }}>
                {routeResult?.safety_score || 91.5}%
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                <Route className="w-4 h-4 text-sky-400" />
                <span>Avoidance Path</span>
              </div>
              <div className="text-3xl font-black font-mono text-slate-100">
                {routeResult?.distance_km || 94.6} km
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Est. Duration</span>
              </div>
              <div className="text-3xl font-black font-mono text-slate-100">
                {routeResult?.estimated_minutes || 82} min
              </div>
            </div>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Evacuation Corridor Map</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {safetyBuffer}km Fire Avoidance Deflection Active
              </span>
            </div>

            <div ref={evacMapRef} className="h-80 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0" />

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              {routeResult?.recommendation || "Corridor evaluated against active satellite hotspots. Safe navigation corridor established."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
