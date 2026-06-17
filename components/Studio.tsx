"use client";

import { useRef, useState } from "react";
import Configurator from "./Configurator";
import HamsterLoader from "./HamsterLoader";
import PatternBackground from "./PatternBackground";

type Phase = "idle" | "loading" | "editing";
type Result = { petImageUrl?: string; flatVectorUrl?: string; generationId?: string | null };

const LOADING_MSGS = [
  "Reading your photo…",
  "Lifting them off the background…",
  "Painting your pet…",
  "Adding the finishing touches…",
];

const STEP_LABELS = ["Upload", "Design", "Order"];

function Stepper({ current, variant = "light" }: { current: number; variant?: "light" | "dark" }) {
  const activeText = variant === "dark" ? "text-white" : "text-ink";
  const muted = variant === "dark" ? "text-white/55" : "text-ink/40";
  const line = variant === "dark" ? "bg-white/30" : "bg-black/15";
  return (
    <div className="mx-auto mb-8 flex w-full max-w-md items-center justify-center">
      {STEP_LABELS.map((s, i) => (
        <div key={s} className="flex items-center">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
              i <= current ? "bg-terracotta text-white" : variant === "dark" ? "bg-white/20 text-white/70" : "bg-black/10 text-ink/50"
            }`}
          >
            {i + 1}
          </span>
          <span className={`ml-2 text-sm ${i === current ? `${activeText} font-medium` : muted}`}>{s}</span>
          {i < STEP_LABELS.length - 1 ? <span className={`mx-3 h-px w-8 ${line}`} /> : null}
        </div>
      ))}
    </div>
  );
}

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

  // ---- editing: Step 2 (Design) → Step 3 (Order) ------------------------
  if (phase === "editing") {
    return (
      <section id="studio" className="mx-auto max-w-content px-5 py-12">
        <Stepper current={1} />
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl">Design your portrait</h2>
          <p className="mt-1 text-ink/60">Style it on the left, then pick your product and add to cart — it updates instantly.</p>
        </div>
        <Configurator petImageUrl={result?.petImageUrl} flatVectorUrl={result?.flatVectorUrl} generationId={result?.generationId} />
      </section>
    );
  }

  // ---- loading ----------------------------------------------------------
  if (phase === "loading") {
    return (
      <section id="studio" className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden bg-bone px-5 py-16">
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <PatternBackground variant="waves" />
        </div>
        <div className="relative z-10">
          <Stepper current={0} />
        </div>
        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="flex flex-col items-center">
            <HamsterLoader />
            {preview ? (
              <img src={preview} alt="Your pet" className="mt-3 h-12 w-12 rounded-full object-cover ring-1 ring-black/10" />
            ) : null}
          </div>
          <p className="mt-6 font-display text-2xl text-ink">{msg}</p>
          <p className="mt-1 text-sm text-ink/55">Hang tight — this takes a few seconds. Don&apos;t close the page.</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-terracotta transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink/50">{Math.round(progress)}%</p>
        </div>
      </section>
    );
  }

  // ---- idle: Step 1 (Upload) -------------------------------------------
  return (
    <section id="studio" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: "#2E2E2E", backgroundImage: "url('/images/hero.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55" />
      <div className="relative z-10 mx-auto w-full max-w-xl px-5 py-20 text-center text-white">
        <h1 className="font-display text-5xl leading-[1.05] drop-shadow sm:text-6xl">Your dog. As art. In seconds.</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/85">Three quick steps: upload a photo, design your portrait, and order. See it before you pay.</p>

        <div className="mt-8">
          <Stepper current={0} variant="dark" />
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handle(e.dataTransfer.files?.[0]);
          }}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-white/60 bg-white/10 px-8 py-12 backdrop-blur-sm transition hover:border-white hover:bg-white/20"
        >
          <p className="font-display text-2xl">Step 1 — Upload your pet</p>
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
