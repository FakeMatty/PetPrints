// Maps Shopify variant SKUs (lib/products.ts) to Prodigi product SKUs.
// Sourced from the Prodigi product sheets. Digital download has no SKU
// (delivered by email, not Prodigi).
//
// Some products need item `attributes` (e.g. framed prints require a frame
// `color`). Phone-case finish (gloss/matte) is encoded in the SKU, so no
// attribute is needed there.

export type ProdigiItem = {
  sku: string;
  sizing: "fillPrintArea" | "fitPrintArea";
  attributes?: Record<string, string>;
};

export const PRODIGI_SKUS: Record<string, ProdigiItem> = {
  // Unframed fine-art prints (Cold Press Watercolour Paper)
  "PP-UNF-A4": { sku: "ART-FAP-CPWP-A4", sizing: "fillPrintArea" },
  "PP-UNF-A3": { sku: "ART-FAP-CPWP-A3", sizing: "fillPrintArea" },
  "PP-UNF-A2": { sku: "ART-FAP-CPWP-A2", sizing: "fillPrintArea" },

  // Framed prints — Classic frame, A-sizes. Require a frame colour.
  "PP-FR-A5": { sku: "GLOBAL-CFP-A5", sizing: "fillPrintArea", attributes: { color: "black" } },
  "PP-FR-A4": { sku: "GLOBAL-CFP-A4", sizing: "fillPrintArea", attributes: { color: "black" } },
  "PP-FR-A3": { sku: "GLOBAL-CFP-A3", sizing: "fillPrintArea", attributes: { color: "black" } },
  "PP-FR-A2": { sku: "GLOBAL-CFP-A2", sizing: "fillPrintArea", attributes: { color: "black" } },

  // Mug — 15oz ceramic
  "PP-MUG": { sku: "H-MUG-15OZ-W", sizing: "fillPrintArea" },

  // Phone cases — glossy snap case (finish baked into SKU)
  "PP-CASE-IP16": { sku: "GLOBAL-TECH-IP16-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP16PL": { sku: "GLOBAL-TECH-IP16PL-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP16PR": { sku: "GLOBAL-TECH-IP16PR-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP16PM": { sku: "GLOBAL-TECH-IP16PM-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP15": { sku: "GLOBAL-TECH-IP15-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP15PL": { sku: "GLOBAL-TECH-IP15PL-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP15PR": { sku: "GLOBAL-TECH-IP15PR-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-IP15PM": { sku: "GLOBAL-TECH-IP15PM-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-SGS25": { sku: "GLOBAL-TECH-SGS25-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-SGS25P": { sku: "GLOBAL-TECH-SGS25P-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-SGS25U": { sku: "GLOBAL-TECH-SGS25U-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-SGS24": { sku: "GLOBAL-TECH-SGS24-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-SGS24P": { sku: "GLOBAL-TECH-SGS24P-CS-G", sizing: "fillPrintArea" },
  "PP-CASE-SGS24U": { sku: "GLOBAL-TECH-SGS24U-CS-G", sizing: "fillPrintArea" },
};
