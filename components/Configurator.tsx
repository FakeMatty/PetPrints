"use client";

import { useState, useRef } from "react";
import PortraitArt, { type PortraitConfig } from "./PortraitArt";
import ProductMockup, { type ProductKey } from "./ProductMockup";
import { STYLES, PATTERNS, COLOURS, FONTS } from "@/lib/palette";
import { CATALOG } from "@/lib/products";
import { composeAndUploadPrint, printWidthForInches, downloadPrint } from "@/lib/printfile";

// Which mockup to show for each catalog product, so the preview always matches
// what the customer is about to buy.
const PREVIEW_FOR: Record<string, ProductKey> = {
  digital: "print",
  unframed: "print",
  framed: "frame",
  merch: "mug",
  case: "case",
};

// Prodigi's valid frame colours (name = value sent to Prodigi).
const FRAME_COLOURS: { name: string; hex: string }[] = [
  { name: "black", hex: "#1a1a1a" },
  { name: "white", hex: "#f5f5f5" },
  { name: "natural", hex: "#c9a66b" },
  { name: "silver", hex: "#c4c4c4" },
  { name: "light grey", hex: "#d3d3d3" },
  { name: "dark grey", hex: "#555555" },
  { name: "gold", hex: "#d4af37" },
  { name: "brown", hex: "#5a3a22" },
];

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? "border-ink bg-ink text-bone" : "border-black/15 bg-white text-ink hover:border-black/40"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-widest text-ink/50">{label}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs uppercase tracking-widest text-ink/50">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-terracotta"
      />
    </label>
  );
}

