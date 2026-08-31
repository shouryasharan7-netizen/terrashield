import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let inMemoryAlerts = [
  {
    id: 1,
    user_location: "Sonoma Valley Community",
    center: [-122.458, 38.2919],
    radius_km: 25,
    status: "BREACHED",
    threats_count: 3,
    threats: [
      { fire_id: 104, lat: 38.31, lon: -122.42, brightness: 345.2, frp: 84.1, distance_km: 4.2 },
      { fire_id: 109, lat: 38.25, lon: -122.50, brightness: 328.0, frp: 42.5, distance_km: 6.8 }
    ],
    created_at: new Date().toISOString(),
    recommended_action: "Evacuate immediately via designated West corridors"
  },
  {
    id: 2,
    user_location: "Marin County Foothills",
    center: [-122.55, 37.97],
    radius_km: 20,
    status: "CLEAR",
    threats_count: 0,
    threats: [],
    created_at: new Date().toISOString(),
    recommended_action: "Monitor perimeter conditions normally"
  }
];

export async function GET() {
  return NextResponse.json({
    total_rules: inMemoryAlerts.length,
    active_monitoring: inMemoryAlerts
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newRule = {
    id: inMemoryAlerts.length + 1,
    user_location: body.user_location,
    center: [body.center_lon, body.center_lat],
    radius_km: body.radius_km || 25,
    status: "CLEAR",
    threats_count: 0,
    threats: [],
    created_at: new Date().toISOString(),
    recommended_action: "Sensor Armed. Continuous satellite perimeter surveillance active."
  };
  inMemoryAlerts.unshift(newRule);
  return NextResponse.json({ status: "created", rule_id: newRule.id, location: newRule.user_location });
}
