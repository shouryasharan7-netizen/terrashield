import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const activeFires = 600;
  const acresBurned = 14700;
  const acresSaved = 19200;
  const co2 = acresBurned * 5.5;

  const today = new Date();
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    trend.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fire_detections: Math.round(activeFires * (0.12 + 0.03 * (7 - i))),
      air_quality_index: 68 + (i % 3) * 5
    });
  }

  return NextResponse.json({
    active_fires_today: activeFires,
    estimated_acres_burned: acresBurned,
    acres_protected_early_detection: acresSaved,
    estimated_co2_metric_tons: Math.round(co2),
    average_aqi: 58.4,
    communities_at_risk_count: 18,
    deforestation_signals_count: 420,
    total_frp_megawatts: 18892.0,
    community_reports_count: 12,
    seven_day_trend: trend
  });
}
