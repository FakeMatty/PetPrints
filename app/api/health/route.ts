import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/health — runtime diagnostics. Reports what the SERVER actually sees
// (env loaded? Supabase reachable? tables + bucket present?). Open in the
// browser or hit /health for a friendly view.
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    supabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseUrlValue: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null,
    supabaseKey: !!(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    replicateToken: !!process.env.REPLICATE_API_TOKEN,
    styliseModel: process.env.REPLICATE_STYLISE_MODEL || "black-forest-labs/flux-kontext-pro (default)",
    shopifyDomain: process.env.SHOPIFY_STORE_DOMAIN || null,
    shopifyStorefrontToken: !!process.env.SHOPIFY_STOREFRONT_TOKEN,
    prodigiKey: !!process.env.PRODIGI_API_KEY,
    shopifyWebhookSecret: !!process.env.SHOPIFY_WEBHOOK_SECRET,
  };

  const supabase = { configured: env.supabaseUrl && env.supabaseKey, dbOk: false, storageOk: false, error: null as string | null };
  try {
    const sb = supabaseAdmin();
    const db = await sb.from("generations").select("*", { count: "exact", head: true });
    supabase.dbOk = !db.error;
    if (db.error) supabase.error = `db: ${db.error.message}`;
    const store = await sb.storage.from("pet-art").list("", { limit: 1 });
    supabase.storageOk = !store.error;
    if (store.error) supabase.error = `${supabase.error ?? ""} storage: ${store.error.message}`.trim();
  } catch (e) {
    supabase.error = e instanceof Error ? e.message : "Supabase check failed";
  }

  const ok = env.replicateToken && supabase.configured && supabase.dbOk && supabase.storageOk;
  return NextResponse.json({ ok, env, supabase }, { status: ok ? 200 : 500 });
}
