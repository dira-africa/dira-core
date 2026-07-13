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
  title: "For Farmers — Dira Africa",
  description: "Learn how Kenyan farmers use the Dira weather network to earn Climate Tokens, redeem airtime, vouchers, and mobile money.",
  alternates: {
    canonical: "/for-farmers",
  },
};

export default function ForFarmersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
              Earn Climate Tokens
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Empowering Kenya's Farmers
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Dira rewards farmers for monitoring agricultural progress. Photograph your fields, submit location-verified data, and redeem tokens directly for farm inputs or cash.
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-300">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-bold mb-2">Easy Mobile Capture</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Take photos directly from your phone. Our app runs inside Telegram (TMA) as well as any browser as an installable, data-friendly PWA.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-300">
              <div className="text-3xl mb-4">🪙</div>
              <h3 className="text-lg font-bold mb-2">Climate Token Rewards</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Earn Dira Climate Tokens (DIRA) on Hedera for every verified submission. Grow your balance with bi-weekly updates.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-300">
              <div className="text-3xl mb-4">🛒</div>
              <h3 className="text-lg font-bold mb-2">Direct Vouchers & Cash</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Redeem tokens instantly for Africa's Talking airtime, agro-dealer seed/fertilizer vouchers, or Safaricom M-Pesa mobile cash pools.
              </p>
            </div>
          </div>
        </section>

        {/* How to Participate */}
        <section className="py-16 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center">4 Simple Steps to Earn</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">1</span>
                <div>
                  <h4 className="text-base font-bold text-white">Join Dira on Telegram</h4>
                  <p className="text-xs text-white/60 mt-1">Search for @DiraBot or open Dira in your mobile browser to register as a Farmer.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">2</span>
                <div>
                  <h4 className="text-base font-bold text-white">Photograph Your Crops</h4>
                  <p className="text-xs text-white/60 mt-1">Every two weeks, capture a clear photo of your field with GPS location enabled on your smartphone.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">3</span>
                <div>
                  <h4 className="text-base font-bold text-white">AI Verification & Blockchain Anchor</h4>
                  <p className="text-xs text-white/60 mt-1">Our AI analyzes crop status to verify submission, and anchors a cryptographically secure hash on the Hedera ledger.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">4</span>
                <div>
                  <h4 className="text-base font-bold text-white">Receive & Redeem</h4>
                  <p className="text-xs text-white/60 mt-1">Earn DIRA tokens directly into your wallet. Visit agro-dealers or use airtime cashouts to redeem your climate earnings.</p>
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
