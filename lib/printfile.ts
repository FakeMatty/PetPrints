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

// Compose the print file at the given width and upload it to Supabase.
export async function composeAndUploadPrint(svgEl: SVGSVGElement, width = 1600): Promise<string> {
  const canvas = await renderToCanvas(svgEl, width);
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
