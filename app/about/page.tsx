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
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "About Us — Dira Africa",
  description: "Dira Africa is a decentralized weather sensing network designed to mitigate micro-climate risks.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              About Dira Africa
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Dira is a Decentralised Physical Infrastructure Network (DePIN). We turn everyday smartphones into a distributed climate sensing network across Kenya.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center">Our Vision</h2>
          <p className="text-white/70 text-sm leading-relaxed text-center">
            Traditional weather monitoring stations are sparse and expensive, leaving smallholder farmers in developing nations vulnerable to unpredictable weather patterns. Dira crowdsources barometric and environmental observations to map atmospheric variations at hyper-local levels.
          </p>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
