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

import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "How It Works — Dira Africa",
  description: "Learn how the decentralized physical weather sensing network operates, leveraging smartphones, AI crop checks, and Hedera Consensus Service.",
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0A6E56]/10 rounded-full blur-3xl -z-10" />
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              How Dira Works
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Dira turns everyday smartphones into a distributed climate sensing network. By collecting barometric and crop health data, we create verified climate insights anchored on the blockchain.
            </p>
          </div>
        </section>

        {/* The Dual Node System */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold">The Dual Data Engine</h2>
            <p className="text-white/60 mt-2">Dira operates through two coordinated client roles across Kenya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Farmers Block */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold mb-6">
                🌾
              </div>
              <h3 className="text-xl font-bold mb-4">Farmer Submissions</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Farmers take geo-tagged crop photographs bi-weekly through the Telegram Mini App or standalone browser app. These pictures are uploaded to Dira's decentralized database to document agriculture progress and crop health.
              </p>
              <ul className="space-y-3 text-xs text-white/50">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✔</span>
                  <span>Interactive crop health and growth stage analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✔</span>
                  <span>Geo-referenced verification to ensure authenticity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✔</span>
                  <span>Weekly reward distribution in Climate Tokens</span>
                </li>
              </ul>
            </div>

            {/* Agents Block */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold mb-6">
                ⏱
              </div>
              <h3 className="text-xl font-bold mb-4">Data Agents</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Data Agents run a lightweight background sync process that reads the smartphone's built-in barometric sensor four times daily. This pressure history is aggregated to compile regional weather maps and predict micro-climates.
              </p>
              <ul className="space-y-3 text-xs text-white/50">
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">✔</span>
                  <span>Zero-effort passive background barometric syncing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">✔</span>
                  <span>High-frequency pressure trends mapped geographically</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-400">✔</span>
                  <span>Micro-climate token rewards for data consistency</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Verification Pipeline */}
        <section className="py-16 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Data Provenance & Security</h2>
              <p className="text-white/60 mt-2">Dira leverages Hedera Consensus Service for strict cryptographic proofs.</p>
            </div>

            <div className="relative border border-white/10 rounded-3xl bg-white/[0.01] p-8 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 text-center">
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-emerald-400">1. Capture & Local Sign</div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    User records crop photo or barometric pressure. The metadata gets signed locally with device telemetry (GPS, altitude, and timestamp).
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-emerald-400">2. AI Crop Check</div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Dira's server checks the image using computer vision to confirm it represents a genuine crop field, preventing spoofed submissions.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-emerald-400">3. Hedera Anchor</div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Once verified, the SHA-256 hash of the payload is anchored on Hedera (HCS) under Topic `0.0.9544926` for public accountability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
