import Link from "next/link";
import PortraitArt, { type PortraitConfig } from "@/components/PortraitArt";

const GALLERY: PortraitConfig[] = [
  { style: "flat", pattern: "halo", colour: "#A6B89B", name: "Biscuit", nameOn: true, font: "classic" },
  { style: "line", pattern: "dots", colour: "#FAF7F2", name: "Pixel", nameOn: true, font: "minimal" },
  { style: "pop", pattern: "lines", colour: "#2B3A55", name: "Rufus", nameOn: true, font: "bold" },
  { style: "flat", pattern: "grid", colour: "#D8A33B", name: "Maple", nameOn: true, font: "script" },
  { style: "watercolour", pattern: "solid", colour: "#E8C8C0", name: "Olive", nameOn: true, font: "classic" },
  { style: "pop", pattern: "halo", colour: "#C57B57", name: "Boss", nameOn: true, font: "bold" },
];

const PRICES = [
  { sku: "Digital download", price: "£19", note: "SVG + hi-res PNG, instant" },
  { sku: "Unframed print", price: "£39", note: "Museum-grade matte" },
  { sku: "Framed print", price: "£65", note: "The hero piece" },
  { sku: "Mug · tote · tee", price: "from £24", note: "Same art, anything" },
];

export default function Home() {
  return (
    <main>
      {/* hero */}
      <section className="mx-auto max-w-content px-5 pb-10 pt-16 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-terracotta">Pet Portrait Studio</p>
        <h1 className="mx-auto max-w-3xl font-display text-5xl leading-tight text-ink sm:text-6xl">
          Your dog. As art. In seconds.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink/65">
          Upload a photo, watch them become a clean vector portrait, pick your favourite,
          and put it on anything. See it before you pay.
        </p>
        <Link
          href="/create"
          className="mt-8 inline-block rounded-full bg-ink px-8 py-3.5 text-base font-medium text-bone transition hover:bg-terracotta"
        >
          Upload your pet →
        </Link>
      </section>

      {/* gallery */}
      <section className="mx-auto max-w-content px-5 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {GALLERY.map((c, i) => (
            <div key={i} className="overflow-hidden rounded-md bg-white ring-1 ring-black/5">
              <PortraitArt config={c} id={`g${i}`} width="100%" height="100%" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-ink/50">
          Every portrait above is the same illustration engine — one AI generation, endless looks.
        </p>
      </section>

      {/* pricing */}
      <section className="mx-auto max-w-content px-5 py-12">
        <h2 className="mb-6 text-center font-display text-3xl text-ink">Put them on everything</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRICES.map((p) => (
            <div key={p.sku} className="rounded-lg bg-white p-6 ring-1 ring-black/5">
              <p className="text-sm text-ink/55">{p.sku}</p>
              <p className="mt-1 font-display text-3xl text-ink">{p.price}</p>
              <p className="mt-2 text-sm text-ink/60">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-content px-5 py-10 text-center text-sm text-ink/40">
        Instant preview · UK fulfilment · Love it or it&apos;s on us
      </footer>
    </main>
  );
}
