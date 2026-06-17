"use client";

// Decorative CSS-only backgrounds (converted from styled-components to styled-jsx).
// `variant` picks the pattern; drop it behind content with `position:absolute inset-0`.
//   - "stripes": diagonal zig-zag
//   - "waves": layered radial waves
export default function PatternBackground({
  variant = "waves",
  className,
}: {
  variant?: "stripes" | "waves";
  className?: string;
}) {
  return (
    <div className={`pattern pattern--${variant} ${className ?? ""}`} aria-hidden="true">
      <style jsx>{`
        .pattern {
          width: 100%;
          height: 100%;
        }
        .pattern--stripes {
          --color: #faa7d8;
          background: linear-gradient(45deg, var(--color) 25%, transparent 25%) -50px 0,
            linear-gradient(-45deg, var(--color) 25%, transparent 25%) -50px 0,
            linear-gradient(45deg, transparent 75%, var(--color) 75%) -50px 0,
            linear-gradient(-45deg, transparent 75%, var(--color) 75%) -50px 0;
          background-color: #e5e5f7;
          background-size: 10px 40px;
        }
        .pattern--waves {
          --s: 100px;
          --c1: #f8b195;
          --c2: #355c7d;
          --_g: var(--c2) 4% 14%, var(--c1) 14% 24%, var(--c2) 22% 34%, var(--c1) 34% 44%,
            var(--c2) 44% 56%, var(--c1) 56% 66%, var(--c2) 66% 76%, var(--c1) 76% 86%, var(--c2) 86% 96%;
          background: radial-gradient(100% 100% at 100% 0, var(--c1) 4%, var(--_g), #0008 96%, #0000),
            radial-gradient(100% 100% at 0 100%, #0000, #0008 4%, var(--_g), var(--c1) 96%) var(--c1);
          background-size: var(--s) var(--s);
        }
      `}</style>
    </div>
  );
}
