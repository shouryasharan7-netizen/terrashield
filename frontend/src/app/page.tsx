"use client";

import React, { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThreatMap } from "@/components/map/ThreatMap";
import { RiskForecast } from "@/components/predictions/RiskForecast";
import { AlertPanel } from "@/components/alerts/AlertPanel";
import { EvacuationOptimizer } from "@/components/predictions/EvacuationOptimizer";
import { ImpactAnalytics } from "@/components/analytics/ImpactAnalytics";
import { CommunityReportModal } from "@/components/modals/CommunityReportModal";
import { AboutScienceModal } from "@/components/modals/AboutScienceModal";
import { AttributionModal } from "@/components/modals/AttributionModal";
import { UserGuideModal } from "@/components/modals/UserGuideModal";
import { useAppStore } from "@/lib/store";
import { AlertCircle, X, Flame } from "lucide-react";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    activeTab,
    toggleLayer,
    setIsReportModalOpen,
    setIsGuideModalOpen,
    activeNotification,
    setActiveNotification
  } = useAppStore();

  // Auto-launch User Guide on first visit
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("terrashield_guide_viewed");
    if (!hasSeenGuide) {
      setIsGuideModalOpen(true);
      localStorage.setItem("terrashield_guide_viewed", "true");
    }
  }, [setIsGuideModalOpen]);

  // Keyboard shortcut listener per specification:
  // "/" for search, "L" for layer toggle, "R" for report, "?" for guide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        toggleLayer("fires");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setIsReportModalOpen(true);
      } else if (e.key === "?" || e.key === "h" || e.key === "H") {
        e.preventDefault();
        setIsGuideModalOpen(true);
      } else if (e.key === "Escape") {
        setActiveNotification(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleLayer, setIsReportModalOpen, setIsGuideModalOpen, setActiveNotification]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Global Command Center Navigation TopBar */}
      <TopBar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Dynamic Command Center View Content */}
        <main className="flex-1 overflow-hidden relative bg-slate-950">
          {activeTab === "map" && <ThreatMap />}
          {activeTab === "dashboard" && <RiskForecast />}
          {activeTab === "alerts" && <AlertPanel />}
          {activeTab === "evacuation" && <EvacuationOptimizer />}
          {activeTab === "analytics" && <ImpactAnalytics />}
        </main>
      </div>

      {/* Emergency Broadcast Toast Alert */}
      {activeNotification && (
        <div className="fixed top-20 right-6 z-50 max-w-md w-full bg-rose-950/95 border-2 border-rose-600 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center animate-ping absolute" />
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center relative">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-200">
                  {activeNotification.title}
                </h4>
                <span className="text-[10px] text-rose-300/80 font-mono">
                  PRIORITY 1 DISASTER DIRECTIVE
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveNotification(null)}
              className="text-rose-400 hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-rose-100 leading-relaxed font-medium">
            {activeNotification.message}
          </p>
          <div className="mt-3 flex justify-end space-x-2 text-xs">
            <button
              onClick={() => setActiveNotification(null)}
              className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-900 border border-rose-700/60 rounded-lg text-rose-200"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <CommunityReportModal />
      <AboutScienceModal />
      <AttributionModal />
      <UserGuideModal />
    </div>
  );
}
