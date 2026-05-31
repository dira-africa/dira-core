"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { saveOnboardingState } from "@/lib/onboarding";
import { apiClient } from "@/lib/api-client";
import { AuthResponse } from "@/lib/auth";

export default function LanguageStep() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If state says we are further along, check where they should be, but language is always accessible
  }, []);

  const handleSelectLanguage = async (lang: "en" | "sw") => {
    setIsSubmitting(true);
    try {
      // 1. Update UI locale dynamically
      setLocale(lang);

      // 2. Sync language preference to the backend API
      const res = await apiClient.put<AuthResponse>("/api/auth/profile", { language: lang });
      if (res.token && res.user) {
        sessionStorage.setItem("dira_auth_token", res.token);
        sessionStorage.setItem("dira_auth_user", JSON.stringify(res.user));
      }

      // 3. Save progress in localStorage
      saveOnboardingState({
        step: "role",
        language: lang,
      });

      // 4. Navigate to next step
      router.push("/onboarding/role");
    } catch (err) {
      console.error("Failed to save language preference:", err);
      // Fallback: save locally and proceed
      saveOnboardingState({
        step: "role",
        language: lang,
      });
      router.push("/onboarding/role");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto p-6 flex flex-col justify-center bg-gradient-to-b from-[#1A1A6E]/30 to-[#0A6E56]/10 text-white min-h-screen">
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

        {/* Progress Header */}
        <div className="flex justify-between items-center text-xs text-white/40">
          <span className="font-bold tracking-widest uppercase text-primary">Dira Africa</span>
          <span>{locale === "en" ? "Step 1 of 4" : "Hatua ya 1 kati ya 4"}</span>
        </div>

        {/* Step Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {locale === "en" ? "Select Language" : "Chagua Lugha"}
          </h1>
          <p className="text-xs text-white/50 leading-relaxed">
            {locale === "en"
              ? "Please select your preferred language to customize your Dira experience."
              : "Tafadhali chagua lugha unayopendelea ili kubinafsisha huduma zako za Dira."}
          </p>
        </div>

        {/* Buttons Grid */}
        <div className="space-y-3 pt-2">
          {/* English */}
          <button
            onClick={() => handleSelectLanguage("en")}
            disabled={isSubmitting}
            className={`w-full p-5 rounded-2xl border text-center transition-all flex justify-between items-center ${
              locale === "en"
                ? "bg-primary/20 border-primary shadow-lg shadow-primary/15"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            <span className="text-base font-bold">English</span>
            <span className="text-xl">🇬🇧</span>
          </button>

          {/* Kiswahili */}
          <button
            onClick={() => handleSelectLanguage("sw")}
            disabled={isSubmitting}
            className={`w-full p-5 rounded-2xl border text-center transition-all flex justify-between items-center ${
              locale === "sw"
                ? "bg-primary/20 border-primary shadow-lg shadow-primary/15"
                : "bg-white/5 border-white/10 hover:border-white/20"
            }`}
          >
            <span className="text-base font-bold">Kiswahili</span>
            <span className="text-xl">🇰🇪</span>
          </button>
        </div>

        {/* Indicator Line */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-1/4 rounded-full" />
        </div>
      </div>
    </main>
  );
}
