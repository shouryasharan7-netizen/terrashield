import { create } from "zustand";
import { FireFeature, AirQualityFeature, CommunityReportFeature } from "./api";

export type ActiveTab = "map" | "dashboard" | "alerts" | "evacuation" | "analytics";

export interface SelectedFeature {
  type: "fire" | "air_quality" | "report" | "deforestation";
  data: any;
}

interface AppState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Layer filters
  showFires: boolean;
  showAirQuality: boolean;
  showDeforestation: boolean;
  showReports: boolean;
  toggleLayer: (layer: "fires" | "aqi" | "deforestation" | "reports") => void;

  // Map view & selection
  mapCenter: [number, number]; // [lat, lon]
  mapZoom: number;
  setMapCenter: (center: [number, number], zoom?: number) => void;
  selectedFeature: SelectedFeature | null;
  setSelectedFeature: (feature: SelectedFeature | null) => void;

  // Modals
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  isScienceModalOpen: boolean;
  setIsScienceModalOpen: (open: boolean) => void;
  isAttributionModalOpen: boolean;
  setIsAttributionModalOpen: (open: boolean) => void;
  isGuideModalOpen: boolean;
  setIsGuideModalOpen: (open: boolean) => void;

  // Active toast / notification siren
  activeNotification: {
    id: string;
    title: string;
    message: string;
    severity: "warning" | "emergency" | "info";
  } | null;
  setActiveNotification: (notif: { id: string; title: string; message: string; severity: "warning" | "emergency" | "info" } | null) => void;

  // Last refresh timestamp
  lastRefreshTime: string;
  setLastRefreshTime: (t: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "map",
  setActiveTab: (tab) => set({ activeTab: tab }),

  showFires: true,
  showAirQuality: true,
  showDeforestation: true,
  showReports: true,
  toggleLayer: (layer) =>
    set((state) => {
      if (layer === "fires") return { showFires: !state.showFires };
      if (layer === "aqi") return { showAirQuality: !state.showAirQuality };
      if (layer === "deforestation") return { showDeforestation: !state.showDeforestation };
      if (layer === "reports") return { showReports: !state.showReports };
      return {};
    }),

  mapCenter: [37.7749, -122.4194], // California default
  mapZoom: 6,
  setMapCenter: (center, zoom = 6) => set({ mapCenter: center, mapZoom: zoom }),

  selectedFeature: null,
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),

  isReportModalOpen: false,
  setIsReportModalOpen: (open) => set({ isReportModalOpen: open }),

  isScienceModalOpen: false,
  setIsScienceModalOpen: (open) => set({ isScienceModalOpen: open }),

  isAttributionModalOpen: false,
  setIsAttributionModalOpen: (open) => set({ isAttributionModalOpen: open }),

  isGuideModalOpen: true,
  setIsGuideModalOpen: (open) => set({ isGuideModalOpen: open }),

  activeNotification: null,
  setActiveNotification: (notif) => set({ activeNotification: notif }),

  lastRefreshTime: new Date().toLocaleTimeString(),
  setLastRefreshTime: (t) => set({ lastRefreshTime: t }),
}));
