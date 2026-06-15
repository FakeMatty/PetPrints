// Phase 2 — the AI generation pipeline, server-side only.
//
//   raster path:  FLUX Kontext stylise  ->  background-remove  ->  transparent PNG
//   vector path:  FLUX Kontext flat-stylise -> bg-remove -> vectorise -> SVG
//
// Only the PET goes through here. Background, pattern, name and font stay
// deterministic SVG layers composited in the browser.
//
// Model slugs are env-overridable. Use "owner/name" (latest version resolved
// automatically) or pin with "owner/name:<versionId>".

const REPLICATE_API = "https://api.replicate.com/v1";

const MODELS = {
  stylise: process.env.REPLICATE_STYLISE_MODEL ?? "black-forest-labs/flux-kontext-pro",
  removeBg: process.env.REPLICATE_BG_MODEL ?? "lucataco/remove-bg",
  vectorise: process.env.REPLICATE_VECTORISE_MODEL ?? "recraft-ai/recraft-vectorize",
};

// Tunable without code: set REPLICATE_STYLE_PROMPT in .env to iterate.
export const RASTER_PROMPT =
  process.env.REPLICATE_STYLE_PROMPT ??
  `Using the provided photo of the pet, create a high-detail VECTOR-STYLE ILLUSTRATION of the pet ONLY. This must look like a clean digital vector illustration, NOT a photograph and NOT a realistic painting.

POSE & ACCURACY
Match the exact pose, perspective, proportions, and angle from the original photo.
Maintain all distinctive features so the pet remains clearly recognizable.

BACKGROUND
Remove the entire original background completely.
Replace it with a solid, flat NEUTRAL MID-GREY background (#808080) — even grey, no shadows, no gradients, no textures. This grey is a removable backdrop, so keep the edges between the pet and the grey perfectly crisp and clean, with no coloured fringe or spill along the fur.

ILLUSTRATION STYLE
Modern, premium VECTOR illustration:
- Clean vector shapes with smooth curves and crisp edges.
- Layered flat colors with controlled soft gradients for depth.
- 8-14 tones per color group (fur, beard, ears, eyes, nose) for high detail while keeping clear vector clarity.
- Absolutely NO outline, stroke, white keyline, sticker border or halo around the pet's silhouette. The fur edge must meet the background directly with a clean, sharp boundary.
- Fur represented as grouped shape clusters, not individual hairs.
- Subtle shading and highlights for dimension without breaking the vector aesthetic.
- Realistic but clean reflections on eyes and nose.

DETAILS TO PRESERVE
Natural fur direction and tonal transitions; muzzle/beard shape and texture; ear shapes and markings; accurate nose structure and shininess; all unique fur patterns and coloration.

COMPOSITION
Center the pet; the pet fills most of the canvas; smooth, print-ready edges.

AVOID
busy background, objects, furniture, floor, walls, shadows, text, watermark, logo, outline strokes, heavy textures, cartoonish exaggeration, posterization, color banding, unclean edges, photographic realism, painterly brush texture, white keyline, sticker outline, silhouette border, light edge halo or rim of any colour.`;

export const FLAT_PROMPT =
  process.env.REPLICATE_FLAT_PROMPT ??
  "Restyle this exact photo into a clean flat vector illustration of the SAME pet, keeping its " +
    "pose, markings and proportions. A few solid colours with gentle shading, smooth thin outlines, " +
    "tidy vector stylisation, on a solid flat neutral mid-grey background (#808080) with crisp clean " +
    "edges and no coloured fringe. Avoid heavy black outlines, avoid clip-art look, no photographic " +
    "realism, no extra animals, no text, no border.";

function token(): string {
  const t = process.env.REPLICATE_API_TOKEN;
  if (!t) throw new Error("Missing REPLICATE_API_TOKEN in your env.");
  return t;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fetch wrapper that transparently waits out Replicate's 429 throttle
// (free/low-credit accounts get a burst of 1 prediction). Honors retry_after.
async function rfetch(url: string, init: RequestInit, attempts = 8): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, init);
    if (res.status !== 429) return res;
    let wait = 2;
    const header = res.headers.get("retry-after");
    if (header) wait = parseFloat(header);
    else {
      try {
        const body = (await res.clone().json()) as { retry_after?: number };
        if (body.retry_after) wait = body.retry_after;
      } catch {
        /* ignore */
      }
    }
    await sleep((wait + 0.5) * 1000);
  }
  return fetch(url, init);
}

const auth = () => ({ Authorization: `Bearer ${token()}` });

// Resolve "owner/name" to its latest version id. Works for community AND
// official models (the /models/.../predictions shortcut only does official).
async function resolveVersion(model: string): Promise<string> {
  if (model.includes(":")) return model.split(":")[1];
  const res = await rfetch(`${REPLICATE_API}/models/${model}`, { headers: auth() });
  if (!res.ok) {
    throw new Error(`Replicate model lookup ${model} ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { latest_version?: { id?: string } };
  const version = json.latest_version?.id;
  if (!version) throw new Error(`No runnable version found for ${model}`);
  return version;
}

async function run(model: string, input: Record<string, unknown>): Promise<string> {
  const version = await resolveVersion(model);
  const create = await rfetch(`${REPLICATE_API}/predictions`, {
    method: "POST",
    headers: { ...auth(), "Content-Type": "application/json", Prefer: "wait" },
    body: JSON.stringify({ version, input }),
  });
  if (!create.ok) throw new Error(`Replicate ${model} ${create.status}: ${await create.text()}`);

  let pred = (await create.json()) as {
    status: string;
    output: unknown;
    error: string | null;
    urls?: { get: string };
  };

  while (pred.status !== "succeeded" && pred.status !== "failed" && pred.urls?.get) {
    await sleep(1500);
    const poll = await rfetch(pred.urls.get, { headers: auth() });
    pred = await poll.json();
  }
  if (pred.status === "failed") throw new Error(`Replicate ${model} failed: ${pred.error}`);

  const out = pred.output;
  const url = Array.isArray(out) ? out[0] : out;
  if (typeof url !== "string") throw new Error(`Unexpected ${model} output: ${JSON.stringify(out)}`);
  return url;
}

export async function stylise(image: string, prompt: string): Promise<string> {
  // Input shape differs by model family:
  //   Gemini "nano-banana"  -> { prompt, image_input: [image] }
  //   FLUX Kontext          -> { prompt, input_image: image }
  const isNano = MODELS.stylise.includes("nano-banana");
  const input = isNano
    ? { prompt, image_input: [image], output_format: "png" }
    : { prompt, input_image: image, output_format: "png" };
  return run(MODELS.stylise, input);
}

export async function removeBackground(image: string): Promise<string> {
  return run(MODELS.removeBg, { image });
}

export async function vectorise(image: string): Promise<string> {
  return run(MODELS.vectorise, { image });
}

export type GenerationResult = {
  rasterUrl: string;
  flatVectorUrl?: string;
};

export async function generatePet(
  image: string,
  opts: { withVector?: boolean } = {},
): Promise<GenerationResult> {
  const styled = await stylise(image, RASTER_PROMPT);
  const rasterUrl = await removeBackground(styled);

  if (!opts.withVector) return { rasterUrl };

  try {
    const flat = await stylise(image, FLAT_PROMPT);
    const flatCut = await removeBackground(flat);
    const flatVectorUrl = await vectorise(flatCut);
    return { rasterUrl, flatVectorUrl };
  } catch (err) {
    console.error("Vector path failed, returning raster only:", err);
    return { rasterUrl };
  }
}
