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

"use client";

import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import ScrollReveal from "@/components/ScrollReveal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { blogPosts } from "../BlogClient";

export default function BlogPostClient({ slug }: { slug: string }) {
  const { locale } = useTranslation();
  const isSw = locale === "sw";

  const posts = blogPosts[locale] || blogPosts.en;
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
        <PublicNav />
        <main className="flex-grow flex flex-col justify-center items-center py-24 space-y-4">
          <h2 className="text-2xl font-bold">{isSw ? "Makala Hayakupatikana" : "Article Not Found"}</h2>
          <Link href="/blog" className="text-emerald-400 hover:underline text-sm">
            {isSw ? "Rudi kwenye Blogu" : "Back to Blog"}
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div>
          <Link href="/blog" className="text-xs font-bold text-emerald-400 hover:underline">
            {isSw ? "← Rudi kwenye Blogu" : "← Back to Blog"}
          </Link>
        </div>

        {/* Article header */}
        <ScrollReveal className="space-y-4">
          <span className="text-xs text-white/40 block">{post.date} · {post.readTime}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {post.title}
          </h1>
          <p className="text-base sm:text-lg text-emerald-400/80 leading-relaxed font-semibold italic">
            {post.excerpt}
          </p>
        </ScrollReveal>

        {/* Article body */}
        <ScrollReveal className="prose prose-invert max-w-none text-white/80 text-xs sm:text-sm leading-relaxed space-y-6 pt-4 border-t border-white/15">
          <p>{post.content}</p>
          <p>
            {isSw 
              ? "Kama unataka kuchangia data au kufadhili vipimo vya hali ya hewa vya karibu nawe, jiunge na mtandao wetu kupitia Telegram bot leo." 
              : "To start contributing atmospheric readings or auditing farm coordinates in your region, connect your smartphone to Dira Africa via our Telegram bot."}
          </p>
        </ScrollReveal>

      </main>

      <PublicFooter />
    </div>
  );
}
