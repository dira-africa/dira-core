"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authenticateWithTelegram, getStoredUser, isAuthenticated, User } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/useTranslation";
import LoadingSkeleton from "./ui/LoadingSkeleton";

interface CustomWindow extends Window {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
}

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();

  const [status, setStatus] = useState<"initializing" | "authenticating" | "not-telegram" | "error" | "authenticated">("initializing");
  const [errorDetails, setErrorDetails] = useState<string>("");

  const handleRedirect = useCallback((user: User) => {
    if (user.isNewUser) {
      if (!pathname.startsWith("/onboarding")) {
        router.push("/onboarding");
      } else {
        setStatus("authenticated");
      }
    } else {
      const targetPath = user.role === "farmer" ? "/farmer/home" : "/agent/home";
      if (pathname.startsWith(targetPath)) {
        setStatus("authenticated");
      } else {
        router.push(targetPath);
      }
    }
  }, [pathname, router]);

  const runAuth = useCallback(async () => {
    setStatus("authenticating");
    try {
      const authData = await authenticateWithTelegram();
      handleRedirect(authData.user);
    } catch (err: unknown) {
      console.error("Authentication error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to authenticate.";
      setErrorDetails(errMsg);
      setStatus("error");
    }
  }, [handleRedirect]);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") return;

    // Allow bypassing Telegram checks for the privacy policy page, public dashboard and admin interface
    if (pathname === "/privacy" || pathname.startsWith("/admin") || pathname === "/public") {
      setStatus("authenticated");
      return;
    }

    const customWindow = window as unknown as CustomWindow;
    const tgWebApp = customWindow.Telegram?.WebApp;
    const initData = tgWebApp?.initData;

    // Verify if we are running inside Telegram (must have initData)
    if (!initData) {
      setStatus("not-telegram");
      return;
    }

    // If already authenticated and the current path is correct, short circuit
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        handleRedirect(user);
        return;
      }
    }

    // Otherwise, perform authentication
    runAuth();
  }, [handleRedirect, runAuth, pathname]);

  // Listen to pathname changes to complete redirection status
  useEffect(() => {
    if (status === "authenticating" || status === "initializing") {
      const user = getStoredUser();
      if (user && isAuthenticated()) {
        handleRedirect(user);
      }
    }
  }, [pathname, status, handleRedirect]);

  if (status === "initializing" || status === "authenticating") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0e0e26] via-[#051c1c] to-[#04120f] text-white p-6">
        <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-8 animate-fade-in">
          {/* Logo with pulsing brand ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full border border-primary/30 bg-[#0A6E56]/10 flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="font-extrabold text-3xl tracking-wide text-primary">D</span>
            </div>
            {/* Spinning Premium Circular Loader */}
            <div className="absolute -inset-2 rounded-full border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
          </div>

          <div className="space-y-3">
            <h1 className="text-xl font-bold tracking-wide">Dira Africa</h1>
            <p className="text-sm text-white/70 max-w-xs leading-relaxed">
              {t("auth.authenticating")}
            </p>
          </div>

          {/* Premium Skeleton preview to mimic content loading behind */}
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-4 opacity-30 mt-4">
            <LoadingSkeleton type="wallet" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "not-telegram") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0e0e26] via-[#1c0c17] to-[#1a0505] text-white p-6">
        <div className="relative flex flex-col items-center max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          {/* Error Icon */}
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-lg font-bold text-white">
              {locale === "en" ? "Access Restrained" : "Ufikiaji Umezuiliwa"}
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              {t("auth.pleaseOpenTelegram")}
            </p>
          </div>

          {/* Premium styled link instruction */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-white/70 space-y-2">
            <p className="font-semibold text-primary">
              {locale === "en" ? "How to connect:" : "Jinsi ya kujiunga:"}
            </p>
            <ol className="list-decimal list-inside text-left space-y-1 text-white/50">
              <li>{locale === "en" ? "Open Telegram app" : "Fungua programu ya Telegram"}</li>
              <li>{locale === "en" ? "Search for @DiraAfricaBot" : "Tafuta @DiraAfricaBot"}</li>
              <li>{locale === "en" ? "Tap Menu or Start app" : "Gusa Menu au Anzisha programu"}</li>
            </ol>
          </div>

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

  if (status === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0e0e26] via-[#1f190e] to-[#120f04] text-white p-6">
        <div className="relative flex flex-col items-center max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          {/* Failure Alert Icon */}
          <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-lg font-bold text-white">
              {locale === "en" ? "Authentication Failed" : "Uthibitishaji Umefeli"}
            </h1>
            <p className="text-xs text-white/50 bg-black/20 p-2 rounded-lg font-mono text-left break-all select-all">
              Error: {errorDetails}
            </p>
            <p className="text-sm text-white/60">
              {t("auth.authFailed")}
            </p>
          </div>

          <button
            onClick={runAuth}
            className="w-full py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("auth.retry")}
          </button>
        </div>
      </div>
    );
  }

  // Once authenticated and fully routed, render the page children
  return <>{children}</>;
}