export default function Configurator({
  petImageUrl,
  flatVectorUrl,
  generationId,
}: {
  petImageUrl?: string;
  flatVectorUrl?: string;
  generationId?: string | null;
} = {}) {
  const [config, setConfig] = useState<PortraitConfig>({
    style: "flat",
    pattern: "halo",
    colour: "#A6B89B",
    name: "Biscuit",
    nameOn: true,
    font: "classic",
    petImageUrl,
    petScale: 1,
    petOffsetX: 0,
    petOffsetY: 0,
    nameY: 452,
    nameSize: 40,
  });
  const [productKey, setProductKey] = useState(CATALOG[0].key);
  const [variantId, setVariantId] = useState(CATALOG[0].variants[0].id);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameColour, setFrameColour] = useState("black");
  const printRef = useRef<HTMLDivElement>(null);

  // Local download of the composited artwork — handy for making tester images.
  async function downloadImage() {
    setDownloading(true);
    try {
      const svgEl = printRef.current?.querySelector("svg");
      if (svgEl) {
        const base = config.nameOn && config.name.trim() ? config.name.trim() : "pet-portrait";
        const safe = base.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        await downloadPrint(svgEl as unknown as SVGSVGElement, `${safe}.png`, 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not prepare download");
    } finally {
      setDownloading(false);
    }
  }

  function set<K extends keyof PortraitConfig>(k: K, v: PortraitConfig[K]) {
    setConfig((c) => ({ ...c, [k]: v }));
  }

  const activeProduct = CATALOG.find((p) => p.key === productKey) ?? CATALOG[0];
  const activeVariant = activeProduct.variants.find((v) => v.id === variantId) ?? activeProduct.variants[0];
  const colourKey = COLOURS.find((c) => c.hex === config.colour)?.key ?? config.colour;
  const hasGenerated = !!petImageUrl;
  const mockup = PREVIEW_FOR[productKey] ?? "print";
  const frameHex = FRAME_COLOURS.find((c) => c.name === frameColour)?.hex ?? "#1a1a1a";
  const subtotal = (Number(activeVariant.price) * qty).toFixed(2);

  async function addToCart() {
    setAdding(true);
    setError(null);
    const isVector = !!flatVectorUrl && config.petImageUrl === flatVectorUrl;
    // Render the finished portrait to a high-res print file and store it.
    let printUrl = petImageUrl ?? "pending-generation";
    try {
      const svgEl = printRef.current?.querySelector("svg");
      if (svgEl) {
        // Size the print file to the chosen physical size, capped at 300 DPI so
        // we never upscale the artwork beyond what print needs.
        const printWidth = printWidthForInches(activeVariant.inches ?? 8);
        printUrl = await composeAndUploadPrint(svgEl as unknown as SVGSVGElement, printWidth);
      }
    } catch {
      /* fall back to the pet image URL if compositing fails */
    }
    // Save the chosen config (linked to the generation) so the order has an
    // audit trail back to the stored artwork. The returned id rides to Shopify.
    let configId = "";
    try {
      const r = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: generationId ?? null,
          bgPattern: config.pattern,
          bgColour: colourKey,
          nameText: config.nameOn ? config.name.trim() : null,
          nameFont: config.font,
          printUrl,
          config,
        }),
      });
      const d = await r.json();
      if (r.ok && d.configId) configId = d.configId;
    } catch {
      /* non-fatal: continue without the audit id */
    }
    const attributes = [
      { key: "look", value: hasGenerated ? (isVector ? "flat-vector" : "illustration") : config.style },
      { key: "background", value: colourKey },
      { key: "pattern", value: config.pattern },
      { key: "pet_name", value: config.nameOn ? config.name.trim() : "" },
      { key: "font", value: config.font },
      { key: "generation_id", value: generationId ?? "" },
      { key: "config_id", value: configId },
      ...(productKey === "framed" ? [{ key: "frame_colour", value: frameColour }] : []),
      { key: "_artwork_svg_url", value: flatVectorUrl ?? "pending-generation" },
      { key: "_artwork_print_url", value: printUrl },
    ];
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchandiseId: variantId, quantity: qty, attributes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create cart");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setAdding(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[440px_1fr]">
      <div ref={printRef} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        <PortraitArt config={config} id="print" width={400} height={500} />
      </div>
      <div className="space-y-3">
        {/* Fixed-size stage: the window stays put while the product changes. */}
        <div className="flex h-[480px] items-center justify-center overflow-hidden rounded-lg bg-[#efe9e1] ring-1 ring-black/5">
          <ProductMockup config={config} product={mockup} frameColour={frameHex} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink/45">
            Live preview of your {activeProduct.label.toLowerCase()} — changes the moment you pick a product.
          </p>
          <button
            type="button"
            onClick={downloadImage}
            disabled={downloading}
            className="shrink-0 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:border-black/40 disabled:opacity-50"
          >
            {downloading ? "Preparing…" : "↓ Download PNG"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {!hasGenerated ? (
          <Field label="Art style">
            {STYLES.map((s) => (
              <Pill key={s.key} active={config.style === s.key} onClick={() => set("style", s.key)}>
                {s.label}
                {!s.vector ? <span className="ml-1 text-xs opacity-60"> raster</span> : null}
              </Pill>
            ))}
          </Field>
        ) : flatVectorUrl ? (
          <Field label="Look">
            <Pill active={config.petImageUrl === petImageUrl} onClick={() => set("petImageUrl", petImageUrl)}>
              Illustration
            </Pill>
            <Pill active={config.petImageUrl === flatVectorUrl} onClick={() => set("petImageUrl", flatVectorUrl)}>
              Flat vector
            </Pill>
          </Field>
        ) : null}

        <Field label="Pet size & position">
          <Slider label="Size" value={config.petScale ?? 1} min={0.6} max={2} step={0.02} onChange={(v) => set("petScale", v)} />
          <Slider label="Left / right" value={config.petOffsetX ?? 0} min={-220} max={220} onChange={(v) => set("petOffsetX", v)} />
          <Slider label="Up / down" value={config.petOffsetY ?? 0} min={-260} max={260} onChange={(v) => set("petOffsetY", v)} />
        </Field>

        <Field label="Background pattern">
          {PATTERNS.map((p) => (
            <Pill key={p.key} active={config.pattern === p.key} onClick={() => set("pattern", p.key)}>
              {p.label}
            </Pill>
          ))}
        </Field>

        <Field label="Background colour">
          {COLOURS.map((c) => (
            <button
              key={c.key}
              type="button"
              title={c.label}
              aria-label={c.label}
              onClick={() => set("colour", c.hex)}
              className={`h-9 w-9 rounded-full ring-2 ring-offset-2 transition ${
                config.colour === c.hex ? "ring-ink" : "ring-transparent hover:ring-black/20"
              }`}
              style={{ backgroundColor: c.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
            />
          ))}
          <label className="flex items-center gap-2 text-sm text-ink/70" title="Pick any colour">
            <input
              type="color"
              value={config.colour}
              onChange={(e) => set("colour", e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-full border border-black/15 bg-white p-0.5"
            />
            Custom
          </label>
        </Field>

        <Field label="Pet name">
          <div className="flex w-full flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.nameOn} onChange={(e) => set("nameOn", e.target.checked)} />
              Show name
            </label>
            <input
              type="text"
              value={config.name}
              disabled={!config.nameOn}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your pet's name"
              className="flex-1 rounded-md border border-black/15 px-3 py-1.5 text-sm disabled:opacity-40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FONTS.map((f) => (
              <Pill key={f.key} active={config.font === f.key} onClick={() => set("font", f.key)}>
                <span className={f.className}>{f.label}</span>
              </Pill>
            ))}
          </div>
          <div className="flex w-full flex-wrap gap-3">
            <Slider label="Text size" value={config.nameSize ?? 40} min={16} max={80} onChange={(v) => set("nameSize", v)} />
            <Slider label="Text position (top - bottom)" value={config.nameY ?? 452} min={80} max={490} onChange={(v) => set("nameY", v)} />
          </div>
        </Field>

        {productKey === "framed" ? (
          <Field label="Frame colour">
            {FRAME_COLOURS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                onClick={() => setFrameColour(c.name)}
                className={`h-9 w-9 rounded-md ring-2 ring-offset-2 transition ${frameColour === c.name ? "ring-ink" : "ring-transparent hover:ring-black/20"}`}
                style={{ backgroundColor: c.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }}
              />
            ))}
          </Field>
        ) : null}

        <div className="space-y-3 rounded-lg border border-black/10 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-ink/50">Choose your product &amp; add to cart</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-ink/50">
              Product
              <select
                value={productKey}
                onChange={(e) => {
                  const p = CATALOG.find((c) => c.key === e.target.value) ?? CATALOG[0];
                  setProductKey(p.key);
                  setVariantId(p.variants[0].id);
                }}
                className="rounded-md border border-black/15 px-2 py-1.5 text-sm font-normal normal-case text-ink"
              >
                {CATALOG.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-ink/50">
              Option
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="rounded-md border border-black/15 px-2 py-1.5 text-sm font-normal normal-case text-ink"
              >
                {activeProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} ({"£"}{v.price})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-ink/50">
              Qty
              <input
                type="number"
                min={1}
                max={20}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="w-16 rounded-md border border-black/15 px-2 py-1.5 text-sm font-normal normal-case text-ink"
              />
            </label>
            <button
              type="button"
              onClick={addToCart}
              disabled={adding}
              className="ml-auto rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-ink disabled:opacity-50"
            >
              {adding ? "Adding..." : `Add to cart £${subtotal}`}
            </button>
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
