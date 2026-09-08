"use client";

import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { riskColorVar } from "@/lib/utils";

export function NetworkMap() {
  const router = useRouter();
  const { stations } = useAppContext();
  const width = 960;
  const height = 430;
  const pad = 48;
  const lats = stations.map((s) => s.lat);
  const lons = stations.map((s) => s.lon);
  const minLat = Math.min(...lats, -5.5);
  const maxLat = Math.max(...lats, -1.0);
  const minLon = Math.min(...lons, 34.0);
  const maxLon = Math.max(...lons, 41.0);
  const x = (lon: number) => pad + ((lon - minLon) / Math.max(maxLon - minLon, 1)) * (width - pad * 2);
  const y = (lat: number) => height - pad - ((lat - minLat) / Math.max(maxLat - minLat, 1)) * (height - pad * 2);
  const route = [...stations].sort((a, b) => a.km_from_mombasa - b.km_from_mombasa);

  return (
    <div className="relative overflow-hidden rounded-squircle-lg border border-border bg-[#eef3f7]">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="430" role="img" aria-label="Geographic pipeline network map">
        <defs><pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d8e1e8" strokeWidth="1" /></pattern></defs>
        <rect width={width} height={height} fill="url(#map-grid)" />
        <path d={route.map((s, i) => `${i ? "L" : "M"} ${x(s.lon)} ${y(s.lat)}`).join(" ")} fill="none" stroke="#7f9aaa" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity=".25" />
        <path d={route.map((s, i) => `${i ? "L" : "M"} ${x(s.lon)} ${y(s.lat)}`).join(" ")} fill="none" stroke="#668798" strokeWidth="2.5" strokeDasharray="5 5" />
        {stations.map((station) => <g key={station.code} className="cursor-pointer" onClick={() => router.push(`/pumps?station=${encodeURIComponent(station.code)}`)} tabIndex={0} role="button" aria-label={`${station.code} ${station.name}`}>
          <circle cx={x(station.lon)} cy={y(station.lat)} r={station.alert ? 11 : 8} fill={riskColorVar(station.max_risk)} stroke="white" strokeWidth="3" />
          <text x={x(station.lon)} y={y(station.lat) - 17} textAnchor="middle" fontSize="12" fontWeight="700" fill="#263640">{station.code}</text>
        </g>)}
        <text x={pad} y={height - 16} fontSize="11" fill="#637783">Approximate station coordinates · click a station to view its pumps</text>
      </svg>
      <div className="absolute right-4 top-4 rounded-squircle bg-white/85 px-3 py-2 text-[11px] shadow-soft backdrop-blur-sm">
        <p className="mb-1 font-bold text-text">Network status</p>
        <p className="text-text-mute">{stations.length} stations · {stations.reduce((sum, s) => sum + s.pump_count, 0)} pumps</p>
      </div>
    </div>
  );
}
