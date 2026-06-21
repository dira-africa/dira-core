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

const CROP_OPTIONS = [
  { id: "Maize", en: "Maize", sw: "Mahindi" },
  { id: "Beans", en: "Beans", sw: "Maharage" },
  { id: "Wheat", en: "Wheat", sw: "Ngano" },
  { id: "Tea", en: "Tea", sw: "Chai" },
  { id: "Coffee", en: "Coffee", sw: "Kahawa" },
  { id: "Vegetables", en: "Vegetables", sw: "Mboga mboga" },
  { id: "Other", en: "Other", sw: "Nyinginezo" }
];

const GROWTH_STAGES = [
  { id: "Germination", en: "Germination", sw: "Kuchipua" },
  { id: "Seedling", en: "Seedling", sw: "Miche" },
  { id: "Vegetative", en: "Vegetative", sw: "Ukuaji wa Majani" },
  { id: "Flowering", en: "Flowering", sw: "Uchanaji Maua" },
  { id: "Grain Fill", en: "Grain Fill / Maturation", sw: "Kujaza Mbegu" },
  { id: "Harvest Ready", en: "Harvest Ready", sw: "Tayari kwa Mavuno" }
];

const PROBLEM_OPTIONS = [
  { id: "Yellowing", en: "Yellowing leaves", sw: "Majani ya njano" },
  { id: "Wilting", en: "Wilting / Drying", sw: "Kunyauka / Kukauka" },
  { id: "Spots/Disease", en: "Leaf spots / Rust / Disease", sw: "Madoadoa / Kutu / Ugonjwa" },
  { id: "Pests", en: "Pests / Insects", sw: "Wadudu waharibifu" },
  { id: "Flooding", en: "Waterlogging / Flooding", sw: "Maji yaliyotuama / Mafuriko" },
  { id: "Drought", en: "Drought stress / Lack of water", sw: "Ukame / Ukosefu wa maji" },
];

