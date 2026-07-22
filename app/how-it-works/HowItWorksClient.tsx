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
import { trackEvent } from "@/lib/analytics";

export default function HowItWorksClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot";

  const workflow = [
    {
      step: "01",
      title: isSw ? "Nasa na Upakie" : "Capture & Upload",
      desc: isSw 
        ? "Wakulima wanapiga picha za mazao yao mara mbili kwa wiki kupitia programu ya Telegram. Simu inaambatanisha viwianishi vya GPS na alama ya muda." 
        : "Farmers capture geo-tagged crop photos bi-weekly. The smartphone records GPS coordinates, altitude, and timestamp details automatically.",
      detail: isSw 
        ? "Simu zinasoma shinikizo la hewa kiotomatiki mara 4 kwa siku kama sehemu ya maajenti wa data." 
        : "Phones sync background barometric telemetry 4x daily to capture high-resolution regional pressure gradients."
    },
    {
      step: "02",
      title: isSw ? "Uhakiki wa Kina wa AI" : "AI Verification Audit",
      desc: isSw 
        ? "Kila ripoti inachakatwa kupitia mfano wa Bayesian. AI inathibitisha uhalisi wa picha, inafananisha aina ya zao, na inakagua afya ya mimea." 
        : "Every submission goes through our automated verification pipeline. AI validates photo hashes, confirms growth stage, and checks local weather reports.",
      detail: isSw 
        ? "Mchakato huu unazuia uwasilishaji bandia au picha zilizorudiwa ili kuhakikisha uaminifu." 
        : "The process checks for duplicates and GPS geofence limits to ensure highly reliable ground-truth observations."
    },
    {
      step: "03",
      title: isSw ? "Kuhifadhi Kwenye Hedera Ledger" : "Anchoring to Hedera",
      desc: isSw 
        ? "Baada ya kupitishwa, hash salama ya SHA-256 ya data inahifadhiwa kwenye Hedera Consensus Service (HCS) Topic. Hii inatoa uthibitisho wa umma usiobadilika." 
        : "Once approved, a secure SHA-256 hash of the verification score and telemetry is anchored onto the Hedera Consensus Service (HCS) Topic.",
      detail: isSw 
        ? "Hakuna data binafsi ya mkulima inayowekwa hadharani, kuhakikisha ulinzi kamili wa data." 
        : "This guarantees full auditability of the data quality while keeping farmers' personally identifiable information private."
    },
    {
      step: "04",
      title: isSw ? "Zawadi za Token za Kila Wiki" : "Climate Token Rewards",
      desc: isSw 
        ? "Uwasilishaji uliothibitishwa unastahili kupata Climate Tokens (DIRA) kupitia Hedera Token Service (HTS). Hizi huwekwa kwenye mkoba wako wa ndani ya programu." 
        : "Verified submissions earn Climate Tokens (DIRA) minted on the Hedera Token Service (HTS) and credited directly to the in-app wallet.",
      detail: isSw 
        ? "Tokens zinaweza kukombolewa kwa salio la simu (airtime) au vocha za pembejeo za kilimo." 
        : "Farmers redeem tokens for mobile airtime (Africa's Talking) or seed/fertilizer vouchers at partner agro-dealers."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Mzunguko wa Kazi wa Dira" : "The Dira Sensing Loop"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Gundua jinsi tunavyobadilisha data ya vihisi vya simu kuwa ripoti zilizohakikiwa na blockchain na kuwapa wakulima zawadi za Climate Tokens." 
                : "Explore how we convert smartphone environmental data into verified climate assets anchored on Hedera."}
            </p>
          </div>
        </section>

        {/* Workflow Diagram */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
          <div className="space-y-12">
            {workflow.map((item, idx) => (
              <ScrollReveal key={idx}>
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 bg-white/[0.01] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.02] transition-all duration-300">
                  <div className="text-5xl font-black text-emerald-400 font-mono shrink-0">
                    {item.step}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                    <div className="text-[11px] text-white/40 border-l-2 border-emerald-500/30 pl-3">
                      {item.detail}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-t from-[#1A1A6E]/30 to-transparent">
          <ScrollReveal className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold">
              {isSw ? "Ready Kuanza Kuchuma?" : "Ready to Start Earning?"}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm">
              {isSw 
                ? "Jiunge na maelfu ya wakulima na maajenti kote Kenya leo." 
                : "Join thousands of farmers and agents across Kenya who are mapping weather patterns today."}
            </p>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { target: "how_works_bottom" })}
              className="inline-block px-8 py-4 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-102"
            >
              {isSw ? "Fungua katika Telegram" : "Open in Telegram"}
            </a>
          </ScrollReveal>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
