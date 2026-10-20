# Prospect24 content audit

Reviewed 21 October 2026. Scope: refine the existing one-page client presentation; preserve the React/Vite architecture, visual identity and interactions. No publication or deployment is included.

## Current content → source → decision

| Existing content | Verified reference | Decision and resulting presentation |
| --- | --- | --- |
| Hero positioning and integrated disciplines | [English homepage](https://prospect24.am/en/), [Armenian homepage](https://prospect24.am/) | KEEP the headline, short business description and illustrative comparison. Preserve imagery, motion and the illustrative label. |
| Introduction repeats the disciplines | Homepage and package scope | REWRITE to explain how market conditions, planning constraints and financial assumptions inform a development decision. |
| Four interactive service categories | [Package scope EN](https://prospect24.am/en/investment-packages/), [HY](https://prospect24.am/investment-packages/) | KEEP interactions and categories; EXPAND the detail with actual deliverables. No guaranteed profitability, financing or permission claims. |
| Three generic package cards and equally generic dialogs | Package scope EN/HY | REWRITE summaries, preserve published prices, add inheritance, distinguish fixed published price from starting prices. Full grouped deliverables in existing dialogs; comparison explains differences. |
| Third package area 1,300–1,500 m² | Both package pages specify 1,200–1,500 m² | CORRECT to 1,200–1,500 m² for all packages. |
| All prices called illustrative design pricing | Package page: 2,400,000; from 4,800,000; from 11,200,000 AMD | CORRECT to published reference pricing; final commercial offer requires confirmation. |
| Financial scope described as an initial assessment | Package scope | EXPAND to five-year investment plan, cash flows, financial results, indicators and break-even calculations. First year monthly, years two–five annually. |
| Third package lacks APZ context | Package scope | ADD preparation for the architectural planning assignment (APZ), explicitly without guaranteeing approval. |
| Three named portfolio entries with decorative narratives | [Official gallery](https://prospect24.am/en/projects/) | KEEP three image-led entries. REWRITE descriptions to state the evidence available. Correct “Avet Avetisyan, 20”; identify Khachaturian Architects as a studio portfolio label, not a separately verified development. |
| Garden Hill extra image drawn from a service asset | Official gallery and supplied asset mapping | REMOVE the unverified secondary gallery association; preserve the supplied named main image. |
| Five animated process steps | Synthesis of published package deliverables | KEEP as an explanatory journey. Clarify that scope and sequence are agreed per project; not an official guaranteed delivery methodology. |
| Implementing companies have only generic role labels | [Companies EN](https://prospect24.am/en/companies/), [HY](https://prospect24.am/companies/) | EXPAND concise role descriptions. Separate implementers from partner network. Preserve text identities; do not invent corporate logos. |
| Generic cooperation photograph caption | [State property memorandum](https://prospect24.am/en/memorandum-of-cooperation/) | REPLACE caption with factual dated evidence, the matching supplied news image and original article link. |
| Supplied partner assets unused | [Official partners](https://prospect24.am/en/partners/) | ADD a restrained 12-logo homepage grid and a dialog with all 30 supplied logos. Preserve proportions and original colors. No claim that relationships are equivalent. |
| News/media/state-property menu labels disabled | Actual one-page sections and official publications | MERGE state-property evidence into expertise; ADD a compact cooperation/media section. All navigation items now have working section anchors. |
| Phone/email correct, generic city address | [Contacts](https://prospect24.am/en/contact-us/) | KEEP phone/email and correct tel/mailto URLs. EXPAND address to 1/61 building, Azatutyan Avenue, Yerevan, Armenia, with Armenian equivalent. |
| Contact form only name/email/message | Official enquiry fields; existing mailto implementation | ADD package selection and optional phone. Package CTA preselects the relevant package. Preserve draft-only behavior; remove the unsupported assertion that the mail app definitely opened. |
| English supporting copy in AM mode | Armenian package/company pages; faithful editorial translations | LOCALIZE services, packages, comparison, process, form, navigation, captions, news, legal notices and accessibility labels. Explicit month names prevent browser-locale fallback. Proper names retained where appropriate. |
| Prototype legal dialogs and misleading illustrative pricing | Existing implementation and published pricing | KEEP honest presentation notices, revise price wording, disclose external links, and state that production legal documents need approval. |

## Added evidence

| Item | Signed | Published | Official source |
| --- | --- | --- | --- |
| State Property Management Committee / Prospect24: investment packages for state property intended for disposal | 24 January 2025 | 28 January 2025 | [Article](https://prospect24.am/en/memorandum-of-cooperation/) |
| Chakhruk NGO / Prospect24: support for the proposed settlement initiative | 20 January 2025 | 25 February 2025 | [Article](https://prospect24.am/en/memorandum-chakhruk-ngo-and-prospect24/) |
| Chamber of Architects of the RA / Prospect24: combining real estate and architectural expertise | 21 March 2025 | 26 March 2025 | [Article](https://prospect24.am/en/prospect24_archtects-palace/) |

The Architects article timed out in the web text reader; its complete English HTML was successfully fetched directly from the same official URL. Publication dates were also checked against the [news index](https://prospect24.am/en/news/). Signed dates and publication dates remain distinct in both languages. Agreements are presented as published records, not proof of completed work, approvals or a current commercial contract.

[Official videos](https://prospect24.am/en/videos/) reference exactly two Dignisi News interviews: `jn9iFdgyBg8` (cooperation rather than competition) and `NamajLyCY3k` (preparing a property’s package from the beginning). They open YouTube on request; no embedded tracking player or stock interview is added. English titles are faithful topic translations; Armenian titles follow the official references.

## Partner verification

The official partners page HTML contains 30 named logo assets, matching the 30 supplied `assets/partners/` entries: Araratbank, Decoree Holding, Ador, Cerama Casa, Zigzag, Art Deco, Inecobank, Nine Architects, Storaket Studio, Petro Stone, CUP Bureau, ALT Architectural Studio, MEK Furniture, Graphit, Atrium, Amio Bank, Anarch, Byblos Bank Armenia, Futuris Architects, AGL Projects, Domus, Chakhruk NGO, Kult Home, Valan Decor, Asedl, Tognana, Mer Ankyun, ANZ Facade, Exterior Group and Architects Palace. Asedl and Mer Ankyun names follow the source image titles; no descriptions or legal entity identities are inferred. Existing images are bundled through Vite, with no runtime dependency on the old website.

## Preserved design and project structure

- Existing React 19/Vite application, preview routes, dependencies and static content architecture.
- Typography, palette, architectural photography, hero composition and before/after control.
- Entrance/reveal animations, parallax, service interactions, carousel keyboard/swipe controls, process animation and reduced-motion behavior.
- Existing sections and their overall sequence. Company evidence and logo grid extend expertise; a compact news/media area precedes the existing final CTA.
- Existing native dialogs, mobile navigation, scroll locking, pricing cards and footer identity.

Changes to layout are limited to content needs: readable company descriptions, grouped scope details, restrained logo grid, compact news/media layout, form fields, mobile wrapping and long Armenian copy. No CMS, API, backend, routing system or state library was introduced.

## Editorial exclusions and uncertainty

- Do not use `/en/about-us/`, `/en/our-services/` or `/en/shop/` as business evidence: legacy template material is outside the verified sources.
- No invented testimonials, personnel, awards, investment returns, delivery achievements, operating hours or social accounts.
- Repeated portfolio labels/images are not counted as separate projects. “Architecture & Design” is omitted because the label alone does not establish a distinct identifiable development.
- Portfolio location, project authorship beyond the published label, developer/client identity, completion/status, specifications, budgets, performance and commercial results remain unverified. Images are portfolio references, not case studies asserting Prospect24 delivery.
- The named supplied project imagery is retained. Its exact image-to-project attribution should receive client confirmation, particularly Garden Hill where an earlier design reference used a different view. The unverified supplementary service-image association was removed.
- BSC’s published “30 years” and “750+ businesses” claims were reviewed but intentionally omitted; role descriptions provide sufficient homepage context without time-sensitive statistics.
- APZ is expanded editorially as the architectural planning assignment. The official Armenian source uses the Cyrillic abbreviation; the interface uses Latin APZ consistently to avoid mixed-script terminology. It is preparation, not permission assurance.
- Expanded Development scope explicitly includes Pre-Investment work. Investment combines expanded market work, detailed architecture and the Development business model extended into a full business plan. The source expresses inheritance by discipline; the interface avoids implying approvals or a construction contract.
- Homepage summaries, company roles, comparison copy, process labels, news summaries and supporting Armenian UI text are faithful editorial adaptations, not verbatim official quotations. Native Armenian editorial review remains appropriate before launch.

## Client commercial/legal confirmation before production

Confirm current prices, taxes (not specified by the source), exact construction-area measurement, project-specific scope, APZ responsibilities, commercial terms, delivery times and exclusions. No such missing terms were invented. Confirm current partner relationships, company logo assets, project attribution and image-use permissions. Approve final privacy/terms and choose a real enquiry delivery system if needed. The presentation currently prepares an email draft only and does not send or store enquiries.

## Reference principles

Reviewed [Hines](https://www.hines.com/), [JLL services](https://www.jll.com/en-us/services) and [Arup projects](https://www.arup.com/projects/) for proposition → capabilities → evidence → next action hierarchy. Applied selective homepage content and progressive disclosure, without copying their layouts, branding or motion.

## Verification

Run `npm run build`, `npm run test:ui`, `npm run test:a11y`, `npm run test:contrast` and `node scripts/verify-content.mjs`. Tests accept `PREVIEW_URL`; final checks use the production build to avoid development hot-reload noise. Existing QA assets are retained. Reports are in `qa/results.json`, `qa/accessibility-results.json`, `qa/photo-contrast-results.json` and `qa/content-results.json`; new screenshots use the `content-` prefix.

Final results on the production preview at `http://localhost:4177/`:

- Build passed.
- Existing interaction suite: 67 checks passed; no console, runtime or resource errors.
- Content/localization suite: 109 checks passed, including home/dialog overflow and heading clipping at 320, 390, 768 and 1440 px in both languages.
- Accessibility: zero automated WCAG A/AA violations across 20 existing screen/dialog states and five additional partner/Armenian package-dialog states.
- Photo/background contrast: 116 text ranges checked at desktop/mobile widths; zero failures.
- Desktop and mobile visual review completed, including loaded partner logos, company descriptions, news, Armenian scopes and contact fields.

Automation does not replace native-language editorial review, commercial/legal approval, or assistive-technology user testing. No live enquiries were sent. A transient Windows screenshot file lock required rerunning the UI suite; the final run passed.
