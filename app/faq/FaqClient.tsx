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

export default function FaqClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";

  const faqs = [
    {
      q: isSw ? "Dira ni nini?" : "What is Dira Africa?",
      a: isSw 
        ? "Dira ni mtandao uliotawanyika wa vihisi vya kimwili (DePIN) unaotumia simu janja za wakulima na maajenti kukusanya data sahihi za hali ya hewa nchini Kenya." 
        : "Dira is a decentralized physical infrastructure network (DePIN) that harnesses smartphone sensors across Kenya to compile micro-climate data sets."
    },
    {
      q: isSw ? "Nani anaweza kujiunga na mtandao huu?" : "Who can participate in the network?",
      a: isSw 
        ? "Mkulima yeyote nchini Kenya mwenye simu yenye GPS, au kijana yeyote mwenye simu yenye kihisi cha barometer anaweza kujiunga na kuanza kuchuma Climate Tokens." 
        : "Any farmer in Kenya with a GPS-enabled camera phone or any youth with a barometer-equipped smartphone can participate to earn rewards."
    },
    {
      q: isSw ? "Climate Tokens (DIRA) ni nini?" : "What are Climate Tokens?",
      a: isSw 
        ? "DIRA ni tokeni za kidijitali zinazotolewa kwenye blockchain ya Hedera kama zawadi kwa kuchangia data sahihi na iliyothibitishwa ya hali ya hewa." 
        : "DIRA is a digital utility token issued on the Hedera Token Service (HTS) to reward users for contributing high-fidelity environmental observations."
    },
    {
      q: isSw ? "Ninakomboaje tokens zangu kuwa salio au pesa?" : "How do I redeem my tokens?",
      a: isSw 
        ? "Unaweza kukomboa tokens zako mara moja kupitia bot yetu ya Telegram ili kupokea salio la simu (airtime) au vocha za pembejeo za kilimo kwa agro-dealers washirika." 
        : "Tokens can be redeemed within the Telegram bot for mobile airtime (Africa's Talking) or seed/fertilizer vouchers at partner agro-dealers."
    }
  ];

  // Prepare FAQPage JSON-LD
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Maswali Yanayoulizwa Sana" : "Frequently Asked Questions"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Majibu ya haraka ya maswali ya kila siku kuhusu mtandao wetu, kujiunga, na Climate Tokens." 
                : "Browse common questions regarding registrations, barometer syncs, and climate reward systems."}
            </p>
          </div>
        </section>

        {/* FAQ Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, idx) => (
            <ScrollReveal key={idx}>
              <div className="bg-white/[0.01] border border-white/5 p-6 sm:p-8 rounded-3xl hover:bg-white/[0.02] transition-all duration-200">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </section>

        {/* FAQ JSON-LD Structured Data Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
