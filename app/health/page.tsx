"use client";

import { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  env: Record<string, unknown>;
  supabase: { configured: boolean; dbOk: boolean; storageOk: boolean; error: string | null };
};

function Row({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 py-2.5">
      <span className="text-sm text-ink">{label}</span>
      <span className="flex items-center gap-2 text-sm">
        {detail ? <span className="text-ink/50">{detail}</span> : null}
        <span className={ok ? "text-green-700" : "text-red-700"}>{ok ? "✓ ok" : "✗ missing"}</span>
      </span>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">System health</h1>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-black/15 px-4 py-1.5 text-sm hover:border-black/40"
        >
          Re-check
        </button>
      </div>

      {loading || !data ? (
        <p className="text-ink/60">Checking…</p>
      ) : (
        <>
          <div
            className={`mb-6 rounded-lg p-4 text-sm font-medium ${
              data.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {data.ok ? "All systems go — generation and saving should work." : "Something needs attention (see below)."}
          </div>

          <h2 className="mb-1 mt-6 text-xs font-medium uppercase tracking-widest text-ink/50">Supabase (saving)</h2>
          <Row label="URL configured" ok={!!data.env.supabaseUrl} detail={String(data.env.supabaseUrlValue ?? "")} />
          <Row label="Key configured" ok={!!data.env.supabaseKey} detail={data.env.usingServiceRole ? "service role" : "public key"} />
          <Row label="Database reachable (generations table)" ok={data.supabase.dbOk} />
          <Row label="Storage reachable (pet-art bucket)" ok={data.supabase.storageOk} />
          {data.supabase.error ? <p className="mt-2 text-sm text-red-700">{data.supabase.error}</p> : null}

          <h2 className="mb-1 mt-8 text-xs font-medium uppercase tracking-widest text-ink/50">AI generation</h2>
          <Row label="Replicate token" ok={!!data.env.replicateToken} />
          <Row label="Stylise model" ok detail={String(data.env.styliseModel ?? "")} />

          <h2 className="mb-1 mt-8 text-xs font-medium uppercase tracking-widest text-ink/50">Commerce & fulfilment</h2>
          <Row label="Shopify domain" ok={!!data.env.shopifyDomain} detail={String(data.env.shopifyDomain ?? "")} />
          <Row label="Shopify Storefront token" ok={!!data.env.shopifyStorefrontToken} />
          <Row label="Prodigi API key" ok={!!data.env.prodigiKey} />
          <Row label="Shopify webhook secret" ok={!!data.env.shopifyWebhookSecret} />
        </>
      )}
    </main>
  );
}
