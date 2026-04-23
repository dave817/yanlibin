# Oreo Beauty — Demo Site

A school demo for a luxury self-care brand (Oreo Beauty, Cacao Series). The
centerpiece is **Style Swipe** — a Tinder-style card deck that lets shoppers
swipe right to love a product or left to skip it.

Not a real storefront. No cart, no checkout. Demo only.

## Stack

Plain HTML + CSS + vanilla JS. No build step, no framework, no dependencies.
Deploys to any static host (Vercel, Netlify, GitHub Pages) with zero config.

- `index.html` — single-page site
- `styles.css` — design tokens, layout, components
- `swipe.js` — WebGL marble shader + swipe physics + SVG bottle illustrations
- `shopify-theme/` — original Shopify theme export (for reference)

## Run locally

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node
npx serve .

# Option 3: just open the file
open index.html
```

Then visit <http://localhost:8000>.

## Deploy to Vercel

1. Push this repo to GitHub (already done).
2. Go to vercel.com, import the repo.
3. Framework preset: **Other** (or leave blank). Root directory: `./`. Build
   command: leave empty. Output directory: leave empty. Vercel serves the
   static files directly.

That's it.

## Design notes

- Typography: **Fraunces** (variable serif, optical sizing) for display,
  **Geist** for body, **Geist Mono** for data/labels.
- Palette: warm cream, cacao, deep chocolate, muted gold. No purple gradients.
- Layout: editorial asymmetric bento. No 3-column feature grids with
  icons-in-colored-circles.
- Style Swipe uses a custom GLSL fragment shader (fBm domain-warped marble
  texture) as the section background. Runs at 60fps on mobile, capped at 1.5x
  DPR for battery.

## Swipe UX

- **Drag** the top card left or right (or use the buttons, or arrow keys).
- Past 110px, the card flies out and the next one is live.
- Loved products appear on the shelf below.
- All products swiped → empty state with "Start over" button.

## Credits

Fonts: Google Fonts (Fraunces by Undercase Type, Geist by Vercel).
Copy and brand are fictional.
