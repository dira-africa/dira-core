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

export default function ForPartnersClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";

  const [formState, setFormState] = useState({ name: "", email: "", organization: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    trackEvent("partner_form_submit", { org: formState.organization });
    
    // Simulate submission
    setTimeout(() => {
      setStatus("success");
      setFormState({ name: "", email: "", organization: "", message: "" });
    }, 1200);
  };

  const partnerChannels = [
    {
      title: isSw ? "Wafanyabiashara wa Kilimo (Agro-Dealers)" : "Agro-Dealer Partners",
      desc: isSw 
        ? "Wafanyabiashara wa pembejeo za kilimo wanapokea vocha za Dira Climate Tokens kutoka kwa wakulima badala ya mbegu, mbolea, na zana za kilimo. Dira inarejesha malipo haya mara moja." 
        : "Local agro-dealers accept Dira Climate Token vouchers from farmers in exchange for seed, fertilizer, and farm tools. Dira reconciles and settles payments directly."
    },
    {
      title: isSw ? "Vikundi vya Jamii (Dira Circles)" : "Community Pools (Circles)",
      desc: isSw 
        ? "Waratibu wanasimamia Dira Circles: mabwawa ya ndani ya jamii yanayofadhiliwa na mikopo ya kaboni. Wanachama wanapigia kura matumizi ya rasilimali kununua vifaa vya pamoja." 
        : "Coordinators manage Dira Circles: localized cash pools funded by offset sponsors. Community members vote on pooling resources to fund joint irrigation or tools."
    },
    {
      title: isSw ? "Wateja wa Data (Insurers & Researchers)" : "Climate Data Consumers",
      desc: isSw 
        ? "Mashirika ya bima, watafiti, na idara za serikali wanapata data sahihi na iliyothibitishwa ya shinikizo la hewa na ripoti za mazao ili kupanga mipango ya bima ya ukame." 
        : "Insurers, researchers, and government departments query location-validated barometric and crop matrices to calibrate drought insurance indices."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {isSw ? "USHIRIKA WA B2B & JAMII" : "B2B & COMMUNITY"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Kuwawezesha Washirika wa Tabianchi" : "Empowering Climate Partners"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Dira inaunganisha wakulima, wasambazaji, na mashirika katika uchumi wa pamoja wa hali ya hewa. Fadhili uwasilishaji wa data thabiti." 
                : "Dira links farmers, local coordinators, and suppliers into a circular weather sensing economy. Sponsoring verified micro-data helps mitigate climate risks."}
            </p>
          </div>
        </section>

        {/* Channels Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partnerChannels.map((channel, index) => (
              <ScrollReveal key={index} className={`delay-${index * 100}`}>
                <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 transition-all duration-300 h-full">
                  <h3 className="text-lg font-bold mb-4 text-emerald-400">{channel.title}</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{channel.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* B2B Partner Form */}
        <section className="py-16 bg-[#1A1A6E]/10 border-t border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto space-y-8">
            <ScrollReveal className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {isSw ? "Wasiliana nasi kama Mshirika" : "Become a Partner"}
              </h2>
              <p className="text-white/50 text-xs sm:text-sm">
                {isSw ? "Jaza fomu hii na timu yetu itawasiliana nawe." : "Submit your details to coordinate with our agricultural network team."}
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <form onSubmit={handleSubmit} className="space-y-4 bg-white/[0.01] border border-white/5 p-8 rounded-3xl shadow-xl">
                <div>
                  <label htmlFor="partner-name" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Jina Kamili" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    id="partner-name"
                    required
                    autoComplete="name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="partner-email" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Barua Pepe" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    id="partner-email"
                    required
                    autoComplete="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="partner-org" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Shirika / Kampuni" : "Organization"}
                  </label>
                  <input
                    type="text"
                    id="partner-org"
                    required
                    autoComplete="organization"
                    value={formState.organization}
                    onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="partner-message" className="block text-xs font-bold uppercase text-white/50 mb-1">
                    {isSw ? "Ujumbe Wako" : "Message"}
                  </label>
                  <textarea
                    id="partner-message"
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3 bg-[#0A6E56] hover:bg-[#085a46] disabled:bg-[#0A6E56]/50 text-white font-extrabold rounded-xl transition-all shadow-md uppercase tracking-wider text-xs"
                >
                  {status === "submitting" ? (isSw ? "Inatuma..." : "Sending...") : (isSw ? "Tuma Ombi" : "Submit Proposal")}
                </button>

                {status === "success" && (
                  <div role="status" className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center font-bold">
                    {isSw ? "Asante! Ombi lako limepokelewa." : "Thank you! Your inquiry has been submitted successfully."}
                  </div>
                )}
              </form>
            </ScrollReveal>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
