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

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary caught exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0e0e26] text-white flex flex-col justify-center items-center h-screen w-screen overflow-hidden text-center space-y-6">
        <span className="text-6xl">🚨</span>
        <h2 className="text-3xl font-black bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
          System Collision Detected
        </h2>
        <p className="text-white/60 text-sm max-w-sm leading-relaxed px-4">
          A critical rendering crash occurred. Press the button to reload the global shell.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#0A6E56] hover:bg-[#085a46] text-white font-bold rounded-xl transition-all shadow-md text-xs uppercase tracking-wider"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
