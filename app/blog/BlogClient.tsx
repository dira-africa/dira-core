/*
 * Copyright 2026 Dira Africa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed story in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

export const blogPosts: Record<"en" | "sw", Post[]> = {
  en: [
    {
      slug: "announcing-hedera-testnet",
      title: "Announcing Dira Hedera Testnet Integration",
      excerpt: "We have fully migrated our weekly Merkle proof anchoring and climate rewards pipeline to Hedera HCS and HTS.",
      date: "July 12, 2026",
      readTime: "3 min read",
      content: "We are thrilled to announce that Dira Africa has successfully integrated its main climate validation pipeline with the Hedera testnet network. Every week, Dira anchors cryptographic proofs of crop and barometer reports to the Hedera Consensus Service (HCS), providing unprecedented transparency for carbon offset sponsors and agricultural insurers. Furthermore, Climate Tokens are now minted using the Hedera Token Service (HTS) to reward our network of farmers and agents."
    },
    {
      slug: "smartphone-barometers-weather",
      title: "How Smartphone Barometers Map Weather Patterns",
      excerpt: "Discover the science behind crowdsourced barometric readings and how high-frequency syncing paints micro-climatic trends.",
      date: "June 25, 2026",
      readTime: "5 min read",
      content: "Did you know your smartphone has a built-in barometer sensor? Weather forecast models rely heavily on atmospheric pressure trends to predict localized weather changes. By mapping pressure syncs from thousands of smartphones across Kenya four times daily, Dira acts as a decentralized physical sensing network. This high-density observation web fills critical data gaps in micro-climate forecasting, allowing local communities to adapt to weather threats proactively."
    }
  ],
  sw: [
    {
      slug: "announcing-hedera-testnet",
      title: "Kutangaza Ushirikiano wa Mtandao wa Hedera",
      excerpt: "Tumefanikiwa kuhamisha mchakato wetu wa uhakiki na ugawaji wa Climate Tokens kwenda kwenye mitandao ya Hedera HCS na HTS.",
      date: "Julai 12, 2026",
      readTime: "Dakika 3 kusoma",
      content: "Tunafurahi kutangaza kwamba Dira Africa imefanikiwa kuunganisha mfumo wake wa uhakiki wa hali ya hewa na mtandao wa majaribio wa Hedera. Kila wiki, Dira inahifadhi thibitisho za kidijitali za ripoti za mazao kwenye Hedera Consensus Service (HCS), ikitoa uwazi wa kipekee kwa wadhamini na mashirika ya bima ya kilimo. Pia, Climate Tokens sasa zinatolewa kwa kutumia Hedera Token Service (HTS) kuwazawadia wakulima na maajenti wetu."
    },
    {
      slug: "smartphone-barometers-weather",
      title: "Jinsi Barometa za Simu Zinavyochora Hali ya Hewa",
      excerpt: "Gundua sayansi inayohusika na kusoma shinikizo la hewa kupitia simu na jinsi ramani hizi zinavyosaidia jamii.",
      date: "Juni 25, 2026",
      readTime: "Dakika 5 kusoma",
      content: "Je, unajua simu yako janja ina sensorer ya barometa iliyojengwa ndani? Mfano wa utabiri wa hali ya hewa unategemea sana shinikizo la hewa ili kutabiri mabadiliko ya eneo husika. Kwa kusawazisha shinikizo mara 4 kwa siku kutoka kwa maelfu ya simu kote nchini Kenya, Dira inaunda mtandao uliotawanyika wa kusoma hewa. Mtandao huu unajaza pengo kubwa la taarifa na kusaidia jamii zetu kukabiliana na mabadiliko ya hali ya hewa."
    }
  ]
};

export default function BlogClient() {
  const { locale } = useTranslation();
  const isSw = locale === "sw";
  const posts = blogPosts[locale] || blogPosts.en;

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow">
        
        {/* Hero */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              {isSw ? "Blogu ya Dira" : "Dira Newsroom"}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {isSw 
                ? "Soma matangazo ya kiufundi, habari, na makala kutoka kwa viongozi wa hali ya hewa ya DePIN nchini Kenya." 
                : "Technical updates, announcements, and insights from the frontlines of decentralised climate sensing in East Africa."}
            </p>
          </div>
        </section>

        {/* List */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, idx) => (
              <ScrollReveal key={post.slug} className={`delay-${idx * 100}`}>
                <article className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all duration-200 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs text-white/40 block mb-2">{post.date} · {post.readTime}</span>
                    <h3 className="text-xl font-bold mb-4 hover:text-emerald-400 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6">{post.excerpt}</p>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-emerald-400 hover:underline">
                    {isSw ? "Soma Makala Kamili →" : "Read Article →"}
                  </Link>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
