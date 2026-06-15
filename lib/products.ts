// The catalog created in the connected Shopify store (draft products).
// Variant GIDs are stable and work directly as Storefront `merchandiseId`.
//
// IMPORTANT before checkout works:
//  1) set each product's status to ACTIVE, and
//  2) publish it to the Headless sales channel (Storefront API only returns
//     variants published to the app's channel).
// Until then cartCreate returns a "merchandise not found / not published" error.

export type Variant = { id: string; label: string; price: string };
export type CatalogProduct = { key: string; label: string; variants: Variant[] };

export const CATALOG: CatalogProduct[] = [
  {
    key: "digital",
    label: "Digital download",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338084692", label: "SVG + PNG", price: "19.00" },
    ],
  },
  {
    key: "unframed",
    label: "Unframed print",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338150228", label: "8×10 in", price: "35.00" },
      { id: "gid://shopify/ProductVariant/56115338182996", label: "12×16 in", price: "40.00" },
      { id: "gid://shopify/ProductVariant/56115338215764", label: "16×20 in", price: "45.00" },
    ],
  },
  {
    key: "framed",
    label: "Framed print",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338248532", label: "8×10 in", price: "55.00" },
      { id: "gid://shopify/ProductVariant/56115338281300", label: "12×16 in", price: "65.00" },
      { id: "gid://shopify/ProductVariant/56115338314068", label: "16×20 in", price: "75.00" },
    ],
  },
  {
    key: "merch",
    label: "Merch",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338346836", label: "Mug", price: "24.00" },
      { id: "gid://shopify/ProductVariant/56115338379604", label: "Tote bag", price: "28.00" },
      { id: "gid://shopify/ProductVariant/56115338412372", label: "T-shirt", price: "32.00" },
    ],
  },
];
