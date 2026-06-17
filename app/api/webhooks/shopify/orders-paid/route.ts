import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createProdigiOrder, type ProdigiOrderItem } from "@/lib/prodigi";
import { PRODIGI_SKUS } from "@/lib/prodigiSkus";
import { sendDigitalEmail } from "@/lib/email";

export const runtime = "nodejs";

// Shopify "orders/paid" webhook -> create a Prodigi order from the artwork on
// each line item. Verbose logging so deliveries can be traced in Vercel logs.

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

  // Verify the signature when a secret is configured. If it isn't set yet
  // (e.g. sandbox testing), process anyway but warn — SET IT BEFORE GOING LIVE.
  if (secret) {
    if (!verify(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
      console.warn("[orders/paid] invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[orders/paid] SHOPIFY_WEBHOOK_SECRET not set — skipping verification (set it before going live)");
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(raw) as ShopifyOrder;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`[orders/paid] order=${order.name} lineItems=${order.line_items?.length ?? 0}`);

  const items: ProdigiOrderItem[] = [];
  const skipped: string[] = [];
  const digital: { pngUrl?: string; svgUrl?: string }[] = [];
  for (const li of order.line_items ?? []) {
    const printUrl = prop(li, "_artwork_print_url");
    // Digital download — deliver by email, not Prodigi.
    if (li.sku === "PP-DIGITAL") {
      digital.push({ pngUrl: printUrl, svgUrl: prop(li, "_artwork_svg_url") });
      continue;
    }
    const mapped = li.sku ? PRODIGI_SKUS[li.sku] : undefined;
    console.log(`[orders/paid] line sku=${li.sku} mapped=${mapped?.sku ?? "none"} printUrl=${printUrl ? "yes" : "no"}`);
    if (!mapped) {
      if (li.sku) skipped.push(`${li.sku}:unmapped`);
      continue;
    }
    if (!printUrl || printUrl === "pending-generation") {
      skipped.push(`${li.sku}:no-artwork`);
      continue;
    }
    items.push({
      sku: mapped.sku,
      copies: li.quantity || 1,
      sizing: mapped.sizing,
      assets: [{ printArea: "default", url: printUrl }],
    });
  }

  // Deliver digital downloads by email (best-effort; no-op if Resend not set).
  if (digital.length && order.email) {
    for (const d of digital) {
      const sent = await sendDigitalEmail(order.email, d);
      console.log(`[orders/paid] digital email to ${order.email}: ${sent ? "sent" : "skipped/failed"}`);
    }
  }

  if (items.length === 0) {
    console.warn(`[orders/paid] no print items. skipped=${JSON.stringify(skipped)} digital=${digital.length}`);
    return NextResponse.json({ ok: true, printed: 0, emailed: digital.length, skipped });
  }

  const addr = order.shipping_address;
  if (!addr) {
    console.warn("[orders/paid] no shipping address");
    return NextResponse.json({ error: "No shipping address" }, { status: 400 });
  }

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
    console.log(`[orders/paid] Prodigi order created id=${result.id} items=${items.length}`);
    return NextResponse.json({ ok: true, prodigiOrderId: result.id, printed: items.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Prodigi order failed";
    console.error(`[orders/paid] Prodigi error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
