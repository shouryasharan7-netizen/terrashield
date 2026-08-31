"use client";

import React from "react";
import {
  Map as MapIcon,
  Activity,
  BellRing,
  Navigation,
  BarChart3,
  Flame,
  Wind,
  Trees,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAppStore, ActiveTab } from "@/lib/store";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    showFires,
    showAirQuality,
    showDeforestation,
    showReports,
    toggleLayer
  } = useAppStore();

  const navigationItems = [
    { id: "map" as ActiveTab, label: "Live Threat Map", icon: MapIcon, badge: "LIVE" },
    { id: "dashboard" as ActiveTab, label: "AI Risk Forecast", icon: Activity },
    { id: "alerts" as ActiveTab, label: "Geofence Alerts", icon: BellRing },
    { id: "evacuation" as ActiveTab, label: "Evac Route Optimizer", icon: Navigation },
    { id: "analytics" as ActiveTab, label: "Impact Analytics", icon: BarChart3 },
  ];

  return (
    <aside
      className={`h-[calc(100vh-4rem)] bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-20 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation Links */}
      <div className="p-3 space-y-6">
        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              Command Modules
            </div>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center px-0" : "justify-between px-3"
                  } py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Threat Layer Controls */}
        <div>
          {!collapsed && (
            <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>Map Layers (L)</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {/* Fires Layer */}
            <button
              onClick={() => toggleLayer("fires")}
              className={`w-full flex items-center ${
                collapsed ? "justify-center px-0" : "justify-between px-3"
              } py-2 rounded-lg text-xs transition-colors ${
                showFires ? "bg-rose-950/40 text-rose-300 border border-rose-800/40" : "text-slate-500 hover:bg-slate-800/40"
              }`}
              title="NASA FIRMS Wildfire Layer"
            >
              <div className="flex items-center space-x-2.5">
                <Flame className={`w-4 h-4 ${showFires ? "text-rose-400" : "text-slate-600"}`} />
                {!collapsed && <span>NASA FIRMS Fires</span>}
              </div>
              {!collapsed && (
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    showFires ? "bg-rose-500 ring-2 ring-rose-500/30" : "bg-slate-700"
                  }`}
                />
              )}
            </button>

            {/* Air Quality Layer */}
            <button
              onClick={() => toggleLayer("aqi")}
              className={`w-full flex items-center ${
                collapsed ? "justify-center px-0" : "justify-between px-3"
              } py-2 rounded-lg text-xs transition-colors ${
                showAirQuality ? "bg-sky-950/40 text-sky-300 border border-sky-800/40" : "text-slate-500 hover:bg-slate-800/40"
              }`}
              title="Air Quality Stations"
            >
              <div className="flex items-center space-x-2.5">
                <Wind className={`w-4 h-4 ${showAirQuality ? "text-sky-400" : "text-slate-600"}`} />
                {!collapsed && <span>Air Quality (OpenAQ)</span>}
              </div>
              {!collapsed && (
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    showAirQuality ? "bg-sky-400 ring-2 ring-sky-400/30" : "bg-slate-700"
                  }`}
                />
              )}
            </button>

            {/* Deforestation Layer */}
            <button
              onClick={() => toggleLayer("deforestation")}
              className={`w-full flex items-center ${
                collapsed ? "justify-center px-0" : "justify-between px-3"
              } py-2 rounded-lg text-xs transition-colors ${
                showDeforestation ? "bg-amber-950/40 text-amber-300 border border-amber-800/40" : "text-slate-500 hover:bg-slate-800/40"
              }`}
              title="Deforestation Alerts"
            >
              <div className="flex items-center space-x-2.5">
                <Trees className={`w-4 h-4 ${showDeforestation ? "text-amber-400" : "text-slate-600"}`} />
                {!collapsed && <span>Deforestation Signals</span>}
              </div>
              {!collapsed && (
                <div
                  className={`w-3 h-3 rounded-full transition-all ${
                    showDeforestation ? "bg-amber-400 ring-2 ring-amber-400/30" : "bg-slate-700"
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry & Collapse button */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {!collapsed && (
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Telemetry Node:</span>
              <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>ML Predictor:</span>
              <span className="text-sky-400">RandomForest v1.0</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Sensors Online:</span>
              <span className="text-slate-200">615 Stations</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
