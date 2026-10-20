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

- The homepage at `/` includes a navbar design switcher: 01–06 on desktop and a compact Design disclosure on phones. Selection changes the entire page instantly without reloading or resetting scroll, language or carousel state. The selected theme is kept in `?theme=01`–`06` for refresh and sharing. Direct previews remain available at `/design-preview/01`–`06`, with an overview at `/design-preview`. Header, mobile menu and footer use working section anchors. State-property evidence is featured in expertise; partners and news/media have their own anchors.
- Full-screen mobile menu with staggered entries, focus trapping, Escape close and scroll lock.
- Matched architectural before/after comparison: mouse, pointer, touch, click positioning, arrow keys, Home and End.
- Masked hero heading entrance, image scale, restrained parallax, scroll reveals and image hovers.
- Crossfading service imagery with keyboard focus support; expanding service descriptions and mobile image accordions.
- Three art-directed architectural package backgrounds, animated details, and responsive comparison.
- Three supplied portfolio entries with crossfades, previous/next, keyboard navigation, touch swipe and project previews.
- Scroll-driven horizontal/vertical process progress.
- Contact dialog, accessible native dialogs, backdrop and Escape closing, and focus restoration.
- EN/AM covers the complete business presentation, package scopes and comparison, company roles, news/media, process, contact form, legal notices and accessibility labels. Proper organization names remain where appropriate.
- Reduced-motion support and locally bundled open-source Cormorant Garamond / Manrope fonts.

## Editing content

Edit **`src/data.js`** for published reference prices, package scopes, contact details, services, portfolio, implementers, partner network, news/media and English/Armenian copy. Existing layout and animation styles are in **`src/styles.css`**; content-related refinements are in **`src/presentation.css`**. Interactions and components remain in **`src/main.jsx`**. Sources, decisions and outstanding approvals are recorded in **`CONTENT_AUDIT.md`**.

## Asset provenance and presentation limits

- The supplied image was located under `prospect24-design-reference.png`, not the original attachment filename.
- All named project images come from the supplied `assets/projects/` directory. They are presented as architectural imagery; completion status, achievements, investment returns and locations are not asserted.
- The reference uses a dusk low-rise image for Garden Hill, while the supplied Garden Hill asset shows a different building. The project section intentionally retains the supplied named asset.
- The hero pair was generated with the built-in image generation tool for this prototype. It is explicitly labeled an illustrative development vision. Originals are saved as `assets/hero-after-generated.png` and `assets/hero-before-generated.png`; optimized copies are in `public/images/`. Prompts are recorded in `ASSETS.md`.
- The supplied high-resolution Prospect24 wordmark is used in the header, mobile menu and footer. Its transparent PNG is rendered against the correct background; the dark-context version is inverted for contrast.
- DIGNISI, KHACHATURIAN ARCHITECTS and BSC use temporary text representations because their official logo files were not supplied. Other supplied partner logos have not been substituted for these organizations.
- Package prices, scope, area and contact details were checked against the official English and Armenian websites. Published reference pricing is 2,400,000 AMD, from 4,800,000 AMD and from 11,200,000 AMD, each for 1,200–1,500 m². Final scope and commercial offer require confirmation. Supplied genuine partner/news assets are now included, with source attribution in **`CONTENT_AUDIT.md`**.
- The enquiry form validates input and prepares a `mailto:` draft in the visitor’s configured email application. It does not send or store enquiries. Privacy and terms dialogs explain the prototype rather than inventing approved production policies.

## Browser verification

```sh
npm run test:ui
```

The development server must be running. The browser verification script uses Playwright and an installed Google Chrome (`channel: 'chrome'`). It checks interactions, image sources, error logs and overflow, and captures viewport and full-page screenshots at 1440×900, 1920×1080, 768×1024 and 390×844. Additional overflow checks cover 375px and 430px. Results and screenshots are in `qa/`.

