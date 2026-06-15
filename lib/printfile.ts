"use client";

// Rasterize the live preview SVG (pet + background + pattern + name) into a
// high-resolution PNG for print. Runs in the browser so it matches exactly
// what the customer sees, with their fonts. The pet image is inlined as a data
// URL first so the canvas isn't tainted by the cross-origin asset.

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

// Returns a base64 PNG data URL at print resolution (default 1600x2000, 4:5).
export async function composePrintDataUrl(svgEl: SVGSVGElement, width = 1600): Promise<string> {
  const height = Math.round((width * 500) / 400);
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Inline the pet image so the exported canvas isn't tainted.
  const image = clone.querySelector("image");
  if (image) {
    const href = image.getAttribute("href") ?? image.getAttribute("xlink:href");
    if (href && !href.startsWith("data:")) {
      const dataUrl = await urlToDataUrl(href);
      image.setAttribute("href", dataUrl);
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
  return canvas.toDataURL("image/png");
}
