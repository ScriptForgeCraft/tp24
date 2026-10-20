# Prospect24 — homepage presentation prototype

A local, single-page React + Vite prototype based on `prospect24-design-reference.png`. All images and fonts used by the website are served locally. No backend, account, API key, analytics or hosted service is required.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open **http://localhost:5173/**. The port is fixed so an existing server produces a clear error instead of silently moving the preview.

```sh
npm run build
npm run preview
```

The production preview runs at **http://localhost:4173/**. The complete static build is in `dist/`.

## Experience

The homepage follows the supplied section order: navigation, before/after hero, introduction, development services, packages, selected projects, process, expertise and partnership, final CTA, and footer.

- Transparent-to-stone sticky header, underline navigation and smooth anchor scrolling.
- Full-screen mobile menu with staggered entries, focus trapping, Escape close and scroll lock.
- Matched architectural before/after comparison: mouse, pointer, touch, click positioning, arrow keys, Home and End.
- Masked hero heading entrance, image scale, restrained parallax, scroll reveals and image hovers.
- Crossfading service imagery with keyboard focus support; expanding service descriptions and mobile image accordions.
- Three art-directed architectural package backgrounds, animated details, and responsive comparison.
- Three supplied portfolio entries with crossfades, previous/next, keyboard navigation, touch swipe and project previews.
- Scroll-driven horizontal/vertical process progress.
- Contact dialog, accessible native dialogs, backdrop and Escape closing, and focus restoration.
- EN/AM changes navigation, principal headings, hero copy, service/package names and primary actions. Supporting package details, process labels and dialog descriptions remain English in this prototype.
- Reduced-motion support and locally bundled open-source Cormorant Garamond / Manrope fonts.

## Editing content

Edit **`src/data.js`** for packages, indicative prices, scope, contact details, service descriptions, project entries and the English/Armenian copy. Layout and animation styles are in **`src/styles.css`**; the interactions and components are in **`src/main.jsx`**.

## Asset provenance and presentation limits

- The supplied image was located under `prospect24-design-reference.png`, not the original attachment filename.
- All named project images come from the supplied `assets/projects/` directory. They are presented as architectural imagery; completion status, achievements, investment returns and locations are not asserted.
- The reference uses a dusk low-rise image for Garden Hill, while the supplied Garden Hill asset shows a different building. The project section intentionally retains the supplied named asset.
- The hero pair was generated with the built-in image generation tool for this prototype. It is explicitly labeled an illustrative development vision. Originals are saved as `assets/hero-after-generated.png` and `assets/hero-before-generated.png`; optimized copies are in `public/images/`. Prompts are recorded in `ASSETS.md`.
- The supplied high-resolution Prospect24 wordmark is used in the header, mobile menu and footer. Its transparent PNG is rendered against the correct background; the dark-context version is inverted for contrast.
- DIGNISI, KHACHATURIAN ARCHITECTS and BSC use temporary text representations because their official logo files were not supplied. Other supplied partner logos have not been substituted for these organizations.
- Prices and the phone/email details were transcribed from the supplied visual reference. Prices are clearly marked illustrative and must be commercially approved before production use.
- The enquiry form validates input and prepares a `mailto:` draft in the visitor’s configured email application. It does not send or store enquiries. Privacy and terms dialogs explain the prototype rather than inventing approved production policies.

## Browser verification

```sh
npm run test:ui
```

The development server must be running. The browser verification script uses Playwright and an installed Google Chrome (`channel: 'chrome'`). It checks interactions, image sources, error logs and overflow, and captures viewport and full-page screenshots at 1440×900, 1920×1080, 768×1024 and 390×844. Additional overflow checks cover 375px and 430px. Results and screenshots are in `qa/`.

`PREVIEW_URL` can point the checks at a production preview. A configured mail application is needed to actually open the composed enquiry draft; no external message is sent by the tests.
# tp24
# tp24

## Client presentation export

After `npm run build`, run `node scripts/package-preview.mjs` to create `output/Prospect24-Preview.html`. This self-contained file embeds fonts, imagery, styles and JavaScript and opens directly from disk without a server. `node scripts/verify-presentation.mjs` checks the offline export. The ready-to-send ZIP includes this file, a short Russian opening guide and desktop/mobile screenshots.
