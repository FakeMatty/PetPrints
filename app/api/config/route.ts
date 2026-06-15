import { NextResponse } from "next/server";
import { recordConfig } from "@/lib/supabase";

// POST /api/config — called at add-to-cart. Stores the chosen configuration
// (linked to its generation) and returns the config id, which becomes the
// audit id attached to the Shopify order line item.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      generationId?: string | null;
      bgPattern?: string;
      bgColour?: string;
      nameText?: string | null;
      nameFont?: string;
      printUrl?: string;
      config?: Record<string, unknown>;
    };
    const configId = await recordConfig(body);
    return NextResponse.json({ configId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Config save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
