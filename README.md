# Tynmas Labs — Website

Four-page static website for Tynmas Labs, a 3D printing studio in Nairobi, Kenya.

## Pages

- `index.html` — Home: hero, intro, how 3D printing works, featured services, why choose us, featured products, CTA
- `shop.html` — Shop: search, category filters, product grid, quick-view modal with color/material/quantity, in-memory cart
- `services.html` — Services: six service cards with benefits and Request a Quote / Make an Inquiry CTAs
- `contact.html` — Contact & Quotes: quote form with drag-and-drop file upload and live price estimate, contact info, business hours, FAQ

## Structure

```
index.html
shop.html
services.html
contact.html
assets/
  css/style.css   # shared design system (colors, typography, components, responsive)
  js/nav.js       # mobile nav toggle (all pages)
  js/shop.js      # shop filtering, search, modal, cart
  js/contact.js   # quote estimator, form validation, FAQ accordion
  img/            # product/hero photos go here (placeholders used until then)
```

## Design system

- Colors: Midnight Black `#0A0D12` (background), Graphite `#161B22` (cards/nav), Tynmas Blue `#2563EB` (accent), Pure White (headings), Cool Gray `#A6ADB8` (body), Light Gray `#D9DDE3` (borders)
- Type: Space Grotesk (display), Inter (body), JetBrains Mono (labels/prices)
- Fully responsive — fluid headings, mobile nav, 2-column product grid and stacked layouts on phones

## Running locally

It's a static site — open `index.html` directly, or serve the folder:

```
npx serve .
```

## Known limitations (no backend yet)

- Cart is in-memory only; resets on page reload
- The quote form shows a local success state — it does not send email yet
- Product and hero images are styled placeholders awaiting real photography
