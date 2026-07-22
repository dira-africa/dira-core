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

import { useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function VerificationClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  
  const [submissionId, setSubmissionId] = useState("");
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet";
  const topicId = process.env.NEXT_PUBLIC_HDIRA_HCS_TOPIC_ID || "0.0.9544926";

  const searchUrl = submissionId 
    ? `https://hashscan.io/${network}/search?q=${encodeURIComponent(submissionId)}`
    : `https://hashscan.io/${network}/topic/${topicId}`;

  const pillars = [
    {
      title: isSw ? "1. Uhakiki wa Crop-AI" : "1. Computer Vision Audits",
      desc: isSw 
        ? "Mifano yetu ya kijasusi (AI) inakagua kila picha iliyowasilishwa kuhakikisha inawakilisha zao halisi shambani, inazuia picha zilizopakuliwa mtandaoni au zile zilizorudiwa." 
        : "Automated computer vision checks confirm the image is of a genuine crop. It analyzes species mismatch, growth stages, and tags unique hashes to block duplicate uploads."
    },
    {
      title: isSw ? "2. Geofence & GPS Verification" : "2. Geofencing & GPS Telemetry",
      desc: isSw 
        ? "Wakulima wanaweza tu kuwasilisha picha kutoka ndani ya viwango vya jiografia (boundaries) vya mashamba yao yaliyosajiliwa, kuzuia ripoti za uongo kutoka nje ya eneo." 
        : "GPS coordinates must align with the farmer's registered land parcel boundaries. Submissions are geofenced to prevent arbitrary spoofing."
    },
    {
      title: isSw ? "3. Triangulation ya Hali ya Hewa" : "3. Weather Triangulation",
      desc: isSw 
        ? "Uwasilishaji wa maajenti wa data unalinganishwa na vituo vingine vya karibu na ripoti za setilaiti ili kubaini usahihi wa masomo ya shinikizo." 
        : "Data agent barometric readings are cross-verified against nearby mobile sensors and satellite forecast models to filter anomalous or corrupted pressure inputs."
    },
    {
      title: isSw ? "4. Kuhifadhi Kwenye Hedera" : "4. Tamper-Proof Anchoring",
      desc: isSw 
        ? "Data iliyopitishwa inapata 'haki ya kikatiba' kwa kuhifadhi hash ya SHA-256 kwenye mtandao wa Hedera Consensus Service. Mara inapowekwa, haiwezi kubadilishwa wala kufutwa." 
        : "The SHA-256 hash of every verified report is anchored to Hedera HCS. Once written, the record is immutable, establishing a publicly verifiable proof of quality."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {isSw ? "DATA YENYE UTHIBITISHO" : "TRUST & PROVENANCE"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Uthibitishaji wa Hali ya Hewa" : "How Dira Proves Data Integrity"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Dira inatumia mchanganyiko wa AI, geolocation, na blockchain kuhakikisha kwamba kila pointi ya data ya hali ya hewa ni ya kweli na ya kuaminika." 
                : "Dira combines computer vision, telemetry triangulation, and ledger anchoring to deliver high-fidelity climate observations."}
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((p, idx) => (
              <ScrollReveal key={idx} className={`delay-${idx * 100}`}>
                <div className="bg-white/[0.01] border border-white/10 rounded-3xl p-8 hover:bg-[#1A1A6E]/20 hover:border-emerald-500/20 transition-all duration-300 h-full">
                  <h3 className="text-lg font-bold text-emerald-400 mb-3">{p.title}</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* HashScan Search */}
        <section className="py-16 bg-[#1A1A6E]/10 border-t border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto space-y-8">
            <ScrollReveal className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {isSw ? "Thibitisha Kwenye Hedera" : "Verify a Record Publicly"}
              </h2>
              <p className="text-white/50 text-xs sm:text-sm">
                {isSw 
                  ? "Ingiza ID ya uwasilishaji wako hapa chini ili kuikagua kwenye HashScan explorer ya Hedera." 
                  : "Enter a crop submission ID to inspect its registration on the Hedera ledger."}
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-4">
                <div>
                  <label htmlFor="search-sub-id" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "ID ya Uwasilishaji" : "Submission Transaction ID"}
                  </label>
                  <input
                    type="text"
                    id="search-sub-id"
                    placeholder="e.g. sub_12345..."
                    value={submissionId}
                    onChange={(e) => setSubmissionId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("verify_search", { subId: submissionId })}
                  className="block w-full py-3 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-xl transition-all shadow-md text-center uppercase tracking-wider text-xs"
                >
                  {isSw ? "Kagua Kwenye HashScan ↗" : "Verify on HashScan ↗"}
                </a>
                <p className="text-[10px] text-white/30 text-center font-mono">
                  {isSw ? `Hedera Topic ID ya Dira: ${topicId}` : `Dira HCS Topic ID: ${topicId}`}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
