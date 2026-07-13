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
  title: "For Partners — Dira Africa",
  description: "Join Dira Africa's partner network. Learn how agro-dealers, community coordinators, and organizations sponsor climate data sensing.",
  alternates: {
    canonical: "/for-partners",
  },
};

export default function ForPartnersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
              B2B & COMMUNITY
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Empowering Climate Partners
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Dira links farmers, local community leaders, and agricultural suppliers into a circular weather sensing economy. Sponsoring verified micro-data helps mitigate climate risks.
            </p>
          </div>
        </section>

        {/* Partner Channels */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold mb-2">Agro-Dealers</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Local agro-dealers accept Climate Token vouchers in exchange for high-yield seeds, fertilizers, and tools. Dira reconciles and settles payments directly through Fastify backend APIs.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold mb-2">Community Pools (Circles)</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Coordinators manage Dira Circles: localized cash-out pools funded by carbon offset credits. Community members vote on pooling resources to fund regional irrigation or farming gear.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 transition-all duration-300">
              <h3 className="text-lg font-bold mb-2">Data Consumers</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Insurance providers, researchers, and government departments query location-validated atmospheric and crop pressure matrices to manage drought/flood insurance schemes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
