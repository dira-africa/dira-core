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

import { useEffect } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Render boundary caught exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e26] text-white">
      <PublicNav />
      <main className="flex-grow flex flex-col justify-center items-center py-32 px-4 text-center space-y-6">
        <span className="text-6xl">⚠️</span>
        <h2 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
          Something went wrong
        </h2>
        <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Our climate sensing interface encountered a rendering crash. Let's try recalibrating.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#0A6E56] hover:bg-[#085a46] text-white font-bold rounded-xl transition-all shadow-md text-xs uppercase tracking-wider"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
          >
            Home Page
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
