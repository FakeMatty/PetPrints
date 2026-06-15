// Server-side Storefront API client. Runs only in route handlers / server
// components so the token is never shipped to the browser.
//
// The Headless channel gives you two tokens:
//   - public  (32-hex)        -> header X-Shopify-Storefront-Access-Token, browser-safe
//   - private (shpat_...)     -> header Shopify-Storefront-Private-Token, server-only
// We auto-pick the right header from the token shape, so either works here.

const API_VERSION = "2026-04";

export async function storefront<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) {
    throw new Error(
      "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN in your env.",
    );
  }

  const isPrivate = token.startsWith("shpat_") || token.startsWith("shppa_");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  headers[isPrivate ? "Shopify-Storefront-Private-Token" : "X-Shopify-Storefront-Access-Token"] = token;

  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!, $attributes: [AttributeInput!]) {
    cartCreate(input: { lines: $lines, attributes: $attributes }) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;
