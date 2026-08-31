"use client";

import React, { useState, useEffect } from "react";
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
  Pause,
  MonitorPlay,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface VideoScene {
  id: number;
  title: string;
  moduleName: string;
  tab: ActiveTab;
  duration: number; // in seconds
  caption: string;
  narration: string;
  badge: string;
  badgeColor: string;
  highlights: string[];
  visualType: "map" | "ai" | "alerts" | "evac" | "analytics";
}

const SCENES: VideoScene[] = [
  {
    id: 1,
    title: "Live Threat Map & NASA Telemetry",
    moduleName: "Live Threat Map",
    tab: "map",
    duration: 6,
    badge: "MODULE 1: SATELLITE RADAR",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    caption: "Scanning real-time orbital swaths from NASA VIIRS and MODIS satellites.",
    narration: "The Live Threat Map aggregates NASA FIRMS active wildfire hotspots and international OpenAQ sensor stations. Clicking any red marker opens the telemetry panel showing temperature, Fire Radiative Power in Megawatts, and detection confidence.",
    highlights: [
      "🔴 Red Points: NASA satellite active thermal fires with FRP & scan timestamp",
      "🔵 AQI Stations: Live atmospheric air quality (PM2.5, PM10, CO, NO2)",
      "🟡 Deforestation: Sentinel-2 radar radar canopy disturbance alerts",
      "Inspection Drawer: Click any pin to open full sensor metrics on the right"
    ],
    visualType: "map"
  },
  {
    id: 2,
    title: "AI Fire Risk Prediction Engine",
    moduleName: "AI Risk Forecast",
    tab: "dashboard",
    duration: 6,
    badge: "MODULE 2: MACHINE LEARNING",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
    caption: "RandomForest ML regressor computing point fire risk with 90% confidence bands.",
    narration: "Our Scikit-Learn Random Forest model evaluates fuel moisture, temperature, humidity, and wind velocity. It projects a 7-day fire danger trajectory with 90% confidence uncertainty envelopes across 100 decision trees.",
    highlights: [
      "Risk Score (0–100): Calculated from live atmospheric fuel moisture index",
      "90% Confidence Interval: Upper and lower bounds showing model variance",
      "Threshold Tiers: Low Danger (<40), Watch Phase (40-59), Warning (60-79), Emergency (80+)",
      "Multi-Region Presets: Compare Sonoma County, Greece, Amazon, or Sydney"
    ],
    visualType: "ai"
  },
  {
    id: 3,
    title: "Smart Geofence & Emergency Sirens",
    moduleName: "Geofence Alerts",
    tab: "alerts",
    duration: 6,
    badge: "MODULE 3: PERIMETER ALERTS",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    caption: "Active perimeter breach surveillance and automated disaster directive broadcast.",
    narration: "Arm geofence zones around vulnerable communities or parks with a customizable buffer between 5 and 100 kilometers. If active satellite hotspots cross the boundary, the platform triggers automated SMS triggers and emergency sirens.",
    highlights: [
      "Arm Custom Zones: Set location name, coordinates, and buffer radius (5–100km)",
      "Real-Time Breach Detector: Compares all active satellite detections against perimeter",
      "Test Emergency Broadcast: Triggers top-level disaster siren and evacuation directive toast",
      "Preloaded Perimeters: Includes Sonoma Valley Community & Marin County Foothills"
    ],
    visualType: "alerts"
  },
  {
    id: 4,
    title: "Evacuation Corridor Optimizer",
    moduleName: "Evac Route Optimizer",
    tab: "evacuation",
    duration: 6,
    badge: "MODULE 4: PATHFINDING",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/40",
    caption: "Dynamic pathfinding with automatic 10km wildfire buffer deflection and safety scoring.",
    narration: "The Evacuation Route Optimizer charts safe passage away from wildfire fronts. It calculates road waypoints and applies orthogonal vector deflections around active fire nodes to guarantee a minimum 10 kilometer buffer.",
    highlights: [
      "10km Avoidance Buffer: Slider lets emergency crews expand safety margins",
      "Interactive Corridor Map: Renders road path, origin hazard zone, and safe harbor",
      "Safety Rating: Scores corridor safety (e.g. 98% Optimal) and estimated transit minutes",
      "Dynamic Detours: Recalculates in real-time if new satellite hotspots appear"
    ],
    visualType: "evac"
  },
  {
    id: 5,
    title: "Impact Analytics & Citizen Verification",
    moduleName: "Impact Analytics",
    tab: "analytics",
    duration: 6,
    badge: "MODULE 5: CARBON & COMMUNITY",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    caption: "Carbon emission counter, 19,200 protected acres shield, and crowd verification.",
    narration: "Impact Analytics translates fire detections into ecological impact, measuring carbon emissions and acreage shielded. Ground observers can press key R to report hazards, which auto-verify against satellite passes.",
    highlights: [
      "Protected Acreage Shield: Tracks 19,200 acres saved via early perimeter alert warnings",
      "Carbon Footprint: Computes carbon tonnage released using acres burned × 5.5 tons CO2",
      "Crowdsourced Verification (Key 'R'): Auto-verifies reports within 2km of satellites",
      "7-Day Trend Chart: Correlates daily satellite fire counts with worldwide AQI levels"
    ],
    visualType: "analytics"
  }
];

