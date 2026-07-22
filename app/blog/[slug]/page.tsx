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
import BlogPostClient from "./BlogPostClient";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = `${params.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} — Dira Africa`;
  return {
    title,
    description: "Read updates and technical documentation from the Dira Africa climate sensing team.",
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
  };
}

export default function Page({ params }: Props) {
  return <BlogPostClient slug={params.slug} />;
}
