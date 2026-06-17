"use client";

import { supabaseBrowser } from "./supabaseBrowser";

// Rasterize the live preview SVG (pet + background + pattern + name) to a
// high-resolution PNG and upload it straight to Supabase Storage from the
// browser. Direct upload avoids the serverless body-size limit, so we can store
// true full-resolution prints. Returns the permanent public URL.

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Could not read image"));
    r.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not render artwork"));
    img.src = src;
  });
}

async function renderToCanvas(svgEl: SVGSVGElement, width: number): Promise<HTMLCanvasElement> {
  const height = Math.round((width * 500) / 400);
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Inline the pet image so the exported canvas isn't tainted.
  const image = clone.querySelector("image");
  if (image) {
    const href = image.getAttribute("href") ?? image.getAttribute("xlink:href");
    if (href && !href.startsWith("data:")) {
      image.setAttribute("href", await urlToDataUrl(href));
    }
  }

  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  const xml = new XMLSerializer().serializeToString(clone);
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);

  const bitmap = await loadImage(svgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

// Hard print-resolution ceiling. We never generate a file denser than this for
// the chosen physical size — printing above ~300 DPI adds file weight with no
// visible benefit (and would just upscale the AI artwork).
export const PRINT_DPI = 300;

// Pixel width of the print file for a given physical size, capped at 300 DPI.
// The artwork canvas is 400×500 (4:5), so the LONG edge is the height (500 units)
// and width = longEdgePx × 400/500. We size the long edge to inches × 300 and
// never exceed it; a small floor keeps tiny items (e.g. a phone case) crisp.
export function printWidthForInches(longestInches: number): number {
  const longEdgePx = Math.round(longestInches * PRINT_DPI); // 300 DPI ceiling
  return Math.max(1200, Math.round((longEdgePx * 400) / 500));
}

// Render the composited artwork to a PNG Blob (no upload). Used by both the
// Supabase uploader and the local "Download PNG" button.
export async function composePrintBlob(svgEl: SVGSVGElement, width = 1600): Promise<Blob> {
  const canvas = await renderToCanvas(svgEl, width);
  if (typeof console !== "undefined") {
    console.debug(`[print] ${canvas.width}×${canvas.height}px (long edge ${canvas.height}px)`);
  }
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode print file"))), "image/png"),
  );
}

// Trigger a browser download of the composited artwork as a PNG.
export async function downloadPrint(svgEl: SVGSVGElement, filename = "pet-portrait.png", width = 2000): Promise<void> {
  const blob = await composePrintBlob(svgEl, width);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Compose the print file at the given width and upload it to Supabase.
export async function composeAndUploadPrint(svgEl: SVGSVGElement, width = 1600): Promise<string> {
  const canvas = await renderToCanvas(svgEl, width);
  // Safety: report the achieved long-edge resolution so we can confirm the cap.
  if (typeof console !== "undefined") {
    console.debug(`[print] ${canvas.width}×${canvas.height}px (long edge ${canvas.height}px)`);
  }
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode print file"))), "image/png"),
  );

  const sb = supabaseBrowser();
  const path = `print/${crypto.randomUUID()}.png`;
  const { error } = await sb.storage.from("pet-art").upload(path, blob, {
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw new Error(`Print upload failed: ${error.message}`);
  return sb.storage.from("pet-art").getPublicUrl(path).data.publicUrl;
}
