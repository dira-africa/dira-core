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

import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function HomeClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot";

  const stats = [
    { value: "47", label: isSw ? "Kaunti Zilizofunikwa" : "Counties Covered" },
    { value: "15,200+", label: isSw ? "Vihisi Amilifu vya Simu" : "Active Mobile Sensors" },
    { value: "100k+", label: isSw ? "Vyeti vya Hali ya Hewa" : "Climate Proofs Anchored" },
    { value: "500k+", label: isSw ? "Dira Token Zilizotolewa" : "DIRA Rewards Minted" }
  ];

  const steps = [
    {
      num: "1",
      title: isSw ? "Jiunge kwenye Telegram" : "Join on Telegram",
      desc: isSw ? "Fungua bot yetu ya Telegram ili kusajili akaunti yako ya Mkulima au Agent." : "Open our Telegram bot to register your account as a Farmer or Agent."
    },
    {
      num: "2",
      title: isSw ? "Nasa na Uwasilishe" : "Capture & Submit",
      desc: isSw ? "Tuma picha za mazao au ruhusu usawazishaji wa shinikizo la hewa kiotomatiki." : "Send crop photos or enable automatic barometric pressure syncing."
    },
    {
      num: "3",
      title: isSw ? "Uhakiki wa Kina wa AI" : "AI Verification",
      desc: isSw ? "AI yetu inakagua data na kuihifadhi kwenye blockchain ya Hedera." : "Our AI validates the data parameters and anchors them to Hedera ledger."
    },
    {
      num: "4",
      title: isSw ? "Chuma na Ukomboe" : "Earn & Redeem",
      desc: isSw ? "Pata DIRA Tokens na uzikomboe kwa salio la simu au vocha za pembejeo." : "Earn DIRA tokens and redeem them instantly for airtime or input vouchers."
    }
  ];

  const audiences = [
    {
      role: isSw ? "KWA WAKULIMA" : "FOR FARMERS",
      title: isSw ? "Fuatilia Mazao Yako" : "Monitor Your Crops",
      desc: isSw ? "Wasilisha picha za mazao kila wiki mbili na upokee vocha za mbegu na mbolea au salio la simu." : "Submit geo-tagged crop photos bi-weekly to receive airtime and agricultural vouchers for seeds/fertilizer.",
      link: "/for-farmers",
      btnText: isSw ? "Jifunze Zaidi" : "Learn More"
    },
    {
      role: isSw ? "KWA MAAJENTI" : "FOR DATA AGENTS",
      title: isSw ? "Usawazishaji wa Hali ya Hewa" : "Passive Weather Syncing",
      desc: isSw ? "Vijana wanajipatia kipato kwa kuruhusu usawazishaji wa sensorer za barometa za simu zao mara 4 kwa siku." : "Youth earn passive income by syncing their smartphone barometric sensors four times daily.",
      link: "/for-agents",
      btnText: isSw ? "Anza Sasa" : "Get Started"
    },
    {
      role: isSw ? "KWA WASHIRIKA" : "FOR PARTNERS",
      title: isSw ? "Utafiti na Bima za Kilimo" : "Insurance & Climate Research",
      desc: isSw ? "Nunua data thabiti na iliyothibitishwa ya hali ya hewa ili kuendesha mipango ya bima ya ukame." : "Integrate verified micro-climate data matrices to build index-based drought insurance schemes.",
      link: "/for-partners",
      btnText: isSw ? "Wasiliana Nasi" : "Partner With Us"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/40 to-transparent">
          {/* Animated Background Circles */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#0A6E56]/10 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-5xl mx-auto text-center space-y-8">
            <ScrollReveal>
              <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                {isSw ? "Kubadilisha Simu Janja Kuwa" : "Turning Smartphones Into"}<br />
                {isSw ? "Mtandao wa Hali ya Hewa Kenya" : "Kenya's Weather Sensing Network"}
              </h1>
            </ScrollReveal>

            <ScrollReveal className="delay-100">
              <p className="text-base sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                {isSw 
                  ? "Dira ni Mtandao wa Kusoma Hali ya Hewa uliotawanyika (DePIN). Tunakusanya data ya barometa na ripoti za mazao ili kupunguza athari za tabianchi kote Kenya na kutoa zawadi za Climate Tokens."
                  : "Dira is a Decentralised Physical Infrastructure Network (DePIN). We crowdsource barometric and crop observations to mitigate micro-climate risks across Kenya and distribute Climate Token rewards."}
              </p>
            </ScrollReveal>

            <ScrollReveal className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 delay-200">
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("cta_click", { target: "hero_open_bot" })}
                className="w-full sm:w-auto px-8 py-4 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-2xl shadow-lg shadow-[#0A6E56]/30 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.97] text-center"
              >
                {isSw ? "Anza Kupata Mapato kwenye Telegram" : "Start Earning in Telegram"}
              </a>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all duration-200 text-center"
              >
                {isSw ? "Jinsi inavyofanya kazi" : "How it Works"}
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* Live Counters */}
        <section className="py-12 bg-white/[0.01] border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/50 font-bold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 Steps Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
          <ScrollReveal className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold">
              {isSw ? "Hatua Nne Rahisi za Kuchuma" : "4 Simple Steps to Earn"}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              {isSw 
                ? "Dira inarahisisha ukusanyaji wa data ya hali ya hewa na ugawaji wa Climate Tokens kwa hatua chache rahisi." 
                : "Dira coordinates regional weather observations and distributes climate rewards in a simplified cycle."}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <ScrollReveal key={idx} className={`delay-${idx * 100}`}>
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] transition-all duration-300 relative group h-full">
                  <div className="absolute top-4 right-6 text-6xl font-black text-white/5 font-mono group-hover:text-emerald-500/10 transition-colors">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-extrabold mb-3 text-emerald-400">{step.title}</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Who it's For Section */}
        <section className="py-24 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            <ScrollReveal className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                {isSw ? "Soko Letu na Washiriki" : "Who Dira Powers"}
              </h2>
              <p className="text-white/60 text-xs sm:text-sm mt-2 leading-relaxed">
                {isSw 
                  ? "Dira inaunganisha wakulima, vijana wa maajenti wa data, na washirika wa bima ya kilimo katika uchumi mmoja."
                  : "Dira connects farmers, young data agents, and commercial insurers into a unified climate network."}
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {audiences.map((aud, idx) => (
                <ScrollReveal key={idx} className={`delay-${idx * 100}`}>
                  <div className="bg-white/[0.01] border border-white/10 hover:border-emerald-500/30 rounded-3xl p-8 flex flex-col justify-between h-full hover:bg-white/[0.02] transition-all duration-300">
                    <div>
                      <span className="text-[10px] uppercase text-emerald-400 font-extrabold tracking-wider">{aud.role}</span>
                      <h3 className="text-xl font-bold mt-2 mb-4">{aud.title}</h3>
                      <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-8">{aud.desc}</p>
                    </div>
                    <Link
                      href={aud.link}
                      className="inline-block w-full text-center py-3 bg-white/5 hover:bg-emerald-500 hover:text-white border border-white/10 rounded-2xl text-xs font-bold transition-all"
                    >
                      {aud.btnText}
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Teaser Accordion */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
          <ScrollReveal className="text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              {isSw ? "Maswali Yanayoulizwa Sana" : "Frequently Asked Questions"}
            </h2>
            <p className="text-white/50 text-xs sm:text-sm mt-2">
              {isSw ? "Majibu ya maswali ya kawaida kuhusu Dira na Climate Tokens." : "Quick answers to help you get started with Dira and Climate Tokens."}
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            <ScrollReveal className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
              <h4 className="font-bold text-sm sm:text-base text-white">
                {isSw ? "Dira ni nini hasa?" : "What is Dira Africa?"}
              </h4>
              <p className="text-white/60 text-xs sm:text-sm mt-2 leading-relaxed">
                {isSw 
                  ? "Dira ni mtandao uliotawanyika (DePIN) unaotumia sensorer za simu janja kutoa taarifa sahihi za hali ya hewa Kenya." 
                  : "Dira is a decentralized physical infrastructure network that transforms everyday smartphones into a distributed climate sensing web."}
              </p>
            </ScrollReveal>
            <ScrollReveal className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
              <h4 className="font-bold text-sm sm:text-base text-white">
                {isSw ? "Ninalipwaje kwa kushiriki?" : "How do I earn rewards?"}
              </h4>
              <p className="text-white/60 text-xs sm:text-sm mt-2 leading-relaxed">
                {isSw 
                  ? "Unapokea DIRA Tokens kwenye blockchain ya Hedera kila wakati unapowasilisha picha ya zao au kusawazisha shinikizo la hewa. Unaweza kuzibadilisha kuwa salio la simu (airtime) au vocha za kilimo." 
                  : "You receive DIRA Climate Tokens for submitting verified crop reports or syncing barometric data. These tokens can be redeemed for airtime or input vouchers."}
              </p>
            </ScrollReveal>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/faq"
              className="text-xs sm:text-sm font-bold text-emerald-400 hover:underline"
            >
              {isSw ? "Soma maswali yote hapa →" : "View all FAQs →"}
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
