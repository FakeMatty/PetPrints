"use client";

import { useRef, useState } from "react";

export type GenResult = { petImageUrl?: string; flatVectorUrl?: string; generationId?: string | null };

// Phase 1 + 2 entry point. Validates the photo client-side, then POSTs it to
// /api/generate which runs the Replicate pipeline (stylise -> bg-remove ->
// optional vectorise) and returns the stylised pet.
//
// In production add: resolution floor, single-subject + moderation checks,
// EXIF rotation fix, rate limiting, and watermarked low-res previews.
export default function UploadZone({
  onReady,
}: {
  onReady: (result?: GenResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("Could not read that file"));
      r.readAsDataURL(file);
    });
  }

  async function handle(file?: File) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like a photo — try a JPG or PNG of your pet.");
      return;
    }
    try {
      setStatus("Reading your photo…");
      const dataUrl = await readAsDataUrl(file);
      setStatus("Turning them into art… this takes a few seconds");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onReady({ petImageUrl: data.rasterUrl, flatVectorUrl: data.flatVectorUrl, generationId: data.generationId });
    } catch (e) {
      setStatus(null);
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  const busy = !!status;

  return (
    <div className="mx-auto max-w-xl text-center">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) handle(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed border-ink/25 bg-white px-8 py-14 transition ${
          busy ? "opacity-70" : "cursor-pointer hover:border-terracotta"
        }`}
      >
        <p className="font-display text-2xl text-ink">{status ?? "Upload your pet"}</p>
        <p className="mt-2 text-sm text-ink/60">
          {busy ? "Hang tight." : "Drag a photo here, or tap to choose. Phone photos welcome."}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0] ?? undefined)}
        />
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={() => !busy && onReady()}
        className="mt-4 text-sm text-ink/60 underline underline-offset-4 hover:text-ink"
      >
        No photo handy? Preview with a sample pet →
      </button>
    </div>
  );
}
