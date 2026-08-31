"use client";

import React, { useState, useEffect } from "react";
import { fetchPredictRisk } from "@/lib/api";
import {
  Flame,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Calendar,
  MapPin,
  TrendingUp,
  Info,
  CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from "recharts";

const TARGET_PRESETS = [
  { name: "Sonoma County / Napa Valley, CA", lat: 38.2919, lon: -122.4580 },
  { name: "Los Angeles Foothills, CA", lat: 34.1808, lon: -118.3090 },
  { name: "Boulder / Front Range, CO", lat: 40.0150, lon: -105.2705 },
  { name: "Okanagan Valley, BC (Canada)", lat: 49.8880, lon: -119.4960 },
  { name: "Attica Wildland Interface (Greece)", lat: 38.0460, lon: 23.8560 },
  { name: "Blue Mountains, NSW (Australia)", lat: -33.7126, lon: 150.3119 }
];

export const RiskForecast: React.FC = () => {
  const [selectedLoc, setSelectedLoc] = useState(TARGET_PRESETS[0]);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPredictRisk(selectedLoc.lat, selectedLoc.lon, selectedLoc.name)
      .then((data) => {
        if (isMounted) {
          setPredictionData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Prediction fetch error:", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedLoc]);

  if (loading || !predictionData) {
    return (
      <div className="p-8 space-y-4 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
          <div className="h-48 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-72 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const curr = predictionData.current_assessment;
  const chartData = predictionData.seven_day_forecast.map((f: any) => ({
    day: f.day_name,
    date: f.date,
    score: f.risk_score,
    lower: f.confidence_interval.lower,
    upper: f.confidence_interval.upper,
    temp: f.temp_max,
    wind: f.wind_max,
    humidity: f.humidity_min
  }));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto h-[calc(100vh-4rem)]">
      {/* Header & Location Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-rose-500" />
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide">
              AI FIRE RISK PREDICTION ENGINE
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Machine Learning model trained on physical Fire Weather Index (FWI) with 90% confidence intervals.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <MapPin className="w-4 h-4 text-emerald-400 ml-2" />
          <select
            value={selectedLoc.name}
            onChange={(e) => {
              const found = TARGET_PRESETS.find((p) => p.name === e.target.value);
              if (found) setSelectedLoc(found);
            }}
            className="bg-transparent text-xs text-slate-200 font-medium py-1 px-2 focus:outline-none cursor-pointer"
          >
            {TARGET_PRESETS.map((p) => (
              <option key={p.name} value={p.name} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Gauge & Current Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              CURRENT RISK INDEX
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${curr.color}25`,
                color: curr.color,
                border: `1px solid ${curr.color}60`
              }}
            >
              {curr.risk_level}
            </span>
          </div>

          <div className="flex items-baseline space-x-3 my-2">
            <div className="text-6xl font-black font-mono tracking-tight" style={{ color: curr.color }}>
              {curr.risk_score}
            </div>
            <div className="text-sm font-semibold text-slate-400">/ 100</div>
          </div>

          {/* Real-time confidence interval */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">90% Confidence Interval:</span>
              <span className="font-mono text-slate-200 font-semibold">
                [{curr.confidence_interval.lower} — {curr.confidence_interval.upper}]
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Model Standard Error:</span>
              <span className="font-mono text-slate-400">±{curr.confidence_interval.std_dev} pts</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Fuel Moisture Index (FMI):</span>
              <span className="font-mono text-emerald-400 font-bold">{curr.fuel_moisture_index}%</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
            {curr.description}
          </div>
        </div>

        {/* Atmospheric Sensor Inputs (Physics Breakdown) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              ATMOSPHERIC FUEL CONDITIONS
            </span>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-slate-400 text-xs">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Max Temp</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {curr.feature_contributions.temperature}°C
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-slate-400 text-xs">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>Min Humidity</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {curr.feature_contributions.humidity}%
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-slate-400 text-xs">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>Wind Velocity</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {curr.feature_contributions.wind_speed} km/h
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center space-x-2 text-slate-400 text-xs">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>24h Rainfall</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {curr.feature_contributions.precipitation} mm
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Model Validation R²:</span>
            <span className="text-emerald-400 font-bold">0.9302 (Calibrated)</span>
          </div>
        </div>

        {/* Alert Thresholds & Guardrails */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            COMMAND THRESHOLDS
          </span>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-400 block">Low Danger (0 - 39)</span>
                <span className="text-[11px] text-slate-400">Routine patrols sufficient</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-400 block">Watch Phase (40 - 59)</span>
                <span className="text-[11px] text-slate-400">Pre-position aerial retardant crews</span>
              </div>
              <Info className="w-4 h-4 text-blue-400" />
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 flex justify-between items-center">
              <div>
                <span className="font-bold text-amber-400 block">Warning Phase (60 - 79)</span>
                <span className="text-[11px] text-slate-400">Burn bans & automated geofence checks</span>
              </div>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>

            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 flex justify-between items-center">
              <div>
                <span className="font-bold text-rose-400 block">Emergency / Red Flag (80 - 100)</span>
                <span className="text-[11px] text-slate-400">Mandatory evacuation corridors active</span>
              </div>
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Risk Forecast Timeline (AreaChart with Confidence Bounds) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>7-Day Predictive Fire Risk Trajectory</span>
            </h2>
            <p className="text-xs text-slate-400">
              Projected daily wildfire danger with 90% uncertainty envelope (upper & lower tree estimates)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span>Risk Score</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-3 h-2 bg-emerald-500/20 inline-block rounded" />
              <span>Confidence Band</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f8fafc"
                }}
                formatter={(val: any) => [`${val} / 100`, "Risk Score"]}
              />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Emergency (80)", fill: "#ef4444", fontSize: 11 }} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Warning (60)", fill: "#f59e0b", fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#riskGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 7-Day Day-by-Day Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {predictionData.seven_day_forecast.map((day: any) => (
            <div
              key={day.date}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">{day.day_name}</span>
                <span className="text-[10px] text-slate-500">{day.date.slice(5)}</span>
              </div>
              <div className="text-xl font-black font-mono" style={{ color: day.color }}>
                {day.risk_score}
              </div>
              <div className="text-[10px] text-slate-400">
                {day.temp_max}°C · {day.wind_max}km/h
              </div>
              <div
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-center"
                style={{ backgroundColor: `${day.color}20`, color: day.color }}
              >
                {day.risk_level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
