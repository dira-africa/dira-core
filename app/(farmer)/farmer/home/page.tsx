"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { getStoredUser, clearAuth, User } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useRouter } from "next/navigation";

export default function FarmerHomePage() {
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
      <main className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col space-y-6 bg-gradient-to-b from-[#0A6E56]/20 via-[#04120f] to-[#0d0d21] text-white min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-white">
              🌾
            </div>
            <div>
              <p className="text-[10px] text-white/50 leading-none">{locale === "en" ? "Farmer Portal" : "Tovuti ya Mkulima"}</p>
              <h1 className="font-extrabold text-sm tracking-wide text-white">
                {user?.name || "Farmer"}
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
        <section className="relative overflow-hidden bg-gradient-to-r from-primary to-[#052b22] border border-primary/20 rounded-3xl p-6 shadow-2xl">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-white/60 tracking-wider font-semibold uppercase">
                  {locale === "en" ? "Climate Tokens Balance" : "Salio la Climate Tokens"}
                </p>
                <p className="text-3xl font-extrabold mt-1 tracking-tight">120.50 DIRA</p>
              </div>
              <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-bold uppercase">
                {locale === "en" ? "Farmer" : "Mkulima"}
              </span>
            </div>
            
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/50">{locale === "en" ? "Pending Rewards" : "Thawabu Zilizosalia"}</p>
                <p className="text-sm font-bold">15.00 DIRA</p>
              </div>
              <button className="px-4 py-2 bg-white text-primary rounded-xl text-xs font-bold shadow-md hover:bg-white/95 active:scale-[0.98] transition-all">
                {locale === "en" ? "Redeem Airtime" : "Komboa Salio"}
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-primary tracking-widest uppercase">
            {locale === "en" ? "Farmer Services" : "Huduma za Mkulima"}
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Submit photo */}
            <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all space-y-2">
              <span className="text-2xl">📸</span>
              <span className="text-xs font-bold">{locale === "en" ? "Submit Crops" : "Tuma Mazao"}</span>
              <span className="text-[9px] text-white/40">{locale === "en" ? "Bi-weekly photo" : "Picha ya wiki mbili"}</span>
            </button>
            
            {/* Input Voucher */}
            <button className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all space-y-2">
              <span className="text-2xl">🎟️</span>
              <span className="text-xs font-bold">{locale === "en" ? "Agro Vouchers" : "Vocha za Pembejeo"}</span>
              <span className="text-[9px] text-white/40">{locale === "en" ? "Buy seeds/inputs" : "Nunua mbegu/mbolea"}</span>
            </button>
          </div>
        </section>

        {/* Climate Sensor Status */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-3">
          <h2 className="text-xs font-bold text-white/70 tracking-widest uppercase">
            {locale === "en" ? "Weather Anchors" : "Viunga vya Hali ya Hewa"}
          </h2>
          <div className="flex justify-between items-center text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span>{locale === "en" ? "GPS Network Active" : "Mtandao wa GPS Unafanya Kazi"}</span>
            </div>
            <span className="text-white/40 font-mono">0.0245, 34.2045</span>
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
