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
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import { getStoredUser, clearAuth, User } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import { performSync } from "@/lib/sync";
import type { Map } from "leaflet";

interface SyncStats {
  syncsToday: number;
  totalReadingsSynced: number;
  verifiedReadingsSynced: number;
  nextSyncScheduledInMs: number;
  lastSyncTime: string | null;
  isCertified: boolean;
  certifiedAt: string | null;
  consistentSyncDays: number;
  countyRank: number;
  countyTotalAgents: number;
  earningsToday: number;
  earningsThisWeek: number;
  earningsAllTime: number;
}

interface AgentProfile {
  full_name: string;
  county: string;
  coverage_radius_km: number | string;
  device_model: string | null;
  is_certified: boolean;
  certified_at: string | null;
  longitude: number;
  latitude: number;
}

interface SyncPoint {
  id: string;
  longitude: number;
  latitude: number;
  recorded_at: string;
  verified: boolean;
}

interface ProfileResponse {
  success: boolean;
  profile: AgentProfile;
}

interface RecentSyncsResponse {
  success: boolean;
  syncs: SyncPoint[];
}

export default function AgentHomePage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  // Stats and data states
  const [balance, setBalance] = useState<number>(0.00);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [recentSyncs, setRecentSyncs] = useState<SyncPoint[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 90-minute cooldown state
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<string | null>(null);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<Map | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch balance
      const balRes = await apiClient.get<{ success: boolean; balance: number }>("/api/tokens/balance");
      if (balRes.success) setBalance(balRes.balance);

      // 2. Fetch stats
      const statsRes = await apiClient.get<{ success: boolean } & SyncStats>("/api/agents/sync-stats");
      if (statsRes.success) setStats(statsRes);

      // 3. Fetch profile
      const profileRes = await apiClient.get<ProfileResponse>("/api/agents/profile");
      if (profileRes.success) setProfile(profileRes.profile);

      // 4. Fetch recent syncs from last 7 days
      const syncsRes = await apiClient.get<RecentSyncsResponse>("/api/agents/recent-syncs");
      if (syncsRes.success) setRecentSyncs(syncsRes.syncs);

    } catch (err) {
      console.error("Failed to load agent dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Cooldown countdown timer check
  useEffect(() => {
    const checkCooldown = () => {
      const lastSync = localStorage.getItem("dira-last-sync-time");
      if (lastSync) {
        const diffMs = Date.now() - new Date(lastSync).getTime();
        const waitMs = 90 * 60 * 1000; // 90 minutes
        if (diffMs < waitMs) {
          const remainingSecs = Math.ceil((waitMs - diffMs) / 1000);
          const mins = Math.floor(remainingSecs / 60);
          const secs = remainingSecs % 60;
          setCooldownTimeLeft(`${mins}m ${secs}s`);
        } else {
          setCooldownTimeLeft(null);
        }
      } else {
        setCooldownTimeLeft(null);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Map Initialization
  useEffect(() => {
    if (isLoading || !profile) return;
    const { latitude, longitude, coverage_radius_km } = profile;
    if (!latitude || !longitude || !mapContainerRef.current) return;

    let isMounted = true;
    let linkElement: HTMLLinkElement | null = null;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Add Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        linkElement = document.createElement("link");
        linkElement.id = "leaflet-css";
        linkElement.rel = "stylesheet";
        linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(linkElement);
      }

      // Initialize map centered on agent coverage
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([latitude, longitude], 12);
      leafletMap.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      // Draw coverage radius circle
      const radiusMeters = Number(coverage_radius_km) * 1000;
      L.circle([latitude, longitude], {
        color: "#6366f1", // indigo-500
        fillColor: "#6366f1",
        fillOpacity: 0.15,
        radius: radiusMeters,
        weight: 1.5
      }).addTo(map);

      // Add custom center pin
      const centerIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        shadowSize: [32, 32]
      });
      L.marker([latitude, longitude], { icon: centerIcon }).addTo(map);

      // Plot recent sync locations
      recentSyncs.forEach((sync) => {
        if (!sync.latitude || !sync.longitude) return;
        L.circleMarker([sync.latitude, sync.longitude], {
          radius: 4,
          fillColor: sync.verified ? "#10b981" : "#f43f5e",
          color: "#ffffff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.85
        }).addTo(map);
      });

    }).catch((err) => {
      console.error("Leaflet failed to load on agent map:", err);
    });

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [profile, recentSyncs, isLoading]);

  const triggerSyncNow = async () => {
    if (isSyncing || cooldownTimeLeft) return;
    setIsSyncing(true);
    setSyncStatusMsg(locale === "en" ? "Initializing device sensors..." : "Tunatayarisha vipimo vya simu...");

    try {
      // Execute the performance sync logic (checks network, gets GPS, reads barometer, and submits/stores)
      const res = await performSync();

      if (res.success) {
        if (res.status === "synced_online") {
          const successMsgEn = `Sync successful! Synced ${res.data.pressure_hpa} hPa. Verification in progress.`;
          const successMsgSw = `Usawazishaji umekamilika! Umesawazisha ${res.data.pressure_hpa} hPa. Uhakiki unaendelea.`;
          showToast("success", locale === "en" ? successMsgEn : successMsgSw);
        } else {
          const offlineMsgEn = `Offline. Reading saved locally and will upload when online.`;
          const offlineMsgSw = `Hauko mtandaoni. Kipimo kimehifadhiwa na kitatumwa ukiwa mtandaoni.`;
          showToast("success", locale === "en" ? offlineMsgEn : offlineMsgSw);
        }
        await fetchDashboardData();
      }
    } catch (err: any) {
      console.error("Sync failed:", err);
      if (err.message && err.message.startsWith("COOLDOWN:")) {
        const minsLeft = err.message.split(":")[1];
        const msgEn = `Sync locked. Please wait ${minsLeft} minutes.`;
        const msgSw = `Usawazishaji umefungwa. Tafadhali subiri dakika ${minsLeft}.`;
        showToast("error", locale === "en" ? msgEn : msgSw);
      } else {
        const errMsg = err.message || "Sync failed. Please ensure location services are enabled.";
        showToast("error", locale === "en" ? errMsg : "Hitilafu imetokea wakati wa usawazishaji.");
      }
    } finally {
      setIsSyncing(false);
      setSyncStatusMsg("");
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (locale === "sw") {
      const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} saa ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  };

  if (isLoading || !stats || !profile) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-5 bg-gradient-to-b from-[#1A1A6E]/10 via-[#0a0f2b] to-[#040512] text-white min-h-screen pb-24 justify-center items-center">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-xs font-semibold text-white/50">{locale === "en" ? "Loading dashboard..." : "Inapakia dashibodi..."}</p>
        </div>
      </AuthGuard>
    );
  }

  // Calculate sync status markers
  const targetSyncs = 4;
  const isSyncOnTrack = stats.syncsToday >= 3;
  const syncPercentage = Math.min(100, (stats.syncsToday / targetSyncs) * 100);

  // KES equivalents
  const balanceKes = balance * 0.50; // Cash standard redemption rate
  const airtimeKes = balance * 0.55; // Airtime rate

  // Certification Calculation
  const certTargetDays = 30;
  const isCertified = stats.isCertified;
  const certPercentage = Math.min(100, (stats.consistentSyncDays / certTargetDays) * 100);

  return (
    <AuthGuard>
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-5 bg-gradient-to-b from-[#1A1A6E]/20 via-[#0a0f2b] to-[#040512] text-white min-h-screen pb-28 relative font-sans">
        
        {/* Floating Toast Notification */}
        {toast && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform scale-100 flex items-center space-x-3 ${
            toast.type === "success" 
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200" 
              : "bg-red-950/90 border-red-500/30 text-red-200"
          }`}>
            <span className="text-lg">{toast.type === "success" ? "✅" : "⚠️"}</span>
            <p className="text-xs font-semibold leading-relaxed flex-1">{toast.message}</p>
          </div>
        )}

        {/* Global Syncing Spinner Overlay */}
        {isSyncing && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 rounded-3xl flex flex-col items-center justify-center space-y-4">
            {/* Syncing Spinning Animation */}
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <span className="text-2xl animate-pulse">🛰️</span>
            </div>
            <p className="text-sm font-bold tracking-wide text-white/95 text-center px-6 leading-relaxed">{syncStatusMsg}</p>
          </div>
        )}

        {/* Header Greeting & Profile Details */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-lg">
              📡
            </div>
            <div>
              <p className="text-[9px] text-white/40 font-mono leading-none tracking-widest uppercase">
                {locale === "en" ? "DePIN Agent Node" : "Wakala wa Dira"}
              </p>
              <h1 className="font-extrabold text-sm tracking-tight text-white mt-1">
                {profile.full_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switch */}
            <button
              onClick={() => setLocale(locale === "en" ? "sw" : "en")}
              className="text-[10px] font-bold px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-colors"
            >
              {locale === "en" ? "SW" : "EN"}
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-extrabold hover:bg-white/10 transition-colors uppercase"
            >
              {locale === "en" ? "Logout" : "Ondoka"}
            </button>
          </div>
        </header>

        {/* 1. Sync Status Card */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-extrabold leading-none">
                {locale === "en" ? "Sync status" : "Hali ya sawazisho"}
              </p>
              <h3 className="text-base font-black tracking-tight mt-1">
                {stats.syncsToday} / {targetSyncs} {locale === "en" ? "Syncs Today" : "Sawazisho Leo"}
              </h3>
            </div>
            
            {/* On-Track Badge */}
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
              isSyncOnTrack 
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
            }`}>
              <span>{isSyncOnTrack ? "✓" : "⚠"}</span>
              <span className="uppercase leading-none tracking-wider font-extrabold">
                {isSyncOnTrack ? (locale === "en" ? "On track" : "Kwenye Mstari") : (locale === "en" ? "Behind" : "Uko Nyuma")}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${syncPercentage}%` }} 
              />
            </div>
            <div className="flex justify-between text-[9px] text-white/40 font-mono">
              <span>0%</span>
              <span>
                {stats.lastSyncTime 
                  ? (locale === "en" ? `Last sync: ${formatDate(stats.lastSyncTime)}` : `Mwisho: ${formatDate(stats.lastSyncTime)}`)
                  : (locale === "en" ? "No sync yet today" : "Hakuna sawazisho bado leo")}
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Large SYNC NOW Button with Cooldown Countdown */}
          <button 
            onClick={triggerSyncNow}
            disabled={isSyncing || !!cooldownTimeLeft}
            className="w-full py-4 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:bg-indigo-850/50 disabled:text-white/35 border border-indigo-400/20 font-black text-sm text-white transition-all flex items-center justify-center space-x-2.5 shadow-lg shadow-indigo-900/35 group"
          >
            {cooldownTimeLeft ? (
              <>
                <span>⏳</span>
                <span>
                  {locale === "en" 
                    ? `Sync locked (${cooldownTimeLeft} left)` 
                    : `Usawazishaji umefungwa (Bado ${cooldownTimeLeft})`}
                </span>
              </>
            ) : (
              <>
                <span className="group-hover:animate-bounce">🔄</span>
                <span className="tracking-wider uppercase">
                  {locale === "en" ? "Sync Now" : "Sawazisha Sasa"}
                </span>
              </>
            )}
          </button>
        </section>

        {/* 2. Token Earnings Card */}
        <section className="bg-gradient-to-r from-indigo-700/85 to-[#12135c]/95 border border-indigo-500/25 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold leading-none">
                  {locale === "en" ? "Node Wallet Balance" : "Salio la Node ya Dira"}
                </p>
                <h2 className="text-2xl font-black mt-1.5 tracking-tight">{balance.toFixed(2)} DIRA</h2>
                <div className="flex flex-col space-y-0.5 mt-1 font-mono text-[9px] text-white/60">
                  <p>KES {balanceKes.toFixed(2)} {locale === "en" ? "(Cash Equivalent)" : "(M-Pesa ya Taslimu)"}</p>
                  <p>KES {airtimeKes.toFixed(2)} {locale === "en" ? "(Airtime equivalent)" : "(Mavuno ya Maongezi)"}</p>
                </div>
              </div>
              
              <Link href="/wallet">
                <button className="px-4 py-2 bg-white text-indigo-700 active:scale-[0.98] rounded-xl text-xs font-black shadow-md hover:bg-white/95 transition-all">
                  {locale === "en" ? "Redeem" : "Kusanya"}
                </button>
              </Link>
            </div>

            {/* Sub stats row */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[8px] text-white/40 uppercase font-extrabold leading-none">{locale === "en" ? "Today" : "Leo"}</p>
                <p className="text-xs font-black text-white/90 mt-1">+{stats.earningsToday} DIRA</p>
              </div>
              <div className="border-l border-white/10">
                <p className="text-[8px] text-white/40 uppercase font-extrabold leading-none">{locale === "en" ? "This Week" : "Wiki Hii"}</p>
                <p className="text-xs font-black text-indigo-200 mt-1">+{stats.earningsThisWeek} DIRA</p>
              </div>
              <div className="border-l border-white/10">
                <p className="text-[8px] text-white/40 uppercase font-extrabold leading-none">{locale === "en" ? "All-Time" : "Jumla Kuu"}</p>
                <p className="text-xs font-black text-emerald-400 mt-1">+{stats.earningsAllTime} DIRA</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Coverage Map */}
        <section className="space-y-2">
          <h3 className="font-extrabold text-xs text-white/40 uppercase tracking-wider leading-none">
            🗺️ {locale === "en" ? "Your Coverage & Sync Map" : "Ramani Yako ya Usawazishaji"}
          </h3>
          <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-md">
            <div 
              ref={mapContainerRef} 
              className="h-36 w-full bg-black/40 z-10" 
            />
            {/* Map Info Overlay */}
            <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-[8px] font-mono text-white/60">
              Radius: {profile.coverage_radius_km} km • {recentSyncs.length} {locale === "en" ? "points (last 7d)" : "vipimo (wiki 1)"}
            </div>
          </div>
        </section>

        {/* 4. Certification Badge Card */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-4.5 space-y-3.5">
          <div className="flex items-center space-x-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${
              isCertified ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
            }`}>
              🎖️
            </div>
            <div>
              {isCertified ? (
                <div>
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                    {locale === "en" ? "Certified Dira Data Agent" : "Wakala Aliyeidhinishwa wa Dira"}
                  </h4>
                  <p className="text-[9px] text-white/40 mt-0.5">
                    {locale === "en" ? `Approved: ${stats.certifiedAt ? new Date(stats.certifiedAt).toLocaleDateString() : "Active"}` : `Imeidhinishwa: ${stats.certifiedAt ? new Date(stats.certifiedAt).toLocaleDateString() : "Active"}`}
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-black text-white/90">
                    {locale === "en" ? "Data Certification Progress" : "Maendeleo ya Cheti cha Data"}
                  </h4>
                  <p className="text-[9px] text-white/40 leading-none mt-1">
                    {locale === "en" 
                      ? "Complete 30 days of consistent syncing to earn certification." 
                      : "Kamilisha siku 30 za usawazishaji thabiti ili kupata cheti."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!isCertified && (
            <div className="space-y-1.5">
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${certPercentage}%` }} 
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-white/40 leading-none">
                <span>{stats.consistentSyncDays} / {certTargetDays} {locale === "en" ? "days" : "siku"}</span>
                <span>{Math.round(certPercentage)}%</span>
              </div>
            </div>
          )}
        </section>

        {/* 5. Leaderboard Teaser */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-all"
                 onClick={() => router.push("/agent/leaderboard")}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-[8px] text-white/40 uppercase tracking-widest font-extrabold leading-none">
                {locale === "en" ? "Weekly county rank" : "Bao la viongozi wa kaunti"}
              </p>
              <h4 className="text-xs font-black text-white/95 mt-1">
                {locale === "en" 
                  ? `Rank #${stats.countyRank} of ${stats.countyTotalAgents} in ${profile.county}` 
                  : `Nafasi ya #${stats.countyRank} kati ya ${stats.countyTotalAgents} katika Kaunti ya ${profile.county}`}
              </h4>
            </div>
          </div>
          <span className="text-indigo-400 group-hover:translate-x-1 transition-transform font-bold text-xs">
            {locale === "en" ? "Leaderboard" : "Viongozi"} ▶
          </span>
        </section>

        {/* 6. Sticky Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-[#040512] via-[#040512]/95 to-[#040512]/90 border-t border-white/10 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.6)] z-50 px-5 py-3 flex justify-between items-center select-none">
          {/* Home Tab */}
          <Link href="/agent/home" className="flex flex-col items-center space-y-1 group">
            <svg
              className="h-5 w-5 text-indigo-400 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-transform group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-indigo-400">
              {locale === "en" ? "Home" : "Mwanzo"}
            </span>
          </Link>

          {/* Map Tab */}
          <Link href="/agent/map" className="flex flex-col items-center space-y-1 group">
            <svg
              className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Map" : "Ramani"}
            </span>
          </Link>

          {/* Wallet Tab */}
          <Link href="/wallet" className="flex flex-col items-center space-y-1 group">
            <svg
              className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Wallet" : "Mkoba"}
            </span>
          </Link>

          {/* Leaderboard Tab */}
          <Link href="/agent/leaderboard" className="flex flex-col items-center space-y-1 group">
            <svg
              className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Leaders" : "Viongozi"}
            </span>
          </Link>

          {/* Settings Tab */}
          <Link href="/agent/settings" className="flex flex-col items-center space-y-1 group">
            <svg
              className="h-5 w-5 text-white/50 group-hover:text-white/80 transition-transform group-hover:scale-105"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Settings" : "Mipangilio"}
            </span>
          </Link>
        </nav>
      </main>
    </AuthGuard>
  );
}
