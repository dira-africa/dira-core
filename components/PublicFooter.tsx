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
import { useTranslation } from "@/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function PublicFooter() {
  const { locale } = useTranslation();

  return (
    <footer className="bg-[#1A1A6E]/90 border-t border-white/10 text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-[#0A6E56] flex items-center justify-center font-bold text-white shadow-md">
                D
              </div>
              <span className="font-extrabold text-lg text-white">Dira Africa</span>
            </div>
            <p className="text-xs leading-relaxed">
              {locale === "sw"
                ? "Kubadilisha simu janja kuwa mtandao wa kusoma hali ya hewa uliotawanyika kote Kenya kupitia DePIN."
                : "Turning smartphones into a distributed weather sensing network across Kenya via DePIN."}
            </p>
          </div>

          {/* Links Quick */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">
              {locale === "sw" ? "Ukurasa" : "Pages"}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/how-it-works" onClick={() => trackEvent("footer_click", { target: "how-it-works" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Jinsi inavyofanya kazi" : "How It Works"}
                </Link>
              </li>
              <li>
                <Link href="/for-farmers" onClick={() => trackEvent("footer_click", { target: "for-farmers" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Kwa Wakulima" : "For Farmers"}
                </Link>
              </li>
              <li>
                <Link href="/for-partners" onClick={() => trackEvent("footer_click", { target: "for-partners" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Kwa Washirika" : "For Partners"}
                </Link>
              </li>
              <li>
                <Link href="/about" onClick={() => trackEvent("footer_click", { target: "about" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Kuhusu sisi" : "About Us"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Tech */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">
              {locale === "sw" ? "Teknolojia" : "Technology"}
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/public" onClick={() => trackEvent("footer_click", { target: "verification" })} className="hover:text-white transition-colors text-xs font-sans">
                  {locale === "sw" ? "Uthibitishaji wa Hedera" : "Hedera Verification"}
                </Link>
              </li>
              <li>
                <span className="opacity-75">HCS Topic: 0.0.9544926</span>
              </li>
              <li>
                <span className="opacity-75">HTS Token: 0.0.9544938</span>
              </li>
              <li>
                <a href="https://github.com/dira-africa" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-xs font-sans">
                  GitHub Organization
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / BCI */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4">
              {locale === "sw" ? "Kisheria & Utawala" : "Legal & Governance"}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" onClick={() => trackEvent("footer_click", { target: "privacy" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Ulinzi wa Data & Sera" : "Data Protection & Privacy"}
                </Link>
              </li>
              <li>
                <span className="block leading-relaxed">
                  {locale === "sw" ? "Chini ya BCI (Blockchain & Climate Institute)" : "Co-governed by Blockchain & Climate Institute"}
                </span>
              </li>
              <li className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider">
                Apache 2.0 License
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs">
          <p>© 2026 Dira Africa. All rights reserved. / Haki zote zimehifadhiwa.</p>
        </div>
      </div>
    </footer>
  );
}