export const UserGuideModal: React.FC = () => {
  const { isGuideModalOpen, setIsGuideModalOpen, setActiveTab } = useAppStore();
  const [activeVideoMode, setActiveVideoMode] = useState(true); // Default to interactive video walkthrough
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100%

  const scene = SCENES[currentSceneIdx];

  // Video progress timer & scene switcher
  useEffect(() => {
    if (!isGuideModalOpen || !activeVideoMode || !isPlaying) return;

    const intervalTime = 50; // update every 50ms
    const totalMs = scene.duration * 1000;
    const increment = (intervalTime / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next scene
          setCurrentSceneIdx((idx) => (idx + 1) % SCENES.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isGuideModalOpen, activeVideoMode, isPlaying, scene.duration, currentSceneIdx]);

  if (!isGuideModalOpen) return null;

  const handleSelectScene = (idx: number) => {
    setCurrentSceneIdx(idx);
    setProgress(0);
  };

  const handleLaunchModule = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsGuideModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-3xl w-full p-5 md:p-7 shadow-2xl space-y-5 relative text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Mode Toggle & Close */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${scene.badgeColor} uppercase tracking-wider font-mono`}>
                {scene.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Chapter {currentSceneIdx + 1} of {SCENES.length}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center space-x-2 mt-1.5">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>TerraShield: Interactive Platform Walkthrough</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveVideoMode(!activeVideoMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeVideoMode
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              <MonitorPlay className="w-4 h-4 text-emerald-400" />
              <span>{activeVideoMode ? "Live Demo Mode" : "Card View"}</span>
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

        {/* Dynamic Video Stage */}
        {activeVideoMode ? (
          <div className="space-y-4">
            {/* Animated Interactive Screen Simulator */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-5 md:p-6 group">
              {/* Animated Scene Canvas Simulation */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Scene Header */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                      ACTIVE FUNCTION: {scene.moduleName.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-slate-100 tracking-wide">
                    {scene.title}
                  </h3>
                </div>

                {/* Direct Jump Button */}
                <button
                  onClick={() => handleLaunchModule(scene.tab)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-950 flex items-center space-x-1.5 transition-all transform hover:scale-105"
                >
                  <span>Open {scene.moduleName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Scene Mock Visualization */}
              <div className="relative z-10 my-auto py-2">
                {scene.visualType === "map" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 backdrop-blur">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="text-rose-400 font-bold">● Active Wildfires: 600 Detections</span>
                      <span className="text-sky-400">● OpenAQ Stations: 15 Online</span>
                    </div>
                    <div className="h-16 bg-slate-950 rounded-lg border border-slate-800/80 p-2 flex items-center justify-around relative overflow-hidden">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                        <span className="w-3 h-3 rounded-full bg-rose-500 relative" />
                        <span className="font-mono text-rose-300">Santa Rosa: 345.1K (82.4 MW)</span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold">52</span>
                        <span className="font-mono text-slate-300">SF Central: 52 AQI (Moderate)</span>
                      </div>
                    </div>
                  </div>
                )}

                {scene.visualType === "ai" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 backdrop-blur">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-teal-300 font-mono font-bold">Random Forest Regressor (100 Trees)</span>
                      <span className="text-emerald-400 font-mono text-[11px]">R² = 0.9302 Calibrated</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Point Risk</div>
                        <div className="text-base font-black text-emerald-400 font-mono">11.2 / 100</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">90% Confidence</div>
                        <div className="text-base font-black text-slate-200 font-mono">[4.4 - 18.0]</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Fuel Moisture</div>
                        <div className="text-base font-black text-sky-400 font-mono">26.4% FMI</div>
                      </div>
                    </div>
                  </div>
                )}

                {scene.visualType === "alerts" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 backdrop-blur">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-amber-400 font-bold font-mono">Perimeter Geofence Monitor</span>
                      <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">BREACH DETECTED</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-100">Sonoma Valley Community (25km Buffer)</div>
                        <div className="text-[11px] text-rose-300 font-mono mt-0.5">3 Active Fire Threats within 18.4km</div>
                      </div>
                      <div className="px-2.5 py-1 bg-rose-600/80 rounded text-[11px] font-bold text-white uppercase">
                        Siren Dispatched
                      </div>
                    </div>
                  </div>
                )}

                {scene.visualType === "evac" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 backdrop-blur">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-sky-400 font-mono font-bold">Dynamic Pathfinding Detour</span>
                      <span className="text-emerald-400 font-mono font-bold">Safety Score: 98% Optimal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Total Distance</div>
                        <div className="text-base font-black text-slate-200 font-mono">82.2 km</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Avoidance Buffer</div>
                        <div className="text-base font-black text-emerald-400 font-mono">10.0 km</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Est. Duration</div>
                        <div className="text-base font-black text-amber-400 font-mono">90 min</div>
                      </div>
                    </div>
                  </div>
                )}

                {scene.visualType === "analytics" && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 backdrop-blur">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-purple-400 font-mono font-bold">Planetary Impact & Carbon Accounting</span>
                      <span className="text-emerald-400 font-mono font-bold">Shield Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Protected Acreage</div>
                        <div className="text-base font-black text-emerald-400 font-mono">19,200 ac</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">Acres Burned</div>
                        <div className="text-base font-black text-slate-200 font-mono">51,450 ac</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400">CO2 Emissions</div>
                        <div className="text-base font-black text-amber-400 font-mono">282,975 t</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene Narration Bar & Controls */}
              <div className="relative z-10 space-y-2">
                <div className="p-3 bg-slate-950/95 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans shadow-lg flex items-start space-x-2.5">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <p className="leading-snug">{scene.narration}</p>
                </div>

                {/* Scrubber / Progress Line */}
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-300"
                        title={isPlaying ? "Pause walkthrough" : "Resume walkthrough"}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                      <span>{scene.moduleName}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectScene((currentSceneIdx - 1 + SCENES.length) % SCENES.length)}
                        className="p-1 hover:text-slate-200"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span>{currentSceneIdx + 1} / {SCENES.length}</span>
                      <button
                        onClick={() => handleSelectScene((currentSceneIdx + 1) % SCENES.length)}
                        className="p-1 hover:text-slate-200"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scene Selector Chapters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SCENES.map((s, idx) => {
                const isSelected = idx === currentSceneIdx;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectScene(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-slate-800 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md"
                        : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-semibold uppercase text-emerald-400">
                      Part {idx + 1}
                    </div>
                    <div className="text-xs font-bold text-slate-200 truncate mt-0.5">
                      {s.moduleName}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Key Capabilities for the Active Scene */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Operational Highlights for {scene.moduleName}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                {scene.highlights.map((h, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Static Card View fallback */
          <div className="space-y-4 text-xs md:text-sm">
            <p className="text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              {scene.narration}
            </p>

            <div className="space-y-2">
              {scene.highlights.map((pt, i) => (
                <div key={i} className="flex items-start space-x-2.5 text-slate-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Keyboard Shortcuts Reminder */}
        <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-sans font-medium text-[11px]">Shortcuts:</span>
          <div className="flex space-x-3 text-[11px]">
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">/</strong> Search</span>
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">L</strong> Layers</span>
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">R</strong> Report</span>
            <span><strong className="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded">ESC</strong> Close</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => handleLaunchModule(scene.tab)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 flex items-center space-x-1"
          >
            <span>Jump directly to {scene.moduleName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsGuideModalOpen(false)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center space-x-1.5 transition-all"
          >
            <span>Explore Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
