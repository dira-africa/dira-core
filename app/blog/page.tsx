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
  title: "Blog & Updates — Dira Africa",
  description: "Read latest announcements, technical updates, and stories from our weather DePIN networks across Kenya.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = [
    {
      title: "Announcing Dira Hedera Testnet Integration",
      excerpt: "We have fully migrated our weekly Merkle proof anchoring and climate rewards pipeline to Hedera HCS and HTS.",
      date: "July 12, 2026",
      readTime: "3 min read",
    },
    {
      title: "How Smartphone Barometers Map Weather Patterns",
      excerpt: "Discover the science behind crowdsourced barometric readings and how high-frequency syncing paints micro-climatic trends.",
      date: "June 25, 2026",
      readTime: "5 min read",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A1A6E]/30 to-transparent">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Dira Newsroom
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Technical articles, announcements, and success stories from the frontlines of decentralized climate observations in East Africa.
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post, idx) => (
              <article key={idx} className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-200">
                <span className="text-xs text-white/40 block mb-2">{post.date} · {post.readTime}</span>
                <h3 className="text-xl font-bold mb-4 hover:text-emerald-400 transition-colors cursor-pointer">{post.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-6">{post.excerpt}</p>
                <span className="text-xs font-bold text-emerald-400 cursor-pointer hover:underline">Read Article →</span>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
