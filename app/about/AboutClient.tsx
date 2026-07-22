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

export default function AboutClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Kuhusu Dira Africa" : "About Dira Africa"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Dira ni Mtandao wa Kusoma Hali ya Hewa uliotawanyika (DePIN). Tunalenga kupunguza athari za hali ya hewa kwa wakulima wadogo." 
                : "Dira is a Decentralised Physical Infrastructure Network (DePIN). We turn everyday smartphones into a distributed climate sensing network across Kenya."}
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
          <ScrollReveal className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {isSw ? "Dira inasimamia nini?" : "What Dira Means"}
            </h2>
            <blockquote className="text-xl sm:text-2xl italic text-emerald-400 font-serif leading-relaxed max-w-3xl mx-auto">
              {isSw 
                ? "“Dira” inamaanisha Dira (Compass) au Duara (Circle) katika lugha ya Kiswahili." 
                : "“Dira” translates to Compass or Circle in Swahili."}
            </blockquote>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              {isSw 
                ? "Inaakisi dira yetu ya kuwaongoza wakulima kupitia taarifa sahihi za tabianchi, na muundo wa duara wa uchumi wa jamii yetu ambapo data inaleta thamani ya kifedha moja kwa moja kwa wanajamii." 
                : "It reflects our dual mission: acting as a compass guiding smallholders through unpredictable climates with high-accuracy data, and building circular economic support networks inside regional farming communities."}
            </p>
          </ScrollReveal>
        </section>

        {/* Core Principles */}
        <section className="py-16 bg-[#1A1A6E]/10 border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center">
              {isSw ? "Misingi Yetu ya Kazi" : "Our Core Pillars"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">
                  {isSw ? "Ugatuaji wa Data (DePIN)" : "Decentralised Sensing"}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  {isSw 
                    ? "Vituo vya hali ya hewa vya kawaida ni vichache. Dira inatumia sensorer za barometa za simu za kawaida kutengeneza ramani ya hali ya hewa yenye ubora wa juu." 
                    : "Traditional weather stations are sparse and expensive. Dira leverages passive pressure tracking in consumer smartphones to construct highly granular micro-climate maps."}
                </p>
              </ScrollReveal>
              <ScrollReveal className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl">
                <h3 className="text-lg font-bold text-emerald-400 mb-2">
                  {isSw ? "Uthibitishaji wa Uwazi (Hedera)" : "Verifiable Accountability"}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">
                  {isSw 
                    ? "Tunahifadhi SHA-256 hash za ripoti zilizothibitishwa kwenye mtandao wa Hedera Consensus Service. Hii inatoa uhakika wa 100% wa ukweli wa data kwa wadau wote bila kuweka hadharani siri za watumiaji." 
                    : "We anchor every crop validation hash to the Hedera Consensus Service (HCS). This ensures absolute transparency for carbon offset sponsors and insurers without leaking private farmer identifiers."}
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Open Source Commitment */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {isSw ? "Kujitolea kwa Msimbo Wazi" : "Open Source Commitment"}
            </h2>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              {isSw 
                ? "Dira inajengwa kama mradi wa msimbo wazi chini ya Leseni ya Apache 2.0. Tunaamini kwamba miundombinu ya jamii inapaswa kumilikiwa na jamii." 
                : "Dira Africa is published under the Apache 2.0 open-source license. We believe critical environmental observation infrastructure should be auditable, customizable, and owned by the community."}
            </p>
            <a
              href="https://github.com/dira-africa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold transition-all"
            >
              {isSw ? "Tazama Github Yetu" : "Browse GitHub Repository"}
            </a>
          </ScrollReveal>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
