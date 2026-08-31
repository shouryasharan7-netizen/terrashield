export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface FireFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    id: number;
    brightness: number;
    confidence: string;
    frp: number;
    satellite: string;
    scan_time: string;
    source: string;
    daynight: string;
  };
}

export interface AirQualityFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    station_name: string;
    aqi: number;
    category: string;
    color: string;
    pm2_5: number;
    pm10: number;
    co: number;
    no2: number;
    measured_at: string;
    source: string;
  };
}

export interface CommunityReportFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    threat_type: string;
    title: string;
    description: string;
    photo_url: string;
    reporter_name: string;
    is_verified: boolean;
    nearest_satellite_km: number | null;
    created_at: string;
  };
}

export async function fetchFires(limit = 600) {
  const res = await fetch(`${API_BASE}/api/fires?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch active fires");
  return res.json();
}

export async function fetchAirQuality() {
  const res = await fetch(`${API_BASE}/api/air-quality`);
  if (!res.ok) throw new Error("Failed to fetch air quality");
  return res.json();
}

export async function fetchPredictRisk(lat: number, lon: number, locationName: string) {
  const res = await fetch(`${API_BASE}/api/predictions/predict-risk?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(locationName)}`);
  if (!res.ok) throw new Error("Failed to compute risk prediction");
  return res.json();
}

export async function fetchEvacuationRoute(startLat: number, startLon: number, endLat: number, endLon: number, bufferKm = 10.0) {
  const res = await fetch(`${API_BASE}/api/evacuation/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}&safety_buffer_km=${bufferKm}`);
  if (!res.ok) throw new Error("Failed to optimize evacuation route");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error("Failed to fetch geofence alerts");
  return res.json();
}

export async function createAlertGeofence(payload: {
  user_location: string;
  center_lat: number;
  center_lon: number;
  radius_km: number;
  threshold_score: number;
}) {
  const res = await fetch(`${API_BASE}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to save geofence");
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/api/reports`);
  if (!res.ok) throw new Error("Failed to fetch community reports");
  return res.json();
}

export async function submitReport(payload: {
  latitude: number;
  longitude: number;
  threat_type: string;
  title: string;
  description: string;
  photo_url?: string;
  reporter_name?: string;
}) {
  const res = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to submit community report");
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/api/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
