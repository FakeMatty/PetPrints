import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createProdigiOrder, type ProdigiOrderItem } from "@/lib/prodigi";
import { PRODIGI_SKUS } from "@/lib/prodigiSkus";

export const runtime = "nodejs";

// Shopify "orders/paid" webhook. Register it (pointing at this URL) in your
// Shopify app/admin, and set SHOPIFY_WEBHOOK_SECRET to the webhook signing
// secret. On a paid order this reads the artwork attached to each line item
// and creates a Prodigi print order. Digital items are skipped (email those).

type LineItem = {
  sku: string | null;
  quantity: number;
  properties?: { name: string; value: string }[];
};

type ShopifyOrder = {
  name?: string;
  email?: string;
  line_items?: LineItem[];
  shipping_address?: {
    name?: string;
    address1?: string;
    address2?: string;
    zip?: string;
    country_code?: string;
    city?: string;
    province?: string;
  };
};

function verify(raw: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;
  const digest = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

function prop(item: LineItem, key: string): string | undefined {
  return item.properties?.find((p) => p.name === key)?.value;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });

  if (!verify(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const order = JSON.parse(raw) as ShopifyOrder;
  const addr = order.shipping_address;

  const items: ProdigiOrderItem[] = [];
  const digitalOnly: string[] = [];
  for (const li of order.line_items ?? []) {
    const mapped = li.sku ? PRODIGI_SKUS[li.sku] : undefined;
    const printUrl = prop(li, "_artwork_print_url");
    if (!mapped) {
      if (li.sku) digitalOnly.push(li.sku); // e.g. PP-DIGITAL -> email separately
      continue;
    }
    if (!printUrl || printUrl === "pending-generation") continue;
    items.push({
      sku: mapped.sku,
      copies: li.quantity || 1,
      sizing: mapped.sizing,
      assets: [{ printArea: "default", url: printUrl }],
    });
  }

  if (items.length === 0) {
    // Nothing to print (digital only, or missing artwork). Acknowledge so
    // Shopify doesn't retry; handle digital fulfilment elsewhere.
    return NextResponse.json({ ok: true, printed: 0, digitalOnly });
  }

  if (!addr) return NextResponse.json({ error: "No shipping address" }, { status: 400 });

  try {
    const result = await createProdigiOrder({
      merchantReference: order.name,
      recipient: {
        name: addr.name ?? "Customer",
        email: order.email,
        address: {
          line1: addr.address1 ?? "",
          line2: addr.address2,
          postalOrZipCode: addr.zip ?? "",
          countryCode: addr.country_code ?? "GB",
          townOrCity: addr.city ?? "",
          stateOrCounty: addr.province,
        },
      },
      items,
    });
    return NextResponse.json({ ok: true, prodigiOrderId: result.id, printed: items.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Prodigi order failed";
    // 500 lets Shopify retry the webhook.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
