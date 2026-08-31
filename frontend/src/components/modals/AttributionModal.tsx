"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { X, ExternalLink, Globe, Database } from "lucide-react";

export const AttributionModal: React.FC = () => {
  const { isAttributionModalOpen, setIsAttributionModalOpen } = useAppStore();
  if (!isAttributionModalOpen) return null;

  const SOURCES = [
    {
      name: "NASA FIRMS (Fire Information for Resource Management System)",
      agency: "NASA Earth Science Data and Information System (ESDIS)",
      instruments: "VIIRS (Suomi-NPP / NOAA-20) & MODIS (Terra / Aqua)",
      role: "Near-Real-Time (NRT) active fire detection, FRP, and thermal anomaly coordinates.",
      url: "https://firms.modaps.eosdis.nasa.gov/"
    },
    {
      name: "OpenAQ & Open-Meteo European Atmosphere Service",
      agency: "OpenAQ Open Data Initiative / ECMWF Copernicus Atmosphere Monitoring",
      instruments: "Ground Air Quality Monitoring Stations & Optical Particle Counters",
      role: "US AQI, PM2.5, PM10, Carbon Monoxide, Nitrogen Dioxide, and Sulphur Dioxide levels.",
      url: "https://openaq.org/"
    },
    {
      name: "Open-Meteo High-Resolution Ensemble Service",
      agency: "NOAA GFS / DWD ICON / ECMWF Meteorological Models",
      instruments: "Numerical Weather Prediction & Surface In-Situ Stations",
      role: "Real-time surface temperature, relative humidity, wind speed, and 7-day predictive forecasts.",
      url: "https://open-meteo.com/"
    },
    {
      name: "Global Forest Watch & ESA Sentinel-2",
      agency: "World Resources Institute / European Space Agency",
      instruments: "Multi-Spectral Instrument (MSI) & Radar Synthetic Aperture",
      role: "Tree canopy loss indicators, forest perimeter depletion, and illegal logging risk zones.",
      url: "https://www.globalforestwatch.org/"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Database className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
              Data Attribution & Sensor Transparency
            </h2>
          </div>
          <button
            onClick={() => setIsAttributionModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {SOURCES.map((s, idx) => (
            <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{s.name}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">{s.agency}</p>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-slate-400"><strong>Sensors:</strong> {s.instruments}</p>
              <p className="text-slate-300"><strong>Platform Role:</strong> {s.role}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={() => setIsAttributionModalOpen(false)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
