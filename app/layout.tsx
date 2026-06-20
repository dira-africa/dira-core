import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import TelegramProvider from "@/components/TelegramProvider";
import XionProvider from "@/components/XionProvider";
import AppInitializer from "@/components/AppInitializer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dira Africa",
  description: "Decentralised Physical Infrastructure Network (DePIN) for Weather Sensing across Kenya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full min-h-screen bg-background text-foreground overflow-x-hidden`}
      >
        <XionProvider>
          <TelegramProvider>
            <AppInitializer>
              <div className="flex flex-col min-h-screen h-full w-full">
                {children}
              </div>
            </AppInitializer>
          </TelegramProvider>
        </XionProvider>
      </body>
    </html>
  );
}

