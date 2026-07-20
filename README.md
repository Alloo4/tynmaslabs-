# Tynmas Labs — Website

Website for Tynmas Labs, a 3D printing studio in Nairobi, Kenya. Static HTML/CSS/JS with a handful of Vercel Serverless Functions for the two things that need a secret to work: taking payment and receiving file uploads.

## Pages

- `index.html` — Home: hero, intro, how 3D printing works, featured services, why choose us, featured products, CTA
- `shop.html` — Shop: search, category filters, product grid, quick-view modal with color/material/quantity, persistent cart, Paystack checkout
- `services.html` — Services: six service cards with benefits and Request a Quote / Make an Inquiry CTAs
- `contact.html` — Contact & Quotes: quote form with drag-and-drop file upload (uploaded to Vercel Blob) and live price estimate, contact info, business hours, FAQ

## Structure

```
index.html
shop.html
services.html
contact.html
api/
  paystack-initialize.js   # starts a Paystack transaction (secret key server-side)
  paystack-verify.js       # verifies a transaction by reference (secret key server-side)
  blob-upload.js           # authorizes client-side uploads to Vercel Blob
assets/
  css/style.css     # shared design system — dark theme by default, :root[data-theme="light"] overrides
  data/products.json # single source of truth for the product catalog (client display + server-side price validation)
  js/nav.js         # mobile nav toggle (all pages)
  js/theme.js       # light/dark theme toggle, persisted in localStorage
  js/config.js      # public config — Web3Forms access key (see setup below)
  js/cart.js        # shared cart state (localStorage) used by shop.js
  js/shop.js        # shop filtering, search, modal, cart drawer, Paystack checkout
  js/contact.js     # quote estimator, file upload, form submission, FAQ accordion
  img/              # logo, favicon, product/hero photos
package.json         # declares @vercel/blob for the serverless functions
```

## Design system

- Colors: Midnight Black `#0A0D12` (background), Graphite `#161B22` (cards/nav), Tynmas Blue `#2563EB` (accent), Pure White (headings), Cool Gray `#A6ADB8` (body), Light Gray `#D9DDE3` (borders) — see `:root[data-theme="light"]` in `style.css` for the light-theme equivalents
- Type: Space Grotesk (display), Inter (body), JetBrains Mono (labels/prices)
- Fully responsive — fluid headings, mobile nav, 2-column product grid and stacked layouts on phones

## Running locally

The static pages alone can be served with:

```
npx serve .
```

but the cart checkout, order confirmation and quote-request upload need the `/api` functions, so for full functionality use the Vercel CLI instead:

```
vercel dev
```

## One-time setup (do this before checkout/quote-requests will actually work)

1. **Paystack** — sign up at [paystack.com](https://paystack.com), grab your **secret key** (test key to start), and add it to the Vercel project as an environment variable named `PAYSTACK_SECRET_KEY`.
2. **Web3Forms** — sign up free at [web3forms.com](https://web3forms.com) using `info@tynmaslabs.com`, copy your access key, and paste it into `assets/js/config.js` (`window.TYNMAS_WEB3FORMS_KEY`). This key powers both the quote-request email and the order-confirmation email; it's meant to be public/client-side.
3. **Vercel Blob** — in the Vercel dashboard, attach a Blob store to this project (Storage → Create → Blob). This auto-injects `BLOB_READ_WRITE_TOKEN` — no copying needed.

Until these are set, the "Pay with Paystack" and "Send request" buttons will show a clear error instead of silently failing.
