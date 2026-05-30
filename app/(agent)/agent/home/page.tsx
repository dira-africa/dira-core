"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { getStoredUser, clearAuth, User } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useRouter } from "next/navigation";

export default function AgentHomePage() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <AuthGuard>
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#1A1A6E]/20 via-[#0a0f2b] to-[#040512] text-white min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
              🌡️
            </div>
            <div>
              <p className="text-[10px] text-white/50 leading-none">{locale === "en" ? "Data Agent Node" : "Njia ya Wakala wa Data"}</p>
              <h1 className="font-extrabold text-sm tracking-wide text-white">
                {user?.name || "Data Agent"}
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-all font-semibold"
          >
            {locale === "en" ? "Logout" : "Ondoka"}
          </button>
        </header>

        {/* Climate Tokens Wallet Card */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-[#12135c] border border-indigo-500/20 rounded-3xl p-6 shadow-2xl">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-white/60 tracking-wider font-semibold uppercase">
                  {locale === "en" ? "Node Earnings" : "Mavuno ya Node"}
                </p>
                <p className="text-3xl font-extrabold mt-1 tracking-tight">450.80 DIRA</p>
              </div>
              <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-bold uppercase">
                {locale === "en" ? "Agent" : "Wakala"}
              </span>
            </div>
            
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/50">{locale === "en" ? "Today's Yield" : "Mazao ya Leo"}</p>
                <p className="text-sm font-bold">12.40 DIRA</p>
              </div>
              <button className="px-4 py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold shadow-md hover:bg-white/95 active:scale-[0.98] transition-all">
                {locale === "en" ? "Dira Circle Pool" : "Dira Circle Pool"}
              </button>
            </div>
          </div>
        </section>

        {/* Barometric Sync Stats */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-indigo-400 tracking-widest uppercase">
            {locale === "en" ? "Barometric Sensor Sync" : "Usawazishaji wa Sensor"}
          </h2>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/60">{locale === "en" ? "Daily Sync Completion" : "Kukamilika kwa Siku"}</span>
              <span className="text-primary font-bold">3 / 4 Syncs</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: "75%" }} />
            </div>
            <p className="text-[10px] text-white/40">
              {locale === "en" 
                ? "Next passive pressure sync scheduled in 2.5 hours."
                : "Sawazisho lingine la hewa limepangwa baada ya saa 2.5."}
            </p>
          </div>

          <button className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2">
            <span>🔄</span>
            <span>{locale === "en" ? "Force Manual Sync" : "Sawazisha kwa Mkono sasa"}</span>
          </button>
        </section>

        {/* Node Active State */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-3">
          <h2 className="text-xs font-bold text-white/70 tracking-widest uppercase">
            {locale === "en" ? "Hardware Health" : "Afya ya Sensor"}
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col space-y-1">
              <span className="text-white/40 text-[9px] uppercase font-bold">{locale === "en" ? "Barometer" : "Kipima Hewa"}</span>
              <span className="text-green-400 font-semibold">{locale === "en" ? "Connected" : "Imeunganishwa"}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col space-y-1">
              <span className="text-white/40 text-[9px] uppercase font-bold">{locale === "en" ? "Midnight DB" : "Midnight DB"}</span>
              <span className="text-indigo-400 font-semibold">{locale === "en" ? "Cert Anchored" : "Cheti Kimetiwa"}</span>
            </div>
          </div>
        </section>

        {/* Language Toggler */}
        <div className="flex justify-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 w-24 mx-auto">
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
      </main>
    </AuthGuard>
  );
}
