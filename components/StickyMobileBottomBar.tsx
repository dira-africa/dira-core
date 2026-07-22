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

import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function StickyMobileBottomBar() {
  const pathname = usePathname();
  const { locale } = useTranslation();
  
  // Hide on app internal routes, onboarding, auth, or admin
  const isAppRoute =
    pathname.startsWith("/farmer") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/wallet") ||
    pathname === "/home";
  
  if (isAppRoute) return null;

  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/DiraAfricaBot";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A6E]/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden flex justify-center items-center shadow-2xl">
      <a
        href={botUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("cta_click", { target: "sticky_mobile_bottom" })}
        aria-label={locale === "sw" ? "Fungua kwa Telegram na uanze kuchuma" : "Open in Telegram and start earning"}
        className="w-full text-center py-3 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-2xl shadow-lg shadow-[#0A6E56]/30 transition-all text-sm uppercase tracking-wider"
      >
        {locale === "sw" ? "Anza Kuchuma kwenye Telegram" : "Start Earning in Telegram"}
      </a>
    </div>
  );
}
