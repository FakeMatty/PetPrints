import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (service-role key — never import this in client
// components). Used to persist generated artwork so it doesn't expire off
// Replicate's temporary URLs, and to record generations.

const BUCKET = "pet-art";

export function supabaseAdmin() {
  // Read env fresh on each call so an env hot-reload is picked up without a
  // module re-import. Prefer the service-role key; fall back to the public key
  // (works via the pet-art upload policy).
  // Use || (not ??) so blank env vars like SUPABASE_SERVICE_ROLE_KEY="" fall
  // through to the next option instead of being treated as a real value.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase URL or key in your env.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// Download an ephemeral remote image (e.g. a Replicate output) and store it
// permanently in the public pet-art bucket. Returns the permanent public URL.
export async function persistImage(remoteUrl: string, prefix = "pet"): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Fetch asset failed ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "image/png";
  const bytes = new Uint8Array(await res.arrayBuffer());
  const ext = contentType.includes("svg") ? "svg" : contentType.includes("png") ? "png" : "img";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;

  const sb = supabaseAdmin();
  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Store a base64 data URL (e.g. a canvas export) in the bucket. Returns the
// permanent public URL.
export async function persistDataUrl(dataUrl: string, prefix = "print"): Promise<string> {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("Expected a base64 data URL");
  const contentType = match[1];
  const bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
  const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") ? "jpg" : "img";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const sb = supabaseAdmin();
  const { error } = await sb.storage.from(BUCKET).upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Record one row in `generations`. Best-effort; returns the new id.
export async function recordGeneration(row: {
  rasterUrl: string;
  flatVectorUrl?: string;
  sessionId?: string;
}): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("generations")
    .insert({
      raster_url: row.rasterUrl,
      flat_vector_url: row.flatVectorUrl ?? null,
      session_id: row.sessionId ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("recordGeneration failed:", error.message);
    return null;
  }
  return data.id as string;
}

// Record the chosen configuration at add-to-cart, linked to its generation.
// The returned id is the audit id sent to Shopify as a line-item property.
export async function recordConfig(row: {
  generationId?: string | null;
  bgPattern?: string;
  bgColour?: string;
  nameText?: string | null;
  nameFont?: string;
  printUrl?: string;
  composedSvgUrl?: string;
  config?: Record<string, unknown> | null;
}): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("configs")
    .insert({
      generation_id: row.generationId ?? null,
      bg_pattern: row.bgPattern ?? null,
      bg_colour: row.bgColour ?? null,
      name_text: row.nameText ?? null,
      name_font: row.nameFont ?? null,
      print_url: row.printUrl ?? null,
      composed_svg_url: row.composedSvgUrl ?? null,
      config_json: row.config ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("recordConfig failed:", error.message);
    return null;
  }
  return data.id as string;
}
