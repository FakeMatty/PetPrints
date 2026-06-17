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

  const MIN_EDGE = 600; // reject photos too small for a crisp print

  // Validate size, auto-rotate via EXIF, downscale huge files, return a clean
  // data URL (re-encoding also strips EXIF so orientation is baked in).
  async function normalizeImage(file: File): Promise<string> {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file);
    }
    const { width, height } = bitmap;
    if (Math.min(width, height) < MIN_EDGE) {
      bitmap.close();
      throw new Error(
        `That photo is a little small (${width}×${height}px). Use one at least ${MIN_EDGE}px on the short edge for a sharp print.`,
      );
    }
    const maxEdge = 2000;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function handle(file?: File) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like a photo — try a JPG or PNG of your pet.");
      return;
    }
    try {
      setStatus("Checking your photo…");
      const dataUrl = await normalizeImage(file);
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
