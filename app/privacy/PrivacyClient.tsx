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

export default function PrivacyClient() {
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
              {isSw ? "Sera ya Faragha" : "Privacy Policy"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-mono text-xs uppercase tracking-wider">
              {isSw ? "Sheria ya Ulinzi wa Data ya Kenya (ODPC)" : "Kenya Data Protection Act Compliant"}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 text-white/80 leading-relaxed text-xs sm:text-sm">
          <ScrollReveal className="space-y-4">
            <h3 className="text-lg font-bold text-white">{isSw ? "1. Ukusanyaji wa Data" : "1. Data Collection"}</h3>
            <p>
              {isSw 
                ? "Dira inakusanya viwianishi vya GPS, picha za shamba, na masomo ya barometer ya simu kulingana na kibali chako cha makusudi. Hatuhifadhi majina ya kweli au nambari za simu kwenye blockchain." 
                : "Dira Africa collects smartphone barometric readings, crop photograph payloads, and GPS coordinate telemetry based on active user permission. We store no personally identifiable information (PII) on the public ledger."}
            </p>
          </ScrollReveal>

          <ScrollReveal className="space-y-4">
            <h3 className="text-lg font-bold text-white">{isSw ? "2. Sheria ya Ulinzi wa Data ya Kenya" : "2. Kenya Data Protection Act Compliance"}</h3>
            <p>
              {isSw 
                ? "Kulingana na Sheria ya Ulinzi wa Data ya Kenya (2019), watumiaji wote wana haki ya kupata data zao, kurekebisha taarifa, au kuomba kufutwa kwa kumbukumbu zao wakati wowote." 
                : "In strict accordance with the Kenya Data Protection Act (2019), you retain all rights to access, rectify, or request deletion of your telemetry history and profile information."}
            </p>
          </ScrollReveal>

          <ScrollReveal className="space-y-4">
            <h3 className="text-lg font-bold text-white">{isSw ? "3. Shiriki wa Data na Usalama" : "3. Security & Cryptographic Anonymity"}</h3>
            <p>
              {isSw 
                ? "Ripoti zote zilizothibitishwa zinabadilishwa kuwa hash za SHA-256 ambazo ni salama na haziwezi kubadilishwa. Hii inahakikisha ubora wa data bila kuonyesha siri za mkulima." 
                : "Verification hashes are stored on the Hedera ledger under Topic ID 0.0.9544926. Telemetry mapping is decoupled from wallet balances to ensure complete transactional privacy."}
            </p>
          </ScrollReveal>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
