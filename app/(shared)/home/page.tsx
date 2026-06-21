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
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function HomeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.role === "farmer") {
        router.replace("/farmer/home");
      } else {
        router.replace("/agent/home");
      }
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0e0e26] via-[#051c1c] to-[#04120f] p-6">
      <div className="w-full max-w-md">
        <LoadingSkeleton type="wallet" />
      </div>
    </div>
  );
}
