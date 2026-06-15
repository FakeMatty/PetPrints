"use client";

import { useState, useRef } from "react";
import PortraitArt, { type PortraitConfig } from "./PortraitArt";
import ProductMockup, { type ProductKey } from "./ProductMockup";
import { STYLES, PATTERNS, COLOURS, FONTS } from "@/lib/palette";
import { CATALOG } from "@/lib/products";
import { composePrintDataUrl } from "@/lib/printfile";

const PRODUCTS: { key: ProductKey; label: string }[] = [
  { key: "canvas", label: "Canvas" },
  { key: "mug", label: "Mug" },
  { key: "tee", label: "Tee" },
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
  const [product, setProduct] = useState<ProductKey | "art">("art");
  const [productKey, setProductKey] = useState(CATALOG[0].key);
  const [variantId, setVariantId] = useState(CATALOG[0].variants[0].id);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  function set<K extends keyof PortraitConfig>(k: K, v: PortraitConfig[K]) {
    setConfig((c) => ({ ...c, [k]: v }));
  }

  const activeProduct = CATALOG.find((p) => p.key === productKey) ?? CATALOG[0];
  const activeVariant = activeProduct.variants.find((v) => v.id === variantId) ?? activeProduct.variants[0];
  const colourKey = COLOURS.find((c) => c.hex === config.colour)?.key ?? config.colour;
  const hasGenerated = !!petImageUrl;

  async function addToCart() {
    setAdding(true);
    setError(null);
    const isVector = !!flatVectorUrl && config.petImageUrl === flatVectorUrl;
    // Render the finished portrait to a high-res print file and store it.
    let printUrl = petImageUrl ?? "pending-generation";
    try {
      const svgEl = printRef.current?.querySelector("svg");
      if (svgEl) {
        const dataUrl = await composePrintDataUrl(svgEl as unknown as SVGSVGElement, 1600);
        const r = await fetch("/api/persist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const d = await r.json();
        if (r.ok && d.url) printUrl = d.url;
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
      { key: "_artwork_svg_url", value: flatVectorUrl ?? "pending-generation" },
      { key: "_artwork_print_url", value: printUrl },
    ];
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchandiseId: variantId, quantity: 1, attributes }),
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
        <div className="overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
          {product === "art" ? (
            <PortraitArt config={config} id="main" width="100%" height="100%" />
          ) : (
            <ProductMockup config={config} product={product} />
          )}
        </div>
        <div className="flex gap-2">
          <Pill active={product === "art"} onClick={() => setProduct("art")}>
            Artwork
          </Pill>
          {PRODUCTS.map((p) => (
            <Pill key={p.key} active={product === p.key} onClick={() => setProduct(p.key)}>
              {p.label}
            </Pill>
          ))}
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
          <Slider label="Size" value={config.petScale ?? 1} min={0.6} max={1.6} step={0.02} onChange={(v) => set("petScale", v)} />
          <Slider label="Left / right" value={config.petOffsetX ?? 0} min={-120} max={120} onChange={(v) => set("petOffsetX", v)} />
          <Slider label="Up / down" value={config.petOffsetY ?? 0} min={-120} max={120} onChange={(v) => set("petOffsetY", v)} />
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

        <div className="space-y-3 rounded-lg border border-black/10 bg-white p-4">
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
            <button
              type="button"
              onClick={addToCart}
              disabled={adding}
              className="ml-auto rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-ink disabled:opacity-50"
            >
              {adding ? "Adding..." : `Add to cart £${activeVariant.price}`}
            </button>
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
