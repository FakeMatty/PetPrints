import { NextResponse } from "next/server";
import { generatePet } from "@/lib/ai";
import { persistImage, recordGeneration } from "@/lib/supabase";

// POST /api/generate
// Body: { image: <data-uri or public url>, withVector?: boolean }
// Returns: { rasterUrl, flatVectorUrl? }  (permanent Supabase URLs)
//
// The expensive step. Gate it behind upload validation + rate limiting before
// production (brief section 7).
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { image, withVector = false } = (await request.json()) as {
      image?: string;
      withVector?: boolean;
    };
    if (!image) {
      return NextResponse.json({ error: "image is required" }, { status: 400 });
    }

    const result = await generatePet(image, { withVector });

    // Persist to Supabase so the URLs don't expire off Replicate (~1h).
    // If storage isn't configured yet, fall back to the temporary URLs.
    try {
      const rasterUrl = await persistImage(result.rasterUrl, "raster");
      const flatVectorUrl = result.flatVectorUrl
        ? await persistImage(result.flatVectorUrl, "vector")
        : undefined;
      const generationId = await recordGeneration({ rasterUrl, flatVectorUrl });
      return NextResponse.json({ rasterUrl, flatVectorUrl, generationId });
    } catch (persistErr) {
      console.error("Supabase persist failed, returning temporary URLs:", persistErr);
      return NextResponse.json(result);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