export default function SubmitDetails() {
  const router = useRouter();
  const { locale } = useTranslation();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    // Read photo from sessionStorage
    const storedPhoto = sessionStorage.getItem("dira_submit_photo");
    if (!storedPhoto) {
      // If photo is missing, send back to capture
      const baseRoute = window.location.pathname.includes("/farmer/submit") ? "/farmer/submit" : "/submit";
      router.replace(`${baseRoute}/capture`);
    } else {
      setPhotoPreview(storedPhoto);
    }
  }, []);

  const handleCheckboxChange = (problemId: string) => {
    if (problemId === "None") {
      setSelectedProblems(["None"]);
      return;
    }

    let updated = [...selectedProblems].filter(p => p !== "None");
    if (updated.includes(problemId)) {
      updated = updated.filter(p => p !== problemId);
    } else {
      updated.push(problemId);
    }
    setSelectedProblems(updated);
  };

  const handleNext = () => {
    if (!cropType || !growthStage) return;

    // Save details to sessionStorage
    sessionStorage.setItem("dira_submit_crop_type", cropType);
    sessionStorage.setItem("dira_submit_growth_stage", growthStage);
    sessionStorage.setItem("dira_submit_problems", JSON.stringify(selectedProblems));
    sessionStorage.setItem("dira_submit_notes", notes.slice(0, 200));

    // Navigate to Page 3 Uploading
    const baseRoute = window.location.pathname.includes("/farmer/submit") ? "/farmer/submit" : "/submit";
    router.push(`${baseRoute}/uploading`);
  };

  return (
    <AuthGuard>
      <main className="flex-1 w-full max-w-md mx-auto p-5 flex flex-col justify-between bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen">
        
        {/* Header */}
        <div className="space-y-1 py-2">
          <div className="flex items-center space-x-2 text-primary">
            <span className="text-xl">📋</span>
            <span className="text-xs font-black tracking-widest uppercase">
              {locale === "en" ? "Step 2: Crop Details" : "Hatua ya 2: Maelezo"}
            </span>
          </div>
          <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
            {locale === "en" ? "Add Crop Information" : "Weka Maelezo ya Zao"}
          </h1>
        </div>

        {/* Scrollable Form Content */}
        <section className="flex-1 my-4 space-y-5 overflow-y-auto pr-1 max-h-[60vh]">
          {/* Photo Thumbnail */}
          {photoPreview && (
            <div className="flex items-center space-x-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Crop Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-extrabold text-white/90">
                  {locale === "en" ? "Captured Image" : "Picha Iliyopigwa"}
                </p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase mt-0.5">
                  ✅ {locale === "en" ? "Ready for upload" : "Tayari kupakiwa"}
                </p>
              </div>
            </div>
          )}

          {/* Crop Type Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/70">
              {locale === "en" ? "Select Crop Type *" : "Chagua Aina ya Zao *"}
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full p-3 bg-white/5 hover:bg-white/10 focus:bg-[#04120f] border border-white/10 rounded-2xl text-xs font-semibold text-white/90 focus:outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="" className="bg-[#04120f]">{locale === "en" ? "Choose Crop..." : "Chagua Zao..."}</option>
              {CROP_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#04120f]">
                  {locale === "sw" ? opt.sw : opt.en}
                </option>
              ))}
            </select>
          </div>

          {/* Growth Stage Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/70">
              {locale === "en" ? "Growth Stage *" : "Hatua ya Ukuaji *"}
            </label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full p-3 bg-white/5 hover:bg-white/10 focus:bg-[#04120f] border border-white/10 rounded-2xl text-xs font-semibold text-white/90 focus:outline-none focus:border-primary/50 transition-all appearance-none"
            >
              <option value="" className="bg-[#04120f]">{locale === "en" ? "Choose Stage..." : "Chagua Hatua..."}</option>
              {GROWTH_STAGES.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#04120f]">
                  {locale === "sw" ? opt.sw : opt.en}
                </option>
              ))}
            </select>
          </div>

          {/* Visible Problems Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 block">
              {locale === "en" ? "Visible Problems (Select all that apply)" : "Matatizo Yanayoonekana"}
            </label>
            
            <div className="space-y-2">
              {PROBLEM_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center space-x-3 bg-white/5 border border-white/5 p-3 rounded-2xl hover:bg-white/10 transition-all cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedProblems.includes(opt.id)}
                    onChange={() => handleCheckboxChange(opt.id)}
                    className="h-4 w-4 rounded-md border-white/20 text-primary focus:ring-primary/40 bg-white/5 cursor-pointer accent-primary"
                  />
                  <span className="text-xs font-medium text-white/80">
                    {locale === "sw" ? opt.sw : opt.en}
                  </span>
                </label>
              ))}

              {/* None Option */}
              <label
                className="flex items-center space-x-3 bg-white/5 border border-white/5 p-3 rounded-2xl hover:bg-white/10 transition-all cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedProblems.includes("None") || selectedProblems.length === 0}
                  onChange={() => handleCheckboxChange("None")}
                  className="h-4 w-4 rounded-md border-white/20 text-primary focus:ring-primary/40 bg-white/5 cursor-pointer accent-primary"
                />
                <span className="text-xs font-extrabold text-emerald-400">
                  🌱 {locale === "en" ? "None / Healthy Crop" : "Hakuna / Zao lina afya"}
                </span>
              </label>
            </div>
          </div>

          {/* Optional Notes Textarea */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-white/70">
                {locale === "en" ? "Additional Notes" : "Maelezo ya Ziada"}
              </label>
              <span className="text-[10px] text-white/40">{notes.length}/200</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              placeholder={locale === "en" ? "Describe farm health issues..." : "Eleza matatizo ya afya ya shamba..."}
              rows={3}
              className="w-full p-3 bg-white/5 border border-white/10 focus:bg-[#04120f] focus:border-primary/50 focus:outline-none rounded-2xl text-xs font-semibold text-white/90 placeholder-white/30 transition-all resize-none"
            />
          </div>
        </section>

        {/* Footer Actions */}
        <footer className="pt-4 flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
          >
            ⬅️ {locale === "en" ? "Back" : "Rudi nyuma"}
          </button>
          <button
            onClick={handleNext}
            disabled={!cropType || !growthStage}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${
              cropType && growthStage
                ? "bg-primary hover:brightness-105 active:scale-[0.98]"
                : "bg-white/10 text-white/35 cursor-not-allowed border border-white/5"
            }`}
          >
            ➡️ {locale === "en" ? "Next" : "Mbele"}
          </button>
        </footer>

      </main>
    </AuthGuard>
  );
}
