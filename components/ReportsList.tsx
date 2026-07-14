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
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";
import BackButton from "@/components/ui/BackButton";

interface CropSubmission {
  id: string;
  photo_url: string;
  crop_type: string;
  growth_stage: string;
  verification_status: "pending" | "verified" | "rejected";
  ai_health_score: string | number;
  ai_confidence: string | number;
  submitted_at: string;
}

interface SubmissionsResponse {
  success: boolean;
  submissions: CropSubmission[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export default function ReportsList() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useTranslation();

  const [submissions, setSubmissions] = useState<CropSubmission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<SubmissionsResponse>(`/api/farmers/submissions?page=${page}&limit=10`);
      if (res.success) {
        setSubmissions(res.submissions);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.page || 1);
      }
    } catch (err: any) {
      console.error("Failed to load submissions:", err);
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage]);

  // Date Formatter
  const formatDate = (dateStr: string, lang: "en" | "sw") => {
    const date = new Date(dateStr);
    if (lang === "sw") {
      const months = [
        "Jan", "Feb", "Mac", "Apr", "Mei", "Jun", 
        "Jul", "Ago", "Sep", "Okt", "Nov", "Des"
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  };

  // Health score badge formatting
  const getHealthBadge = (scoreStr: string | number) => {
    const score = Number(scoreStr);
    if (score > 0.7) {
      return {
        bg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
        label: locale === "en" ? "Healthy" : "Salama",
      };
    } else if (score >= 0.4) {
      return {
        bg: "bg-amber-500/20 border-amber-500/30 text-amber-400",
        label: locale === "en" ? "Caution" : "Angalizo",
      };
    } else {
      return {
        bg: "bg-rose-500/20 border-rose-500/30 text-rose-400",
        label: locale === "en" ? "Critical" : "Hatari",
      };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-emerald-500 text-white";
      case "rejected":
        return "bg-rose-500 text-white";
      default:
        return "bg-amber-500 text-black";
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col space-y-5 bg-gradient-to-b from-[#0A6E56]/10 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-24">
          <div className="py-2 space-y-2 animate-pulse">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-6 w-48 bg-white/20 rounded" />
          </div>
          
          <div className="space-y-3 flex-1 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 border border-white/10 rounded-2xl" />
            ))}
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
            {locale === "en" ? "Failed to load reports" : "Imeshindikana kupakia ripoti"}
          </h2>
          <p className="text-xs text-white/60">
            {locale === "en" ? error : "Hitilafu imetokea wakati wa kuunganisha kwenye mtandao."}
          </p>
          <button
            onClick={() => fetchSubmissions(currentPage)}
            className="px-6 py-2.5 bg-primary hover:bg-[#085a46] rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            {locale === "en" ? "Retry" : "Jaribu Tena"}
          </button>
        </div>
      </AuthGuard>
    );
  }

  const baseRoute = pathname.includes("/farmer/reports") ? "/farmer/reports" : "/reports";

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-between bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-28">
        
        {/* Header */}
        <div className="space-y-1 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-primary">
              <span className="text-xl">📋</span>
              <span className="text-xs font-black tracking-widest uppercase">
                {locale === "en" ? "Farmer Portal" : "Tovuti ya Mkulima"}
              </span>
            </div>
            <BackButton href="/farmer/home" label={locale === "en" ? "Home" : "Nyumbani"} />
          </div>
          <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
            {locale === "en" ? "Crop Submissions History" : "Historia ya Uwasilishaji"}
          </h1>
        </div>

        {/* Submissions List */}
        <section className="flex-1 my-4 space-y-3 overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-4xl block">🌱</span>
              <p className="text-sm text-white/50">
                {locale === "en" ? "No crop submissions found." : "Hakuna uwasilishaji wa mazao uliopatikana."}
              </p>
              <Link href="/farmer/submit">
                <button className="px-5 py-2.5 bg-primary hover:brightness-105 rounded-xl text-xs font-bold uppercase tracking-wider mt-2">
                  📸 {locale === "en" ? "Submit First Crop" : "Tuma Zao la Kwanza"}
                </button>
              </Link>
            </div>
          ) : (
            submissions.map((sub) => {
              const badge = getHealthBadge(sub.ai_health_score);
              const isPending = sub.verification_status === "pending";
              const isRejected = sub.verification_status === "rejected";

              return (
                <div
                  key={sub.id}
                  onClick={() => router.push(`${baseRoute}/${sub.id}`)}
                  className="flex items-center justify-between p-3.5 bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.99] border border-white/5 hover:border-white/10 rounded-2xl transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center space-x-3.5 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sub.photo_url}
                        alt={sub.crop_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-xs text-white/95 truncate">
                          {locale === "sw" && sub.crop_type === "Maize" ? "Mahindi" : locale === "sw" && sub.crop_type === "Beans" ? "Maharage" : sub.crop_type}
                        </h3>
                        <span className="text-[8px] text-white/40 font-mono">
                          {formatDate(sub.submitted_at, locale)}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-white/50 leading-none">
                        {locale === "en" ? "Stage: " : "Hatua: "}{sub.growth_stage}
                      </p>

                      <div className="flex items-center space-x-1.5 pt-0.5">
                        {/* Health Badge */}
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border leading-none ${badge.bg}`}>
                          {badge.label}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none uppercase ${getStatusBadge(sub.verification_status)}`}>
                          {sub.verification_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward Tokens Column */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-black tracking-tight ${isPending ? "text-white/30" : isRejected ? "text-rose-400" : "text-emerald-400"}`}>
                      {isRejected ? "+0" : "+15"} DIRA
                    </p>
                    <p className="text-[8px] text-white/30 mt-0.5 uppercase tracking-wider font-extrabold">
                      {isPending ? (locale === "en" ? "Pending" : "Kusubiri") : (locale === "en" ? "Earned" : "Ulipaji")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`font-bold px-3 py-1 rounded-lg ${currentPage === 1 ? "text-white/20 cursor-not-allowed" : "text-primary hover:bg-white/5"}`}
            >
              ◀ {locale === "en" ? "Prev" : "Rudi"}
            </button>
            <span className="text-[10px] font-bold text-white/60">
              {locale === "en" ? `Page ${currentPage} of ${totalPages}` : `Ukurasa ${currentPage} wa ${totalPages}`}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`font-bold px-3 py-1 rounded-lg ${currentPage === totalPages ? "text-white/20 cursor-not-allowed" : "text-primary hover:bg-white/5"}`}
            >
              {locale === "en" ? "Next" : "Mbele"} ▶
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-[#04120f] via-[#04120f]/95 to-[#04120f]/90 border-t border-white/10 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] z-50 px-6 py-3 flex justify-between items-center select-none">
          {/* Home Tab */}
          <Link href="/farmer/home" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Home" : "Mwanzo"}
            </span>
          </Link>

          {/* Camera/Submit Tab */}
          <Link href="/farmer/submit" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-white/40 group-hover:text-white/70">
              {locale === "en" ? "Camera" : "Kamera"}
            </span>
          </Link>

          {/* Wallet Tab */}
          <Link href="/wallet" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80`}
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

          {/* Reports Tab */}
          <Link href="/farmer/reports" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 text-primary filter drop-shadow-[0_0_8px_rgba(10,110,86,0.6)]`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[9px] font-extrabold tracking-wide text-primary">
              {locale === "en" ? "Reports" : "Ripoti"}
            </span>
          </Link>

          {/* Settings Tab */}
          <Link href="/farmer/settings" className="flex flex-col items-center space-y-1 group">
            <svg
              className={`h-5 w-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white/80`}
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
      </div>
    </AuthGuard>
  );
}