`PREVIEW_URL` can point the checks at a production preview. A configured mail application is needed to actually open the composed enquiry draft; no external message is sent by the tests.

`node scripts/verify-content.mjs` additionally checks both languages, complete package scopes, inherited services, package-to-contact selection, all 30 partner images, official video links, dated evidence and home/dialog overflow at 320, 390, 768 and 1440 px. New evidence is saved under `qa/content-*`. Final validation should use a stable production preview, without editing source during a test run.

### Accessibility refinement

`src/presentation.css` defines the retained graphite and paper design. Supporting text is darker on light backgrounds and lighter on dark backgrounds; buttons invert these two colors on hover. The final conversation section follows the page grid on a paper background, with a large heading, contact action and direct email instead of a repeated hero photograph. Photograph overlays and caption backplates protect text contrast. All process steps stay fully opaque, focus rings work on both palettes, and the footer signature is capped at 560px on desktop and 260px on phones.

With the dev server running, use `npm run test:a11y` for axe checks of the home page, both languages, mobile navigation and six dialog types. `npm run test:contrast` samples actual rendered backgrounds under text over photographs at desktop and mobile sizes in the retained design; axe leaves many photo and gradient backgrounds for manual review. Results are in `qa/accessibility-results.json` and `qa/photo-contrast-results.json`. The automated checks and visual review are focused verification, not a complete accessibility certification.
# tp24
# tp24

## Client presentation export

After `npm run build`, run `node scripts/package-preview.mjs` to create `output/Prospect24-Preview.html`. This self-contained file embeds fonts, imagery, styles and JavaScript and opens directly from disk without a server. `node scripts/verify-presentation.mjs` checks the offline export. The ready-to-send ZIP includes this file, a short Russian opening guide and desktop/mobile screenshots.

## Six color-system previews

Open `http://localhost:5173/` while `npm run dev` is running and use **01–06 in the navbar** to present the six color systems. On phones, open **Design** to choose a numbered option with its name and color swatch. Selection changes coordinated colors throughout the existing homepage. Content, imagery and component state are shared. The default `/` retains its original colors until a variant is chosen. The overview at `/design-preview` and direct preview URLs also remain available.

`npm run test:design-switcher` verifies instant switching, preserved scroll and carousel state, refreshable URLs, keyboard controls, accessibility scans and responsive layout in English and Armenian.

`npm run build` emits real `index.html` entries for the overview and all six variants under `dist/design-preview/`, including preview-only `noindex` metadata. `npm run preview` serves the built version at `http://localhost:4173/design-preview`. The existing portable HTML/ZIP above still presents the original homepage; the new color exploration uses these dedicated URLs.

See [COLOR_PREVIEWS.md](COLOR_PREVIEWS.md) for theme names, implementation files, preservation evidence and validation commands.

## Visual design studio

Open `/?editor=1` or click the pencil in the navbar. The approved presentation stays intact; the studio edits a live copy of the actual React application. Desktop, Tablet and Mobile render in a same-origin iframe at 1440, 768 and 390 CSS pixels. The canvas scales to fit the workspace and scrolls independently. Collapse the properties panel for more room. On phones, the panel docks below the canvas.

Select an element directly or use **Layers**. The hierarchy comes from the rendered components, including nested layout containers, cards, images and text. Breadcrumbs select parents. Editing captures conflicting link, slider, carousel and accordion gestures; **Preview** restores normal site interactions with the edited appearance. Escape deselects or cancels an active resize.

