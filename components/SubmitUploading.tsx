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

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiClient } from "@/lib/api-client";
import AuthGuard from "@/components/AuthGuard";

interface UploadUrlResponse {
  success: boolean;
  uploadUrl: string;
  photoUrl: string;
  filename: string;
}

interface CropSubmissionResponse {
  success: boolean;
  verificationStatus: "pending" | "verified" | "rejected";
  submissionId: string;
  message?: string;
}

export default function SubmitUploading() {
  const router = useRouter();
  const { locale } = useTranslation();

  const [phase, setPhase] = useState<"uploading" | "success" | "failure">("uploading");
  const [step, setStep] = useState<"channel" | "file" | "register">("channel");
  const [progressPercent, setProgressPercent] = useState(10);
  
  const [retryCount, setRetryCount] = useState(0);
  const [backoffSeconds, setBackoffSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form parameters loaded from sessionStorage
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cropType, setCropType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    // Read selections
    const base64 = sessionStorage.getItem("dira_submit_photo");
    const crop = sessionStorage.getItem("dira_submit_crop_type");
    const stage = sessionStorage.getItem("dira_submit_growth_stage");
    const probsStr = sessionStorage.getItem("dira_submit_problems");
    const notesText = sessionStorage.getItem("dira_submit_notes") || "";
    const latStr = sessionStorage.getItem("dira_submit_lat");
    const lngStr = sessionStorage.getItem("dira_submit_lng");

    const baseRoute = window.location.pathname.includes("/farmer/submit") ? "/farmer/submit" : "/submit";

    if (!base64 || !crop || !stage) {
      router.replace(`${baseRoute}/capture`);
      return;
    }

    setPhotoBase64(base64);
    setCropType(crop);
    setGrowthStage(stage);
    setSelectedProblems(probsStr ? JSON.parse(probsStr) : []);
    setNotes(notesText);
    setLatitude(latStr ? Number(latStr) : null);
    setLongitude(lngStr ? Number(lngStr) : null);

    // Trigger upload on mount
    startUploadFlow(base64, crop, stage, probsStr ? JSON.parse(probsStr) : [], notesText, latStr ? Number(latStr) : null, lngStr ? Number(lngStr) : null);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(",");
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const startUploadFlow = async (
    b64: string = photoBase64!,
    crop: string = cropType,
    stage: string = growthStage,
    probs: string[] = selectedProblems,
    notesText: string = notes,
    lat: number | null = latitude,
    lng: number | null = longitude
  ) => {
    setPhase("uploading");
    setStep("channel");
    setProgressPercent(15);

    try {
      // 1. GET /api/crop-submissions/upload-url - retrieve pre-signed channel
      const channelRes = await apiClient.get<UploadUrlResponse>("/api/crop-submissions/upload-url");
      if (!channelRes.success || !channelRes.uploadUrl || !channelRes.photoUrl) {
        throw new Error("Failed to allocate secure upload URL.");
      }

      setStep("file");
      setProgressPercent(45);

      // Convert Base64 back to Blob
      const photoBlob = base64ToBlob(b64);

      // 2. PUT photo file directly to the mock R2 endpoint
      const uploadRes = await fetch(channelRes.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": photoBlob.type,
        },
        body: photoBlob,
      });

      if (!uploadRes.ok) {
        throw new Error("Direct file upload to storage failed.");
      }

      setStep("register");
      setProgressPercent(80);

      // 3. POST metadata to backend
      const submissionRes = await apiClient.post<CropSubmissionResponse>("/api/crop-submissions", {
        photoUrl: channelRes.photoUrl,
        cropType: crop,
        growthStage: stage,
        latitude: lat || 0.000,
        longitude: lng || 0.000,
        problems: probs,
        notes: notesText
      });

      if (!submissionRes.success || submissionRes.verificationStatus !== "pending") {
        throw new Error("Failed to register crop submission metadata.");
      }

      setProgressPercent(100);
      setPhase("success");
      setRetryCount(0); // Reset retries on success

      // Clear session keys
      sessionStorage.removeItem("dira_submit_photo");
      sessionStorage.removeItem("dira_submit_crop_type");
      sessionStorage.removeItem("dira_submit_growth_stage");
      sessionStorage.removeItem("dira_submit_problems");
      sessionStorage.removeItem("dira_submit_notes");
      sessionStorage.removeItem("dira_submit_lat");
      sessionStorage.removeItem("dira_submit_lng");

    } catch (err) {
      console.error("Upload sequence failed:", err);
      setPhase("failure");
      triggerBackoffTimer();
    }
  };

  // Exponential backoff scheduler (2s, 4s, 8s)
  const triggerBackoffTimer = () => {
    // delay matches 2^(retryCount + 1): 2s, 4s, 8s, 16s...
    const delay = Math.pow(2, retryCount + 1);
    setBackoffSeconds(delay);
    setRetryCount(prev => prev + 1);

    let counter = delay;
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      counter -= 1;
      setBackoffSeconds(counter);
      if (counter <= 0) {
        clearInterval(timerRef.current!);
        // Run retry automatically when timer hits zero
        startUploadFlow();
      }
    }, 1000);
  };

  const handleManualRetry = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBackoffSeconds(0);
    startUploadFlow();
  };

  return (
    <AuthGuard>
      <main className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-between bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen text-center">
        
        {phase === "uploading" && (
          <div className="flex-1 flex flex-col justify-center items-center space-y-8 my-auto">
            {/* Animated Loading Circle */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full border-4 border-white/5" />
              <div className="absolute h-24 w-24 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
              <span className="text-xl font-bold text-primary font-mono">{progressPercent}%</span>
            </div>

            <div className="space-y-2 max-w-xs">
              <h1 className="font-extrabold text-base">
                {locale === "en" ? "Uploading Crop Data..." : "Inapakia Data ya Zao..."}
              </h1>
              <p className="text-xs text-white/50 leading-relaxed">
                {step === "channel" && (locale === "en" ? "Acquiring secure upload channel..." : "Kupata njia salama ya kupakia...")}
                {step === "file" && (locale === "en" ? "Uploading compressed crop photo..." : "Kupakia picha iliyobanwa...")}
                {step === "register" && (locale === "en" ? "Registering crop metadata..." : "Kusajili maelezo ya zao...")}
              </p>
            </div>
          </div>
        )}

        {phase === "success" && (
          <div className="flex-1 flex flex-col justify-center items-center space-y-6 my-auto">
            {/* Celebration Green Badge */}
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/10 animate-bounce">
              🎉
            </div>

            <div className="space-y-4 max-w-xs">
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-tight">
                {locale === "en" ? "Upload Successful!" : "Imepakiwa Kikamilifu!"}
              </h1>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-xs text-emerald-400 font-bold tracking-normal leading-relaxed text-center">
                {locale === "en"
                  ? "Submission pending AI verification. Earn 5 tokens upon validation check."
                  : "Uwasilishaji unangoja ithibati ya AI. Utapata tokeni 5 baada ya uthibitisho."}
              </div>

              <p className="text-xs text-white/50 leading-relaxed">
                {locale === "en"
                  ? "We will send your crop health analysis report via Telegram notification shortly."
                  : "Tutakutumia ripoti kamili ya afya ya zao lako kupitia Telegram hivi punde."}
              </p>
            </div>
          </div>
        )}

        {phase === "failure" && (
          <div className="flex-1 flex flex-col justify-center items-center space-y-6 my-auto">
            <div className="h-20 w-20 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-4xl shadow-lg">
              ⚠️
            </div>

            <div className="space-y-2 max-w-xs">
              <h1 className="font-extrabold text-lg">
                {locale === "en" ? "Connection Interrupted" : "Mawasiliano Yamekatika"}
              </h1>
              <p className="text-xs text-white/50 leading-relaxed">
                {locale === "en"
                  ? "The upload failed. Retrying automatically..."
                  : "Imeshindikana kupakia. Inajaribu tena yenyewe..."}
              </p>
            </div>

            {backoffSeconds > 0 && (
              <p className="text-xs font-bold text-primary animate-pulse">
                {locale === "en"
                  ? `Next attempt in ${backoffSeconds}s...`
                  : `Jaribio la pili baada ya sekunde ${backoffSeconds}...`}
              </p>
            )}

            <button
              onClick={handleManualRetry}
              className="px-6 py-3 bg-primary hover:bg-[#085a46] active:scale-[0.98] transition-all font-bold text-xs rounded-2xl uppercase tracking-wider shadow-lg"
            >
              🔄 {locale === "en" ? "Retry Now" : "Jaribu Sasa"}
            </button>
          </div>
        )}

        {/* Footer Actions */}
        {phase === "success" ? (
          <button
            onClick={() => router.push(window.location.pathname.includes("/farmer/submit") ? "/farmer/home" : "/home")}
            className="w-full py-3 bg-primary hover:brightness-105 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            {locale === "en" ? "Back to Home" : "Rudi Nyumbani"}
          </button>
        ) : (
          <div />
        )}

      </main>
    </AuthGuard>
  );
}
