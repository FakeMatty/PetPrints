"use client";

import { useState } from "react";
import Link from "next/link";
import UploadZone, { type GenResult } from "@/components/UploadZone";
import Configurator from "@/components/Configurator";

export default function CreatePage() {
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);

  return (
    <main className="mx-auto max-w-content px-5 py-10">
      <Link href="/" className="text-sm text-ink/60 hover:text-ink">
        ← Pet Portrait Studio
      </Link>

      <div className="mt-8">
        {!ready ? (
          <div className="py-16">
            <h1 className="mb-8 text-center font-display text-3xl text-ink">
              Let&apos;s make your portrait
            </h1>
            <UploadZone
              onReady={(r) => {
                setResult(r ?? null);
                setReady(true);
              }}
            />
          </div>
        ) : (
          <>
            <h1 className="mb-1 font-display text-3xl text-ink">Pick your favourite</h1>
            <p className="mb-8 text-ink/60">
              Flip any option — it updates instantly. Add to cart when you love it.
            </p>
            <Configurator
              petImageUrl={result?.petImageUrl}
              flatVectorUrl={result?.flatVectorUrl}
              generationId={result?.generationId}
            />
          </>
        )}
      </div>
    </main>
  );
}
