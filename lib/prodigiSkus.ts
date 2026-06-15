// Maps your Shopify variant SKUs (lib/products.ts) to Prodigi product SKUs.
//
// TODO: replace the placeholder Prodigi SKUs with real ones from the Prodigi
// product catalogue (https://www.prodigi.com/products/). Each entry says which
// Prodigi product + size to print. Digital download has no Prodigi SKU (it's
// emailed instead).

export type ProdigiItem = { sku: string; sizing: "fillPrintArea" | "fitPrintArea" };

export const PRODIGI_SKUS: Record<string, ProdigiItem> = {
  // Unframed fine-art prints
  "PP-UNF-8x10": { sku: "ART-FAP-CPWP-10X12", sizing: "fillPrintArea" },
  "PP-UNF-12x16": { sku: "GLOBAL-FAP-12X16", sizing: "fillPrintArea" },
  "PP-UNF-16x20": { sku: "GLOBAL-FAP-16X20", sizing: "fillPrintArea" },
  // Framed prints
  "PP-FR-8x10": { sku: "GLOBAL-CFPM-8X10", sizing: "fillPrintArea" },
  "PP-FR-12x16": { sku: "GLOBAL-CFPM-12X16", sizing: "fillPrintArea" },
  "PP-FR-16x20": { sku: "GLOBAL-CFPM-16X20", sizing: "fillPrintArea" },
  // Merch
  "PP-MUG": { sku: "GLOBAL-MUG-11OZ", sizing: "fillPrintArea" },
  "PP-TOTE": { sku: "GLOBAL-TOTE", sizing: "fillPrintArea" },
  "PP-TEE": { sku: "GLOBAL-TEE-GIL-64000", sizing: "fillPrintArea" },
  // PP-DIGITAL: no Prodigi SKU — fulfilled by email.
};
