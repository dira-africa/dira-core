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

import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "Dira Africa — Decentralised Physical Weather Sensing Network",
  description: "Dira Africa is a DePIN network converting smartphones into weather sensors across Kenya. Earn Climate Tokens for verified crop reports and pressure tracking.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dira Africa — Decentralised Physical Weather Sensing Network",
    description: "Participate in Kenya's smartphone weather DePIN. Verify crops, share barometric telemetry, and earn Climate Tokens.",
    url: "https://dira.africa",
    siteName: "Dira Africa",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dira Africa — Decentralised Physical Weather Sensing Network",
    description: "Participate in Kenya's smartphone weather DePIN. Verify crops, share barometric telemetry, and earn Climate Tokens.",
  },
};

export default function LandingPage() {
  const features = [
    {
      icon: "📡",
      title: "Decentralized Physical Sensing (DePIN)",
      desc: "Harnessing local barometric sensors in millions of smartphones to map weather observations at a hyper-local scale across Kenya."
    },
    {
      icon: "🌾",
      title: "AI Crop Health Audits",
      desc: "Automated verification pipelines analyzing farm status photographically, validating crop stages, and tracking agricultural health parameters."
    },
    {
      icon: "⛓",
      title: "Public Accountability on Hedera",
      desc: "Anchoring crop certifications on Hedera Consensus Service (HCS) and distributing rewards via Hedera Token Service (HTS)."
    }
  ];

  const stats = [
    { value: "47", label: "Counties Covered" },
    { value: "15,200+", label: "Active Mobile Sensors" },
    { value: "100k+", label: "Climate Proofs Anchored" },
    { value: "500k+", label: "DIRA Rewards Minted" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/40 to-transparent">
          {/* Animated Background Gradients */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#0A6E56]/15 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Turning Smartphones Into <br className="hidden sm:inline" />
              Kenya's Weather Sensing Network
            </h1>
            <p className="text-base sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Dira is a Decentralised Physical Infrastructure Network (DePIN). We crowdsource barometric and crop observations to mitigate micro-climate risks and distribute Climate Token rewards.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/home"
                className="w-full sm:w-auto px-8 py-4 bg-[#0A6E56] hover:bg-[#085a46] text-white font-extrabold rounded-2xl shadow-lg shadow-[#0A6E56]/30 transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Launch Dira App
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all duration-200"
              >
                How it Works
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Stats Banner */}
        <section className="py-12 bg-white/[0.01] border-y border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/55 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Value Proposition */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Next-Generation Climate Sensing</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              We coordinate crowd-sourced data gathering across Kenya to power smart weather predictions, carbon audits, and index-based crop insurance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 hover:bg-white/[0.03] transition-all duration-300 relative group"
              >
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* JSON-LD Structured Data Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Dira Africa",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "iOS, Android, Web",
              "description": "Decentralised Physical Infrastructure Network (DePIN) Weather sensing network across Kenya",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
