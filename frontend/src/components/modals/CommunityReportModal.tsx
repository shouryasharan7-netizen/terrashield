"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { submitReport } from "@/lib/api";
import { X, AlertTriangle, Camera, CheckCircle2, Send, MapPin } from "lucide-react";

export const CommunityReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen } = useAppStore();
  const [threatType, setThreatType] = useState("fire");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("37.7749");
  const [lon, setLon] = useState("-122.4194");
  const [reporterName, setReporterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  if (!isReportModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitReport({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        threat_type: threatType,
        title: title || `${threatType.toUpperCase()} Ground Hazard`,
        description: description,
        reporter_name: reporterName || "Local Observer"
      });
      setSubmissionResult(res);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setSubmissionResult(null);
        setTitle("");
        setDescription("");
      }, 2500);
    } catch (err) {
      console.error("Report submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              File Crowd-Sourced Hazard Report
            </h2>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submissionResult ? (
          <div className="p-6 text-center space-y-3 bg-slate-950 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-bold text-slate-100 text-sm">
              Hazard Report Successfully Broadcast!
            </div>
            <p className="text-xs text-slate-300">
              {submissionResult.verification_note}
            </p>
            {submissionResult.is_verified && (
              <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/40">
                ✓ VERIFIED BY NASA SATELLITE
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Hazard Category</label>
              <div className="grid grid-cols-4 gap-2">
                {["fire", "smoke", "flood", "deforestation"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setThreatType(type)}
                    className={`py-2 rounded-lg font-bold uppercase text-[10px] transition-all border ${
                      threatType === type
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/30"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Headline / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Ridge Fire Ignition Observed"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Field Observations / Description</label>
              <textarea
                required
                rows={3}
                placeholder="Describe flame height, smoke drift direction, speed of progression, or assets threatened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Observer Identity (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ranger Station 4 / Citizen Watch"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg shadow-rose-900/30 flex items-center justify-center space-x-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Broadcasting..." : "Submit to Live Map (Auto-Verify)"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
