# Go-live checklist

Status: the full pipeline works locally — upload → AI illustration → editor →
Supabase storage + audit trail (generations/configs) → cart → checkout → print
file → Prodigi order. This is what's left to take real, paid, fulfilled orders.

## 1. Deploy the app (required first — webhooks need a public URL)

- [ ] Push the project to GitHub and import it into **Vercel** (or `vercel` CLI).
- [ ] Add a custom domain in Vercel (SSL is automatic).
- [ ] Set **all** env vars in Vercel → Project → Settings → Environment Variables
      (local `.env` does NOT deploy):
      `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (see §4),
      `REPLICATE_API_TOKEN`, `REPLICATE_STYLISE_MODEL`,
      `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`,
      `PRODIGI_API_KEY`, `PRODIGI_BASE_URL`, `SHOPIFY_WEBHOOK_SECRET`.
- [ ] Confirm `https://your-domain/health` shows all green in production.

## 2. Shopify — start selling

- [ ] Upgrade from trial to a paid plan (required to take payment).
- [ ] Enable a payment provider (Shopify Payments / PayPal).
- [ ] Set the four products to **Active** and **publish them to the Headless
      channel** (Storefront API only returns published variants — without this,
      add-to-cart fails with "merchandise not published").
- [ ] Set shipping rates, taxes, and a refund/returns policy.
- [ ] Register a webhook: topic **orders/paid**, URL
      `https://your-domain/api/webhooks/shopify/orders-paid`, and put its signing
      secret in `SHOPIFY_WEBHOOK_SECRET`.

## 3. Prodigi — fulfilment

- [ ] Create a Prodigi account; add a payment method.
- [ ] Replace the placeholder SKUs in `lib/prodigiSkus.ts` with real Prodigi
      product SKUs that match your sizes/products.
- [ ] Test against the **sandbox** first (current `PRODIGI_BASE_URL`), with a
      Shopify test order, and confirm a draft order appears in Prodigi.
- [ ] Switch `PRODIGI_BASE_URL` to `https://api.prodigi.com/v4.0` and use the
      **live** API key when ready.
- [ ] Order one physical sample to check print quality and colour (screen RGB
      vs CMYK — the printed colour will differ slightly).
- [ ] Digital-download orders are currently skipped by the webhook — add an
      email step to send the file, or handle those manually for now.

## 4. Supabase — production hardening

- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (server-side only) so uploads/inserts run
      with full rights, then tighten RLS: remove the permissive public
      insert/select policies added for the demo. Right now anyone with the
      public key could write to the bucket/tables.
- [ ] Decide retention for stored images.

## 5. Protect margin & prevent abuse (before promoting)

- [ ] Rate-limit `/api/generate` per session/IP.
- [ ] Watermarked low-res previews on a cheaper model; only spend the premium
      model (nano-banana-pro) on add-to-cart / purchase intent.
- [ ] Basic content moderation on uploads (reject non-pets / NSFW).

## 6. Polish & legal

- [ ] Real product images, final pricing, landing copy, FAQ, guarantee.
- [ ] Privacy policy + terms covering customer photo handling (GDPR/UK).
- [ ] EXIF rotation handling and min-resolution validation on upload.
- [ ] (Optional) Store the customer's original photo for reprints — not saved today.
- [ ] Analytics + error monitoring (e.g. Vercel Analytics, Sentry).

## Minimum to take ONE real order
Deploy (§1) + Shopify paid plan, payment, products published, webhook (§2) +
Prodigi live key, real SKUs, sample checked (§3). Everything else can follow.
