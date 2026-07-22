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

export default function TermsClient() {
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
              {isSw ? "Masharti ya Matumizi" : "Terms of Service"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-mono text-xs uppercase tracking-wider">
              {isSw ? "Leseni ya Apache 2.0 na Masharti ya Mtandao" : "Apache 2.0 Open-Source Network Terms"}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 text-white/80 leading-relaxed text-xs sm:text-sm">
          <ScrollReveal className="space-y-4">
            <h3 className="text-lg font-bold text-white">{isSw ? "1. Uwasilishaji wa Data ya Kilimo" : "1. Environmental Telemetry Submissions"}</h3>
            <p>
              {isSw 
                ? "Kwa kuwasilisha picha za mazao au masomo ya barometer, unathibitisha kuwa data hiyo ni ya kweli na imechukuliwa kutoka eneo lako halisi. Uwasilishaji wa uongo utasababisha kufungiwa kwa akaunti." 
                : "By submitting crop photographs or barometric logs, you warrant that all environmental observations represent authentic ground-truth measurements captured from your device. False reporting triggers automated reputation penalties and account suspension."}
            </p>
          </ScrollReveal>

          <ScrollReveal className="space-y-4">
            <h3 className="text-lg font-bold text-white">{isSw ? "2. Usambazaji wa Climate Tokens" : "2. Climate Token Distributions"}</h3>
            <p>
              {isSw 
                ? "Climate Tokens (DIRA) zinasambazwa kulingana na matokeo ya uhakiki wa AI. Dira haina dhima ya upotezaji wa tokens kutokana na usumbufu wa mtandao wa blockchain." 
                : "DIRA rewards are generated on-chain matching AI audit validation scores. The network accepts no liability for losses arising from smart contract upgrades, wallet keys misplacement, or Hedera testnet fluctuations."}
            </p>
          </ScrollReveal>

          <ScrollReveal className="space-y-4">
            <h3 className="text-lg font-bold text-white">{isSw ? "3. Leseni ya Apache 2.0" : "3. Apache 2.0 License & Warranties"}</h3>
            <p>
              {isSw 
                ? "Msimbo wetu wa programu unatolewa 'kama ulivyo' chini ya Leseni ya Apache 2.0, bila dhamana ya aina yoyote." 
                : "Dira Africa codebase is published under the Apache 2.0 license. Software utilities are provided 'AS IS', without warranties of any kind, express or implied."}
            </p>
          </ScrollReveal>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
