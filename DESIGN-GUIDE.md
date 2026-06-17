# Pet Portrait Studio — Design Guide

Scope: **landing page** + **create/editor page**. Direction: **premium gallery** —
restrained, lots of whitespace, big warm lifestyle imagery, editorial type. It should
feel like an independent print studio, not Vistaprint. Let the colourful portraits be
the colour; everything around them is calm and neutral.

---

## 1. Principles

1. **One job per screen.** The landing page exists to get the photo uploaded. The
   editor exists to get to "Add to cart". Remove anything that doesn't serve that.
2. **Show, don't tell.** Big real imagery (art framed on real walls, products in real
   rooms) does more than copy. The instant preview *is* the strongest sales argument.
3. **Restraint = premium.** Generous whitespace, few fonts, one accent colour, tight
   copy. Crowding reads as cheap.
4. **Mobile-first.** Most pet photos are taken on a phone; the whole flow must be
   flawless one-handed. Design the mobile layout first, then expand.
5. **Earn trust fast.** Preview-before-pay, a sample gallery, reviews, and a simple
   guarantee. UK fulfilment stated clearly.

---

## 2. Tokens (already in `tailwind.config.ts` — keep consistent)

- **Colour**: Bone `#FAF7F2` (page), Ink `#2E2E2E` (text), Terracotta `#C57B57`
  (single accent / primary CTA), Sage `#A6B89B` (secondary accent, sparingly). White
  for cards/surfaces.
- **Type**: a warm editorial display face for headings (a soft serif or characterful
  grotesk), a clean neutral sans for body. Headlines large and confident; body 16px,
  line-height ~1.7. Sentence case, never ALL CAPS except tiny labels.
- **Spacing**: generous — section padding 80–120px desktop / 48–64px mobile. Let
  things breathe.
- **Radius**: soft (10–18px) on cards/buttons; portraits sit in clean rectangles.
- **Imagery rule**: warm, natural light, real homes. No stocky studio-white clutter.
  Portraits always shown *in context* (framed on a wall, mug on a desk).
- **Motion**: subtle only — gentle fade/slide on scroll, hover lift on cards. Nothing
  bouncy.

---

## 3. Landing page — section by section (top to bottom)

1. **Announcement bar** (slim, optional): "Free UK delivery · Love it or it's on us".
   Bone background, small ink text. Easy trust, low noise.
2. **Header**: minimal. Logo left; links (How it works · Gallery · Reviews · FAQ);
   one terracotta "Create yours" button right. Transparent over the hero, solid bone
   on scroll. Mobile: logo + hamburger + the CTA.
