"use client";

import { useRef, useState } from "react";
import Configurator from "./Configurator";

type Phase = "idle" | "loading" | "editing";
type Result = { petImageUrl?: string; flatVectorUrl?: string; generationId?: string | null };

const LOADING_MSGS = [
  "Reading your photo…",
  "Lifting them off the background…",
  "Painting your pet…",
  "Adding the finishing touches…",
];

export default function Studio() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState(LOADING_MSGS[0]);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function normalizeImage(file: File): Promise<string> {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(file);
    }
    const { width, height } = bitmap;
    if (Math.min(width, height) < 600) {
      bitmap.close();
      throw new Error(`That photo is a little small (${width}×${height}px). Use one at least 600px on the short edge.`);
    }
    const scale = Math.min(1, 2000 / Math.max(width, height));
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
    if (!file) {
      setResult(null);
      setPhase("editing");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like a photo — try a JPG or PNG of your pet.");
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await normalizeImage(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that photo");
      return;
    }

    setPreview(dataUrl);
    setPhase("loading");
    setProgress(6);
    setMsg(LOADING_MSGS[0]);

    let p = 6;
    const tick = window.setInterval(() => {
      p = Math.min(92, p + Math.random() * 7 + 2);
      setProgress(p);
      setMsg(LOADING_MSGS[Math.min(LOADING_MSGS.length - 1, Math.floor(p / 24))]);
    }, 900);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      window.clearInterval(tick);
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setProgress(100);
      setMsg("Ready!");
      setTimeout(() => {
        setResult({ petImageUrl: data.rasterUrl, flatVectorUrl: data.flatVectorUrl, generationId: data.generationId });
        setPhase("editing");
      }, 600);
    } catch (e) {
      window.clearInterval(tick);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("idle");
    }
  }

  // ---- editing ----------------------------------------------------------
  if (phase === "editing") {
    return (
      <section id="studio" className="mx-auto max-w-content px-5 py-12">
        <h2 className="mb-1 font-display text-3xl">Pick your favourite</h2>
        <p className="mb-8 text-ink/60">Flip any option — it updates instantly. Add to cart when you love it.</p>
        <Configurator petImageUrl={result?.petImageUrl} flatVectorUrl={result?.flatVectorUrl} generationId={result?.generationId} />
      </section>
    );
  }

  // ---- loading ----------------------------------------------------------
  if (phase === "loading") {
    return (
      <section id="studio" className="flex min-h-[78vh] items-center justify-center bg-bone px-5">
        <div className="w-full max-w-sm text-center">
          <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-2xl ring-1 ring-black/10">
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-bone/70 to-transparent" />
          </div>
          <p className="mt-6 font-display text-2xl text-ink">{msg}</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-terracotta transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink/50">{Math.round(progress)}%</p>
        </div>
      </section>
    );
  }

  // ---- idle (hero + upload over the image) ------------------------------
  return (
    <section id="studio" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "#2E2E2E", backgroundImage: "url('/images/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55" />
      <div className="relative z-10 mx-auto w-full max-w-xl px-5 py-16 text-center text-white">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/80">Custom pet art</p>
        <h1 className="font-display text-5xl leading-[1.05] drop-shadow sm:text-6xl">Your dog. As art. In seconds.</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/85">Upload a photo and watch them become a gallery-grade portrait — see it before you pay.</p>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handle(e.dataTransfer.files?.[0]);
          }}
          className="mt-8 cursor-pointer rounded-2xl border-2 border-dashed border-white/60 bg-white/10 px-8 py-12 backdrop-blur-sm transition hover:border-white hover:bg-white/20"
        >
          <p className="font-display text-2xl">Upload your pet</p>
          <p className="mt-1 text-sm text-white/80">Drag a photo here, or tap to choose. Phone snaps welcome.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handle(e.target.files?.[0] ?? undefined)}
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
        <button type="button" onClick={() => handle()} className="mt-4 text-sm text-white/80 underline underline-offset-4 hover:text-white">
          No photo handy? Preview with a sample pet →
        </button>
      </div>
    </section>
  );
}
