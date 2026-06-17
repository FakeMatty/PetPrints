import PortraitArt, { type PortraitConfig } from "./PortraitArt";

export type ProductKey = "canvas" | "mug" | "tee" | "case";

// Lifestyle comps so the customer sees the art in context, not on a void.
// Same composited SVG, dropped onto different products at zero extra cost —
// the whole point of the vector-first architecture.
export default function ProductMockup({
  config,
  product,
}: {
  config: PortraitConfig;
  product: ProductKey;
}) {
  if (product === "mug") {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="relative">
          <div className="h-44 w-44 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <PortraitArt config={config} id="mug" width="100%" height="100%" />
          </div>
          <div className="absolute -right-7 top-9 h-20 w-12 rounded-r-full border-[10px] border-white/90" />
        </div>
      </div>
    );
  }

  if (product === "tee") {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="relative h-60 w-60">
          <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full">
            <path
              d="M60 28 L96 28 C100 44 140 44 144 28 L180 28 L212 64 L186 92 L172 78 L172 212 L68 212 L68 78 L54 92 L28 64 Z"
              fill="#f2efe9"
              stroke="#dcd6cc"
              strokeWidth="2"
            />
          </svg>
          <div className="absolute left-1/2 top-[44%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md">
            <PortraitArt config={config} id="tee" width="100%" height="100%" />
          </div>
        </div>
      </div>
    );
  }

  if (product === "case") {
    // Tall snap case: the 4:5 artwork is scaled to cover the case (sides crop),
    // mirroring Prodigi's fillPrintArea so the preview matches the print.
    return (
      <div className="flex items-center justify-center bg-[#efe9e1] py-6">
        <div className="relative" style={{ width: 150, height: 310 }}>
          <div className="absolute inset-0 overflow-hidden rounded-[30px] bg-black ring-1 ring-black/20">
            <div className="absolute" style={{ top: 0, left: -49, width: 248, height: 310 }}>
              <PortraitArt config={config} id="case" width="100%" height="100%" />
            </div>
          </div>
          <div className="absolute left-3 top-3 h-9 w-9 rounded-xl bg-black/40" />
        </div>
      </div>
    );
  }

  // canvas on a wall
  return (
    <div className="flex items-center justify-center bg-[#efe9e1] py-8">
      <div className="rounded-[3px] border-[10px] border-[#2e2e2e] bg-white p-2 shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
        <div className="h-64 w-[210px] overflow-hidden">
          <PortraitArt config={config} id="canvas" width="100%" height="100%" />
        </div>
      </div>
    </div>
  );
}
