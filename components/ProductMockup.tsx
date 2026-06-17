import PortraitArt, { type PortraitConfig } from "./PortraitArt";

export type ProductKey = "print" | "frame" | "mug" | "case";

// Lifestyle comps so the customer sees the art in context, not on a void.
// Same composited SVG, dropped onto different products at zero extra cost —
// the whole point of the vector-first architecture. Every mockup is centered
// inside a fixed-size stage by the caller, so the window never jumps when the
// customer switches product.
export default function ProductMockup({
  config,
  product,
  frameColour = "#1a1a1a",
}: {
  config: PortraitConfig;
  product: ProductKey;
  frameColour?: string;
}) {
  if (product === "mug") {
    return (
      <div className="relative">
        <div className="h-52 w-52 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <PortraitArt config={config} id="mug" width="100%" height="100%" />
        </div>
        <div className="absolute -right-8 top-12 h-24 w-14 rounded-r-full border-[11px] border-white/90" />
      </div>
    );
  }

  if (product === "case") {
    // Tall snap case: the 4:5 artwork is scaled to cover the case (sides crop),
    // mirroring Prodigi's fillPrintArea so the preview matches the print.
    return (
      <div className="relative" style={{ width: 165, height: 340 }}>
        <div className="absolute inset-0 overflow-hidden rounded-[32px] bg-black ring-1 ring-black/20">
          <div className="absolute" style={{ top: 0, left: -54, width: 272, height: 340 }}>
            <PortraitArt config={config} id="case" width="100%" height="100%" />
          </div>
        </div>
        <div className="absolute left-3 top-3 h-10 w-10 rounded-xl bg-black/40" />
      </div>
    );
  }

  if (product === "frame") {
    // Framed print: the frame takes the colour from the picker, with a white
    // mat around the artwork so it reads as a real gallery frame.
    return (
      <div
        className="shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
        style={{ backgroundColor: frameColour, padding: 14, borderRadius: 3 }}
      >
        <div className="bg-white" style={{ padding: 14 }}>
          <div className="h-[360px] w-[288px] overflow-hidden">
            <PortraitArt config={config} id="frame" width="100%" height="100%" />
          </div>
        </div>
      </div>
    );
  }

  // print: a clean flat paper print with a soft drop shadow.
  return (
    <div className="bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.16)] ring-1 ring-black/5">
      <div className="h-[412px] w-[330px] overflow-hidden">
        <PortraitArt config={config} id="prv" width="100%" height="100%" />
      </div>
    </div>
  );
}
