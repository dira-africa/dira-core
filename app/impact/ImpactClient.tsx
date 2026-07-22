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

import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ImpactStats {
  totalVerifiedDataPoints: number;
  activeUsers7Days: number;
  countiesCovered: number;
  cropSubmissionsMonth: number;
  tokensDisbursedKes: number;
  hedera: {
    topicId?: string;
    tokenId?: string;
    topicLink?: string | null;
    tokenLink?: string | null;
  };
}

export default function ImpactClient({ stats }: { stats: ImpactStats }) {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet";

  const items = [
    {
      value: stats.totalVerifiedDataPoints.toLocaleString(),
      label: isSw ? "Pointi za Hali ya Hewa Zilizothibitishwa" : "Verified Climate Observations",
      desc: isSw ? "Jumla ya picha za mazao na masomo ya barometer yaliyothibitishwa na AI." : "Total crop audits and barometric telemetry records validated."
    },
    {
      value: stats.activeUsers7Days.toLocaleString(),
      label: isSw ? "Wachangiaji Amilifu (Siku 7)" : "Active Contributors (7 Days)",
      desc: isSw ? "Wakulima na maajenti walioripoti data katika wiki iliyopita." : "Farmers and agents who synced environmental data in the past week."
    },
    {
      value: stats.countiesCovered.toString(),
      label: isSw ? "Kaunti Zilizofunikwa" : "Counties Monitored",
      desc: isSw ? "Idadi ya kaunti nchini Kenya zenye vifaa amilifu vya kupimia hewa." : "Number of counties in Kenya with active smartphone micro-sensors."
    },
    {
      value: `KES ${stats.tokensDisbursedKes.toLocaleString()}`,
      label: isSw ? "Thamani ya Zawadi Zilizokombolewa" : "Disbursed Reward Value",
      desc: isSw ? "Thamani yote ya salio la simu na vocha zilizolipwa kwa wanajamii." : "Total value of airtime and vouchers redeemed by network contributors."
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
              {isSw ? "RIPOTI YA UWANJA" : "NETWORK LEDGER"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Matokeo Yetu na Uwazi" : "Dira Network Impact Tracker"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Dira inahakikisha uwazi wa 100%. Data yote ya hali ya hewa inahifadhiwa kwenye Hedera Consensus Service." 
                : "Real-time network stats verified by automated AI audits and anchored cryptographically onto public ledgers."}
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item, idx) => (
              <ScrollReveal key={idx} className={`delay-${idx * 100}`}>
                <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-4 hover:border-emerald-500/20 transition-all duration-300">
                  <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono">
                    {item.value}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Ledger Details */}
        <section className="py-16 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center">
              {isSw ? "Uthibitishaji wa Hedera Ledger" : "Hedera Ledger Provenance"}
            </h2>
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl space-y-6">
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed text-center">
                {isSw 
                  ? "Kila ripoti inajumuisha SHA-256 hash inayowekwa kwenye Hedera consensus topic ili kuondoa udanganyifu. Bofya viungo hapa chini kukagua mtandao wetu moja kwa moja." 
                  : "All observations generate cryptographic hashes anchored on-chain. Audit the transactions and tokens directly using the public block explorers below."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={stats.hedera.topicLink || `https://hashscan.io/${network}/topic/${stats.hedera.topicId || '0.0.9544926'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-2xl transition-all text-center space-y-2 group"
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Hedera HCS Topic ID</span>
                  <span className="text-sm font-mono font-bold text-white group-hover:underline">{stats.hedera.topicId || "0.0.9544926"}</span>
                  <span className="text-xs text-white/40">Audit Consensus Records ↗</span>
                </a>
                <a
                  href={stats.hedera.tokenLink || `https://hashscan.io/${network}/token/${stats.hedera.tokenId || '0.0.9544938'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-emerald-500/10 border border-white/10 rounded-2xl transition-all text-center space-y-2 group"
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Hedera HTS Token ID</span>
                  <span className="text-sm font-mono font-bold text-white group-hover:underline">{stats.hedera.tokenId || "0.0.9544938"}</span>
                  <span className="text-xs text-white/40">Audit Token Distribution ↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
