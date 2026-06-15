import { NextResponse } from "next/server";
import { persistDataUrl } from "@/lib/supabase";

// POST /api/persist  Body: { dataUrl }  -> { url }
// Stores a base64 image (e.g. the composed print file) in Supabase and returns
// its permanent public URL.
export async function POST(request: Request) {
  try {
    const { dataUrl } = (await request.json()) as { dataUrl?: string };
    if (!dataUrl) return NextResponse.json({ error: "dataUrl is required" }, { status: 400 });
    const url = await persistDataUrl(dataUrl, "print");
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Persist failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
