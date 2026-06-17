"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client (publishable/anon key). Used to upload the print
// file directly from the browser to Storage, bypassing the serverless request
// body-size limit so large, full-resolution prints can be stored.
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
