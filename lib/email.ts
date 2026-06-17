// Digital-download delivery via Resend. Gated on env: if not configured it logs
// and no-ops (so physical orders are unaffected). Set RESEND_API_KEY and
// EMAIL_FROM (a verified Resend sender) to enable.

export async function sendDigitalEmail(
  to: string,
  links: { pngUrl?: string; svgUrl?: string },
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn("[email] RESEND_API_KEY/EMAIL_FROM not set — skipping digital email");
    return false;
  }

  const links_html: string[] = [];
  if (links.pngUrl && links.pngUrl !== "pending-generation")
    links_html.push(`<p><a href="${links.pngUrl}">Download your portrait (PNG)</a></p>`);
  if (links.svgUrl && links.svgUrl !== "pending-generation")
    links_html.push(`<p><a href="${links.svgUrl}">Download your portrait (SVG)</a></p>`);

  const html =
    `<h2>Your pet portrait is ready</h2>` +
    `<p>Thanks for your order! Your download${links_html.length > 1 ? "s are" : " is"} below:</p>` +
    links_html.join("") +
    `<p style="color:#888;font-size:13px">Links may expire — please save your files.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: "Your pet portrait download", html }),
  });
  if (!res.ok) {
    console.error("[email] Resend error", res.status, await res.text());
    return false;
  }
  return true;
}
