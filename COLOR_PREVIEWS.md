# Prospect24 color-system exploration

The supplied “Шесть палитр — один архитектурный стиль” reference is implemented as six color systems for the existing homepage. It is not a layout redesign. The reference's compressed layout, alternate project image and partner names were not substituted for the actual site's content.

## Preview URLs

Open `/` and use **01–06 in the navbar** to switch the full page instantly. On phones, use the **Design** disclosure. Selection preserves scroll, language, carousel and other app state. The selected variant is stored in the URL (`/?theme=03`) for refresh and sharing. The overview is `/design-preview`; the direct routes below also remain available.

| Route | Theme | Main colors |
| --- | --- | --- |
| `/design-preview/01` | Graphite & Ivory | `#171A1B`, `#F6F6F3`, `#E2E2E2`, `#868686` |
| `/design-preview/02` | Stone & Forest | `#263D35`, `#F1F0EB`, `#172C25`, `#6F7F76` |
| `/design-preview/03` | Slate & Ice | `#203746`, `#E9EFF2`, `#162936`, `#687C8F` |
| `/design-preview/04` | Espresso & Porcelain | `#292522`, `#F7F5F2`, `#382F2A`, `#7A6F67` |
| `/design-preview/05` | Sage & Charcoal | `#202622`, `#E6EAE2`, `#314735`, `#687D6F` |
| `/design-preview/06` | White & Terracotta | `#FAFAF8`, `#222222`, `#A64F3D`, `#7D6D63` |

Run `npm run dev` and open `http://localhost:5173/design-preview`. The production build is created with `npm run build`, then served with `npm run preview` at `http://localhost:4173/design-preview`. Each variant has a real static HTML entry and supports direct access and refresh. No deployment was performed.

## Shared implementation

- `src/preview/themes.js` defines six coordinated color systems with semantic roles for text, sections, cards, buttons, borders, focus, headers, footers and overlays.
- `src/preview/preview.css` scopes color overrides to `[data-preview-theme]`. The same homepage content, imagery, dimensions, typography and animations are shared by all variants.
- `src/preview/PreviewHost.jsx` manages the selected palette without remounting the homepage. The root URL retains its original colors until a variant is chosen. Selection updates the query parameter on the root page or the path on a direct preview route, without navigation.
- `src/preview/navbar-design.css` fits the selector into the existing navbar. Desktop shows six numbered buttons with an active state. Mobile shows a disclosure with theme names and swatches, outside-click dismissal, Escape handling and focus restoration. Existing navigation and language controls remain available.
- `src/main.jsx` places the selector inside the header and shares the same App across all variants. Content, bilingual presentation and dialogs are maintained in the existing implementation.
- `vite.config.js` emits the overview and six static preview entries. Direct preview entries have `noindex, nofollow` metadata.

## Verification

Run the development server, then:

- `npm run test:design-switcher`: all six palettes through the root navbar at desktop/mobile sizes, retained scroll and carousel state, no reload, selected URL and refresh, direct-route switching, keyboard selection, mobile dismissal and axe WCAG A/AA scans. Header/page overflow checks cover 320–1920px in English and Armenian. Results and screenshots: `qa/navbar-design/`.
- `npm run test:preview-colors`: shared content, images and geometry, buttons, dialogs, mobile menu, overview, keyboard controls and responsive checks for all six palettes. Baseline is the current homepage with the navbar selector.
- `npm run test:preview-contrast`: rendered photo/gradient text-area contrast checks.
- `npm run test:preview-motion`: ordinary-motion interactions on all six variants.
- `npm run build`, then `npm run test:preview-build`: static entries, refresh, overview links and dialog checks against the production preview.

Earlier color-exploration evidence is in `qa/color-exploration/`. The navbar-specific results are in `qa/navbar-design/results.json`. Automated accessibility scans complement visual review; they are not a full accessibility certification.

The enquiry form continues to prepare a mail draft. No deployment was performed. The existing standalone HTML/ZIP export predates the navbar switcher; use the running site or current static build to present variants.
