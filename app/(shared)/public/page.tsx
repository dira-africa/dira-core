/*
 * Copyright 2026 Dira Africa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import "leaflet/dist/leaflet.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface NetworkStats {
  totalVerifiedDataPoints: number;
  activeUsers7Days: number;
  countiesCovered: number;
  cropSubmissionsMonth: number;
  tokensDisbursedKes: number;
}

interface CoverageGrid {
  lon: number;
  lat: number;
  density: number;
}

interface EconomySummary {
  airtime30Days: number;
  vouchersAllTime: number;
  circleAllTime: number;
  mpesaAllTime: number;
}

interface ActivityEvent {
  role: "farmer" | "agent";
  county: string;
  cropType: string | null;
  timestamp: string;
}

interface QualityMetric {
  day: string;
  pctHigh: number;
  pctMedium: number;
  pctLow: number;
  networkConsensusRate: number;
}

interface HederaAnchor {
  weekNumber: number;
  batchHash: string;
  hcsTxId?: string;
  hcsSequenceNumber?: string;
  htsTxId?: string;
  anchoredAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_FASTIFY_API_URL ||
  "http://localhost:3001";

// Local translation dictionary for the public dashboard
const localT = {
  en: {
    title: "Dira Live Network Dashboard",
    subtitle: "Real-time weather sensing & circular economy activity across Kenya",
    langLabel: "Language",
    verifiedPoints: "Verified Data Points",
    verifiedPointsDesc: "All-time total weather readings & crop submissions",
    activeUsers: "Active Users (7 Days)",
    activeUsersDesc: "Data Agents & Farmers participating this week",
    counties: "Counties Covered",
    countiesDesc: "Active spatial zones with Dira nodes",
    submissions: "Crop Submissions (Month)",
    submissionsDesc: "Agricultural crop health reports verified",
    disbursed: "Climate Tokens Disbursed",
    disbursedDesc: "Total rewards earned in KES equivalent",
    mapTitle: "Live Data Coverage Map",
    mapActiveCounty: "County borders highlighted in Teal represent active Dira counties.",
    mapHeatmapDesc: "Heatmap grid squares show 30-day verified reading density.",
    mapLoading: "Loading geographic boundary data...",
    economyTitle: "Circular Economy Disbursements",
    economySub: "Aggregated reward cashout distribution across all layers (KES)",
    qualityTitle: "Atmospheric Data Quality & Peer Consensus (30 Days)",
    qualitySub: "Percentage of data points verified vs. peer triangulation rate",
    feedTitle: "Anonymised Activity Feed",
    feedSub: "Live platform verification updates from the field",
    feedFarmer: "A farmer in {county} submitted a verified {crop} photo {time}",
    feedAgent: "A data agent in {county} synced atmospheric readings {time}",
    midnightTitle: "Hedera Blockchain Verification Panel",
    midnightSub: "Weekly Merkle-tree anchoring hashes recorded on the Hedera network",
    midnightWeek: "Week No",
    midnightBatch: "Batch Merkle Root",
    midnightTx: "HCS Tx ID",
    midnightDate: "Anchored Date",
    midnightVerifyBtn: "Verify Independently",
    midnightVerifyInstructionsTitle: "How to Verify Independently",
    midnightVerifyInstructions: "1. Download the raw anonymized CSV batch for the targeted Week Number from Dira's open data archive.\n2. Compute the double SHA-256 Merkle Root of the reading UUIDs sorted alphabetically.\n3. Compare your calculated Merkle Root hash against the 'Batch Merkle Root' stored permanently on the Hedera network.",
    footerText: "Dira Africa is a Decentralised Physical Infrastructure Network (DePIN) turning smartphones into a distributed weather sensing network.",
    footerBadge: "Apache 2.0 License • Open Source for Climate Resilience",
    openApi: "Developer API Docs",
    githubRepo: "GitHub Codebase",
    daysAgo: "days ago",
    minutesAgo: "minutes ago",
    justNow: "just now",
    loading: "Loading dashboard telemetry...",
    refreshes: "Auto-refreshes every 60 seconds",
  },
  sw: {
    title: "Bao la Mtandao la Dira",
    subtitle: "Ufuatiliaji wa hali ya hewa ya muda halisi na shughuli za uchumi wa mzunguko nchini Kenya",
    langLabel: "Lugha",
    verifiedPoints: "Data Zilizothibitishwa",
    verifiedPointsDesc: "Jumla ya vipimo vya hali ya hewa na picha za mazao",
    activeUsers: "Watumiaji Amilifu (Siku 7)",
    activeUsersDesc: "Wakala wa Data na Wakulima wanaoshiriki wiki hii",
    counties: "Kaunti Zinazofikiwa",
    countiesDesc: "Maeneo yenye nodi zinazofanya kazi za Dira",
    submissions: "Picha za Mazao (Mwezi)",
    submissionsDesc: "Ripoti za afya ya mazao zilizothibitishwa",
    disbursed: "Zawadi za Dira Zilizotolewa",
    disbursedDesc: "Jumla ya thamani ya KES iliyotolewa kwa watumiaji",
    mapTitle: "Ramani ya Ufikiaji wa Data",
    mapActiveCounty: "Mipaka ya kaunti yenye rangi ya Teal inaonyesha uendeshaji amilifu.",
    mapHeatmapDesc: "Miraba ya ramani inaonyesha msongamano wa data wa siku 30 zilizopita.",
    mapLoading: "Kupakia data ya mipaka ya kijiografia...",
    economyTitle: "Malipo ya Uchumi wa Mzunguko",
    economySub: "Mchanganuo wa malipo ya zawadi kwenye tabaka zote (KES)",
    qualityTitle: "Ubora wa Data na Makubaliano ya Mtandao (Siku 30)",
    qualitySub: "Asilimia ya data zilizothibitishwa dhidi ya makubaliano ya wakala",
    feedTitle: "Shughuli za Hivi Punde",
    feedSub: "Taarifa za uthibitishaji wa moja kwa moja bila kutaja majina",
    feedFarmer: "Mkulima huko {county} ametuma picha ya {crop} iliyothibitishwa {time}",
    feedAgent: "Wakala wa data huko {county} amesawazisha vipimo vya hewa {time}",
    midnightTitle: "Uthibitishaji wa Hedera Blockchain",
    midnightSub: "Mihuri ya kila wiki ya Merkle-tree iliyohifadhiwa kwenye mtandao wa Hedera",
    midnightWeek: "Wiki",
    midnightBatch: "Chapa ya Merkle Root",
    midnightTx: "Miamala ya HCS",
    midnightDate: "Tarehe ya Muhuri",
    midnightVerifyBtn: "Thibitisha Mwenyewe",
    midnightVerifyInstructionsTitle: "Jinsi ya Kuthibitisha Mwenyewe",
    midnightVerifyInstructions: "1. Pakua faili la CSV la data ya wiki husika kutoka kwenye kumbukumbu ya data ya Dira.\n2. Kokotoa Merkle Root ya UUID za vipimo zilizopangwa kialfabeti kwa kutumia SHA-256.\n3. Linganisha chapa yako ya Merkle Root na 'Chapa ya Merkle Root' iliyohifadhiwa kwenye mtandao salama wa Hedera.",
    footerText: "Dira Africa ni Mtandao wa Miundombinu ya Kifaa ya Kusambazwa (DePIN) inayogeuza simu janja kuwa mtandao wa ufuatiliaji wa hali ya hewa.",
    footerBadge: "Leseni ya Apache 2.0 • Chanzo Wazi kwa Ustahimilivu wa Tabianchi",
    openApi: "Nyaraka za API za Msanidi Programu",
    githubRepo: "Chanzo cha Kificho cha GitHub",
    daysAgo: "siku zilizopita",
    minutesAgo: "dakika zilizopita",
    justNow: "sasa hivi",
    loading: "Kupakia vipimo vya mtandao...",
    refreshes: "Inasasisha kiotomatiki kila sekunde 60",
  }
};

export default function PublicDashboard() {
  const [locale, setLocale] = useState<"en" | "sw">("en");
  const t = localT[locale];

  // Telemetry data states
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [coverageData, setCoverageData] = useState<{ activeCounties: string[]; grids: CoverageGrid[] } | null>(null);
  const [economy, setEconomy] = useState<EconomySummary | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [quality, setQuality] = useState<QualityMetric[]>([]);
  const [anchors, setAnchors] = useState<HederaAnchor[]>([]);

  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [showVerifyGuide, setShowVerifyGuide] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);
  const gridLayersRef = useRef<any[]>([]);

  // 1. Initialise all fetches
  const fetchTelemetry = async () => {
    try {
      const [statsRes, econRes, feedRes, qualRes, anchRes] = await Promise.all([
        fetch(`${API_URL}/public/stats`),
        fetch(`${API_URL}/public/circular-economy-summary`),
        fetch(`${API_URL}/public/activity-feed`),
        fetch(`${API_URL}/public/quality-metrics`),
        fetch(`${API_URL}/public/hedera-anchors`)
      ]);

      const statsJson = await statsRes.json();
      const econJson = await econRes.json();
      const feedJson = await feedRes.json();
      const qualJson = await qualRes.json();
      const anchJson = await anchRes.json();

      if (statsJson.success) setStats(statsJson.stats);
      if (econJson.success) setEconomy(econJson.summary);
      if (feedJson.success) setActivities(feedJson.activities);
      if (qualJson.success) setQuality(qualJson.metrics);
      if (anchJson.success) setAnchors(anchJson.anchors);

      setLoading(false);
    } catch (err) {
      console.error("Dashboard telemetry load failure:", err);
    }
  };

  const fetchMapData = async () => {
    try {
      const res = await fetch(`${API_URL}/public/coverage-map`);
      const json = await res.json();
      if (json.success) {
        setCoverageData({
          activeCounties: json.activeCounties,
          grids: json.grids
        });
      }
    } catch (err) {
      console.error("Map coverage load failure:", err);
    }
  };

  // 2. Telemetry polling (60s loop)
  useEffect(() => {
    fetchTelemetry();
    fetchMapData();

    const telemetryInterval = setInterval(fetchTelemetry, 60000);
    const mapInterval = setInterval(fetchMapData, 300000); // 5 min map sync
    const feedInterval = setInterval(async () => {
      // Shorter feed polling interval
      try {
        const feedRes = await fetch(`${API_URL}/public/activity-feed`);
        const feedJson = await feedRes.json();
        if (feedJson.success) setActivities(feedJson.activities);
      } catch (e) {
        // Ignore feed errors during telemetry loop
      }
    }, 30000); // 30s feed loop

    return () => {
      clearInterval(telemetryInterval);
      clearInterval(mapInterval);
      clearInterval(feedInterval);
    };
  }, []);

  // 3. Leaflet GeoJSON County & Grid Map Setup
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix icon issues in leaflet
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Create map if not initialised
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [0.0236, 37.9062], // Kenya Center
          zoom: 6,
          zoomControl: true,
          attributionControl: false
        });

        // Dark cartodb tiles matching the glassmorphic aesthetics
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 18
        }).addTo(map);

        mapRef.current = map;
      }

      const map = mapRef.current;

      // Load county GeoJSON boundaries
      fetch("/kenya-counties.json")
        .then((res) => {
          if (!res.ok) throw new Error("GeoJSON not found");
          return res.json();
        })
        .then((countyData) => {
          if (!isMounted || !map) return;
          setMapLoading(false);

          // Remove old boundary layer if any
          if (geoJsonLayerRef.current) {
            map.removeLayer(geoJsonLayerRef.current);
          }

          // Active counties set
          const activeList = coverageData?.activeCounties || [];

          // Render GeoJSON with styling
          const layer = L.geoJSON(countyData, {
            style: (feature: any) => {
              const cName = feature?.properties?.COUNTY_NAM || "";
              const isActive = activeList.some(
                (c) => c.toLowerCase() === cName.toLowerCase()
              );
              return {
                fillColor: isActive ? "#0df2b8" : "#ffffff",
                weight: 1.5,
                opacity: 0.15,
                color: "#ffffff",
                fillOpacity: isActive ? 0.3 : 0.02
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              const cName = feature?.properties?.COUNTY_NAM || "Kaunti";
              layer.bindTooltip(
                `<div class="font-bold text-xs text-black">${cName}</div>`,
                { sticky: true }
              );
            }
          }).addTo(map);

          geoJsonLayerRef.current = layer;

          // Render grids density on top
          // Clean old grid squares
          gridLayersRef.current.forEach((gl) => map.removeLayer(gl));
          gridLayersRef.current = [];

          const grids = coverageData?.grids || [];
          grids.forEach((grid) => {
            const bounds: L.LatLngBoundsExpression = [
              [grid.lat, grid.lon],
              [grid.lat + 0.05, grid.lon + 0.05]
            ];
            let color = "#ef4444"; // low density
            if (grid.density > 20) {
              color = "#0df2b8"; // high density teal
            } else if (grid.density > 5) {
              color = "#eab308"; // medium density amber
            }

            const rect = L.rectangle(bounds, {
              color: color,
              weight: 0.8,
              fillColor: color,
              fillOpacity: 0.35
            }).addTo(map);

            rect.bindTooltip(
              `<div class="text-xs text-black">Density: <b>${grid.density}</b> points</div>`,
              { sticky: true }
            );

            gridLayersRef.current.push(rect);
          });
        })
        .catch((e) => {
          console.error("Leaflet boundary loading failure:", e);
          setMapLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [coverageData]);

  // 4. Utility calculations for formatted timing
  const formatTimeDifference = (timestampStr: string) => {
    const past = new Date(timestampStr);
    const diffMs = Date.now() - past.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return t.justNow;
    if (diffMin < 60) return `${diffMin} ${t.minutesAgo}`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${diffDays} ${t.daysAgo}`;
  };

  // 5. Chart.js Configurations
  const getEconomyChartData = () => {
    if (!economy) return { labels: [], datasets: [] };
    return {
      labels: [
        locale === "en" ? "Airtime (30d)" : "Airtime (siku 30)",
        locale === "en" ? "Agro-dealer Vouchers" : "Vocha za Duka la Kilimo",
        locale === "en" ? "Dira Circle Pools" : "Uchumi wa Vikundi",
        locale === "en" ? "M-Pesa B2C Payouts" : "Malipo ya M-Pesa"
      ],
      datasets: [
        {
          label: locale === "en" ? "KES Disbursed" : "KES Zilizotolewa",
          data: [
            economy.airtime30Days,
            economy.vouchersAllTime,
            economy.circleAllTime,
            economy.mpesaAllTime
          ],
          backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#0df2b8"],
          borderColor: ["#2563eb", "#059669", "#7c3aed", "#059669"],
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
  };

  const getQualityChartData = () => {
    if (quality.length === 0) return { labels: [], datasets: [] };
    const labels = quality.map((q) => q.day.substring(5)); // Show MM-DD
    const highData = quality.map((q) => q.pctHigh);
    const consensusData = quality.map((q) => q.networkConsensusRate);

    return {
      labels,
      datasets: [
        {
          label: locale === "en" ? "High Confidence Data %" : "Kiwango cha Ubora wa Juu %",
          data: highData,
          borderColor: "#0df2b8",
          backgroundColor: "rgba(13, 242, 184, 0.05)",
          fill: true,
          tension: 0.3,
          pointRadius: 2
        },
        {
          label: locale === "en" ? "Network Consensus Rate %" : "Kiwango cha Makubaliano %",
          data: consensusData,
          borderColor: "#3b82f6",
          backgroundColor: "transparent",
          borderDash: [5, 5],
          tension: 0.3,
          pointRadius: 2
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a23] via-[#051c1c] to-[#04120f] text-white p-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="h-16 w-16 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
          <p className="text-sm tracking-wide text-primary font-bold">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full min-h-screen bg-gradient-to-b from-[#0a0a23] via-[#051614] to-[#040f0c] text-white font-sans overflow-x-hidden">
      {/* Header Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-white/10 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-black text-xl text-white shadow-lg shadow-primary/20">
                D
              </div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-[#0df2b8] bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-white/60 font-semibold">{t.subtitle}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setLocale("en")}
              className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all ${
                locale === "en" ? "bg-primary text-white" : "text-white/50 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("sw")}
              className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all ${
                locale === "sw" ? "bg-primary text-white" : "text-white/50 hover:text-white"
              }`}
            >
              SW
            </button>
          </div>
        </header>

        {/* Section 1: Live Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[140px] hover:border-primary/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-full blur-xl" />
            <h3 className="text-2xl md:text-4xl font-extrabold text-[#0df2b8] tracking-tight animate-fade-in">
              {stats?.totalVerifiedDataPoints.toLocaleString() || "0"}
            </h3>
            <div>
              <p className="text-xs font-black text-white/90">{t.verifiedPoints}</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">{t.verifiedPointsDesc}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[140px] hover:border-blue-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full blur-xl" />
            <h3 className="text-2xl md:text-4xl font-extrabold text-blue-400 tracking-tight">
              {stats?.activeUsers7Days.toLocaleString() || "0"}
            </h3>
            <div>
              <p className="text-xs font-black text-white/90">{t.activeUsers}</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">{t.activeUsersDesc}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[140px] hover:border-purple-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-full blur-xl" />
            <h3 className="text-2xl md:text-4xl font-extrabold text-purple-400 tracking-tight">
              {stats?.countiesCovered.toLocaleString() || "0"}
            </h3>
            <div>
              <p className="text-xs font-black text-white/90">{t.counties}</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">{t.countiesDesc}</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[140px] hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full blur-xl" />
            <h3 className="text-2xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
              {stats?.cropSubmissionsMonth.toLocaleString() || "0"}
            </h3>
            <div>
              <p className="text-xs font-black text-white/90">{t.submissions}</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">{t.submissionsDesc}</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 col-span-2 lg:col-span-1 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[140px] hover:border-[#0df2b8]/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#0df2b8]/10 rounded-full blur-2xl animate-pulse" />
            <h3 className="text-2xl md:text-4xl font-black text-[#0df2b8] tracking-tight">
              KES {stats?.tokensDisbursedKes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </h3>
            <div>
              <p className="text-xs font-black text-white/90">{t.disbursed}</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">{t.disbursedDesc}</p>
            </div>
          </div>
        </section>

        {/* Section 2: Coverage Map & Activity Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaflet Map Card */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col shadow-xl min-h-[450px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-white/95">{t.mapTitle}</h2>
              <div className="flex items-center space-x-2 text-[10px] font-semibold text-white/50">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span>{t.refreshes}</span>
              </div>
            </div>

            {/* Map Frame wrapper */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-white/10 min-h-[350px]">
              {mapLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center text-xs font-bold text-white/80 space-x-2">
                  <div className="h-4 w-4 border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin" />
                  <span>{t.mapLoading}</span>
                </div>
              )}
              <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
            </div>

            {/* Legend indicators */}
            <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-white/60 font-semibold border-t border-white/5 pt-4">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-5 bg-primary/30 border border-primary rounded" />
                <span>{t.mapActiveCounty}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-5 bg-[#0df2b8]/50 border border-[#0df2b8] rounded" />
                <span>{locale === "en" ? "High density grid" : "Eneo lenye msongamano mkubwa"}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-5 bg-yellow-500/50 border border-yellow-500 rounded" />
                <span>{locale === "en" ? "Medium density grid" : "Eneo lenye msongamano wa kati"}</span>
              </div>
            </div>
          </div>

          {/* Activity Feed Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col shadow-xl h-[450px]">
            <h2 className="text-lg font-black text-white/95 mb-1">{t.feedTitle}</h2>
            <p className="text-xs text-white/50 mb-4">{t.feedSub}</p>

            {/* Feed items wrapper */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono text-[11px] leading-relaxed">
              {activities.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/30 text-xs">
                  No recent activities recorded.
                </div>
              ) : (
                activities.map((act, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col space-y-1.5 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                          act.role === "farmer" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {act.role === "farmer" ? "Crop Sub" : "Weather Ingest"}
                      </span>
                      <span className="text-white/40">{formatTimeDifference(act.timestamp)}</span>
                    </div>
                    <p className="text-white/80">
                      {act.role === "farmer"
                        ? t.feedFarmer.replace("{county}", act.county).replace("{crop}", act.cropType || "crop").replace("{time}", "")
                        : t.feedAgent.replace("{county}", act.county).replace("{time}", "")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Visualisation Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Circular Economy */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col shadow-xl min-h-[300px] hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-black text-white/95 mb-1">{t.economyTitle}</h2>
            <p className="text-xs text-white/50 mb-6">{t.economySub}</p>
            <div className="flex-1 relative w-full h-[220px]">
              {economy ? (
                <Bar
                  data={getEconomyChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y" as const,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "rgba(10, 10, 30, 0.95)",
                        titleFont: { family: "monospace", size: 12 },
                        bodyFont: { family: "monospace", size: 12 },
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { family: "monospace" } }
                      },
                      y: {
                        grid: { display: false },
                        ticks: { color: "rgba(255, 255, 255, 0.8)", font: { size: 11 } }
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white/30 text-xs">No chart data.</div>
              )}
            </div>
          </div>

          {/* Chart 2: Data Quality Line */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col shadow-xl min-h-[300px] hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-black text-white/95 mb-1">{t.qualityTitle}</h2>
            <p className="text-xs text-white/50 mb-6">{t.qualitySub}</p>
            <div className="flex-1 relative w-full h-[220px]">
              {quality.length > 0 ? (
                <Line
                  data={getQualityChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: "rgba(255, 255, 255, 0.8)", boxWidth: 12, font: { size: 10 } },
                        position: "top" as const
                      },
                      tooltip: {
                        backgroundColor: "rgba(10, 10, 30, 0.95)",
                        titleFont: { family: "monospace", size: 12 },
                        bodyFont: { family: "monospace", size: 12 },
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1
                      }
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { family: "monospace" } }
                      },
                      y: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { family: "monospace" } },
                        min: 0,
                        max: 100
                      }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-white/30 text-xs">No chart data.</div>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Hedera Blockchain Verification */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white/95">{t.midnightTitle}</h2>
              <p className="text-xs text-white/50">{t.midnightSub}</p>
            </div>
            <button
              onClick={() => setShowVerifyGuide(!showVerifyGuide)}
              className="px-5 py-2 text-xs font-bold rounded-xl border border-primary/30 text-[#0df2b8] bg-[#0df2b8]/5 hover:bg-[#0df2b8]/10 transition-all self-start md:self-auto"
            >
              {t.midnightVerifyBtn}
            </button>
          </div>

          {/* Guide Section */}
          {showVerifyGuide && (
            <div className="bg-[#0df2b8]/5 border border-[#0df2b8]/20 rounded-2xl p-5 space-y-3 font-semibold text-xs leading-relaxed animate-fade-in">
              <h3 className="text-sm font-black text-white">{t.midnightVerifyInstructionsTitle}</h3>
              <p className="whitespace-pre-line text-white/70">{t.midnightVerifyInstructions}</p>
            </div>
          )}

          {/* Anchors Table */}
          <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/20">
            <table className="w-full font-mono text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/60 bg-white/[0.02]">
                  <th className="p-4 font-black">{t.midnightWeek}</th>
                  <th className="p-4 font-black">{t.midnightBatch}</th>
                  <th className="p-4 font-black">{t.midnightTx}</th>
                  <th className="p-4 font-black">{t.midnightDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {anchors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/30 text-xs">
                      No anchors recorded on the Hedera network.
                    </td>
                  </tr>
                ) : (
                  anchors.map((anch, index) => (
                    <tr key={index} className="hover:bg-white/[0.01] transition-all">
                      <td className="p-4 font-bold text-white/90">{anch.weekNumber}</td>
                      <td className="p-4 text-white/70 break-all select-all font-mono">{anch.batchHash}</td>
                      <td className="p-4 break-all font-mono">
                        {anch.hcsTxId ? (
                          <a
                            href={`https://hashscan.io/testnet/transaction/${anch.hcsTxId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {anch.hcsTxId}
                          </a>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="p-4 text-white/50">{new Date(anch.anchoredAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer Container */}
        <footer className="border-t border-white/10 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/40">
          <div className="text-center md:text-left space-y-1">
            <p className="font-bold text-white/60">Dira Africa Platform</p>
            <p className="max-w-md leading-relaxed">{t.footerText}</p>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-3">
            <div className="flex space-x-4 font-bold">
              <a
                href={`${API_URL}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-all"
              >
                {t.openApi}
              </a>
              <span className="text-white/10">|</span>
              <a
                href="https://github.com/dira-africa/dira-core"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-all"
              >
                {t.githubRepo}
              </a>
            </div>
            <p>{t.footerBadge}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
