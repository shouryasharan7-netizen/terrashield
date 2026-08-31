"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { X, Satellite, Cpu, Wind, ShieldAlert, Sparkles, Activity } from "lucide-react";

export const AboutScienceModal: React.FC = () => {
  const { isScienceModalOpen, setIsScienceModalOpen } = useAppStore();
  if (!isScienceModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Satellite className="w-6 h-6 text-sky-400" />
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
              About The Science & Methodology
            </h2>
          </div>
          <button
            onClick={() => setIsScienceModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Satellite Radiance */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>1. Satellite Infrared Thermal Detection (NASA FIRMS)</span>
            </div>
            <p>
              TerraShield ingests data from the <strong>VIIRS (Visible Infrared Imaging Radiometer Suite)</strong> on Suomi-NPP and NOAA-20 satellites, paired with NASA’s <strong>MODIS (Moderate Resolution Imaging Spectroradiometer)</strong> aboard Terra and Aqua satellites.
            </p>
            <p className="text-slate-400">
              Sensors monitor mid-infrared (3.9 µm) and thermal infrared (11 µm) spectral radiances. Pixel temperatures exceeding ambient background thresholds calculate <strong>Fire Radiative Power (FRP, measured in Megawatts)</strong>, which correlates linearly with fuel combustion rates and instantaneous carbon emissions.
            </p>
          </div>

          {/* Section 2: Machine Learning Fire Risk Model */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>2. Scikit-Learn Fire Risk Prediction & Uncertainty Quantification</span>
            </div>
            <p>
              The predictive engine utilizes a <strong>Random Forest Regressor (100 ensemble trees)</strong> calibrated against the Canadian Forest Fire Weather Index (FWI) and McArthur Forest Fire Danger Index (FFDI).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Maximum Ambient Temperature (°C):</strong> Drives fuel drying rates and atmospheric instability.</li>
              <li><strong>Minimum Relative Humidity (%):</strong> Determines 1-hour and 10-hour fine dead fuel moisture.</li>
              <li><strong>Sustained Wind Speed (km/h):</strong> Governs oxygen flux into the combustion zone and ember spotting distances.</li>
              <li><strong>24-Hour Precipitation (mm):</strong> Provides logarithmic suppression to the surface fire danger index.</li>
              <li><strong>Ensemble Confidence Bounds:</strong> Derived from standard deviation across the 100 individual decision tree estimates, generating a 90% confidence envelope (±1.645σ).</li>
            </ul>
          </div>

          {/* Section 3: Evacuation Corridor & Avoidance Buffer */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>3. 10km Spatial Deflection & Evacuation Routing</span>
            </div>
            <p>
              When calculating evacuation routes, standard road networks are dynamically intersected with 10-kilometer radial hazard cylinders surrounding all active fire detections. The algorithm computes orthogonal vector deflections to steer paths away from radiant heat zones, toxic smoke plumes, and potential roadway flame impingements.
            </p>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={() => setIsScienceModalOpen(false)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
