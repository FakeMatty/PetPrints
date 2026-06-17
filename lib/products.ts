// The catalog created in the connected Shopify store (draft products).
// Variant GIDs are stable and work directly as Storefront `merchandiseId`.
// `inches` = the longest print edge, used to scale the print file to ~300 DPI.
//
// IMPORTANT before checkout works:
//  1) set each product's status to ACTIVE, and
//  2) publish it to the Headless sales channel (Storefront API only returns
//     variants published to the app's channel).

export type Variant = { id: string; label: string; price: string; inches?: number };
export type CatalogProduct = { key: string; label: string; variants: Variant[] };

export const CATALOG: CatalogProduct[] = [
  {
    key: "digital",
    label: "Digital download",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338084692", label: "SVG + PNG", price: "19.00", inches: 16 },
    ],
  },
  {
    key: "unframed",
    label: "Unframed print",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338150228", label: "8×10 in", price: "35.00", inches: 10 },
      { id: "gid://shopify/ProductVariant/56115338182996", label: "12×16 in", price: "40.00", inches: 16 },
      { id: "gid://shopify/ProductVariant/56115338215764", label: "16×20 in", price: "45.00", inches: 20 },
    ],
  },
  {
    key: "framed",
    label: "Framed print",
    variants: [
      { id: "gid://shopify/ProductVariant/56144516219220", label: "A5", price: "45.00", inches: 8.3 },
      { id: "gid://shopify/ProductVariant/56144516251988", label: "A4", price: "59.00", inches: 11.7 },
      { id: "gid://shopify/ProductVariant/56144516284756", label: "A3", price: "75.00", inches: 16.5 },
      { id: "gid://shopify/ProductVariant/56144516317524", label: "A2", price: "95.00", inches: 23.4 },
    ],
  },
  {
    key: "merch",
    label: "Mug",
    variants: [
      { id: "gid://shopify/ProductVariant/56115338346836", label: "Ceramic mug", price: "24.00", inches: 8 },
    ],
  },
];
