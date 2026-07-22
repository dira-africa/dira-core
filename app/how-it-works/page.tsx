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
import HowItWorksClient from "./HowItWorksClient";

export const metadata: Metadata = {
  title: "How It Works — Dira Africa",
  description: "Learn how the decentralized physical weather sensing network operates, leveraging smartphones, AI crop checks, and Hedera Consensus Service.",
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function Page() {
  return <HowItWorksClient />;
}
