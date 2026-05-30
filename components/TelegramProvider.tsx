"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type WebAppType from "@twa-dev/sdk";

const TelegramContext = createContext<typeof WebAppType | null>(null);

export const useTelegram = () => useContext(TelegramContext);

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<typeof WebAppType | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dynamically load the SDK only on the client side
      import("@twa-dev/sdk")
        .then((m) => {
          const sdk = m.default;
          try {
            sdk.ready();
            sdk.expand();
            sdk.setHeaderColor("#0A6E56");
            setWebApp(sdk);
          } catch (error) {
            console.error("Failed to initialize Telegram WebApp SDK:", error);
          }
        })
        .catch((err) => {
          console.error("Failed to load @twa-dev/sdk:", err);
        });
    }
  }, []);

  return (
    <TelegramContext.Provider value={webApp}>
      {children}
    </TelegramContext.Provider>
  );
}
