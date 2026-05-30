"use client";

import { useEffect, useState } from "react";
import { authenticateWithTelegram, isAuthenticated } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface AuthGuardProps {
  children: React.ReactNode;
}

interface CustomWindow extends Window {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { t, locale, setLocale } = useTranslation();
  const [status, setStatus] = useState<"checking" | "authenticating" | "failed" | "authenticated">("checking");
  const [errorDetails, setErrorDetails] = useState<string>("");

  const attemptReauth = async () => {
    setStatus("authenticating");
    try {
      await authenticateWithTelegram();
      setStatus("authenticated");
    } catch (err: unknown) {
      console.error("AuthGuard re-authentication failed:", err);
      const errMsg = err instanceof Error ? err.message : "Session expired and re-authentication failed.";
      setErrorDetails(errMsg);
      setStatus("failed");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAuthenticated()) {
      setStatus("authenticated");
      return;
    }

    const customWindow = window as unknown as CustomWindow;
    const tgWebApp = customWindow.Telegram?.WebApp;
    const initData = tgWebApp?.initData;

    if (initData) {
      // Session expired but we have Telegram WebApp context, so attempt re-authentication
      attemptReauth();
    } else {
      // Outside Telegram or missing initData entirely
      setStatus("failed");
    }
  }, []);

  if (status === "checking" || status === "authenticating") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#0e0e26] via-[#051c1c] to-[#04120f] text-white p-6 min-h-screen">
        <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-8 animate-fade-in">
          {/* Pulsing Ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative h-16 w-16 rounded-full border border-primary/30 bg-[#0A6E56]/10 flex items-center justify-center">
              <span className="font-extrabold text-2xl tracking-wide text-primary">D</span>
            </div>
            {/* Spinner */}
            <div className="absolute -inset-1.5 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-sm text-white/70 tracking-wide animate-pulse">
            {t("auth.authenticating")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0e0e26] via-[#1c0c17] to-[#1a0505] text-white p-6">
        <div className="relative flex flex-col items-center max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          {/* Error Alert Icon */}
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-lg font-bold text-white">
              {locale === "en" ? "Telegram Session Required" : "Kipindi cha Telegram Kinahitajika"}
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              {t("auth.pleaseOpenTelegram")}
            </p>
            {errorDetails && (
              <p className="text-[11px] text-red-400/80 bg-red-500/5 border border-red-500/10 p-2 rounded-xl font-mono text-center">
                {errorDetails}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              const customWindow = window as unknown as CustomWindow;
              const tgWebApp = customWindow.Telegram?.WebApp;
              if (tgWebApp?.initData) {
                attemptReauth();
              } else {
                window.location.reload();
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("auth.retry")}
          </button>

          {/* Language Switcher */}
          <div className="flex space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 mt-2">
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
