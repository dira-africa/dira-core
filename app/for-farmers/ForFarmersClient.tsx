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

export default function ForFarmersClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot";

  const benefits = [
    {
      icon: "📱",
      title: isSw ? "Nasa kwa Urahisi" : "Easy Mobile Capture",
      desc: isSw 
        ? "Wasilisha picha kupitia programu ya Telegram. Hakuna vifaa ngumu vya kununua, unatumia simu yako tu." 
        : "Capture field status photographically via our Telegram Mini App. Zero dedicated sensing hardware required."
    },
    {
      icon: "🪙",
      title: isSw ? "Zawadi za Token za Kila Wiki" : "Climate Token Rewards",
      desc: isSw 
        ? "Kila ripoti iliyothibitishwa inakuletea DIRA tokens moja kwa moja kwenye mkoba wako wa kidijitali." 
        : "Earn Climate Tokens (DIRA) for each verified crop status report. Balances credit bi-weekly directly."
    },
    {
      icon: "🛒",
      title: isSw ? "Mpatanishi wa Vocha na Pesa" : "Input Vouchers & Cashout",
      desc: isSw 
        ? "Komboa tokens zako kwa salio la simu, vocha za mbegu na mbolea, au pesa taslimu kupitia M-Pesa." 
        : "Redeem tokens instantly for airtime, agro-dealer seed/fertilizer vouchers, or Safaricom M-Pesa cashout."
    }
  ];

  const steps = [
    {
      step: "1",
      title: isSw ? "Jiunge na Dira Bot" : "Register with Dira Bot",
      desc: isSw ? "Bofya kitufe cha Telegram na ujisajili kama Mkulima." : "Launch the Telegram bot and complete registration as a Farmer."
    },
    {
      step: "2",
      title: isSw ? "Piga Picha za Shamba" : "Photograph Your Crop",
      desc: isSw ? "Chukua picha wazi ya zao lako kila wiki mbili na viwianishi vya GPS vikiwa wazi." : "Snap a clear photo of your field every two weeks with active location services enabled."
    },
    {
      step: "3",
      title: isSw ? "Uhakiki na Uhifadhi" : "AI Validation",
      desc: isSw ? "AI yetu inakagua afya ya zao na kuhifadhi uthibitisho kwenye blockchain." : "AI validates crop type/health metrics and anchors cryptographic proof on Hedera."
    },
    {
      step: "4",
      title: isSw ? "Kukomboa Thamani Yako" : "Redeem Rewards",
      desc: isSw ? "Badilisha tokens zako kuwa salio au nenda kwa agro-dealer aliyesajiliwa kupata mbegu." : "Convert tokens to mobile airtime, shop at partner agro-dealers, or cashout via M-Pesa."
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
              {isSw ? "Zawadi za Kilimo" : "Farmer Empowerment"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Kuwawezesha Wakulima wa Kenya" : "Empowering Kenyan Farmers"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Dira inakupa uwezo wa kuchuma kipato cha ziada kwa kuripoti afya ya mazao yako. Photograph shamba lako na upate Climate Tokens." 
                : "Dira rewards farmers for monitoring agricultural progress. Photograph your fields, submit location-verified data, and redeem tokens directly for farm inputs or cash."}
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} className={`delay-${index * 100}`}>
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed">{benefit.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center">
              {isSw ? "Hatua Rahisi Nne" : "How to Participate"}
            </h2>
            <div className="space-y-6">
              {steps.map((step, idx) => (
                <ScrollReveal key={idx}>
                  <div className="flex items-start space-x-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
                    <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                      {step.step}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{step.title}</h4>
                      <p className="text-xs text-white/60 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-t from-[#1A1A6E]/30 to-transparent">
          <ScrollReveal className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {isSw ? "Jiunge kama Mkulima Leo" : "Join as a Farmer Today"}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm">
              {isSw 
                ? "Fungua Dira Africa bot kwenye Telegram na uanze kupata Climate Tokens kwa picha ya kwanza." 
                : "Launch the Telegram Mini App and make your first verified crop submission to earn rewards."}
            </p>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { target: "farmers_bottom" })}
              className="inline-block px-8 py-4 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-102"
            >
              {isSw ? "Anza Kuchuma Sasa" : "Start Earning"}
            </a>
          </ScrollReveal>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
