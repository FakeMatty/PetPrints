import type { StyleKey } from "@/lib/palette";

// MOCK vectorised pet. In production this <g> is replaced by the SVG returned
// from the AI pipeline (bg removal -> stylise -> vectorise). It is the ONLY
// layer that ever comes from a model; everything around it is parametric.
//
// One shared geometry, rendered four ways to demonstrate the four art styles.

type Ink = { dark: string; mid: string; light: string };

const Geometry = ({
  fillHead,
  fillMuzzle,
  fillEar,
  fillNose,
  fillEye,
  stroke,
  strokeWidth = 0,
  opacity = 1,
}: {
  fillHead: string;
  fillMuzzle: string;
  fillEar: string;
  fillNose: string;
  fillEye: string;
  stroke: string;
  strokeWidth?: number;
  opacity?: number;
}) => (
  <g
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
  >
    <ellipse cx="110" cy="172" rx="34" ry="80" transform="rotate(-22 110 172)" fill={fillEar} />
    <ellipse cx="290" cy="172" rx="34" ry="80" transform="rotate(22 290 172)" fill={fillEar} />
    <ellipse cx="200" cy="205" rx="118" ry="110" fill={fillHead} />
    <ellipse cx="200" cy="262" rx="72" ry="58" fill={fillMuzzle} />
    <circle cx="158" cy="184" r="15" fill={fillEye} />
    <circle cx="242" cy="184" r="15" fill={fillEye} />
    <ellipse cx="200" cy="240" rx="23" ry="16" fill={fillNose} />
    <path d="M200 254 V280 M200 280 C182 298 158 292 152 274 M200 280 C218 298 242 292 248 274" fill="none" stroke={stroke} strokeWidth={Math.max(strokeWidth, 5)} />
  </g>
);

export default function PetArt({ styleKey, ink }: { styleKey: StyleKey; ink: Ink }) {
  if (styleKey === "line") {
    return (
      <Geometry
        fillHead="none"
        fillMuzzle="none"
        fillEar="none"
        fillNose={ink.dark}
        fillEye={ink.dark}
        stroke={ink.dark}
        strokeWidth={7}
      />
    );
  }

  if (styleKey === "flat") {
    return (
      <Geometry
        fillHead={ink.mid}
        fillMuzzle={ink.light}
        fillEar={ink.dark}
        fillNose={ink.dark}
        fillEye={ink.dark}
        stroke="none"
      />
    );
  }

  if (styleKey === "pop") {
    // Two-tone screenprint feel: bold blocks, no mid-tones.
    return (
      <Geometry
        fillHead={ink.dark}
        fillMuzzle={ink.light}
        fillEar={ink.light}
        fillNose={ink.light}
        fillEye={ink.light}
        stroke={ink.dark}
        strokeWidth={3}
      />
    );
  }

  // watercolour — soft, layered, translucent. Raster in production; faked here.
  return (
    <g>
      <Geometry fillHead={ink.light} fillMuzzle={ink.light} fillEar={ink.mid} fillNose={ink.mid} fillEye={ink.dark} stroke="none" opacity={0.55} />
      <Geometry fillHead={ink.mid} fillMuzzle="none" fillEar="none" fillNose={ink.dark} fillEye={ink.dark} stroke="none" opacity={0.4} />
      <Geometry fillHead="none" fillMuzzle="none" fillEar="none" fillNose={ink.dark} fillEye={ink.dark} stroke={ink.dark} strokeWidth={2.5} opacity={0.7} />
    </g>
  );
}
