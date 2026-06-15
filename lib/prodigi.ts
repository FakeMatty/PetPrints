// Prodigi Print API v4 client. Sandbox by default; set PRODIGI_BASE_URL to the
// live endpoint (https://api.prodigi.com/v4.0) when going live.
// Docs: https://www.prodigi.com/print-api/docs/reference/

const BASE = process.env.PRODIGI_BASE_URL ?? "https://api.sandbox.prodigi.com/v4.0";

export type ProdigiRecipient = {
  name: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    countryCode: string;
    townOrCity: string;
    stateOrCounty?: string;
  };
};

export type ProdigiOrderItem = {
  sku: string;
  copies: number;
  sizing: "fillPrintArea" | "fitPrintArea";
  assets: { printArea: "default"; url: string }[];
};

export async function createProdigiOrder(input: {
  recipient: ProdigiRecipient;
  items: ProdigiOrderItem[];
  shippingMethod?: "Budget" | "Standard" | "Express" | "Overnight";
  merchantReference?: string;
}): Promise<{ id: string; status: unknown }> {
  const apiKey = process.env.PRODIGI_API_KEY;
  if (!apiKey) throw new Error("Missing PRODIGI_API_KEY in your env.");

  const res = await fetch(`${BASE}/Orders`, {
    method: "POST",
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      shippingMethod: input.shippingMethod ?? "Standard",
      merchantReference: input.merchantReference,
      recipient: input.recipient,
      items: input.items,
    }),
  });

  if (!res.ok) throw new Error(`Prodigi ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { order?: { id: string; status: unknown } };
  return { id: json.order?.id ?? "unknown", status: json.order?.status };
}
