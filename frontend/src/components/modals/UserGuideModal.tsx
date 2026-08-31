"use client";

import React, { useState } from "react";
import { useAppStore, ActiveTab } from "@/lib/store";
import {
  X,
  Compass,
  Flame,
  Activity,
  BellRing,
  Navigation,
  BarChart3,
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Play,
  MonitorPlay,
  RotateCcw
} from "lucide-react";

export const UserGuideModal: React.FC = () => {
  const { isGuideModalOpen, setIsGuideModalOpen, setActiveTab } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [activeVideoTab, setActiveVideoTab] = useState(false);

  if (!isGuideModalOpen) return null;

  const GUIDE_STEPS = [
    {
      title: "Welcome to TerraShield Command Center",
      badge: "PLATFORM OVERVIEW",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      icon: Compass,
      description:
        "TerraShield is an AI-powered Earth Observation and Disaster Response platform designed for real-time environmental hazard monitoring, predictive wildfire trajectory analysis, and emergency evacuation management.",
      points: [
        "Consolidates NASA FIRMS satellite thermal scans and OpenAQ atmospheric sensors in near-real-time.",
        "Equipped with a physical machine learning model predicting 7-day fire danger with 90% confidence bands.",
        "Provides geofenced automated siren broadcasts and dynamic routing avoiding fire zones."
      ],
      tabTarget: "map" as ActiveTab
    },
    {
      title: "1. Live Threat Map (Primary Radar)",
      badge: "ORBITAL TELEMETRY",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      icon: Flame,
      description:
        "Your real-time visual situational map showing active environmental threats across the globe.",
      points: [
        "🔴 Solid Red Points: Wildfire detections from NASA VIIRS & MODIS satellites. Click any point to inspect Fire Radiative Power (MW), temperature, and confidence.",
        "🔵 Numbered Badges: Air Quality Index (AQI) from international ground monitoring stations (Good, Moderate, Unhealthy).",
        "🟡 Tree Icons: Deforestation signals identified via Sentinel-2 radar canopy depletion.",
        "🟣 Purple Markers: Crowdsourced reports submitted by observers and volunteers."
      ],
      tabTarget: "map" as ActiveTab
    },
    {
      title: "2. AI Fire Risk Prediction Engine",
      badge: "MACHINE LEARNING",
      badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
      icon: Activity,
      description:
        "A Scikit-Learn Random Forest Regressor calibrated on physical Fire Weather Index (FWI) principles to forecast danger up to 7 days in advance.",
      points: [
        "Risk Score (0–100): Calculated from temperature, fuel moisture, humidity, and wind velocity.",
        "90% Confidence Interval: Derived from variance across 100 decision tree estimators, ensuring transparency.",
        "Thresholds: Low (<40), Watch (40-59), Warning (60-79), Emergency (80+).",
        "Location Selector: Switch between target wildfire zones (Sonoma County, Attica Greece, Australia, etc.)."
      ],
      tabTarget: "dashboard" as ActiveTab
    },
    {
      title: "3. Smart Geofence Alert System",
      badge: "PERIMETER SHIELD",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      icon: BellRing,
      description:
        "Guards residential communities, national parks, and key infrastructure against encroaching fires.",
      points: [
        "Arm Custom Zones: Choose any latitude/longitude and set an alert radius buffer (5km–100km).",
        "Automated Spatial Intersection: System checks all live satellite fire detections against the perimeter.",
        "Disaster Sirens: Click 'Test Emergency Broadcast' to simulate automated audio-visual siren broadcasts and toast alerts dispatched to emergency personnel."
      ],
      tabTarget: "alerts" as ActiveTab
    },
    {
      title: "4. Evacuation Route Optimizer",
      badge: "DYNAMIC PATHFINDING",
      badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
      icon: Navigation,
      description:
        "Navigates civilian evacuations safely away from active fire perimeters.",
      points: [
        "10km Fire Avoidance Buffer: Evaluates road corridor against live NASA fire coordinates.",
        "Automatic Detours: Applies orthogonal vector deflections to steer paths around active flame zones.",
        "Interactive Route Map: Displays the calculated evacuation corridor, danger buffer circle, safety rating, and estimated transit duration."
      ],
      tabTarget: "evacuation" as ActiveTab
    },
    {
      title: "5. Impact Analytics & Community Verification",
      badge: "CARBON ACCOUNTING & CITIZENS",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      icon: BarChart3,
      description:
        "Quantifies ecological damages, carbon emissions, and empowers ground observers.",
      points: [
        "Protected Acreage Counter: Calculates acres saved through early perimeter detection warnings (19,200 acres).",
        "CO2 Emissions: Computes carbon tonnage released by fires based on burned acreage.",
        "Crowdsourced Verification (Key 'R'): Submit ground hazard observations. If submitted within 2km of a satellite detection, the platform automatically awards a '✓ SATELLITE VERIFIED' badge."
      ],
      tabTarget: "analytics" as ActiveTab
    }
  ];

  const step = GUIDE_STEPS[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsGuideModalOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsGuideModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 md:p-7 shadow-2xl space-y-5 relative text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Step indicator and Video Walkthrough toggle */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${step.badgeColor} uppercase tracking-wider font-mono`}>
                {step.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Step {currentStep + 1} of {GUIDE_STEPS.length}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center space-x-2 mt-1">
              <StepIcon className="w-5 h-5 text-emerald-400" />
              <span>{step.title}</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveVideoTab(!activeVideoTab)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeVideoTab
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-emerald-400" />
              <span>{activeVideoTab ? "Show Text Guide" : "Video Walkthrough"}</span>
            </button>

            <button
              onClick={() => setIsGuideModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic View: Video Walkthrough vs. Interactive Step Guide */}
        {activeVideoTab ? (
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Video Walkthrough & Audio Narration</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  1080P HD / 6 MODULES
                </span>
              </div>

              {/* Responsive Video / Simulation Container */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                {/* Visual Video Poster / Mock Player */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-950 hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-8 h-8 fill-emerald-400 ml-1" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-sm font-bold text-slate-100">
                    TerraShield Command Center: Complete Feature Walkthrough
                  </h3>
                  <p className="text-xs text-slate-400">
                    Detailed end-to-end operational guide covering NASA FIRMS telemetry, RandomForest confidence bands, geofence siren dispatch, and dynamic corridor deflection.
                  </p>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800 pt-2">
                  <span>Duration: 2m 45s</span>
                  <span className="text-emerald-400">Click steps below to jump to chapters</span>
                </div>
              </div>

              {/* Video Chapters List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { name: "1. Threat Map", time: "0:15", tab: "map" as ActiveTab },
                  { name: "2. AI Risk Forecast", time: "0:45", tab: "dashboard" as ActiveTab },
                  { name: "3. Geofence Alerts", time: "1:15", tab: "alerts" as ActiveTab },
                  { name: "4. Evacuation Route", time: "1:45", tab: "evacuation" as ActiveTab },
                  { name: "5. Impact Analytics", time: "2:10", tab: "analytics" as ActiveTab },
                  { name: "6. Citizen Verification", time: "2:30", tab: "map" as ActiveTab }
                ].map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJumpToTab(ch.tab)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-left transition-all group"
                  >
                    <div className="text-[11px] font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {ch.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{ch.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Step-by-Step Content */
          <div className="space-y-4 text-xs md:text-sm">
            <p className="text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              {step.description}
            </p>

            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                Key Capabilities & Indicators:
              </span>
              <div className="space-y-2">
                {step.points.map((pt, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-slate-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Shortcut Cheatsheet */}
        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-sans font-medium text-[11px]">Keyboard Shortcuts:</span>
          <div className="flex space-x-3 text-[11px]">
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">/</strong> Search</span>
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">L</strong> Layers</span>
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">R</strong> Report</span>
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">ESC</strong> Close</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => handleJumpToTab(step.tabTarget)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 flex items-center space-x-1"
          >
            <span>Open this module directly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5 transition-all"
            >
              <span>{currentStep === GUIDE_STEPS.length - 1 ? "Start Exploring" : "Next Step"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
