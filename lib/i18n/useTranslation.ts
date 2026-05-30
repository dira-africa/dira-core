"use client";

import { useState, useEffect } from "react";
import { translations, TranslationKey } from "./translations";

export type Locale = "en" | "sw";

const LOCALE_STORAGE_KEY = "dira-locale";

interface TelegramUser {
  language_code?: string;
}

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: TelegramUser;
  };
}

interface CustomWindow extends Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
      if (storedLocale === "en" || storedLocale === "sw") {
        setLocaleState(storedLocale);
      } else {
        // Fall back to Telegram user language if available
        try {
          const customWindow = window as unknown as CustomWindow;
          const tgLanguage = customWindow.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
          if (tgLanguage && tgLanguage.startsWith("sw")) {
            setLocaleState("sw");
          }
        } catch (e) {
          console.error("Failed to read Telegram locale:", e);
        }
      }
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || key;
  };

  return {
    t,
    locale,
    setLocale: changeLocale,
  };
}
