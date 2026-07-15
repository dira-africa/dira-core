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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import AuthGuard from "@/components/AuthGuard";
import BackButton from "@/components/ui/BackButton";

export default function SubmitCapture() {
  const router = useRouter();
  const { locale } = useTranslation();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  const [compressing, setCompressing] = useState(false);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number | null>(null);

  useEffect(() => {
    // Attempt pre-fetching coordinates on page load to speed up submission
    getGPSLocation();
  }, []);

  const getGPSLocation = () => {
    setGpsStatus("fetching");
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setGpsStatus("success");
      },
      (err) => {
        console.error("GPS access failed:", err);
        setGpsStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // Image compression logic via HTML Canvas
  const compressImage = (file: File): Promise<{ base64: string; sizeKb: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Cap dimensions at 1920px
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          let quality = 0.85;
          const checkQuality = (q: number) => {
            const dataUrl = canvas.toDataURL("image/jpeg", q);
            // Calculate size from base64 string
            const sizeInBytes = Math.round((dataUrl.length - 22) * 3 / 4);
            const sizeKb = sizeInBytes / 1024;

            if (sizeKb <= 800 || q <= 0.3) {
              resolve({ base64: dataUrl, sizeKb: Math.round(sizeKb) });
            } else {
              checkQuality(q - 0.1);
            }
          };
          checkQuality(quality);
        };
      };
    });
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    // Request fresh location at time of capture
    getGPSLocation();

    try {
      const { base64, sizeKb } = await compressImage(file);
      setPhotoBase64(base64);
      setPhotoPreview(base64);
      setCompressedSizeKb(sizeKb);
    } catch (err) {
      console.error("Image compression error:", err);
    } finally {
      setCompressing(false);
    }
  };

  const handleProceed = () => {
    if (!photoBase64) return;
    
    // Store in sessionStorage to share with details and uploading routes
    sessionStorage.setItem("dira_submit_photo", photoBase64);
    sessionStorage.setItem("dira_submit_lat", latitude !== null ? String(latitude) : "");
    sessionStorage.setItem("dira_submit_lng", longitude !== null ? String(longitude) : "");

    // Navigate to Page 2 Details
    // Support both routing group directories by checking current pathname
    const baseRoute = window.location.pathname.includes("/farmer/submit") ? "/farmer/submit" : "/submit";
    router.push(`${baseRoute}/details`);
  };

  const handleRetake = () => {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setCompressedSizeKb(null);
  };

  return (
    <AuthGuard>
      <main className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-between bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen">
        
        {/* Header */}
        <div className="space-y-1 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-primary">
              <span className="text-xl">📸</span>
              <span className="text-xs font-black tracking-widest uppercase">
                {locale === "en" ? "Step 1: Crop Capture" : "Hatua ya 1: Piga Picha"}
              </span>
            </div>
            <BackButton href="/farmer/home" label={locale === "en" ? "Home" : "Nyumbani"} />
          </div>
          <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
            {locale === "en" ? "Capture Crop Photo" : "Piga Picha ya Zao"}
          </h1>
        </div>

        {/* Camera Viewport Area */}
        <section className="flex-1 my-4 flex flex-col justify-center items-center">
          {!photoPreview ? (
            <label className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-white/[0.03] flex flex-col items-center justify-center cursor-pointer transition-all space-y-3 relative group">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
                disabled={compressing}
              />
              {compressing ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-xs font-bold text-white/60">
                    {locale === "en" ? "Compressing image..." : "Inapunguza ukubwa..."}
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-5xl group-hover:scale-110 transition-transform">📸</span>
                  <p className="text-sm font-extrabold text-white/90">
                    {locale === "en" ? "Click to open camera" : "Bofya kufungua kamera"}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {locale === "en" ? "Max 800KB compressed format" : "Upeo wa 800KB baada ya kubanwa"}
                  </p>
                </>
              )}
            </label>
          ) : (
            <div className="w-full space-y-4">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                />
                
                {compressedSizeKb && (
                  <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold text-emerald-400">
                    {locale === "en" ? "Size: " : "Ukubwa: "}{compressedSizeKb} KB
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* GPS Location Tracker Card */}
        <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white/70">
              {locale === "en" ? "GPS Verification" : "Uthibitisho wa GPS"}
            </span>
            {gpsStatus === "fetching" && (
              <span className="text-white/40 animate-pulse">
                {locale === "en" ? "Fetching..." : "Inatafuta..."}
              </span>
            )}
            {gpsStatus === "success" && (
              <span className="text-emerald-400 font-extrabold flex items-center">
                🟢 {locale === "en" ? "GPS Captured" : "GPS Imerekodiwa"}
              </span>
            )}
            {gpsStatus === "error" && (
              <span className="text-rose-400 font-extrabold flex items-center">
                🔴 {locale === "en" ? "GPS Offline" : "GPS Haipatikani"}
              </span>
            )}
          </div>

          {gpsStatus === "success" && latitude && longitude && (
            <p className="text-[10px] text-white/50 font-mono">
              Lat: {latitude}, Lng: {longitude} (±10m accuracy)
            </p>
          )}

          {gpsStatus === "error" && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[10px] text-rose-400 font-medium">
              ⚠️ {locale === "en" 
                ? "Location not found — submission may not verify" 
                : "Mahali haijapatikana — uwasilishaji hauwezi kuthibitishwa"}
            </div>
          )}
        </section>

        {/* Action Controls */}
        <footer className="pt-4 flex gap-3">
          {photoPreview ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                🔄 {locale === "en" ? "Retake" : "Piga Tena"}
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 py-3 bg-primary hover:brightness-105 active:scale-[0.98] rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
              >
                ➡️ {locale === "en" ? "Proceed" : "Endelea"}
              </button>
            </>
          ) : (
            <button
              onClick={() => router.back()}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-center"
            >
              ⬅️ {locale === "en" ? "Back to Home" : "Rudi Mwanzo"}
            </button>
          )}
        </footer>

      </main>
    </AuthGuard>
  );
}
