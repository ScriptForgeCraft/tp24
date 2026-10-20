# Prospect24 color-system exploration

The supplied “Шесть палитр — один архитектурный стиль” reference is implemented as six color systems for the existing homepage. It is not a layout redesign. The reference's compressed layout, alternate project image and partner names were not substituted for the actual site's content.

## Preview URLs

The overview is `/design-preview`.

| Route | Theme | Main colors |
| --- | --- | --- |
| `/design-preview/01` | Graphite & Ivory | `#171A1B`, `#F6F6F3`, `#E2E2E2`, `#868686` |
| `/design-preview/02` | Stone & Forest | `#263D35`, `#F1F0EB`, `#172C25`, `#6F7F76` |
| `/design-preview/03` | Slate & Ice | `#203746`, `#E9EFF2`, `#162936`, `#687C8F` |
| `/design-preview/04` | Espresso & Porcelain | `#292522`, `#F7F5F2`, `#382F2A`, `#7A6F67` |
| `/design-preview/05` | Sage & Charcoal | `#202622`, `#E6EAE2`, `#314735`, `#687D6F` |
| `/design-preview/06` | White & Terracotta | `#FAFAF8`, `#222222`, `#A64F3D`, `#7D6D63` |

Run `npm run dev` and open `http://localhost:5173/design-preview`. The production build is created with `npm run build`, then served with `npm run preview` at `http://localhost:4173/design-preview`. Each variant has a real static HTML entry and supports direct access and refresh. No deployment was performed.

## Shared implementation and isolation

- `src/preview/themes.js` defines the six palettes and semantic roles for section surfaces, text, cards, primary/inverse/secondary buttons, hover colors, links, borders, focus, header, footer and photographic overlays.
- `src/preview/preview.css` scopes all homepage color overrides beneath `[data-preview-theme]`. No preview rule changes the home page's typography, spacing, dimensions, border radii, image selection or transition timing. The terracotta hero has a neutral light veil and dark text; the other themes use neutral dark veils and light text. Photographs receive no new filters.
- `src/preview/PreviewHost.jsx` wraps the existing homepage on preview routes and supplies the compact numbered selector. Existing navigation and language controls remain. On phones the selector opens an accessible disclosure; Escape closes it and returns focus. The overview uses lightweight HTML/CSS miniature compositions and swatches, with links to the full working pages.
- `src/main.jsx` adds imports and chooses between the existing `App`, its preview wrapper and the overview. The `App` component itself remains unchanged.
- `vite.config.js` emits `/design-preview/index.html` and six variant entries using the same compiled app. Preview entries receive `noindex, nofollow`; the original entry's metadata remains unchanged.

The original `/`, its stylesheet files and content data remain unchanged. Preview variables are on a `display: contents` wrapper, not on `html` or `body`; the underlying homepage component is shared rather than copied six times. Its before/after control, service selection, project carousel, dialogs, bilingual content and existing animation code are retained.

## Executed verification

- `npm run build`: completed; all seven preview HTML entry points generated.
- `npm run test:ui`: 67 existing interface checks passed on the original page.
- `npm run test:preview-colors`: 12 desktop/mobile complete-page comparisons passed. Section order, text, image paths, component dimensions, fonts, spacing and border radii match the original. Button normal/hover contrast, required preview links, refresh, service accordion, project navigation, dialogs, language controls, disclosure keyboard handling and overflow checks from 320px to 1920px passed.
- The same command ran 44 axe WCAG A/AA scans across all themes, contact/comparison dialogs, mobile menus and the overview: zero reported violations. Some photographic/gradient contrast requires additional review; this is not a complete accessibility certification.
- `npm run test:preview-contrast`: 660 rendered text-area contrast checks across the six complete homepages at desktop/mobile sizes passed. This samples backgrounds beneath hidden text paint to check photo/gradient areas that axe cannot resolve. Normal text targets 4.5:1 and large text 3:1.
- `npm run test:preview-build`: every built route, reload, overview link, package dialog and the original homepage passed without resource or JavaScript errors.
- `npm run test:preview-motion`: tests the ordinary-motion hero entrance, drag comparison, navigation, service crossfade, project carousel, dialog Escape and mobile navigation on all six themes. Machine-readable results are in `qa/color-exploration/motion-results.json`.
- Full desktop and mobile screenshots of every complete preview were generated and visually reviewed. The original CSS/data hashes and deterministic desktop/mobile original-page screenshots match the saved pre-change baseline. Geometry matches on both viewports.

Detailed results live in `qa/color-exploration/results.json`, `photo-contrast-results.json`, `motion-results.json` and `build-results.json`; full-page screenshots are under `qa/color-exploration/after/`.

The existing form behavior is preserved: validation prepares a mail draft, without sending or storing an enquiry. Commercial details and legal text retain their existing prototype limitations. No CMS, API, backend, original image, production URL or deployment setting was changed.
