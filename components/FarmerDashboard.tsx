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

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser, clearAuth, User } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";

interface CropSubmission {
  id: string;
  photo_url: string;
  crop_type: string;
  growth_stage: string;
  verification_status: "verified" | "rejected";
  ai_health_score: string | number;
  ai_confidence: string | number;
  ai_report_en: string;
  ai_report_sw: string;
  submitted_at: string;
  rejection_reason?: string;
}

interface Transaction {
  id: string;
  amount: string;
  transaction_type: string;
}

export default function FarmerDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<CropSubmission[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Concurrently fetch balance, submissions, and transaction history
      const [balanceRes, submissionsRes, historyRes] = await Promise.all([
        apiClient.get<{ success: boolean; balance: number }>("/api/tokens/balance"),
        apiClient.get<{ success: boolean; submissions: CropSubmission[] }>("/api/crop-submissions/history"),
        apiClient.get<{ success: boolean; transactions: Transaction[] }>("/api/tokens/history")
      ]);

      if (balanceRes.success) setBalance(Number(balanceRes.balance));
      if (submissionsRes.success) setSubmissions(submissionsRes.submissions);
      if (historyRes.success) setTransactions(historyRes.transactions);
    } catch (err: any) {
      console.error("Dashboard load failed:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(getStoredUser());
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  // Swahili and English Date Formatter
  const getFormattedDate = (lang: "en" | "sw") => {
    const date = new Date();
    if (lang === "sw") {
      const days = ["Jumapili", "Jumatatu", "Jumanne", "Jumatano", "Alhamisi", "Ijumaa", "Jumamosi"];
      const months = [
        "Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", 
        "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"
      ];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  };

  // 14-Day submission recency logic
  const getLatestSubmissionDetails = () => {
    const latest = submissions[0];
    if (!latest) return { hasSubIn14Days: false, daysAgo: 999 };
    
    const diffTime = Math.abs(new Date().getTime() - new Date(latest.submitted_at).getTime());
    const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return {
      latest,
      hasSubIn14Days: daysAgo < 14,
      daysAgo
    };
  };

  const { latest, hasSubIn14Days, daysAgo } = getLatestSubmissionDetails();

  // Quick stats calculation
  const totalEarned = transactions
    .filter(t => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSubmissions = submissions.length;

  let daysActive = 1;
  if (submissions.length > 0) {
    const earliest = submissions[submissions.length - 1];
    const diffTime = Math.abs(new Date().getTime() - new Date(earliest.submitted_at).getTime());
    daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }

  // Health score badge formatting
  const getHealthBadge = (scoreStr: string | number) => {
    const score = Number(scoreStr);
    if (score > 0.7) {
      return {
        bg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
        label: locale === "en" ? "Good Health" : "Afya Nzuri",
        emoji: "🟢"
      };
    } else if (score >= 0.4) {
      return {
        bg: "bg-amber-500/20 border-amber-500/30 text-amber-400",
        label: locale === "en" ? "Fair Health" : "Afya Kawaida",
        emoji: "🟡"
      };
    } else {
      return {
        bg: "bg-rose-500/20 border-rose-500/30 text-rose-400",
        label: locale === "en" ? "Poor Health" : "Afya Mbaya",
        emoji: "🔴"
      };
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/10 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-24">
          {/* Greeting Header Skeleton */}
          <div className="animate-pulse flex justify-between items-center py-2">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-4 w-32 bg-white/20 rounded" />
              </div>
            </div>
            <div className="h-7 w-16 bg-white/10 rounded-xl" />
          </div>

          {/* Token Card Skeleton */}
          <div className="animate-pulse bg-primary/20 border border-primary/20 rounded-3xl p-6 h-36 flex flex-col justify-between" />

          {/* Alert / Status Skeleton */}
          <div className="animate-pulse bg-white/5 border border-white/10 rounded-3xl p-5 h-28" />

          {/* Health Summary Skeleton */}
          <div className="animate-pulse bg-white/5 border border-white/10 rounded-3xl p-5 h-36" />

          {/* Stats Skeleton */}
          <div className="animate-pulse grid grid-cols-3 gap-3">
            <div className="h-16 bg-white/5 rounded-2xl" />
            <div className="h-16 bg-white/5 rounded-2xl" />
            <div className="h-16 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center items-center bg-gradient-to-b from-[#0d0d21] to-[#04120f] text-white min-h-screen text-center space-y-4">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold">
            {locale === "en" ? "Something went wrong" : "Kuna hitilafu iliyotokea"}
          </h2>
          <p className="text-sm text-white/60 max-w-xs">
            {locale === "en"
              ? "We couldn't connect to the Dira Network. Please check your internet connection."
              : "Imeshindikana kuunganisha kwenye Mtandao wa Dira. Tafadhali kagua mtandao wako."}
          </p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-primary hover:bg-[#085a46] active:scale-[0.98] transition-all font-bold text-sm rounded-2xl shadow-lg"
          >
            {locale === "en" ? "Try Again" : "Jaribu Tena"}
          </button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
        
        {/* 1. Greeting Header */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xl shadow-inner select-none">
              👨‍🌾
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide text-white leading-tight">
                {locale === "en" ? "Hello" : "Habari"}, {user?.name || "Farmer"}!
              </h1>
              <p className="text-[10px] text-white/50 font-medium tracking-wide mt-0.5">
                {getFormattedDate(locale)}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 active:scale-[0.98] transition-all font-semibold"
          >
            {locale === "en" ? "Logout" : "Ondoka"}
          </button>
        </header>

        {/* 2. Token Balance Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[#052b22] border border-primary/30 rounded-3xl p-6 shadow-2xl transition-transform duration-300 hover:scale-[1.01]">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/60 tracking-widest font-bold uppercase">
                  {locale === "en" ? "Climate Tokens Balance" : "Salio la Climate Tokens"}
                </p>
                <p className="text-3xl font-black mt-1 tracking-tight font-sans text-emerald-50">
                  {balance !== null ? balance.toFixed(2) : "0.00"} DIRA
                </p>
              </div>
              <span className="text-[9px] bg-white/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {locale === "en" ? "Farmer" : "Mkulima"}
              </span>
            </div>
            
            <div className="pt-3.5 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-white/50 font-medium uppercase tracking-wider">
                  {locale === "en" ? "Estimated Value" : "Thamani Inayokadiriwa"}
                </p>
                <p className="text-xs font-bold text-white/90 mt-0.5">
                  KES {((balance || 0) * 0.55).toFixed(2)} ({locale === "en" ? "Airtime" : "Kadi"}) / KES {((balance || 0) * 0.50).toFixed(2)} ({locale === "en" ? "Cash" : "Pesa"})
                </p>
              </div>
              <Link href="/shared/wallet">
                <button className="px-4 py-2 bg-white text-primary rounded-xl text-xs font-black shadow-md hover:bg-white/95 active:scale-[0.98] transition-all uppercase tracking-wider">
                  {locale === "en" ? "Redeem" : "Komboa"}
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Submission Status Card */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 shadow-lg flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-primary tracking-widest uppercase">
              {locale === "en" ? "Submission Recency" : "Hali ya Picha"}
            </h2>
            {hasSubIn14Days && latest && (
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getHealthBadge(latest.ai_health_score).bg}`}>
                {getHealthBadge(latest.ai_health_score).emoji} {getHealthBadge(latest.ai_health_score).label}
              </span>
            )}
          </div>
          
          {hasSubIn14Days && latest ? (
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-white/90">
                {locale === "en" 
                  ? `Last photo: ${daysAgo === 0 ? "Today" : `${daysAgo} days ago`}` 
                  : `Picha ya mwisho: ${daysAgo === 0 ? "Leo" : `Siku ${daysAgo} zilizopita`}`}
              </p>
              <p className="text-xs text-white/50">
                {locale === "en" 
                  ? `Crop Type: ${latest.crop_type} (${latest.growth_stage})`
                  : `Aina ya Zao: ${latest.crop_type === "Maize" ? "Mahindi" : latest.crop_type === "Beans" ? "Maharage" : latest.crop_type} (${latest.growth_stage})`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-white/80">
                {locale === "en" 
                  ? "Time for your next crop photo — earn 5 tokens" 
                  : "Muda wa picha yako ijayo ya mazao — pata tokeni 5"}
              </p>
              <Link href="/farmer/submit" className="w-full">
                <button className="w-full py-3 bg-gradient-to-r from-primary to-[#085a46] hover:brightness-105 active:scale-[0.99] transition-all rounded-2xl text-xs font-bold uppercase tracking-wider text-center shadow-lg">
                  📸 {locale === "en" ? "Take Crop Photo" : "Piga Picha ya Zao"}
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* 4. Latest Crop Health Summary */}
        {latest && (
          <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
            <h2 className="text-xs font-bold text-white/70 tracking-widest uppercase">
              {locale === "en" ? "Latest Crop Health Report" : "Ripoti ya Afya ya Mazao"}
            </h2>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-xs text-white/80 italic leading-relaxed">
              "{locale === "sw" ? latest.ai_report_sw : latest.ai_report_en}"
            </div>
            <div className="flex justify-end">
              <Link href="/farmer/reports" className="text-xs font-bold text-primary hover:underline">
                {locale === "en" ? "Read Full Report →" : "Soma Ripoti Kamili →"}
              </Link>
            </div>
          </section>
        )}

        {/* 5. Quick Stats Row */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-center space-y-1 shadow-sm">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
              {locale === "en" ? "Total Earned" : "Jumla Pato"}
            </p>
            <p className="text-sm font-extrabold text-emerald-400">
              {totalEarned.toFixed(0)} DIRA
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-center space-y-1 shadow-sm">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
              {locale === "en" ? "Photos" : "Picha"}
            </p>
            <p className="text-sm font-extrabold text-white/95">
              {totalSubmissions}
            </p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 text-center space-y-1 shadow-sm">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
              {locale === "en" ? "Days Active" : "Siku Hai"}
            </p>
            <p className="text-sm font-extrabold text-white/95">
              {daysActive}
            </p>
          </div>
        </section>

        {/* Language Toggler */}
        <div className="flex justify-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 w-24 mx-auto mt-4">
          <button
            onClick={() => setLocale("en")}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
              locale === "en" ? "bg-primary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("sw")}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
              locale === "sw" ? "bg-primary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            SW
          </button>
        </div>

        {/* 6. Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-[#04120f] via-[#04120f]/95 to-[#04120f]/90 border-t border-white/10 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] z-50 px-6 py-3 flex justify-between items-center select-none">
          {/* Home Tab */}
          <Link href="/farmer/home" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                pathname === "/farmer/home" || pathname === "/home" ? "text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]" : "text-white/50 group-hover:text-white/80"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`text-[9px] font-extrabold tracking-wide ${
              pathname === "/farmer/home" || pathname === "/home" ? "text-primary" : "text-white/40 group-hover:text-white/70"
            }`}>
              {locale === "en" ? "Home" : "Mwanzo"}
            </span>
          </Link>

          {/* Camera/Submit Tab */}
          <Link href="/farmer/submit" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                pathname === "/farmer/submit" ? "text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]" : "text-white/50 group-hover:text-white/80"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-[9px] font-extrabold tracking-wide ${
              pathname === "/farmer/submit" ? "text-primary" : "text-white/40 group-hover:text-white/70"
            }`}>
              {locale === "en" ? "Camera" : "Kamera"}
            </span>
          </Link>

          {/* Wallet Tab */}
          <Link href="/shared/wallet" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                pathname === "/shared/wallet" || pathname === "/wallet" ? "text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]" : "text-white/50 group-hover:text-white/80"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className={`text-[9px] font-extrabold tracking-wide ${
              pathname === "/shared/wallet" || pathname === "/wallet" ? "text-primary" : "text-white/40 group-hover:text-white/70"
            }`}>
              {locale === "en" ? "Wallet" : "Mkoba"}
            </span>
          </Link>

          {/* Reports Tab */}
          <Link href="/farmer/reports" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                pathname === "/farmer/reports" ? "text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]" : "text-white/50 group-hover:text-white/80"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`text-[9px] font-extrabold tracking-wide ${
              pathname === "/farmer/reports" ? "text-primary" : "text-white/40 group-hover:text-white/70"
            }`}>
              {locale === "en" ? "Reports" : "Ripoti"}
            </span>
          </Link>

          {/* Settings Tab */}
          <Link href="/farmer/settings" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                pathname === "/farmer/settings" ? "text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]" : "text-white/50 group-hover:text-white/80"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`text-[9px] font-extrabold tracking-wide ${
              pathname === "/farmer/settings" ? "text-primary" : "text-white/40 group-hover:text-white/70"
            }`}>
              {locale === "en" ? "Settings" : "Mipangilio"}
            </span>
          </Link>
        </nav>
      </div>
    </AuthGuard>
  );
}
