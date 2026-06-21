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
import AuthGuard from "@/components/AuthGuard";
import type { Map } from "leaflet";

interface CropSubmissionDetail {
  id: string;
  photo_url: string;
  crop_type: string;
  growth_stage: string;
  verification_status: "pending" | "verified" | "rejected";
  ai_health_score: number | string;
  ai_confidence: number | string;
  ai_report_en: string;
  ai_report_sw: string;
  ai_detected_issues: Record<string, any> | string;
  longitude: number;
  latitude: number;
  rejection_reason?: string;
  submitted_at: string;
  verified_at?: string;
}

interface DetailResponse {
  success: boolean;
  submission: CropSubmissionDetail;
}

const getRecommendations = (cropType: string, healthScore: number, lang: "en" | "sw"): string[] => {
  const isHealthy = healthScore > 0.7;
  const isCaution = healthScore >= 0.4 && healthScore <= 0.7;
  const crop = cropType.toLowerCase();

  if (lang === "sw") {
    if (isHealthy) {
      if (crop === "maize" || crop === "mahindi") {
        return [
          "Endelea kufuatilia ugonjwa wa mlipuko wa necrosis ya mahindi (MLND).",
          "Weka mbolea ya kukuzia (urea/CAN) wakati mmea una urefu wa goti.",
          "Weka matandazo ili kuhifadhi unyevu na kuzuia magugu."
        ];
      }
      if (crop === "beans" || crop === "maharage") {
        return [
          "Palilia shamba mara kwa mara ili kuzuia ushindani wa virutubisho.",
          "Kagua majani dhidi ya chawa wa mimea (aphids) au kutu ya maharage.",
          "Vuna mazao yako punde tu maganda yanapokauka kabisa."
        ];
      }
      return [
        "Endelea na palizi na umwagiliaji wa mara kwa mara.",
        "Kagua chini ya majani kila wiki ili kuona wadudu wanaoharibu mimea.",
        "Nyaraka mabadiliko yoyote ya joto na mvua kwenye shajara yako ya kilimo."
      ];
    } else if (isCaution) {
      if (crop === "maize" || crop === "mahindi") {
        return [
          "Weka mbolea yenye nitrojeni ya kutosha ili kurejesha rangi ya kijani kibichi.",
          "Chunguza uwepo wa viwavi vamizi (Fall Armyworm) na uchukue hatua mapema.",
          "Ongeza kasi ya palizi ili kupunguza kupotea kwa maji na virutubisho."
        ];
      }
      if (crop === "beans" || crop === "maharage") {
        return [
          "Nyunyizia dawa ya asili kuzuia koga ya unga (powdery mildew).",
          "Dhibiti kiwango cha maji ili kuzuia mizizi kuoza kutokana na dimbwi la maji.",
          "Weka mbolea ya fosforasi ili kuimarisha mfumo wa mizizi."
        ];
      }
      return [
        "Pima pH ya udongo na viwango vya unyevunyevu shambani.",
        "Weka samadi au mboji iliyooza vizuri ili kuongeza rutuba ya udongo.",
        "Fuatilia mabadiliko ya afya ya mmea kila siku."
      ];
    } else {
      if (crop === "maize" || crop === "mahindi") {
        return [
          "Wasiliana na afisa ugani wa kilimo wa eneo lako mara moja.",
          "Punguza majani yaliyoathirika sana na uyachome ili kuzuia kuenea kwa ugonjwa.",
          "Nyunyizia dawa ya kibayolojia au kemikali iliyopendekezwa kwa usalama."
        ];
      }
      if (crop === "beans" || crop === "maharage") {
        return [
          "Ng'oa na uchome mimea yote iliyoathirika sana na magonjwa ya virusi.",
          "Hakikisha unafanya mzunguko wa mazao katika msimu ujao.",
          "Epuka kumwagilia maji juu ya majani ili kuzuia kuenea kwa fangasi."
        ];
      }
      return [
        "Tenga eneo lililoathirika ili kuzuia maambukizi kusambaa shambani.",
        "Tafuta ushauri wa kitaalamu kutoka kwa muuzaji wa pembejeo aliye karibu.",
        "Kagua mfumo wako wa maji ili kuhakikisha hakuna uvujaji au msongamano."
      ];
    }
  } else {
    // English recommendations
    if (isHealthy) {
      if (crop === "maize") {
        return [
          "Keep monitoring for Maize Lethal Necrosis Disease (MLND).",
          "Apply top-dressing nitrogenous fertilizer (urea/CAN) at knee-height.",
          "Mulch around the stalks to retain soil moisture and suppress weeds."
        ];
      }
      if (crop === "beans") {
        return [
          "Weed the field regularly to eliminate nutrient competition.",
          "Monitor under leaves for signs of bean rust or aphids.",
          "Harvest promptly when pods are dry to avoid seed deterioration."
        ];
      }
      return [
        "Continue with routine weeding and scheduled watering.",
        "Inspect under the leaves weekly for pest activity.",
        "Record local weather patterns to optimize next season's schedule."
      ];
    } else if (isCaution) {
      if (crop === "maize") {
        return [
          "Apply nitrogen-rich top dressing to restore leaf chlorophyll.",
          "Check specifically for early signs of Fall Armyworm infestation.",
          "Ensure adequate weeding to preserve available soil nutrients."
        ];
      }
      if (crop === "beans") {
        return [
          "Spray organic fungicide if powdery mildew or leaf spot is seen.",
          "Adjust watering to prevent waterlogging and root rot.",
          "Supplement the crop with a phosphorus-rich foliar feed."
        ];
      }
      return [
        "Test soil pH and moisture levels in the affected zone.",
        "Apply compost or organic manure to boost organic matter.",
        "Monitor the crop daily for worsening symptoms."
      ];
    } else {
      if (crop === "maize") {
        return [
          "Consult a local agricultural extension officer immediately.",
          "Prune heavily infested leaves and destroy them away from the field.",
          "Treat with a recommended bio-pesticide to control severe pests."
        ];
      }
      if (crop === "beans") {
        return [
          "Uproot and burn diseased plants showing mosaic virus symptoms.",
          "Rotate crops in the next planting season to break pest cycles.",
          "Avoid overhead sprinkler irrigation to limit fungal spore spread."
        ];
      }
      return [
        "Quarantine the affected field area to prevent spread.",
        "Seek urgent diagnostic advice from a verified agro-dealer.",
        "Check your irrigation systems for leaks or blockages."
      ];
    }
  }
};

