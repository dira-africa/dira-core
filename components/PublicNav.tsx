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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function PublicNav() {
  const pathname = usePathname();
  const { locale, setLocale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "sw" : "en";
    setLocale(newLocale);
    trackEvent("language_switch", { locale: newLocale });
  };

  const navLinks = [
    { href: "/how-it-works", labelEn: "How It Works", labelSw: "Jinsi Inavyofanya Kazi" },
    { href: "/for-farmers", labelEn: "For Farmers", labelSw: "Kwa Wakulima" },
    { href: "/for-partners", labelEn: "For Partners", labelSw: "Kwa Washirika" },
    { href: "/about", labelEn: "About", labelSw: "Kuhusu Sisi" },
    { href: "/blog", labelEn: "Blog", labelSw: "Blogu" },
    { href: "/verification", labelEn: "Verification", labelSw: "Uthibitishaji" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#1A1A6E]/80 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2" onClick={() => trackEvent("nav_click", { target: "logo" })}>
              <div className="h-9 w-9 rounded-full bg-[#0A6E56] flex items-center justify-center font-bold text-lg text-white shadow-md shadow-[#0A6E56]/30">
                D
              </div>
              <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
                Dira Africa
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => trackEvent("nav_click", { target: link.href })}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    active ? "text-emerald-400 font-bold" : "text-white/80 hover:text-white"
                  }`}
                >
                  {locale === "sw" ? link.labelSw : link.labelEn}
                </Link>
              );
            })}
          </div>

          {/* CTAs and Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-white transition-all uppercase"
            >
              {locale === "sw" ? "EN" : "SW"}
            </button>
            <a
              href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { target: "launch_bot" })}
              className="px-4 py-2 text-sm font-bold bg-[#0A6E56] hover:bg-[#085a46] text-white rounded-xl shadow-md shadow-[#0A6E56]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {locale === "sw" ? "Fungua Telegram" : "Open in Telegram"}
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 text-xs font-bold bg-white/10 border border-white/15 rounded-lg text-white"
            >
              {locale === "sw" ? "EN" : "SW"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A1A6E] border-t border-white/10 px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  trackEvent("nav_click", { target: `mobile_${link.href}` });
                }}
                className={`block px-3 py-2 rounded-xl text-base font-semibold ${
                  active ? "bg-[#0A6E56]/20 text-emerald-400 font-bold" : "text-white/80 hover:bg-white/5"
                }`}
              >
                {locale === "sw" ? link.labelSw : link.labelEn}
              </Link>
            );
          })}
          <div className="pt-4 px-3">
            <a
              href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setMobileMenuOpen(false);
                trackEvent("cta_click", { target: "mobile_launch_bot" });
              }}
              className="block w-full text-center py-3 px-4 bg-[#0A6E56] hover:bg-[#085a46] text-white font-bold rounded-xl shadow-md"
            >
              {locale === "sw" ? "Fungua Telegram" : "Open in Telegram"}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
