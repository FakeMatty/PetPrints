# Pet Portrait Studio

Headless storefront for AI pet portraits: upload → stylise → vectorise → live preview → buy.
This repo is the **Phase 0 scaffold + the Phase 3 configurator** (the core "magic" interaction)
from the build brief, built with everything external **mocked** so it runs with zero credentials.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

> Note: `npm run dev` and `npm run typecheck` both work out of the box. The full
> `next build` optimization is just the production bundle step — it wasn't run to
> completion in the authoring sandbox (command time limit), but the project type-checks
> cleanly and runs in dev.

## What's here

```
app/
  page.tsx           Landing: hero, sample gallery, pricing (server component)
  create/page.tsx    Upload flow → configurator (client)
  layout.tsx, globals.css
components/
  Configurator.tsx   ★ Phase 3 — the live, no-AI configurator
  PortraitArt.tsx    The composited portrait: a stack of deterministic SVG layers
  PetArt.tsx         MOCK vectorised pet (the only layer that is AI in production)
  ProductMockup.tsx  Canvas / mug / tee comps from the same SVG
  UploadZone.tsx     Phase 1 stub (drag-drop + camera, validation messaging)
lib/
  palette.ts         Styles, patterns, 8-colour palette, fonts + auto-contrast rules
tailwind.config.ts   Design tokens (bone palette, type scale, radius)
.env.example         Placeholders for Shopify / Supabase / Replicate / Prodigi
```

## AI generation (Phase 2)

`lib/ai.ts` runs the Replicate pipeline; `POST /api/generate` is the entry point,
called from `UploadZone`:

```
stylise (FLUX Kontext, identity-preserving)  ->  background-remove  ->  transparent PNG   (the hero, raster)
stylise (flat 4-5 colour prompt)  ->  background-remove  ->  vectorise  ->  SVG            (apparel / scaling)
```

Add `REPLICATE_API_TOKEN` to `.env`. Model slugs are env-overridable
(`REPLICATE_STYLISE_MODEL`, `REPLICATE_BG_MODEL`, `REPLICATE_VECTORISE_MODEL`) — verify
current versions at replicate.com. Output URLs are Replicate-hosted and temporary until
you persist them to Supabase Storage.

## The one architectural idea

Only the **pet** is AI-generated. Background colour, pattern, name and font are
**parametric SVG layers composited live in the browser** — no model call, no latency,
no cost, perfect print fidelity. The expensive pipeline runs once per upload; the
thousands of look variations are free. See `PortraitArt.tsx`.

```
name text  →  parametric (outline to paths for print)
vector pet →  the ONLY AI layer
halo/arch  →  parametric
bg pattern →  parametric <pattern>
bg colour  →  parametric rect
```

## What's mocked (and where the real work plugs in)

| Brief phase | Status here | To make real |
|---|---|---|
| 0 Scaffold | ✅ done | — |
| 1 Upload + clean-up | UI stub (`UploadZone`) | client validation + EXIF fix; server bg-removal (rembg/BiRefNet) → Supabase |
| 2 Stylise + vectorise | ✅ built (Replicate) | add `REPLICATE_API_TOKEN`; verify model slugs + pricing; persist outputs to Supabase Storage |
| 3 Configurator | ✅ done | renders the real generated pet; falls back to mock when none |
| 4 Cart + checkout | ✅ built | set products Active + publish to Headless channel; needs Storefront token |
| 5 Fulfilment | not started | order-paid webhook → Prodigi/Gelato or email |
| 6 Storefront polish | partial (landing/pricing) | gallery, FAQ, guarantee, analytics, mobile QA |

## Credentials needed to go further

Shopify store + Storefront/Admin tokens · Supabase URL + keys · Replicate/fal key +
bg-removal & vectoriser endpoints · Prodigi/Gelato key. None are required to run the
current demo. Never commit real keys, and keep all employer/firm identifiers out of
code, metadata, and commit history.
