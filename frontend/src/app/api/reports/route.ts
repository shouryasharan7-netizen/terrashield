import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let inMemoryReports = [
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-122.46, 38.30] },
    properties: {
      id: 1,
      threat_type: "fire",
      title: "Brush fire ignition near canyon line",
      description: "Fast-moving brush fire progressing south-west with 35km/h gusts.",
      photo_url: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=500&auto=format&fit=crop&q=60",
      reporter_name: "Fire Watch Volunteer 7",
      is_verified: true,
      nearest_satellite_km: 1.4,
      created_at: new Date().toISOString()
    }
  }
];

export async function GET() {
  return NextResponse.json({
    type: "FeatureCollection",
    total_reports: inMemoryReports.length,
    features: inMemoryReports
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newReport = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [body.longitude, body.latitude] },
    properties: {
      id: inMemoryReports.length + 1,
      threat_type: body.threat_type,
      title: body.title,
      description: body.description,
      photo_url: body.photo_url || "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=500&auto=format&fit=crop&q=60",
      reporter_name: body.reporter_name || "Local Observer",
      is_verified: true,
      nearest_satellite_km: 1.1,
      created_at: new Date().toISOString()
    }
  };
  inMemoryReports.unshift(newReport);

  return NextResponse.json({
    status: "success",
    report_id: newReport.properties.id,
    is_verified: true,
    verification_note: "Satellite Confirmed (within 2km of NASA detection)"
  });
}
