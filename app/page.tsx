import Link from "next/link";
import PortraitArt, { type PortraitConfig } from "@/components/PortraitArt";

// Live sample portraits (no image files needed — rendered by the engine).
const GALLERY: PortraitConfig[] = [
  { style: "flat", pattern: "halo", colour: "#A6B89B", name: "Biscuit", nameOn: true, font: "classic" },
  { style: "line", pattern: "dots", colour: "#FAF7F2", name: "Pixel", nameOn: true, font: "minimal" },
  { style: "pop", pattern: "lines", colour: "#2B3A55", name: "Rufus", nameOn: true, font: "bold" },
  { style: "flat", pattern: "grid", colour: "#D8A33B", name: "Maple", nameOn: true, font: "script" },
  { style: "watercolour", pattern: "solid", colour: "#E8C8C0", name: "Olive", nameOn: true, font: "classic" },
  { style: "pop", pattern: "halo", colour: "#C57B57", name: "Boss", nameOn: true, font: "bold" },
];

// Lifestyle product tiles. `img` points at /public/images/* — drop the Gemini
// shots there and they appear; until then a warm colour block shows.
const SHOWCASE = [
  { label: "Framed print", from: "£45", img: "/images/product-framed.jpg", bg: "#A6B89B" },
  { label: "Unframed print", from: "£29", img: "/images/product-print.jpg", bg: "#E8C8C0" },
  { label: "Phone case", from: "£29", img: "/images/product-case.jpg", bg: "#8FA9C0" },
  { label: "Mug", from: "£24", img: "/images/product-mug.jpg", bg: "#D8A33B" },
];

const STEPS = [
  { n: "1", title: "Upload a photo", body: "Any clear photo of your pet — a phone snap is perfect." },
  { n: "2", title: "Watch them become art", body: "See your pet restyled in seconds. Tweak the colour, background and name." },
  { n: "3", title: "We print & ship", body: "Gallery-grade, made and posted in the UK. Or grab the instant digital download." },
];

const REVIEWS = [
  { name: "Hannah P.", text: "Genuinely teared up. It looks exactly like her and the frame is gorgeous." },
  { name: "Tom R.", text: "Ordered a mug and a print. Quality is miles better than I expected." },
  { name: "Aisha K.", text: "Seeing it before paying sold me instantly. Arrived in three days." },
];

function Lifestyle({ src, bg, className }: { src: string; bg: string; className?: string }) {
  return (
    <div
      className={className}
      style={{ backgroundColor: bg, backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center" }}
      role="img"
    />
  );
}

export default function Home() {
  return (
    <main className="bg-bone text-ink">
      {/* announcement */}
      <div className="bg-ink py-2 text-center text-xs tracking-wide text-bone">
        Free UK delivery · Love it or it&apos;s on us
      </div>

      {/* header */}
      <header className="mx-auto flex max-w-content items-center justify-between px-5 py-5">
        <span className="font-display text-xl">Pet Portrait Studio</span>
        <nav className="hidden gap-8 text-sm text-ink/70 md:flex">
          <a href="#how">How it works</a>
          <a href="#gallery">Gallery</a>
          <a href="#reviews">Reviews</a>
        </nav>
        <Link href="/create" className="rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-white transition hover:bg-ink">
          Create yours
        </Link>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-content items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-terracotta">Custom pet art</p>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">Your dog. As art. In seconds.</h1>
          <p className="mt-5 max-w-md text-lg text-ink/65">
            Upload a photo, watch them become a clean illustrated portrait, pick your favourite, and put it on anything. See it before you pay.
          </p>
          <Link href="/create" className="mt-8 inline-block rounded-full bg-terracotta px-8 py-3.5 text-base font-medium text-white transition hover:bg-ink">
            Upload your pet →
          </Link>
          <p className="mt-4 text-sm text-ink/50">★★★★★ Loved by 10,000+ pet owners</p>
        </div>
        <Lifestyle src="/images/hero.jpg" bg="#A6B89B" className="aspect-[4/5] w-full rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] md:aspect-[3/4]" />
      </section>

      {/* trust strip */}
      <div className="border-y border-black/10 bg-white">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-10 gap-y-2 px-5 py-4 text-sm text-ink/60">
          <span>★★★★★ 10,000+ happy pets</span>
          <span>UK printed &amp; shipped</span>
          <span>See it before you pay</span>
          <span>Love-it guarantee</span>
        </div>
      </div>

      {/* how it works */}
      <section id="how" className="mx-auto max-w-content px-5 py-20">
        <h2 className="mb-12 text-center font-display text-4xl">How it works</h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-terracotta font-display text-lg text-white">{s.n}</div>
              <h3 className="font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* sample gallery (live) */}
      <section id="gallery" className="bg-white py-20">
        <div className="mx-auto max-w-content px-5">
          <h2 className="mb-3 text-center font-display text-4xl">One upload, endless looks</h2>
          <p className="mx-auto mb-10 max-w-xl text-center text-ink/60">
            Every portrait below comes from the same illustration engine — pick the style, background and name that feel like them.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {GALLERY.map((c, i) => (
              <div key={i} className="overflow-hidden rounded-lg ring-1 ring-black/5">
                <PortraitArt config={c} id={`g${i}`} width="100%" height="100%" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* product range */}
      <section className="mx-auto max-w-content px-5 py-20">
        <h2 className="mb-3 text-center font-display text-4xl">Put them on everything</h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-ink/60">One portrait, ready for the wall, the desk, your pocket — or an instant digital download.</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SHOWCASE.map((p) => (
            <Link key={p.label} href="/create" className="group block">
              <Lifestyle src={p.img} bg={p.bg} className="aspect-square w-full rounded-lg transition group-hover:opacity-95" />
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-medium">{p.label}</span>
                <span className="text-sm text-ink/50">from {p.from}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* why us */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-content gap-10 px-5 sm:grid-cols-3">
          {[
            { t: "See it before you pay", b: "No leap of faith. Preview your pet as art instantly, free." },
            { t: "Crisp at any size", b: "Printed from clean vector art — razor-sharp from a sticker to a canvas." },
            { t: "Gallery-grade, UK-made", b: "Premium papers and frames, printed and posted in the UK." },
          ].map((x) => (
            <div key={x.t}>
              <h3 className="font-display text-xl">{x.t}</h3>
              <p className="mt-2 text-sm text-ink/60">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* reviews */}
      <section id="reviews" className="mx-auto max-w-content px-5 py-20">
        <h2 className="mb-10 text-center font-display text-4xl">Tails of joy</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-lg bg-white p-6 ring-1 ring-black/5">
              <p className="text-terracotta">★★★★★</p>
              <p className="mt-3 text-sm text-ink/80">“{r.text}”</p>
              <p className="mt-4 text-sm font-medium">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="bg-ink py-20 text-center text-bone">
        <h2 className="font-display text-4xl">Ready to see your pet as art?</h2>
        <Link href="/create" className="mt-8 inline-block rounded-full bg-terracotta px-8 py-3.5 text-base font-medium text-white transition hover:bg-white hover:text-ink">
          Upload your pet →
        </Link>
      </section>

      <footer className="mx-auto max-w-content px-5 py-10 text-center text-sm text-ink/40">
        Pet Portrait Studio · Instant preview · UK fulfilment · Love-it guarantee
      </footer>
    </main>
  );
}
