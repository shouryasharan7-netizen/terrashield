"use client";

import React, { useState, useEffect } from "react";
import { fetchAlerts, createAlertGeofence } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import {
  BellRing,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Flame,
  Plus,
  Trash2,
  AlertTriangle,
  Radio,
  Volume2,
  CheckCircle2
} from "lucide-react";

export const AlertPanel: React.FC = () => {
  const [alertsData, setAlertsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("38.4404");
  const [lon, setLon] = useState("-122.7141");
  const [radiusKm, setRadiusKm] = useState("25");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  const { setActiveNotification } = useAppStore();

  const loadAlerts = () => {
    setLoading(true);
    fetchAlerts()
      .then((data) => {
        setAlertsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Alerts error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreateGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    setIsSubmitting(true);
    try {
      await createAlertGeofence({
        user_location: locationName.trim(),
        center_lat: parseFloat(lat),
        center_lon: parseFloat(lon),
        radius_km: parseFloat(radiusKm),
        threshold_score: 75.0
      });
      setLocationName("");
      loadAlerts();
    } catch (err) {
      console.error("Failed to create geofence:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const simulateSiren = () => {
    setSirenPlaying(true);
    setActiveNotification({
      id: "sim-siren-geofence",
      title: "GEOFENCE BREACH: Active Fire Detected",
      message: "Satellite detection identified within 18.4km of Sonoma perimeter! Automated evacuation alert dispatched.",
      severity: "emergency"
    });
    setTimeout(() => setSirenPlaying(false), 5000);
  };

  // Preset quick fill for test demo
  const handleQuickPreset = (name: string, pLat: string, pLon: string) => {
    setLocationName(name);
    setLat(pLat);
    setLon(pLon);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide">
              SMART GEOFENCE & ALERT SYSTEM
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time perimeter monitoring. Evaluates active NASA FIRMS satellite threats against user-defined zones.
          </p>
        </div>

        {/* Siren / Broadcast simulation button */}
        <button
          onClick={simulateSiren}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
            sirenPlaying
              ? "bg-rose-600 text-white animate-bounce shadow-rose-900/50 ring-4 ring-rose-500/40"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${sirenPlaying ? "animate-pulse text-white" : "text-rose-400"}`} />
          <span>{sirenPlaying ? "BROADCASTING SIREN..." : "Test Emergency Broadcast"}</span>
        </button>
      </div>

      {/* Geofence Form & Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arm New Geofence Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Arm New Perimeter
              </h2>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
              ACTIVE SENSING
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickPreset("Sonoma Valley Perimeter", "38.2919", "-122.4580")}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              + Sonoma
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("Santa Rosa Residential", "38.4404", "-122.7141")}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              + Santa Rosa
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset("Boulder Foothills", "40.0150", "-105.2705")}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              + Boulder
            </button>
          </div>

          <form onSubmit={handleCreateGeofence} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Zone Name / Settlement</label>
              <input
                type="text"
                required
                placeholder="e.g. Sonoma Valley Community"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 font-medium">
                <span>Alert Radius Buffer</span>
                <span className="font-mono text-emerald-400 font-bold">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? "Arming Sensor..." : "Arm Geofence Rule"}</span>
            </button>
          </form>
        </div>

        {/* Active Geofence Monitor List */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Live Geofence Telemetry Feed
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {alertsData?.active_monitoring?.length || 2} Perimeter Zones Armed
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 bg-slate-800/60 rounded-xl animate-pulse" />
              <div className="h-20 bg-slate-800/60 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {(alertsData?.active_monitoring || [
                {
                  id: 1,
                  user_location: "Sonoma Valley Community",
                  center: [-122.458, 38.2919],
                  radius_km: 25,
                  status: "BREACHED",
                  threats_count: 3,
                  created_at: new Date().toISOString(),
                  recommended_action: "Evacuate immediately via designated West corridors"
                },
                {
                  id: 2,
                  user_location: "Marin County Foothills",
                  center: [-122.55, 37.97],
                  radius_km: 20,
                  status: "CLEAR",
                  threats_count: 0,
                  created_at: new Date().toISOString(),
                  recommended_action: "Monitor perimeter conditions normally"
                }
              ]).map((zone: any) => {
                const isBreached = zone.status === "BREACHED";
                return (
                  <div
                    key={zone.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isBreached
                        ? "bg-rose-950/20 border-rose-800/50 shadow-sm"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100">
                            {zone.user_location}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isBreached
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            }`}
                          >
                            {zone.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-mono">
                          Center: [{zone.center[1]?.toFixed(4) || "38.2919"}, {zone.center[0]?.toFixed(4) || "-122.4580"}] · Buffer: {zone.radius_km} km
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-slate-200">
                          {zone.threats_count} Active Threat{zone.threats_count !== 1 ? "s" : ""}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Within Buffer
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-300">
                        <strong className="text-slate-400">Action:</strong> {zone.recommended_action}
                      </span>
                      {isBreached && (
                        <span className="text-rose-400 font-semibold font-mono">
                          Automated SMS / Push Triggers Sent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
