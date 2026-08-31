"use client";

import React, { useState, useEffect } from "react";
import { fetchAnalytics } from "@/lib/api";
import {
  Flame,
  Trees,
  Wind,
  ShieldCheck,
  Factory,
  Users,
  Activity,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export const ImpactAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-72 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide">
              EARTH OBSERVATION IMPACT ANALYTICS
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Global carbon footprint assessments, early warning acreage savings, and 7-day threat velocities.
          </p>
        </div>
      </div>

      {/* Real-time Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Fires */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Fires Today</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">
            {data.active_fires_today.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-400 font-mono">
            {data.total_frp_megawatts} MW Cumulative FRP
          </div>
        </div>

        {/* Estimated Acres Burned */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Acres Burned (Est.)</span>
            <Trees className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">
            {data.estimated_acres_burned.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            24.5 acres / detection
          </div>
        </div>

        {/* Carbon Emissions (Specification Calculation) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CO₂ Emissions</span>
            <Factory className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black font-mono text-orange-400">
            {data.estimated_co2_metric_tons.toLocaleString()} t
          </div>
          <div className="text-[11px] text-slate-400">
            Formula: acres × 5.5 tons CO₂
          </div>
        </div>

        {/* Judging Highlight: Protected Counter */}
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-5 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Acres Shielded</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {data.acres_protected_early_detection.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/80">
            Early satellite perimeter warning
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
          <div className="text-slate-400">Average Worldwide AQI:</div>
          <div className="text-xl font-bold font-mono text-sky-400">{data.average_aqi} AQI</div>
          <div className="text-[11px] text-slate-500">15 Global Observation Centers</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
          <div className="text-slate-400">Communities At Immediate Risk:</div>
          <div className="text-xl font-bold font-mono text-rose-400">{data.communities_at_risk_count} Zones</div>
          <div className="text-[11px] text-slate-500">Within 25km Fire Front</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
          <div className="text-slate-400">Citizen Reports Logged:</div>
          <div className="text-xl font-bold font-mono text-purple-400">{data.community_reports_count} Reports</div>
          <div className="text-[11px] text-slate-500">Auto-correlated with satellites</div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Wildfire Detections & AQI (Past 7 Days)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Correlating daily satellite fire incidence counts with atmospheric air quality
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.seven_day_trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f8fafc"
                }}
              />
              <Bar dataKey="fire_detections" name="Fire Detections" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="air_quality_index" name="Air Quality (AQI)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
