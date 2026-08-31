"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, RefreshCw, AlertTriangle, ShieldCheck, Flame, Info, BookOpen } from "lucide-react";
import { useAppStore } from "@/lib/store";

export const TopBar: React.FC = () => {
  const {
    lastRefreshTime,
    setMapCenter,
    setIsScienceModalOpen,
    setIsAttributionModalOpen,
    setIsReportModalOpen,
    activeNotification,
    setActiveNotification
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick preset locations for the Command Center
  const PRESET_LOCATIONS: Record<string, [number, number]> = {
    "california": [37.7749, -122.4194],
    "los angeles": [34.0522, -118.2437],
    "amazon": [-3.4653, -62.2159],
    "australia": [-33.8688, 151.2093],
    "mediterranean": [38.7223, -9.1393],
    "greece": [37.9838, 23.7275],
    "canada": [49.2827, -123.1207],
    "tokyo": [35.6762, 139.6503]
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    for (const [key, coords] of Object.entries(PRESET_LOCATIONS)) {
      if (query.includes(key) || key.includes(query)) {
        setMapCenter(coords, 7);
        setSearchQuery("");
        return;
      }
    }
    // Default fallback to California Bay Area
    setMapCenter([37.7749, -122.4194], 7);
    setSearchQuery("");
  };

  const triggerManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      useAppStore.getState().setLastRefreshTime(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <header className="min-h-16 py-2 md:py-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 z-30 sticky top-0">
      {/* Brand & Live Counter */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
          <Flame className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-black tracking-wider text-base md:text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent select-none whitespace-nowrap">
              TERRASHIELD
            </span>
            <span className="inline-flex items-center bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 tracking-wider uppercase whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block" />
              LIVE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight whitespace-nowrap">
            EARTH OBSERVATION RISK COMMAND CENTER
          </p>
        </div>

        {/* Early Mitigation Impact Counter */}
        <div className="hidden xl:flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 space-x-2 shrink-0 ml-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs leading-none">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Protected Acreage</div>
            <div className="text-emerald-400 font-black font-mono mt-0.5">
              19,200 acres <span className="text-[10px] font-normal text-slate-400">(Early Shield)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleSearch} className="relative flex-1 max-w-sm md:max-w-md mx-1 lg:mx-3 min-w-[200px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          id="global-search-input"
          placeholder="Search region (e.g. California, Amazon, Australia) — Press '/' "
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
          /
        </span>
      </form>

      {/* Right Action Icons & Modals */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Refresh button */}
        <button
          onClick={triggerManualRefresh}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/70 rounded-lg text-xs text-slate-300 transition-colors"
          title="Refresh satellite telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          <span className="hidden xl:inline text-[11px] font-mono text-slate-400">
            {lastRefreshTime}
          </span>
        </button>

        {/* Guide / How to Use Trigger */}
        <button
          onClick={() => useAppStore.getState().setIsGuideModalOpen(true)}
          className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 transition-colors flex items-center space-x-1.5 shadow-sm shadow-emerald-950"
          title="Interactive Platform Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-xs">How to Use</span>
        </button>

        {/* Science Modal Trigger */}
        <button
          onClick={() => setIsScienceModalOpen(true)}
          className="px-2.5 py-1.5 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/70 rounded-lg text-xs text-slate-300 transition-colors flex items-center space-x-1"
          title="About the Science & Physics Calculation"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline text-xs font-medium">Science</span>
        </button>

        {/* Attribution Trigger */}
        <button
          onClick={() => setIsAttributionModalOpen(true)}
          className="px-2.5 py-1.5 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/70 rounded-lg text-xs text-slate-300 transition-colors flex items-center space-x-1"
          title="Data Sources & Attribution"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-xs font-medium">Sources</span>
        </button>

        {/* Report Hazard CTA */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-rose-900/30 flex items-center space-x-1.5 transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Report Hazard</span>
          <span className="text-[10px] bg-rose-700/60 px-1 py-0.2 rounded font-mono">R</span>
        </button>

        {/* Notification Bell with simulated Siren */}
        <div className="relative">
          <button
            onClick={() => {
              if (activeNotification) {
                setActiveNotification(null);
              } else {
                setActiveNotification({
                  id: "sim-alert-1",
                  title: "Emergency Fire Perimeter Warning",
                  message: "VIIRS Detection #8942 within 14.2km of Sonoma County perimeter. High wind vector (32 km/h NW).",
                  severity: "emergency"
                });
              }
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700/80 text-slate-300 relative transition-colors"
            title="Alert Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};
