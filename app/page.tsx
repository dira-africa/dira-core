"use client";

import { useState } from "react";
import { useTelegram } from "@/components/TelegramProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { TranslationKey } from "@/lib/i18n/translations";
import LoadingSkeleton, { SkeletonType } from "@/components/ui/LoadingSkeleton";

export default function Home() {
  const sdk = useTelegram();
  const { t, locale, setLocale } = useTranslation();
  const [selectedSkeleton, setSelectedSkeleton] = useState<SkeletonType>("wallet");

  // Retrieve user data from Telegram if available
  const tgUser = sdk?.initDataUnsafe?.user;

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center py-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-white shadow-md shadow-primary/20">
            D
          </div>
          <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-white to-primary/80 bg-clip-text text-transparent">
            Dira Africa
          </span>
        </div>

        {/* Language Toggler */}
        <div className="flex space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setLocale("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              locale === "en" ? "bg-primary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("sw")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              locale === "sw" ? "bg-primary text-white" : "text-white/60 hover:text-white"
            }`}
          >
            SW
          </button>
        </div>
      </header>

      {/* Navigation Preview Block */}
      <section className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
        <h2 className="text-xs font-bold text-primary tracking-widest uppercase">
          {locale === "en" ? "Navigation Index" : "Kielezo cha Urambazaji"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {["onboarding", "home", "wallet", "settings", "leaderboard"].map((item) => (
            <span
              key={item}
              className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs text-white/70"
            >
              {t(`nav.${item}` as TranslationKey)}
            </span>
          ))}
        </div>
      </section>

      {/* Telegram Connection Details */}
      <section className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10" />
        <h2 className="text-sm font-bold text-white/90">
          {locale === "en" ? "Telegram WebView Status" : "Hali ya Telegram WebView"}
        </h2>

        {tgUser ? (
          <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="h-10 w-10 rounded-full bg-primary/30 flex items-center justify-center font-bold text-primary">
              {tgUser.first_name ? tgUser.first_name[0] : "U"}
            </div>
            <div>
              <p className="text-xs text-white/50">{locale === "en" ? "User Account" : "Akaunti ya Mtumiaji"}</p>
              <p className="text-sm font-bold text-white">
                {tgUser.first_name} {tgUser.last_name || ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-amber-400">
              {locale === "en" ? "Not running inside Telegram WebView" : "Haitumiki ndani ya WebView ya Telegram"}
            </p>
            <p className="text-[11px] text-white/60 leading-relaxed">
              {locale === "en"
                ? "The SDK is initialised but defaults to browser mockup. Open in Telegram Mini App for full capabilities."
                : "SDK imewashwa lakini inatumia muundo wa kivinjari. Fungua kwenye Programu Ndogo ya Telegram kwa uwezo kamili."}
            </p>
          </div>
        )}
      </section>

      {/* Reusable Loading Skeletons Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-white/90">
            {locale === "en" ? "Skeleton Loader Preview" : "Kipakiaji cha Mfumo"}
          </h2>
          <div className="flex space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {(["wallet", "card", "list", "profile"] as SkeletonType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSkeleton(type)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all capitalize ${
                  selectedSkeleton === type ? "bg-primary text-white" : "text-white/60"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4">
          <LoadingSkeleton type={selectedSkeleton} />
        </div>
      </section>

      {/* Error Dictionary Preview */}
      <section className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
        <h2 className="text-sm font-bold text-white/90">
          {locale === "en" ? "Application Error Alerts" : "Arifa za Hitilafu za Programu"}
        </h2>
        <div className="space-y-3">
          {["network", "barometer", "gps", "daraja"].map((err) => (
            <div key={err} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                {err === "daraja" ? "MPESA / B2C GATEWAY" : err}
              </span>
              <p className="text-xs text-white/80 leading-normal">
                {t(`error.${err}` as TranslationKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-white/40 space-y-1">
        <p>Dira Africa Platform • Apache 2.0 License</p>
        <p>© 2026 Blockchain & Climate Institute</p>
      </footer>
    </main>
  );
}
