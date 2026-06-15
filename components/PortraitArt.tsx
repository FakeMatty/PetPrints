import PetArt from "./PetArt";
import {
  type StyleKey,
  type PatternKey,
  type FontKey,
  FONTS,
  patternTint,
  petInk,
  nameColour,
} from "@/lib/palette";

export type PortraitConfig = {
  style: StyleKey;
  pattern: PatternKey;
  colour: string;
  name: string;
  nameOn: boolean;
  font: FontKey;
  petImageUrl?: string;
  // Layout controls (optional; sensible defaults applied below).
  petScale?: number; // 1 = default size
  petOffsetX?: number; // px in the 400-wide canvas
  petOffsetY?: number;
  nameY?: number; // vertical position of the name (0-500 canvas)
  nameSize?: number; // font size
};

// Inline font styles so the name renders correctly even when the SVG is
// serialized and rasterized for print (outside the page's CSS).
const NAME_FONT_STYLE: Record<FontKey, Record<string, string | number>> = {
  minimal: { fontFamily: "ui-sans-serif, system-ui, sans-serif", letterSpacing: "0.32em", textTransform: "uppercase", fontWeight: 500 },
  classic: { fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.04em" },
  script: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive" },
  bold: { fontFamily: "'Arial Rounded MT Bold', ui-rounded, system-ui, sans-serif", fontWeight: 700 },
};

export default function PortraitArt({
  config,
  id = "p",
  width,
  height,
  className,
}: {
  config: PortraitConfig;
  id?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  const { style, pattern, colour, name, nameOn, font } = config;
  const tint = patternTint(colour);
  const ink = petInk(colour);
  const fontClass = FONTS.find((f) => f.key === font)?.className ?? "";

  const petScale = config.petScale ?? 1;
  const petOffsetX = config.petOffsetX ?? 0;
  const petOffsetY = config.petOffsetY ?? 0;
  const nameY = config.nameY ?? 452;
  const nameSize = config.nameSize ?? 40;

  const baseW = 320;
  const baseH = 360;
  const petW = baseW * petScale;
  const petH = baseH * petScale;
  const petCx = 200 + petOffsetX;
  const petCy = 198 + petOffsetY;
  const petX = petCx - petW / 2;
  const petY = petCy - petH / 2;

  return (
    <svg
      viewBox="0 0 400 500"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`${style} pet portrait`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`${id}-dots`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="13" cy="13" r="3.4" fill={tint} />
        </pattern>
        <pattern id={`${id}-lines`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect x="0" y="0" width="7" height="22" fill={tint} />
        </pattern>
        <pattern id={`${id}-grid`} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0 H0 V30" fill="none" stroke={tint} strokeWidth="2" />
        </pattern>
        <clipPath id={`${id}-frame`}>
          <rect x="0" y="0" width="400" height="500" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-frame)`}>
        <rect x="0" y="0" width="400" height="500" fill={colour} />

        {pattern === "dots" && <rect x="0" y="0" width="400" height="500" fill={`url(#${id}-dots)`} />}
        {pattern === "lines" && <rect x="0" y="0" width="400" height="500" fill={`url(#${id}-lines)`} />}
        {pattern === "grid" && <rect x="0" y="0" width="400" height="500" fill={`url(#${id}-grid)`} />}
        {pattern === "halo" && <circle cx={petCx} cy={petCy} r={165 * petScale} fill={tint} />}

        {config.petImageUrl ? (
          <image
            href={config.petImageUrl}
            x={petX}
            y={petY}
            width={petW}
            height={petH}
            preserveAspectRatio="xMidYMid meet"
          />
        ) : (
          <g transform={`translate(${petCx} ${petCy}) scale(${0.78 * petScale}) translate(-200 -205)`}>
            <PetArt styleKey={style} ink={ink} />
          </g>
        )}

        {nameOn && name.trim() && (
          <text
            x="200"
            y={nameY}
            textAnchor="middle"
            fontSize={nameSize}
            className={fontClass}
            style={NAME_FONT_STYLE[font]}
            fill={nameColour(colour)}
          >
            {name.trim()}
          </text>
        )}
      </g>
    </svg>
  );
}
