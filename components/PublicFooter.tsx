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
              {locale === "sw" ? "Kurasa" : "Pages"}
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
                <Link href="/for-agents" onClick={() => trackEvent("footer_click", { target: "for-agents" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Kwa Maajenti" : "For Agents"}
                </Link>
              </li>
              <li>
                <Link href="/for-partners" onClick={() => trackEvent("footer_click", { target: "for-partners" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Kwa Washirika" : "For Partners"}
                </Link>
              </li>
              <li>
                <Link href="/impact" onClick={() => trackEvent("footer_click", { target: "impact" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Matokeo yetu" : "Our Impact"}
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
              {locale === "sw" ? "Teknolojia & Msaada" : "Technology & Support"}
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/verification" onClick={() => trackEvent("footer_click", { target: "verification" })} className="hover:text-white transition-colors text-xs font-sans">
                  {locale === "sw" ? "Uthibitishaji wa Hedera" : "Hedera Verification"}
                </Link>
              </li>
              <li>
                <Link href="/faq" onClick={() => trackEvent("footer_click", { target: "faq" })} className="hover:text-white transition-colors text-xs font-sans">
                  {locale === "sw" ? "Maswali ya Kawaida" : "FAQs"}
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={() => trackEvent("footer_click", { target: "contact" })} className="hover:text-white transition-colors text-xs font-sans">
                  {locale === "sw" ? "Wasiliana Nasi" : "Contact Us"}
                </Link>
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
                <Link href="/terms" onClick={() => trackEvent("footer_click", { target: "terms" })} className="hover:text-white transition-colors">
                  {locale === "sw" ? "Masharti ya Matumizi" : "Terms of Use"}
                </Link>
              </li>
              <li className="text-[10px] text-white/40 leading-normal">
                Email: hello@dira.africa<br />
                Phone: +254 700 000 000<br />
                Nairobi, Kenya
              </li>
              <li className="text-[10px] uppercase text-emerald-400 font-bold tracking-wider pt-2">
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
