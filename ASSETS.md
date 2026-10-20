# Asset mapping

The project root and `assets/` were recursively inspected before implementation. All supplied files are preserved. `qa/asset-inventory.json` records source image formats and dimensions.

| Use | Supplied source |
| --- | --- |
| Visual specification | `prospect24-design-reference.png` |
| Introduction | `assets/pages/servicesHero.jpg`, `assets/pages/strategy.jpg` |
| Market service | `assets/home-03-fe8baa2dca.jpg` |
| Architecture service | `assets/pages/balconies.jpg` |
| Finance service | `assets/pages/finance.png` |
| Investment service | `assets/pages/consulting.png` |
| Package backgrounds | `assets/pages/servicesHero.jpg`, `assets/home-02-00e68e293c.jpg`, `assets/pages/regulatory.png` |
| Supplied brand wordmark | `assets/home-01-408f0b6d35.png` → `public/images/brand-wordmark.png` |
| Garden Hill Residence | `assets/projects/garden-hill-residence.jpg` |
| Avet Avetisyan 20 | `assets/projects/avet-avetisyan-20.jpg` |
| Khachaturian Architects | `assets/projects/khachaturian-architects.jpg` |
| Partnership photograph | `assets/news/cooperation.jpg` |

Website versions are optimized to WebP in `public/images/`. Font files are bundled from the `@fontsource` packages with their open font licenses retained in `node_modules`.

## Generated imagery

Generated using the built-in image generation tool. Original PNGs are retained in `assets/`; the website consumes optimized local WebP versions. The final CTA uses the page’s paper background and typographic layout; it has no photographic backdrop.

**After — final prompt:**

> Use case: photorealistic-natural. Asset type: full bleed premium real estate website hero photograph, landscape 3:2. Create a cinematic architectural photograph of a contemporary six-storey luxury residential development at blue hour, elegant warm limestone and dark bronze metal facade, large windows glowing warmly, staggered balconies, trees, refined landscaping. Building fills right two-thirds with dynamic perspective looking along a boulevard, darker low urban skyline and foreground on the left third leaving room for white headline. Camera from slightly elevated across street, 28mm architectural lens, realistic straight verticals, detailed natural textures, muted charcoal, warm taupe, blue gray sky with subtle sunset clouds. Sophisticated architectural visualization reminiscent of luxury editorial real estate, no text, logos, watermark or UI. This is an illustrative development, not a real project. Save a high resolution image.

**Before — final edit prompt (after image used as the edit target):**

> Use case: precise-object-edit. This image is the edit target. Create the BEFORE image for an architectural before-after slider. Keep the camera position, exact crop, image dimensions, perspective, sunset sky, distant skyline on left, road alignment and foreground tree on bottom left unchanged. Replace ONLY the finished luxury apartment building and its landscaping on the right with an undeveloped excavated construction site at the exact same location: exposed earth, gray rock, graded terraces and a few low concrete foundations, perhaps a small parked excavator. Remove building, windows, facade, balcony trees, finished paths and landscaping, leaving an open ground-level construction site. Preserve the road along bottom and all distant elements precisely, so two images align convincingly for a comparison slider. Muted blue hour colors, photographic realism, no text, no logos.