- **Images:** select an image, then use **Upload New Image**, **Choose Existing Image**, or **Restore Original**. JPG, PNG, WebP and browser-supported AVIF are checked by file signature and decoded before storage. SVG/HTML are rejected. Adjust fit, crop position, zoom, opacity and dimensions. Uploads are limited to 12 MB, 16,384 pixels per side and 60 megapixels. Before and After have independent sources and settings; the comparison group provides split, image opacity, labels, editor-divider visibility and synchronized-position restoration. Select **Background Overlay** to adjust its color/opacity independently of the content.
- **Dimensions:** use **Size & Dimensions**, unit selectors and aspect lock, or drag the right/bottom/corner handles. Section height dragging adjusts minimum height; Hero dragging synchronizes its fixed and minimum heights so it can also shrink. Sizes are real layout dimensions. Grid children stay within their parent column; change the parent layout for column options. Percentage heights are deliberately unavailable. For text-bearing blocks that are too short, the panel warns and offers **Fit content automatically**; content is kept visible.
- **Appearance and layout:** use collapsible groups for colors/hex, opacity, border, radius, shadow, typography, spacing and the selected flex/grid layout. Link spacing independently, by opposite sides, or all sides. Modified properties have a dot and an individual reset button.
- **Responsive changes:** Desktop edits base values. Tablet overrides apply at up to 1024px; Mobile overrides apply at up to 600px and inherit tablet/base settings. Dimensions, spacing, typography, image position/fit/zoom and layout can vary by breakpoint. Colors, opacity, borders, images, visibility and copy are global. No custom overrides means the existing responsive CSS wins.
- **Sections and copy:** section X controls hide without deleting. **Sections** restores the original order, and links to hidden sections are disabled. Simple text changes are saved separately in English and Armenian. Complex pricing/counters and structured business lists remain structured.
- **History and reset:** Undo/Redo include image sources, styles, visibility, copy, import and reset. Continuous inputs and resize drags form one step. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z work outside text inputs. Reset individual properties, the selected element, an entire section including nested sections, or the full design. Reset All asks for confirmation and can be undone.

Changes save automatically on this browser. Configuration uses localStorage (`prospect24-client-editor-v1`, schema version 2, with migration of original version 1 colors). Binary uploads use IndexedDB (`prospect24-editor-assets`) under SHA-256 asset identifiers, deduplicated by content. Object URLs exist only at runtime and are revoked when the provider unmounts. Browser quota/storage errors are reported; export a ZIP for durable backup. Closing the editor keeps the saved local appearance; other visitors and repository assets are unaffected.

**Export Project** downloads `prospect24-client-design.zip`, containing `prospect24-client-design/design.json` and every referenced custom asset under `images/`. Sources in that JSON use relative archive paths. **Import** restores the ZIP, checking paths, size limits, image signatures/checksums, schema, element IDs, property names, values and units before applying the design. Missing images warn and fall back to originals. The sidebar's **Settings JSON** export omits binary assets; use ZIP to share uploads between browsers. No publishing or server upload is performed.

Implementation is in `src/editor/`, with `EditorElement` wrappers integrated in `src/main.jsx`, and the small `fflate` ZIP dependency. The configuration is the source of truth: React supplies edited copy/sources, and generated whitelisted CSS supplies base and responsive styles. The original components stay mounted outside the canvas. The iframe also uses those same components, preserving responsive media queries and native dialogs.

Run `npm run build`, then `npm run preview` and `PREVIEW_URL=http://localhost:4173/ npm run test:editor` (set the environment variable using your shell's syntax). The editor Playwright suite covers resizing/cancel/undo, responsive inheritance, images, bilingual copy, comparison, visibility, ZIP round trips, malicious/missing imports, persistence, accessibility and panel bounds. Existing `test:ui` and `test:a11y` exercise the presentation. Evidence is saved in `qa/editor/`.

Scope limits: no arbitrary CSS or rich text; image repositioning uses sliders rather than direct crop dragging; package dialogs reuse the original data rather than edited card copy/images; only currently rendered carousel/project and partner elements appear in Layers. Original project assets resolve through this repository's asset manifest; bundled gallery aliases remain stable between development and production builds. All client uploads are embedded. Integrating an approved design into the published source remains an explicit developer step. The iframe studio requires an HTTP(S) origin; the standalone offline HTML export remains a presentation, not a supported editor workspace.