const getIssueLabel = (key: string, lang: "en" | "sw"): string => {
  const issuesMap: Record<string, Record<"en" | "sw", string>> = {
    no_vegetation: {
      en: "No vegetation detected",
      sw: "Hakuna mmea uliotambuliwa"
    },
    species_mismatch: {
      en: "Crop species mismatch",
      sw: "Aina ya zao hailingani"
    },
    low_chlorophyll: {
      en: "Low chlorophyll levels",
      sw: "Viwango vya chini vya klorofili"
    },
    nutrient_deficiency: {
      en: "Possible nutrient deficiency",
      sw: "Ukosefu wa rutuba ya udongo"
    }
  };
  return issuesMap[key]?.[lang] || key;
};

export default function ReportDetail({ id }: { id: string }) {
  const router = useRouter();
  const { locale } = useTranslation();
  const [submission, setSubmission] = useState<CropSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<Map | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<DetailResponse>(`/api/farmers/submissions/${id}`);
      if (res.success && res.submission) {
        setSubmission(res.submission);
      } else {
        setError(locale === "en" ? "Report not found" : "Ripoti haipatikani");
      }
    } catch (err: any) {
      console.error("Failed to load submission detail:", err);
      setError(err.message || "Failed to load report detail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Animate the progress score on load once data is loaded
  useEffect(() => {
    if (submission) {
      const score = Number(submission.ai_health_score) || 0;
      const targetPercent = Math.round(score * 100);
      setAnimatedScore(0);
      
      const timer = setTimeout(() => {
        setAnimatedScore(targetPercent);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [submission]);

  // Leaflet map initialization
  useEffect(() => {
    if (!submission || loading || error) return;
    const { latitude, longitude } = submission;
    if (!latitude || !longitude || (latitude === 0 && longitude === 0)) return;

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

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);
      leafletMap.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OSM</a> contributors',
      }).addTo(map);

      // Custom marker icon to prevent asset load issues
      const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.marker([latitude, longitude], { icon: defaultIcon }).addTo(map);
    }).catch((err) => {
      console.error("Leaflet loading failed inside details:", err);
    });

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [submission, loading, error]);

  // Date Formatter
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (locale === "sw") {
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

  // WhatsApp text summary builder
  const handleWhatsAppShare = () => {
    if (!submission) return;
    const scoreVal = Number(submission.ai_health_score) || 0;
    const scorePct = Math.round(scoreVal * 100);
    const recs = getRecommendations(submission.crop_type, scoreVal, locale);

    let text = "";
    if (locale === "sw") {
      text = `*Ripoti ya Afya ya Mmea (Dira Africa)*\n\n` +
             `*Zao:* ${submission.crop_type === "Maize" ? "Mahindi" : submission.crop_type === "Beans" ? "Maharage" : submission.crop_type}\n` +
             `*Hatua:* ${submission.growth_stage}\n` +
             `*Tarehe:* ${formatDate(submission.submitted_at)}\n` +
             `*Afya:* ${scorePct}%\n` +
             `*Hali ya Uthibitisho:* ${submission.verification_status.toUpperCase()}\n\n` +
             `*Uchunguzi wa AI:*\n${submission.ai_report_sw || "Hakuna uchunguzi"}\n\n` +
             `*Nini cha kufanya:*\n` +
             `1. ${recs[0]}\n` +
             `2. ${recs[1]}\n` +
             `3. ${recs[2]}\n\n` +
             `Imetumwa kutoka Dira Africa - Simu yako, Afya ya mazao yako!`;
    } else {
      text = `*Crop Health Diagnosis (Dira Africa)*\n\n` +
             `*Crop:* ${submission.crop_type}\n` +
             `*Stage:* ${submission.growth_stage}\n` +
             `*Date:* ${formatDate(submission.submitted_at)}\n` +
             `*Health Score:* ${scorePct}%\n` +
             `*Status:* ${submission.verification_status.toUpperCase()}\n\n` +
             `*AI Diagnosis:*\n${submission.ai_report_en || "No diagnosis details"}\n\n` +
             `*Action Items:*\n` +
             `1. ${recs[0]}\n` +
             `2. ${recs[1]}\n` +
             `3. ${recs[2]}\n\n` +
             `Shared via Dira Africa.`;
    }

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/10 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-10">
          <div className="flex items-center space-x-3 py-2">
            <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
            <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="w-full h-56 bg-white/5 rounded-3xl animate-pulse" />
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl animate-pulse">
            <div className="h-10 w-24 bg-white/10 rounded" />
            <div className="h-16 w-16 bg-white/10 rounded-full" />
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-40 bg-white/10 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !submission) {
    return (
      <AuthGuard>
        <div className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center items-center bg-gradient-to-b from-[#0d0d21] to-[#04120f] text-white min-h-screen text-center space-y-4">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold">
            {locale === "en" ? "Failed to load report" : "Imeshindikana kupakia ripoti"}
          </h2>
          <p className="text-xs text-white/60">
            {locale === "en" ? error : "Hitilafu imetokea wakati wa kuunganisha kwenye mtandao."}
          </p>
          <button
            onClick={fetchDetail}
            className="px-6 py-2.5 bg-primary hover:bg-[#085a46] rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            {locale === "en" ? "Retry" : "Jaribu Tena"}
          </button>
        </div>
      </AuthGuard>
    );
  }

  // Calculate Health Badge and UI parameters
  const scoreVal = Number(submission.ai_health_score) || 0;
  const isHealthy = scoreVal > 0.7;
  const isCaution = scoreVal >= 0.4 && scoreVal <= 0.7;
  const healthLabel = isHealthy
    ? (locale === "en" ? "Healthy" : "Salama")
    : isCaution
    ? (locale === "en" ? "Caution" : "Angalizo")
    : (locale === "en" ? "Critical" : "Hatari");

  const healthColor = isHealthy
    ? "text-emerald-400"
    : isCaution
    ? "text-amber-400"
    : "text-rose-400";

  const strokeColor = isHealthy
    ? "#34d399" // emerald-400
    : isCaution
    ? "#fbbf24" // amber-400
    : "#f87171"; // rose-400

  // SVG Animated Circle calculations
  const radius = 35;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Actions recommendations array
  const recommendations = getRecommendations(submission.crop_type, scoreVal, locale);

  // Parsed Detected Issues
  let parsedIssues: string[] = [];
  try {
    const rawIssues = submission.ai_detected_issues;
    if (typeof rawIssues === "string") {
      const parsed = JSON.parse(rawIssues);
      parsedIssues = Object.keys(parsed).filter(k => parsed[k]);
    } else if (rawIssues && typeof rawIssues === "object") {
      parsedIssues = Object.keys(rawIssues).filter(k => rawIssues[k]);
    }
  } catch (e) {
    console.error("Failed to parse detected issues:", e);
  }

  // Check verification status
  const isPending = submission.verification_status === "pending";
  const isRejected = submission.verification_status === "rejected";

  return (
    <AuthGuard>
      <div className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-between bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen pb-10">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-1 text-xs font-bold text-white/70 hover:text-white transition-colors"
          >
            <span>◀</span>
            <span>{locale === "en" ? "Back" : "Rudi"}</span>
          </button>
          
          <h1 className="font-extrabold text-sm uppercase tracking-wider text-primary">
            {locale === "en" ? "Report Details" : "Maelezo ya Ripoti"}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Core content */}
        <div className="flex-1 my-4 space-y-5 overflow-y-auto pr-0.5">
          
          {/* Main Photo Card */}
          <div className="relative w-full h-56 rounded-3xl overflow-hidden border border-white/10 shadow-lg bg-black/60 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={submission.photo_url}
              alt={submission.crop_type}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col space-y-1.5 z-10">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider border leading-none ${
                isRejected ? "bg-rose-500/20 border-rose-500/30 text-rose-400" :
                isPending ? "bg-amber-500/20 border-amber-500/30 text-amber-400" :
                "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              }`}>
                {submission.verification_status}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <h2 className="font-black text-sm text-white/95 leading-none">
                  {locale === "sw" && submission.crop_type === "Maize" ? "Mahindi" : locale === "sw" && submission.crop_type === "Beans" ? "Maharage" : submission.crop_type}
                </h2>
                <p className="text-[10px] text-white/60 mt-1 leading-none">
                  {locale === "en" ? "Stage: " : "Hatua: "}{submission.growth_stage}
                </p>
              </div>
              <span className="text-[10px] font-mono text-white/50">
                {formatDate(submission.submitted_at)}
              </span>
            </div>
          </div>

          {/* Rejection Notification if rejected */}
          {isRejected && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-400">
                <span className="text-base">⚠️</span>
                <h4 className="font-extrabold text-xs uppercase tracking-wider">
                  {locale === "en" ? "Submission Rejected" : "Uwasilishaji Umekataliwa"}
                </h4>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {locale === "en"
                  ? "Our system could not verify this photo. Please make sure the photo is clear, taken in good lighting, and matches the crop type registered."
                  : "Mfumo wetu haukuweza kuthibitisha picha hii. Tafadhali hakikisha kuwa picha ni wazi, imepigwa wakati wa mchana, na inafanana na zao lililosajiliwa."}
              </p>
              {submission.rejection_reason && (
                <p className="text-[10px] text-rose-300 italic pt-1 border-t border-rose-500/10">
                  {locale === "en" ? "Reason:" : "Sababu:"} {submission.rejection_reason}
                </p>
              )}
            </div>
          )}

          {/* Health Score Overview Panel (only if not pending and not rejected) */}
          {!isRejected && (
            <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-3xl shadow-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest leading-none">
                  {locale === "en" ? "Overall Crop Health" : "Afya ya Jumla ya Zao"}
                </p>
                <h3 className={`font-black text-lg leading-tight ${healthColor}`}>
                  {healthLabel}
                </h3>
                <p className="text-[10px] text-white/50 leading-none">
                  {isPending 
                    ? (locale === "en" ? "Awaiting full AI sync..." : "Inasubiri uchambuzi kamili...") 
                    : `${locale === "en" ? "Confidence level" : "Kiwango cha uhakika"}: ${Math.round((Number(submission.ai_confidence) || 0) * 100)}%`}
                </p>
              </div>

              {/* Circular Progress Indicator */}
              <div className="relative flex items-center justify-center w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-white/10"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Foreground Animated Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black tracking-tighter">
                  {isPending ? "..." : `${animatedScore}%`}
                </span>
              </div>
            </div>
          )}

          {/* Diagnosis Block */}
          <div className="space-y-3.5">
            <h3 className="font-extrabold text-xs text-white/50 uppercase tracking-wider leading-none">
              🔬 {locale === "en" ? "AI Diagnosis & Issues" : "Uchunguzi na Matatizo ya AI"}
            </h3>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3.5">
              {/* Detected issues list */}
              <div>
                <h4 className="text-[10px] font-extrabold text-white/40 uppercase tracking-wide mb-2">
                  {locale === "en" ? "What we detected" : "Tulichogundua"}
                </h4>
                {parsedIssues.length === 0 ? (
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <span className="text-xs">✓</span>
                    <span className="text-[11px] font-bold">
                      {locale === "en" ? "No issues detected" : "Hakuna matatizo yaliyogundulika"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedIssues.map((issue) => (
                      <span
                        key={issue}
                        className="text-[9px] font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg leading-none"
                      >
                        ⚠️ {getIssueLabel(issue, locale)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Report translation */}
              <div className="border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-extrabold text-white/40 uppercase tracking-wide mb-1.5">
                  {locale === "en" ? "What this means" : "Maana yake nini"}
                </h4>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  {isPending 
                    ? (locale === "en" ? "Analyzing greenness indices and species metrics. Check back shortly." : "Inachambua viwango vya kijani na sifa za mimea. Angalia baada ya muda mfupi.")
                    : (locale === "sw" ? submission.ai_report_sw : submission.ai_report_en) || 
                      (locale === "en" ? "Analysis reports generated successfully." : "Ripoti ya uchunguzi imekamilika.")}
                </p>
              </div>

              {/* Actionable recommendations list */}
              {!isRejected && (
                <div className="border-t border-white/5 pt-3">
                  <h4 className="text-[10px] font-extrabold text-white/40 uppercase tracking-wide mb-2">
                    {locale === "en" ? "What you should do" : "Nini cha kufanya"}
                  </h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2.5 text-[11px] text-white/80 leading-relaxed">
                        <span className="w-4 h-4 bg-primary/20 text-primary font-bold text-[9px] flex items-center justify-center rounded-md flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* GPS Map Container */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-xs text-white/50 uppercase tracking-wider leading-none">
              📍 {locale === "en" ? "Submission GPS Location" : "Mahali pa GPS pa Uwasilishaji"}
            </h3>
            
            {submission.latitude && submission.longitude && (submission.latitude !== 0 || submission.longitude !== 0) ? (
              <div className="space-y-1">
                <div
                  ref={mapContainerRef}
                  className="h-40 w-full rounded-3xl overflow-hidden border border-white/10 bg-black/40 z-10"
                />
                <p className="text-[9px] text-white/40 text-right pr-1 font-mono">
                  GPS: {submission.latitude.toFixed(6)}, {submission.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="h-28 w-full bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-center items-center text-center p-4">
                <span className="text-2xl mb-1">📡</span>
                <p className="text-xs text-white/50 font-bold">
                  {locale === "en" ? "Location data unavailable" : "Data ya eneo haipatikani"}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center space-x-3.5 bg-gradient-to-t from-[#0d0d21] to-transparent">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-3 px-4 bg-[#25D366] hover:brightness-95 active:scale-[0.98] text-black font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            {/* WhatsApp SVG Icon */}
            <svg className="h-4.5 w-4.5 fill-black" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.794.002-2.615-1.017-5.074-2.87-6.929-1.853-1.854-4.311-2.872-6.925-2.874-5.405 0-9.81 4.402-9.813 9.802-.001 1.545.425 3.068 1.232 4.417l-.98 3.579 3.68-.965zm10.111-4.893c-.272-.137-1.614-.796-1.863-.887-.249-.09-.43-.136-.61.137-.181.272-.7.887-.859 1.068-.16.181-.318.204-.59.069-.272-.136-1.15-.424-2.19-1.353-.809-.721-1.355-1.614-1.514-1.886-.16-.271-.017-.417.119-.553.123-.122.272-.318.408-.476.136-.159.181-.272.272-.453.09-.181.045-.34-.023-.476-.068-.137-.61-1.472-.836-2.016-.22-.53-.442-.457-.61-.466-.157-.008-.339-.01-.521-.01-.181 0-.476.068-.724.34-.249.272-.95.93-.95 2.267 0 1.338.973 2.63 1.109 2.812.136.181 1.914 2.923 4.637 4.101.648.28 1.153.448 1.547.573.651.207 1.243.178 1.71.108.521-.078 1.614-.66 1.84-1.297.227-.637.227-1.183.159-1.297-.068-.113-.249-.18-.521-.318z"/>
            </svg>
            <span>
              {locale === "en" ? "Share on WhatsApp" : "Shiriki Kwenye WhatsApp"}
            </span>
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
