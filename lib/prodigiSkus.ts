// Maps Shopify variant SKUs (lib/products.ts) to Prodigi product SKUs.
// Sourced from the Prodigi product sheets. Digital download has no SKU
// (delivered by email, not Prodigi).

export type ProdigiItem = { sku: string; sizing: "fillPrintArea" | "fitPrintArea" };

export const PRODIGI_SKUS: Record<string, ProdigiItem> = {
  // Unframed fine-art prints (Cold Press Watercolour Paper)
  "PP-UNF-8x10": { sku: "ART-FAP-CPWP-8X10", sizing: "fillPrintArea" },
  "PP-UNF-12x16": { sku: "ART-FAP-CPWP-12X16", sizing: "fillPrintArea" },
  "PP-UNF-16x20": { sku: "ART-FAP-CPWP-16X20", sizing: "fillPrintArea" },

  // Framed prints — Classic frame, A-sizes (GLOBAL-CFP)
  "PP-FR-A5": { sku: "GLOBAL-CFP-A5", sizing: "fillPrintArea" },
  "PP-FR-A4": { sku: "GLOBAL-CFP-A4", sizing: "fillPrintArea" },
  "PP-FR-A3": { sku: "GLOBAL-CFP-A3", sizing: "fillPrintArea" },
  "PP-FR-A2": { sku: "GLOBAL-CFP-A2", sizing: "fillPrintArea" },

  // Mug — 15oz ceramic
  "PP-MUG": { sku: "H-MUG-15OZ-W", sizing: "fillPrintArea" },
};