3. **Hero** (above the fold, the most important block):
   - Left: editorial headline — "Your dog. As art. In seconds." — one line of subcopy,
     and the primary CTA "Upload your pet →". A tiny trust line under it ("★★★★★ 10,000+
     happy pets").
   - Right: a large, beautiful lifestyle image — a framed pet portrait on a styled wall —
     OR, even better, an embedded mini live-preview teaser. (Image #1 below.)
   - Mobile: stack — headline, image, CTA. Keep the CTA visible without scrolling.
4. **Trust strip**: a thin row — review stars + count, "UK printed & shipped", a press
   or guarantee line. Quiet, reassuring.
5. **How it works** (3 steps, icon or small image each): 1) Upload a photo · 2) Watch
   them become art & pick your favourite · 3) We print & ship. (Images #5a–c.)
6. **Sample gallery**: a clean grid (3–6) of portraits across breeds, styles and
   background colours, on the bone canvas — this showcases the "one upload, endless
   looks" engine. Caption: "Every portrait, one illustration engine." (Images #2.)
7. **Put them on everything**: the product range as lifestyle shots — framed print,
   unframed print, mug, phone case, digital. Price-from under each. Reinforces the
   vector-on-anything story. (Images #3a–d.)
8. **Why us / differentiators**: three short columns — "See it before you pay",
   "Crisp at any size (real vector)", "Gallery-grade, UK-made". Icon + one line each.
9. **Reviews**: 3 testimonial cards with the customer's pet portrait as the avatar.
   Real names, star ratings. (Use real reviews once you have them.)
10. **Guarantee**: a calm reassurance band — "Not in love with it? We'll make it right."
11. **Final CTA**: repeat the hero CTA full-width on bone — "Upload your pet →".
12. **Footer**: links, contact, socials, payment + UK shipping note. Small, tidy.

Section rhythm: alternate bone and white backgrounds to separate blocks without lines.

---

## 4. Create / editor page

**Upload screen (before generation):**
- Centered, calm, lots of space. Big inviting drop zone with a soft dashed border that
  warms to terracotta on hover. Headline "Let's make your portrait", one line of
  reassurance ("Use any clear photo — phone snaps are perfect").
- A subtle 3-icon strip of what happens next, and the "Preview with a sample pet" link.
- A tiny privacy/quality line: "Best results from a clear, well-lit photo."

**Editor (after generation):**
- Two columns desktop: **left = large live preview** in a soft matte mount (so the
  artwork feels gallery-framed even on screen); **right = controls**. Mobile: preview
  on top, controls below, with a **sticky bottom bar** showing price + "Add to cart".
- Group controls with calm spacing and tiny uppercase labels (already the pattern):
  Look · Pet size & position · Background pattern · Background colour · Pet name ·
  Frame colour (frames only) · Product + size + Add to cart.
- The product mockup tabs (Artwork / Canvas / Mug / Tee / Case) sit under the preview.
- Loading: skeleton cards + progressive reveal of styles; never a blank spinner.
- Keep the price and CTA always visible. Make "Add to cart" terracotta and confident.

The editor should feel like a quiet studio bench: the art is the star, controls are
secondary and unobtrusive.

---

## 5. Components

- **Primary button**: terracotta fill, bone text, soft radius, subtle hover-darken to
  ink. One per view ideally.
- **Secondary button**: ink outline on transparent, hover bone fill.
- **Cards**: white, 0.5px hairline border or soft shadow, generous padding, soft radius.
- **Portraits**: always in a clean frame/mount on screen; never bleed to the page edge
  on the landing page.
- **Type pairing**: display face only for H1/H2 and the pet-name feature; sans for
  everything else. Two weights max.

---

## 6. Image shot list (generate these in Gemini)

Aim for warm, natural-light, premium homes. 4:5 or 3:2 for lifestyle; square for
product tiles. Export ~2000px on the long edge, sRGB, JPG.

**#1 — Hero lifestyle (most important).**
> A warm, sunlit modern living room with a single framed illustrated dog portrait
> hanging on a soft off-white wall above a wooden console table with a small plant and
> ceramic vase. Scandinavian, editorial interiors photography, shallow depth of field,
> natural morning light, cosy and premium, lots of negative space on the left for text,
> muted warm palette (bone, terracotta, sage accents). No people. 3:2.

**#2 — Sample portrait set (3–6 tiles).** (You can also screenshot real generations.)
> A clean flat-lay grid of modern minimalist pet portrait illustrations — different
> breeds (cavalier, terrier, labrador, cat) — each on a different solid pastel
> background (sage, blush, mustard, dusty blue), bold flat vector style, framed in thin
> light-wood frames, evenly spaced on a bone background, top-down, soft even lighting.

**#3a — Framed print in a room.**
> A framed illustrated portrait of a golden retriever on a cream gallery wall beside a
> reading nook with a linen armchair and warm lamp, editorial interiors, natural light,
> premium, negative space. 4:5.

**#3b — Mug on a desk.**
> A white ceramic mug printed with a minimalist illustrated dog portrait, on a light
> oak desk next to a notebook and coffee, morning light, shallow depth of field, cosy
> lifestyle product photography, warm neutral palette. Square.

**#3c — Phone case in hand.**
> A hand holding a glossy phone case printed edge-to-edge with a minimalist illustrated
> cat portrait on a sage background, soft daylight, blurred warm background, lifestyle
> product shot. 4:5.

**#3d — Tote / unframed print.**
> A natural cotton tote bag with a flat-illustration dog portrait, hanging on a wooden
> peg by a front door, warm hallway, lifestyle, muted palette. 4:5.

**#5a–c — How it works (optional, can be simple line icons instead).**
> a) A hand holding a phone taking a photo of a happy dog, warm natural light, simple.
> b) A laptop screen showing a pet portrait being customised, cosy desk, soft light.
> c) A wrapped parcel and a framed portrait by a front door, "just delivered" feel.

**#6 — Subtle texture/background (optional).**
> A very subtle warm paper texture in bone/off-white, almost flat, for section
> backgrounds. Minimal, no pattern noise.

Tip for Gemini: keep "no people" unless you want lifestyle hands, ask for "negative
space for text" on the hero, and keep the palette words (bone, terracotta, sage,
muted, warm, editorial) in every prompt so the set feels cohesive.

---

## 7. What to change first (highest impact)

1. Rebuild the **hero** with image #1 + the single upload CTA above the fold.
2. Add **How it works** (3 steps) and the **sample gallery**.
3. Polish the **editor**: matte mount around the preview + sticky mobile add-to-cart.
4. Add **reviews + guarantee** bands.
5. Swap placeholder product imagery for #3a–d.

Everything here uses the existing tokens, so it stays consistent with what's built.
