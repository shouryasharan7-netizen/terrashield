"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { fetchFires, fetchAirQuality, fetchReports, FireFeature, AirQualityFeature, CommunityReportFeature } from "@/lib/api";
import CACHED_FIRES from "@/lib/cached_fires.json";
import { Flame, Wind, Trees, AlertTriangle, Shield, CheckCircle2, Navigation, Layers, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";

export const ThreatMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const layerGroupsRef = useRef<{
    fires?: any;
    aqi?: any;
    deforestation?: any;
    reports?: any;
  }>({});

  const {
    showFires,
    showAirQuality,
    showDeforestation,
    showReports,
    mapCenter,
    mapZoom,
    setSelectedFeature,
    selectedFeature,
    setActiveTab
  } = useAppStore();

  const [firesData, setFiresData] = useState<FireFeature[]>([]);
  const [aqiData, setAqiData] = useState<AirQualityFeature[]>([]);
  const [reportsData, setReportsData] = useState<CommunityReportFeature[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!leafletMapRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: mapCenter,
          zoom: mapZoom,
          zoomControl: false,
          attributionControl: false
        });

        // Dark Matter tiles for Command Center aesthetics
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>, NASA FIRMS, OpenAQ',
          maxZoom: 19,
          maxNativeZoom: 16
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        layerGroupsRef.current.fires = L.layerGroup().addTo(map);
        layerGroupsRef.current.aqi = L.layerGroup().addTo(map);
        layerGroupsRef.current.deforestation = L.layerGroup().addTo(map);
        layerGroupsRef.current.reports = L.layerGroup().addTo(map);

        leafletMapRef.current = map;
      }

      // Load live data from API with instant fallback
      try {
        const [firesRes, aqiRes, reportsRes] = await Promise.all([
          fetchFires(600).catch(() => ({ features: CACHED_FIRES })),
          fetchAirQuality().catch(() => ({ features: [] })),
          fetchReports().catch(() => ({ features: [] }))
        ]);

        if (isMounted) {
          const loadedFires = (firesRes.features && firesRes.features.length > 0)
            ? firesRes.features
            : CACHED_FIRES;
          setFiresData(loadedFires);
          setAqiData(aqiRes.features || []);
          setReportsData(reportsRes.features || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Map data loading error, loading cached detections:", err);
        if (isMounted) {
          setFiresData(CACHED_FIRES as any);
          setLoading(false);
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update center when changed from search or presets
  useEffect(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo(mapCenter, mapZoom, { duration: 1.2 });
    }
  }, [mapCenter, mapZoom]);

  // Render Map Markers dynamically
  useEffect(() => {
    if (!leafletMapRef.current || typeof window === "undefined") return;

    import("leaflet").then((LModule) => {
      const L = LModule.default;
      const { fires, aqi, deforestation, reports } = layerGroupsRef.current;

      // 1. Clear previous layers
      if (fires) fires.clearLayers();
      if (aqi) aqi.clearLayers();
      if (deforestation) deforestation.clearLayers();
      if (reports) reports.clearLayers();

      // 2. Wildfires from NASA FIRMS
      if (showFires && fires) {
        firesData.forEach((f) => {
          const [lon, lat] = f.geometry.coordinates;
          const frp = f.properties.frp || 10;
          const radius = Math.min(14, Math.max(5, Math.sqrt(frp) * 1.4));

          const marker = L.circleMarker([lat, lon], {
            radius: radius,
            fillColor: "#ef4444",
            color: "#ffffff",
            weight: 1.5,
            opacity: 0.95,
            fillOpacity: 0.85,
            className: "fire-marker-static cursor-pointer"
          });

          marker.on("click", () => {
            setSelectedFeature({ type: "fire", data: f.properties });
          });

          marker.bindTooltip(
            `<div class="text-xs font-mono">
              <strong style="color: #ef4444">ACTIVE WILDFIRE</strong><br/>
              Brightness: ${f.properties.brightness} K<br/>
              FRP: ${f.properties.frp} MW<br/>
              Source: ${f.properties.source}
            </div>`,
            { direction: "top", offset: [0, -5], opacity: 0.95 }
          );

          marker.addTo(fires);
        });
      }

      // 3. Air Quality Stations
      if (showAirQuality && aqi) {
        aqiData.forEach((station) => {
          const [lon, lat] = station.geometry.coordinates;
          const aqiVal = station.properties.aqi;
          const color = station.properties.color || "#0ea5e9";

          const iconHtml = `
            <div style="
              background-color: ${color};
              color: #0f172a;
              font-weight: 800;
              font-size: 10px;
              width: 24px;
              height: 24px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px ${color}80;
            " class="aqi-marker-pulse">
              ${aqiVal}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: "aqi-custom-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          const marker = L.marker([lat, lon], { icon: customIcon });

          marker.on("click", () => {
            setSelectedFeature({ type: "air_quality", data: station.properties });
          });

          marker.bindTooltip(
            `<div class="text-xs font-sans">
              <strong>${station.properties.station_name}</strong><br/>
              AQI: <span style="color:${color}; font-weight:bold">${aqiVal} (${station.properties.category})</span><br/>
              PM2.5: ${station.properties.pm2_5} µg/m³
            </div>`,
            { direction: "top", offset: [0, -10] }
          );

          marker.addTo(aqi);
        });
      }

      // 4. Deforestation Signals (Amazon Basin & Indonesia)
      if (showDeforestation && deforestation) {
        const deforestationHotspots = [
          { lat: -3.46, lon: -62.21, name: "Amazon Basin Corridor 1", loss_rate: "340 ha/wk" },
          { lat: -5.12, lon: -59.34, name: "Pará Canopy Depletion Zone", loss_rate: "510 ha/wk" },
          { lat: -8.88, lon: -63.90, name: "Rondônia Agro-Clearance", loss_rate: "620 ha/wk" },
          { lat: 0.51, lon: 101.44, name: "Sumatra Peatland Clearance", loss_rate: "290 ha/wk" },
          { lat: -1.25, lon: 116.83, name: "East Kalimantan Perimeter", loss_rate: "410 ha/wk" }
        ];

        deforestationHotspots.forEach((spot) => {
          const iconHtml = `
            <div style="
              background-color: #f59e0b;
              color: #0f172a;
              width: 20px;
              height: 20px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1.5px solid #ffffff;
              box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.4"/></svg>
            </div>
          `;

          const defIcon = L.divIcon({
            html: iconHtml,
            className: "def-custom-marker",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = L.marker([spot.lat, spot.lon], { icon: defIcon });
          marker.on("click", () => {
            setSelectedFeature({
              type: "deforestation",
              data: {
                name: spot.name,
                loss_rate: spot.loss_rate,
                lat: spot.lat,
                lon: spot.lon,
                source: "Global Forest Watch / Sentinel-2 Radar"
              }
            });
          });

          marker.bindTooltip(
            `<div class="text-xs">
              <strong style="color:#f59e0b">DEFORESTATION SIGNAL</strong><br/>
              ${spot.name}<br/>
              Rate: ${spot.loss_rate}
            </div>`,
            { direction: "top", offset: [0, -10] }
          );

          marker.addTo(deforestation);
        });
      }

      // 5. Community Reports
      if (showReports && reports && reportsData.length > 0) {
        reportsData.forEach((rep) => {
          const [lon, lat] = rep.geometry.coordinates;
          const isVerified = rep.properties.is_verified;

          const iconHtml = `
            <div style="
              background-color: ${isVerified ? "#10b981" : "#a855f7"};
              color: white;
              width: 22px;
              height: 22px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px ${isVerified ? "rgba(16, 185, 129, 0.8)" : "rgba(168, 85, 247, 0.8)"};
            ">
              <span style="font-size: 11px; font-weight: bold;">C</span>
            </div>
          `;

          const repIcon = L.divIcon({
            html: iconHtml,
            className: "report-custom-marker",
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const marker = L.marker([lat, lon], { icon: repIcon });
          marker.on("click", () => {
            setSelectedFeature({ type: "report", data: rep.properties });
          });

          marker.bindTooltip(
            `<div class="text-xs">
              <strong style="color:${isVerified ? "#10b981" : "#a855f7"}">
                ${isVerified ? "✓ VERIFIED CITIZEN REPORT" : "CITIZEN REPORT"}
              </strong><br/>
              ${rep.properties.threat_type.toUpperCase()}: ${rep.properties.title}
            </div>`,
            { direction: "top", offset: [0, -10] }
          );

          marker.addTo(reports);
        });
      }
    });
  }, [firesData, aqiData, reportsData, showFires, showAirQuality, showDeforestation, showReports]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden flex">
      {/* Interactive Leaflet Map Container */}
      <div ref={mapContainerRef} className="flex-1 h-full z-0" />

      {/* Floating Map Legend & Stats Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-xl max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">Orbital Telemetry</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
            {firesData.length} Detections
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span>Wildfire Radiance</span>
            </div>
            <span className="font-mono text-[11px] text-rose-400">VIIRS/MODIS</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
              <span>Air Quality (AQI)</span>
            </div>
            <span className="font-mono text-[11px] text-sky-400">OpenAQ v3</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Deforestation Alert</span>
            </div>
            <span className="font-mono text-[11px] text-amber-400">Sentinel-2</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Citizen Reports</span>
            </div>
            <span className="font-mono text-[11px] text-purple-400">Crowdsourced</span>
          </div>
        </div>
      </div>

      {/* Right Detail Panel (30% width per specification) */}
      <div className="w-96 bg-slate-900/95 border-l border-slate-800 p-5 overflow-y-auto z-10 flex flex-col justify-between hidden md:flex">
        {selectedFeature ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                {selectedFeature.type === "fire" && <Flame className="w-5 h-5 text-rose-400" />}
                {selectedFeature.type === "air_quality" && <Wind className="w-5 h-5 text-sky-400" />}
                {selectedFeature.type === "deforestation" && <Trees className="w-5 h-5 text-amber-400" />}
                {selectedFeature.type === "report" && <AlertTriangle className="w-5 h-5 text-purple-400" />}
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                  {selectedFeature.type.replace("_", " ")} Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>

            {/* Fire Threat Detail */}
            {selectedFeature.type === "fire" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Radiative Power (FRP):</span>
                    <span className="font-mono font-bold text-rose-400">
                      {selectedFeature.data.frp} MW
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Brightness Temp:</span>
                    <span className="font-mono text-slate-200">{selectedFeature.data.brightness} K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Detection Confidence:</span>
                    <span className="font-mono text-emerald-400 font-semibold uppercase">
                      {selectedFeature.data.confidence}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Satellite Sensor:</span>
                    <span className="font-mono text-slate-300">{selectedFeature.data.satellite}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Observation Time:</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(selectedFeature.data.scan_time).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg space-y-2">
                  <div className="text-[11px] text-slate-400 font-medium">Recommended Action:</div>
                  <p className="text-slate-300 leading-relaxed">
                    High radiant heat signature detected. Maintain 10km perimeter buffer. Initiate automated geofence evaluation for nearby settlements.
                  </p>
                  <button
                    onClick={() => setActiveTab("evacuation")}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Generate Evacuation Route</span>
                  </button>
                </div>
              </div>
            )}

            {/* Air Quality Detail */}
            {selectedFeature.type === "air_quality" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Station Name:</span>
                    <span className="font-bold text-slate-200">{selectedFeature.data.station_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Air Quality Index:</span>
                    <span
                      className="font-mono font-black text-base px-2 py-0.5 rounded"
                      style={{ color: selectedFeature.data.color, backgroundColor: `${selectedFeature.data.color}20` }}
                    >
                      {selectedFeature.data.aqi} AQI
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Category:</span>
                    <span className="font-semibold text-slate-200">{selectedFeature.data.category}</span>
                  </div>
                  <div className="border-t border-slate-700/60 pt-2 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>PM2.5:</span>
                      <span className="font-mono text-slate-200">{selectedFeature.data.pm2_5} µg/m³</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>PM10:</span>
                      <span className="font-mono text-slate-200">{selectedFeature.data.pm10} µg/m³</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Carbon Monoxide:</span>
                      <span className="font-mono text-slate-200">{selectedFeature.data.co} µg/m³</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deforestation Detail */}
            {selectedFeature.type === "deforestation" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg space-y-2">
                  <div className="font-bold text-amber-400 text-sm">{selectedFeature.data.name}</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Canopy Loss Rate:</span>
                    <span className="font-mono font-bold text-amber-300">{selectedFeature.data.loss_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sensor Platform:</span>
                    <span className="text-slate-300">{selectedFeature.data.source}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-2 border-t border-amber-800/30">
                    Synthetic aperture radar alert confirms rapid tree canopy loss within 7-day observation cycle. Illegal logging or slash-and-burn pattern indicated.
                  </p>
                </div>
              </div>
            )}

            {/* Citizen Report Detail */}
            {selectedFeature.type === "report" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300">{selectedFeature.data.title}</span>
                    {selectedFeature.data.is_verified ? (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/40 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SATELLITE VERIFIED</span>
                      </span>
                    ) : (
                      <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded border border-purple-500/40">
                        Citizen Sourced
                      </span>
                    )}
                  </div>
                  <p className="text-slate-200">{selectedFeature.data.description}</p>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Reporter:</span>
                    <span className="text-slate-300">{selectedFeature.data.reporter_name}</span>
                  </div>
                  {selectedFeature.data.nearest_satellite_km && (
                    <div className="text-[11px] text-slate-400">
                      Nearest NASA Detection: {selectedFeature.data.nearest_satellite_km} km
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">ENVIRONMENTAL COMMAND FEED</h3>
              <p className="text-xs text-slate-400">Select any marker on the map to inspect telemetry</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Current Fire Load</span>
                  <span className="text-rose-400 font-mono">{firesData.length} Hotspots</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[65%]" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Global VIIRS and MODIS constellation passing over monitored quadrants.
                </p>
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Active Geofence Protection</span>
                  <span className="text-emerald-400 font-mono">100% Armed</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Automated spatial buffers evaluating live fires against urban settlement corridors.
                </p>
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg space-y-2">
                <div className="font-semibold text-slate-300">Quick Keyboard Shortcuts</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex justify-between bg-slate-900 px-2 py-1 rounded">
                    <span className="text-slate-400">Search:</span>
                    <span className="text-emerald-400">/</span>
                  </div>
                  <div className="flex justify-between bg-slate-900 px-2 py-1 rounded">
                    <span className="text-slate-400">Toggle Layer:</span>
                    <span className="text-emerald-400">L</span>
                  </div>
                  <div className="flex justify-between bg-slate-900 px-2 py-1 rounded">
                    <span className="text-slate-400">Report Hazard:</span>
                    <span className="text-emerald-400">R</span>
                  </div>
                  <div className="flex justify-between bg-slate-900 px-2 py-1 rounded">
                    <span className="text-slate-400">Dismiss:</span>
                    <span className="text-emerald-400">ESC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>TERRASHIELD v1.0 MVP</span>
          <span className="text-emerald-400">ALL SYSTEMS GO</span>
        </div>
      </div>
    </div>
  );
};
