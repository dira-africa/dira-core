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

export default function ForAgentsClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot";

  const requirements = [
    {
      title: isSw ? "Simu janja yenye Barometa" : "Smartphone with Barometer",
      desc: isSw 
        ? "Unahitaji simu ya Android au iOS yenye kihisi kilichojengwa ndani cha shinikizo la hewa (barometer)." 
        : "Requires a compatible Android or iOS smartphone with an active, built-in barometric pressure sensor."
    },
    {
      title: isSw ? "Muunganisho wa Internet" : "Reliable Internet",
      desc: isSw 
        ? "Simu inahitaji mtandao kupakia data mara 4 kwa siku. Matumizi ya data ni kidogo sana (chini ya 1MB kwa mwezi)." 
        : "Requires connection to sync readings 4x daily. Data payload is extremely lightweight (less than 1MB per month)."
    },
    {
      title: isSw ? "Kuwezesha Huduma ya Eneo (GPS)" : "GPS Telemetry Access",
      desc: isSw 
        ? "Sensorer inahitaji kujua mahali ilipo kulingana naGPS ili kutengeneza ramani za hali ya hewa." 
        : "Requires location permission to map pressure variations to specific regional micro-climates."
    }
  ];

  const agentSteps = [
    {
      num: "1",
      title: isSw ? "Sajili Akaunti Yako" : "Register on Telegram",
      desc: isSw ? "Fungua Dira Bot na uchague kusajiliwa kama Agent." : "Launch our Telegram bot and select register as a Data Agent."
    },
    {
      num: "2",
      title: isSw ? "Washa Kipima Shinikizo" : "Initialize Sensor Sync",
      desc: isSw ? "Ruhusu programu ya Dira kusoma barometer ya simu yako." : "Grant permission for the Dira app to access your smartphone's built-in barometer."
    },
    {
      num: "3",
      title: isSw ? "Usawazishaji Pasivu" : "Zero-Effort Background Sync",
      desc: isSw ? "Simu yako itatuma shinikizo la hewa kiotomatiki mara 4 kwa siku bila kukusumbua." : "Your device automatically uploads pressure data in the background four times daily."
    },
    {
      num: "4",
      title: isSw ? "Pata Zawadi za Kila Wiki" : "Earn Passive Climate Tokens",
      desc: isSw ? "Pata Climate Tokens (DIRA) kwa kila siku ya usawazishaji thabiti na uzikomboe." : "Accumulate DIRA rewards for consistent daily syncs and cashout weekly."
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
              {isSw ? "FURSA YA KIPATO KWA VIJANA" : "YOUTH ECONOMIC OPPORTUNITY"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Kuwa Agent wa Data wa Dira" : "Become a Dira Data Agent"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Chuma kipato pasivu kwa kuruhusu simu yako janja kusawazisha masomo ya shinikizo la barometa mara 4 kwa siku." 
                : "Earn passive airtime and token rewards by contributing high-frequency barometric data from your smartphone's built-in sensors."}
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center">
            {isSw ? "Vigezo vya Kujiunga" : "Requirements to Join"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requirements.map((req, idx) => (
              <ScrollReveal key={idx} className={`delay-${idx * 100}`}>
                <div className="bg-white/[0.01] border border-white/10 rounded-3xl p-8 hover:bg-[#1A1A6E]/10 hover:border-emerald-500/20 transition-all duration-300 h-full">
                  <h3 className="text-lg font-bold text-emerald-400 mb-2">{req.title}</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{req.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="py-16 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center">
              {isSw ? "Jinsi inavyofanya kazi" : "How to Earn Passive Income"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {agentSteps.map((step, idx) => (
                <ScrollReveal key={idx} className={`delay-${idx * 100}`}>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all h-full relative">
                    <span className="absolute -top-4 -left-2 text-6xl font-black text-emerald-500/10 font-mono">
                      {step.num}
                    </span>
                    <h4 className="text-base font-bold text-white mb-2 pt-4">{step.title}</h4>
                    <p className="text-white/60 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-t from-[#1A1A6E]/30 to-transparent">
          <ScrollReveal className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {isSw ? "Ready Kuanza Syncing?" : "Ready to Start Syncing?"}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm">
              {isSw 
                ? "Bofya kitufe hapa chini kufungua Dira Bot ya Telegram na kuanza kupata Climate Tokens leo." 
                : "Open the Telegram app and register as a Data Agent to turn your phone into a weather station."}
            </p>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { target: "agents_bottom" })}
              className="inline-block px-8 py-4 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-102"
            >
              {isSw ? "Sajili kama Agent Sasa" : "Register as Agent"}
            </a>
          </ScrollReveal>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
