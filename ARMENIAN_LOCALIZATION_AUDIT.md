# Armenian localization audit — Prospect24

Reviewed 21 October 2026. Local repository implementation only; no deployment, publication, commit or push was performed.

## Scope and counts

- **672 catalog entries reviewed**: 292 existing structured-content paths and 380 editor/preview dictionary entries.
- **65 existing Armenian entries corrected**; **386 new Armenian entries**; **221 reviewed entries retained**.
- Comparison baseline: Git revision `8ea4272e603b83dc1c8eb8ab2579f2164b521f37`.
- Counts use one effective key or array-element path per entry. Shared financial-scope text appears at each package path. Dictionary entries include reusable control/property terms, including labels exposed conditionally. Generated editor labels, price/date renderings and dynamic templates are listed separately below and are not added again to the catalog count.
- No missing Armenian catalog values. Proper names, logos, URLs, email addresses, file formats, units and internal identifiers are intentionally retained where appropriate.

## Implementation

| File | Change |
| --- | --- |
| src/data.js | Existing EN/AM keys, package scope, services, companies, news, metadata and form messages. |
| src/main.jsx | Shared language state, dates, currency inflection, mail draft copy, validation and illustrative image description. |
| src/localization.jsx | Small shared language context for the existing presentation, previews and editor. |
| src/uiTranslations.js | Customer-facing editor and preview dictionary; generated labels and error templates. |
| src/armenian.css | Armenian font family, glyph-safe line heights, long headings and button text. |
| src/components/SelectedPortfolio.jsx | Localized accessible carousel/slide descriptions; slider behavior unchanged. |
| src/preview/PreviewHost.jsx | Localized selector, all palette names/descriptions, overview and active title. |
| src/editor/EditorProvider.jsx | Localized toolbar, status, section controls, reset dialog and canvas labels. |
| src/editor/PropertiesPanel.jsx | Localized properties and accessible labels; copy language follows canvas. |
| src/editor/LayersPanel.jsx | Localized layer labels and states. |
| src/editor/SelectionOverlay.jsx | Localized selection labels, hide and resize controls. |
| src/editor/ImageSourceControls.jsx | Concurrent image-control component uses the shared localization helper. |
| package.json; package-lock.json | Locally bundled Noto Sans Armenian and Noto Serif Armenian. |
| scripts/verify-editor.mjs | Expect Armenian labels after switching the editor language. |
| scripts/verify-content.mjs | Accept Armenian space-separated reference areas alongside English comma grouping. |
| scripts/verify-color-previews.mjs | Correct stale final-section expectation to the existing conversation anchor. |
| scripts/verify-preview-motion.mjs | Target the existing active portfolio action, whose accessible name includes the project. |
| scripts/verify-portfolio.mjs | Wait for fonts and the final rail position before the existing native-touch gesture assertion. |
| scripts/localization-catalog.mjs; scripts/verify-armenian.mjs; scripts/write-localization-audit.mjs | Reproducible inventory, dedicated Armenian regression checks and report. |

The existing translations, keys, anchors, prices, imagery, state and interactions were retained. The shared context coordinates the current translation system across parent and editor canvas; it does not replace the content dictionaries. EN/AM updates HTML language to en/hy, title and description without navigation. Switching preserves scroll, selected portfolio project, dialog state, theme and independent saved English/Armenian copy. Contact fields remain in place and the form still prepares a mailto draft.

Concurrent image-editor changes were present during this audit. Their behavior was preserved and their new controls localized; changes to EditorElement.jsx, editorConfig.js, editorExport.js, editor.css and the image-control verification script belong to that concurrent work, not to a localization redesign.

## Official references and verification standard

- [packages](https://prospect24.am/investment-packages/)
- [companies](https://prospect24.am/companies/)
- [projects](https://prospect24.am/projects/)
- [partners](https://prospect24.am/partners/)
- [contact](https://prospect24.am/contact-us/)
- [en](https://prospect24.am/en/)
- [state](https://prospect24.am/memorandum-of-cooperation/)
- [architects](https://prospect24.am/prospect24_archtects-palace/)
- [chakhruk](https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/)

The Armenian package page and Chakhruk article timed out or were inaccessible in the web text reader but their complete HTML was fetched directly from the same official URLs. Armenian package titles, listed prices and area were confirmed against that HTML and the English package page. Official company/project/partner/contact pages and the state-property and architects articles were read successfully. The official article calls the initiative **«Ճախրուկ բնակուտ»**; the earlier «Ճախրուկ ավան» wording was corrected. Signing dates and publication dates are kept distinct.

**verified** means the stated name, fact or official Armenian wording was found in the official reference; harmless capitalization/address expansion is permitted. **editorial translation** means a contextual Armenian rendering of the existing English meaning. A reference attached to an editorial row supports the business context, not a claim that its exact prose is official. **needs approval** is reserved for unresolved business/commercial/legal choices, not used to mislabel editorial copy as verified.

## Typography and visual QA

The actual bundled Latin WOFF2 cmaps contain zero Armenian glyphs for Manrope and Cormorant Garamond. Noto Sans Armenian and Noto Serif Armenian each contain 85 Armenian code points and cover the full alphabet used here. They are bundled through Fontsource/Vite with no runtime font CDN. English font choices remain unchanged. See [font coverage](qa/localization/font-coverage.json).

Armenian was checked at 1920, 1440, 1280, 1024, 850, 768, 700, 650, 600, 390, 375 and 320 px. The dedicated suite checks heading width and horizontal page/dialog overflow. Long Armenian process-stage text wraps within the existing tablet columns. Desktop/mobile screenshots cover the hero, introduction, packages, portfolio, news, package scopes, comparison, contact, editor/gallery and overview. Representative files are under [qa/localization](qa/localization). Mobile layout, swipe, arrows and slider geometry were retained; the Armenian project action gets sufficient text width.

## Validation

Final results are recorded in [validation.json](qa/localization/validation.json). The original general UI, accessibility and editor suites remain in place; assertions were not removed to hide failures.

| Command / check | Result | Evidence / limitation |
| --- | --- | --- |
| npm run build | passed | Final Vite production build; Armenian font files bundled locally. |
| npm run test:ui | passed | 67 checks; no browser/resource errors. |
| npm run test:a11y | passed | 20 scenarios; zero automated WCAG violations. |
| npm run test:contrast | failed — original baseline also fails | 1440px portfolio number 3.10:1 < 4.5:1 and English project title 2.94:1 < 3:1. Both match the original revision. 390px passes. |
| npm run test:editor | passed | 97 checks, including bilingual copy, import/export, image upload, undo, responsive resizing and accessibility. |
| npm run test:armenian | passed | 63 checks; 672 catalog entries; 12 viewport widths; no missing Armenian values, accidental English UI, overflow, runtime or resource errors. |
| npm run test:design-switcher | failed — original baseline also fails | EN 320px header scroll width 336px in a 320px header. Six desktop themes passed their accessibility scans before this assertion. |
| npm run test:preview-colors | passed | 12 palette/viewport combinations; 44 accessibility scans; preserved homepage geometry, content and imagery. |
| npm run test:preview-build | passed | Six static routes, refreshes, original homepage, overview links and interactions. |
| npm run test:preview-motion | passed | All six themes retain hero entrance, comparison dragging, navigation, service crossfade, carousel and mobile navigation. |
| npm run test:preview-contrast | failed — portfolio contrast | Suite stops on palette 01 at the original desktop portfolio number/title failures; mobile passes. |
| Armenian photo-contrast checks on palettes 01–06 | failed — portfolio number only | All six report the desktop portfolio number at 2.93:1 against 4.5:1. All six mobile checks pass after raising the long scroll badge above the comparison divider. |
| node scripts/verify-content.mjs | failed — original English heading also clips | EN ARCHITECTURAL at 768px is 363px wide in a 352px line in both revisions. Dedicated Armenian scope and viewport tests pass. |
| node scripts/verify-portfolio.mjs | passed | 23 checks; all language/viewport navigation cases, arrows, keyboard, mouse drag, focus restoration, editor reveal and native touch swipe. |
| node scripts/verify-editor-images.mjs | passed | 20 image-control checks; concurrent image controls preserved, including remove/restore, ZIP transfer and mobile service photos. |
| Font cmap inspection | passed | Manrope/Cormorant Latin files: zero Armenian glyphs. Both Noto Armenian faces: 85 Armenian code points and full Armenian alphabet coverage. |
| git diff --check | passed | No whitespace errors. |


Known pre-existing findings were reproduced against the original Git revision:

1. The photo-background contrast sampler fails on the desktop portfolio number (baseline and current minimum 3.10:1, required 4.5:1) and the English project title (baseline and current 2.94:1 against a 3:1 requirement). Armenian reports one desktop number failure in each of the six palettes and no mobile failures. These failures are reported, not suppressed or described as passing. No portfolio shade/design change was introduced for this localization task. The longer Armenian scroll badge was raised above the comparison divider to prevent its text crossing underneath that line in the light palette.
2. The broader content suite stops on the English ARCHITECTURAL portfolio heading at 768 px. Original baseline and current both measure 363 px text in a 352 px line. The Armenian dedicated width checks pass.
3. The design-switcher suite detects an English header overflow at 320 px: 336 px scroll width in a 320 px header, reproduced unchanged on the original revision. Armenian page-overflow checks pass; this existing header issue is documented.

Baseline evidence: [contrast](qa/localization/baseline-contrast.json) and [geometry](qa/localization/baseline-geometry.json). The final baseline run loaded all original fonts successfully and recorded no blocked resource requests; an earlier run with blocked fonts was discarded.

Automatic approval review rejected deletion of the temporary comparison fixture with the reason “blocked by policy”. Temporary files remain under output/localization and are not part of the application build. The baseline server was stopped.

## Terminology and business questions

| Topic | Decision / unresolved question | Status |
| --- | --- | --- |
| Architectural planning assignment | Use ճարտարապետահատակագծային առաջադրանք (ՃՀԱ, APZ). The source uses АПЗ/APZ; approval remains explicitly unguaranteed. | editorial translation |
| Excavation information | Retain the official փորվածքներ terminology where needed. Exact technical deliverable remains part of the agreed commercial scope. | verified |
| Commercial offer | Listed prices, starting-price distinction and 1 200–1 500 մ² reference area are unchanged. Final scope and commercial offer still require confirmation. | needs approval |
| Legal notices | Prototype notices are translated faithfully; final production privacy policy/terms require client approval before launch. | needs approval |
| Portfolio evidence | Preserve the three official identities. Completion status, construction authorship and commercial outcomes are not established by the gallery. No extra claims added. | needs approval |
| Partner names | Keep official logo identities and supplied international names; no unsupported Armenian brand names created. | verified |


No customer-facing English sentence remains intentionally untranslated in Armenian mode. Retained English/Latin content consists of proper names, channels (Dignisi News, YouTube), APZ, file formats, keyboard shortcuts, units, email/URL examples and technical identifiers. User-authored editor text is preserved verbatim and is not automatically translated. Native browser/JSON error diagnostics receive a localized fallback; English retains the original diagnostic.

## Complete effective localization catalog

| Original English string | Final Armenian translation | Source file | Translation key | Official source / factual context | Status | Audit change |
| --- | --- | --- | --- | --- | --- | --- |
| Let’s Talk | Կապ հաստատել | src/data.js | translations.talk | — | editorial translation | corrected |
| BUILD WITH | ԿԱՌՈՒՑԵՔ | src/data.js | translations.hero[0] | — | editorial translation | reviewed; retained |
| VISION. | ՏԵՍԼԱԿԱՆՈՎ։ | src/data.js | translations.hero[1] | — | editorial translation | reviewed; retained |
| INVEST WITH | ՆԵՐԴՐԵՔ | src/data.js | translations.hero[2] | — | editorial translation | reviewed; retained |
| CLARITY. | ՀԻՄՆԱՎՈՐՎԱԾ ՈՐՈՇՄԱՄԲ։ | src/data.js | translations.hero[3] | — | editorial translation | corrected |
| Real Estate Development & Investment Advisory | Անշարժ գույքի զարգացում և ներդրումային խորհրդատվություն | src/data.js | translations.tagline | — | editorial translation | reviewed; retained |
| From market research and architectural planning to financial analysis and investment preparation — we bring the essential disciplines of real estate development together. | Շուկայի ուսումնասիրությունից ու ճարտարապետական պլանավորումից մինչև ֆինանսական վերլուծություն և ներդրումային նախապատրաստում՝ մենք համախմբում ենք անշարժ գույքի զարգացման առանցքային մասնագիտական ուղղությունները։ | src/data.js | translations.heroText | — | editorial translation | corrected |
| Explore Our Expertise | Ծանոթացեք մեր փորձառությանը | src/data.js | translations.explore | — | editorial translation | corrected |
| View Projects | Դիտել նախագծերը | src/data.js | translations.view | — | editorial translation | reviewed; retained |
| ONE VISION. | ՄԵԿ ՏԵՍԼԱԿԱՆ։ | src/data.js | translations.intro[0] | — | editorial translation | reviewed; retained |
| MULTIPLE | ԲԱԶՄԱԿՈՂՄ | src/data.js | translations.intro[1] | — | editorial translation | corrected |
| DISCIPLINES. | ՓՈՐՁԱՌՈՒԹՅՈՒՆ։ | src/data.js | translations.intro[2] | — | editorial translation | corrected |
| Successful developments begin long before construction. | Հաջող կառուցապատման հիմքը դրվում է շինարարության մեկնարկից շատ առաջ։ | src/data.js | translations.introSub | — | editorial translation | corrected |
| A site’s potential depends on its market, planning constraints and financial assumptions. Prospect24 connects these disciplines so developers can assess the opportunity and prepare a coherent project. | Տարածքի ներուժը կախված է շուկայական պայմաններից, կառուցապատման սահմանափակումներից և ֆինանսական հաշվարկների հիմքում ընկած ենթադրություններից։ Prospect24-ը համախմբում է այս մասնագիտական ուղղությունները, որպեսզի կառուցապատողները կարողանան գնահատել հնարավորությունն ու պատրաստել փոխկապակցված լուծումներով նախագիծ։ | src/data.js | translations.introText | — | editorial translation | corrected |
| DEVELOPMENT, | ԿԱՌՈՒՑԱՊԱՏՈՒՄ՝ | src/data.js | translations.development[0] | — | editorial translation | corrected |
| FROM EVERY ANGLE. | ԲՈԼՈՐ ՏԵՍԱՆԿՅՈՒՆՆԵՐԻՑ։ | src/data.js | translations.development[1] | — | editorial translation | reviewed; retained |
| Integrated expertise for informed real estate decisions. | Համակցված մասնագիտական փորձառություն՝ անշարժ գույքի ոլորտում հիմնավորված որոշումների համար։ | src/data.js | translations.devSub | — | editorial translation | corrected |
| STRUCTURED SOLUTIONS. | ՀԱՄԱԿԱՐԳՎԱԾ ԼՈՒԾՈՒՄՆԵՐ։ | src/data.js | translations.packages[0] | — | editorial translation | reviewed; retained |
| INFORMED DECISIONS. | ՀԻՄՆԱՎՈՐՎԱԾ ՈՐՈՇՈՒՄՆԵՐ։ | src/data.js | translations.packages[1] | — | editorial translation | reviewed; retained |
| Compare Packages | Համեմատել փաթեթները | src/data.js | translations.compare | — | editorial translation | reviewed; retained |
| ARCHITECTURAL | ՃԱՐՏԱՐԱՊԵՏԱԿԱՆ | src/data.js | translations.project[0] | — | editorial translation | reviewed; retained |
| PERSPECTIVES. | ՏԵՍԼԱԿԱՆՆԵՐ։ | src/data.js | translations.project[1] | — | editorial translation | corrected |
| FROM POSSIBILITY | ՀՆԱՐԱՎՈՐՈՒԹՅՈՒՆԻՑ | src/data.js | translations.process[0] | — | editorial translation | corrected |
| TO PREPARATION. | ԴԵՊԻ ՆԱԽԱՊԱՏՐԱՍՏՈՒՄ։ | src/data.js | translations.process[1] | — | editorial translation | corrected |
| EXPERTISE, | ՓՈՐՁԱՌՈՒԹՅՈՒՆ՝ | src/data.js | translations.expertise[0] | — | editorial translation | reviewed; retained |
| BROUGHT TOGETHER. | ՄԻԱՎՈՐՎԱԾ։ | src/data.js | translations.expertise[1] | — | editorial translation | reviewed; retained |
| Three implementing companies bring market knowledge, architectural design and business planning into one development package. | Երեք իրականացնող ընկերություններ մեկ փաթեթում միավորում են շուկայի ուսումնասիրությունը, ճարտարապետությունն ու բիզնես պլանավորումը։ | src/data.js | translations.expertiseText | — | editorial translation | reviewed; retained |
| THE NEXT | ՁԵՐ ՀԱՋՈՐԴ | src/data.js | translations.cta[0] | — | editorial translation | corrected |
| DEVELOPMENT | ԿԱՌՈՒՑԱՊԱՏՈՒՄԸ | src/data.js | translations.cta[1] | — | editorial translation | corrected |
| STARTS HERE. | ՍԿՍՎՈՒՄ Է ԱՅՍՏԵՂ։ | src/data.js | translations.cta[2] | — | editorial translation | reviewed; retained |
| Let’s explore the potential of your next real estate project. | Բացահայտենք ձեր հաջորդ անշարժ գույքի նախագծի ներուժը։ | src/data.js | translations.ctaText | — | editorial translation | reviewed; retained |
| Let’s Discuss Your Project | Քննարկենք ձեր նախագիծը | src/data.js | translations.discuss | — | editorial translation | reviewed; retained |
| Learn More | Իմանալ ավելին | src/data.js | translations.learn | — | editorial translation | reviewed; retained |
| Before | Մինչև | src/data.js | translations.before | — | editorial translation | reviewed; retained |
| After | Հետո | src/data.js | translations.after | — | editorial translation | reviewed; retained |
| Explore Package | Դիտել փաթեթը | src/data.js | translations.package | — | editorial translation | reviewed; retained |
| Explore Project | Դիտել նախագիծը | src/data.js | translations.exploreProject | — | editorial translation | reviewed; retained |
| Let’s build a conversation. | Սկսենք զրույցը։ | src/data.js | translations.contact | — | editorial translation | reviewed; retained |
| January | հունվարի | src/data.js | translations.months[0] | — | editorial translation | reviewed; retained |
| February | փետրվարի | src/data.js | translations.months[1] | — | editorial translation | reviewed; retained |
| March | մարտի | src/data.js | translations.months[2] | — | editorial translation | reviewed; retained |
| April | ապրիլի | src/data.js | translations.months[3] | — | editorial translation | reviewed; retained |
| May | մայիսի | src/data.js | translations.months[4] | — | editorial translation | reviewed; retained |
| June | հունիսի | src/data.js | translations.months[5] | — | editorial translation | reviewed; retained |
| July | հուլիսի | src/data.js | translations.months[6] | — | editorial translation | reviewed; retained |
| August | օգոստոսի | src/data.js | translations.months[7] | — | editorial translation | reviewed; retained |
| September | սեպտեմբերի | src/data.js | translations.months[8] | — | editorial translation | reviewed; retained |
| October | հոկտեմբերի | src/data.js | translations.months[9] | — | editorial translation | reviewed; retained |
| November | նոյեմբերի | src/data.js | translations.months[10] | — | editorial translation | reviewed; retained |
| December | դեկտեմբերի | src/data.js | translations.months[11] | — | editorial translation | reviewed; retained |
| Sculptural contemporary architecture among trees | Ժամանակակից ճարտարապետություն ծառերի միջավայրում | src/data.js | translations.introImage | — | editorial translation | reviewed; retained |
| Architectural facade and urban streetscape | Ճարտարապետական ճակատ և քաղաքային փողոց | src/data.js | translations.introDetailImage | — | editorial translation | reviewed; retained |
| Our Approach | Մեր մոտեցումը | src/data.js | translations.approachLabel | — | editorial translation | reviewed; retained |
| End-to-end Development | Կառուցապատման համալիր ուղեկցում | src/data.js | translations.serviceLabel | — | editorial translation | corrected |
| Development Packages | Կառուցապատման նախագծերի փաթեթներ | src/data.js | translations.packageLabel | — | editorial translation | corrected |
| Selected Portfolio | Ընտրված նախագծեր | src/data.js | translations.projectLabel | — | editorial translation | corrected |
| The Development Journey | Կառուցապատման գործընթացը | src/data.js | translations.processLabel | — | editorial translation | corrected |
| Implementing Companies | Փաթեթներն իրականացնող ընկերություններ | src/data.js | translations.expertiseLabel | — | editorial translation | corrected |
| Your Next Project | Ձեր հաջորդ նախագիծը | src/data.js | translations.nextLabel | — | editorial translation | reviewed; retained |
| Scroll to discover | Ոլորեք՝ ավելին բացահայտելու համար | src/data.js | translations.scroll | — | editorial translation | corrected |
| From possibility to perspective | Հնարավորությունից դեպի տեսլական | src/data.js | translations.perspective | — | editorial translation | reviewed; retained |
| Illustrative development vision | Կառուցապատման պատկերավոր տեսլական | src/data.js | translations.illustrative | — | editorial translation | corrected |
| A considered perspective. | Կշռադատված տեսլական։ | src/data.js | translations.caption | — | editorial translation | corrected |
| Intelligence. Architecture. Strategy. | Գիտելիք։ Ճարտարապետություն։ Ռազմավարություն։ | src/data.js | translations.serviceCaption | — | editorial translation | reviewed; retained |
| from | սկսած | src/data.js | translations.from | — | editorial translation | reviewed; retained |
| AMD | դրամ | src/data.js | translations.currency | — | editorial translation | reviewed; retained |
| Reference construction area | Կառուցապատման հաշվարկային մակերես | src/data.js | translations.referenceArea | — | editorial translation | reviewed; retained |
| 1,200–1,500 m² | 1 200–1 500 մ² | src/data.js | translations.area | — | editorial translation | corrected |
| Published reference prices for 1,200–1,500 m² of construction area. Confirm the final scope and commercial offer with the team. | Հրապարակված հաշվարկային գներ՝ 1 200–1 500 մ² կառուցապատման մակերեսի համար։ Նախաներդրումային փաթեթի համար նշված է փաթեթի գինը, մյուսների համար՝ մեկնարկային գներ։ Ծառայությունների վերջնական ծավալն ու առևտրային առաջարկը ճշտեք թիմի հետ։ | src/data.js | translations.pricingNote | — | editorial translation | corrected |
| Published package price | Փաթեթի հրապարակված արժեք | src/data.js | translations.fixedPrice | — | editorial translation | reviewed; retained |
| Published starting price | Հրապարակված մեկնարկային արժեք | src/data.js | translations.startingPrice | — | editorial translation | reviewed; retained |
| View all projects | Դիտել բոլոր նախագծերը | src/data.js | translations.allProjects | — | editorial translation | reviewed; retained |
| View project | Դիտել նախագիծը | src/data.js | translations.viewProject | — | editorial translation | reviewed; retained |
| Project navigation | Նախագծերի նավարկում | src/data.js | translations.projectNavigation | — | editorial translation | reviewed; retained |
| Scroll to explore | Ոլորեք՝ նախագծերը դիտելու համար | src/data.js | translations.scrollProjects | — | editorial translation | corrected |
| Drag or use the arrows to explore | Քաշեք կամ օգտագործեք սլաքները՝ նախագծերը դիտելու համար | src/data.js | translations.dragProjects | — | editorial translation | corrected |
| Swipe to explore | Սահեցրեք՝ նախագծերը դիտելու համար | src/data.js | translations.swipeProjects | — | editorial translation | corrected |
| Architectural work featured on Prospect24’s official website. | Prospect24-ի պաշտոնական կայքում ներկայացված ճարտարապետական աշխատանքներ։ | src/data.js | translations.portfolioNote | — | editorial translation | reviewed; retained |
| Portfolio reference | Պորտֆոլիոյում ներկայացված աշխատանք | src/data.js | translations.selected | — | editorial translation | corrected |
| Published architectural imagery | Հրապարակված ճարտարապետական պատկերներ | src/data.js | translations.projectSource | — | editorial translation | corrected |
| Portfolio imagery does not establish that Prospect24 developed or delivered the project. The source does not specify completion status or commercial results. | Պորտֆոլիոյի պատկերները չեն հաստատում, որ Prospect24-ը կառուցապատել կամ իրականացրել է նախագիծը։ Աղբյուրը չի նշում ավարտի կարգավիճակ կամ առևտրային արդյունքներ։ | src/data.js | translations.projectLimit | — | editorial translation | reviewed; retained |
| View official portfolio | Դիտել պաշտոնական պորտֆոլիոն | src/data.js | translations.sourceProject | — | editorial translation | reviewed; retained |
| Discuss Your Project | Քննարկեք ձեր նախագիծը | src/data.js | translations.similar | — | editorial translation | reviewed; retained |
| An overview of how the services connect. The scope and sequence are agreed for each project. | Ծառայությունների փոխկապակցման ընդհանուր նկարագիր։ Ծավալն ու հերթականությունը համաձայնեցվում են յուրաքանչյուր նախագծի համար։ | src/data.js | translations.processNote | — | editorial translation | reviewed; retained |
| Partner network | Գործընկերների ցանց | src/data.js | translations.network | — | editorial translation | corrected |
| Organizations listed in the official Prospect24 partner network, across finance, architecture, materials and interiors. | Prospect24-ի պաշտոնական գործընկերների ցանկում ընդգրկված կազմակերպություններ՝ ֆինանսների, ճարտարապետության, նյութերի և ինտերիերի ոլորտներից։ | src/data.js | translations.networkText | — | editorial translation | reviewed; retained |
| View all 30 partners | Դիտել բոլոր 30 գործընկերներին | src/data.js | translations.allPartners | — | editorial translation | reviewed; retained |
| Inclusion reflects the published partner list; the nature of each relationship may differ. | Ներկայացված է հրապարակված ցանկը․ համագործակցության բնույթը կարող է տարբեր լինել։ | src/data.js | translations.networkNote | — | editorial translation | reviewed; retained |
| Signed | Ստորագրվել է | src/data.js | translations.signed | — | editorial translation | reviewed; retained |
| Published | Հրապարակվել է | src/data.js | translations.published | — | editorial translation | reviewed; retained |
| Read original article | Կարդալ սկզբնաղբյուրը | src/data.js | translations.article | — | editorial translation | reviewed; retained |
| Cooperation & Media | Համագործակցություն և մեդիա | src/data.js | translations.newsLabel | — | editorial translation | reviewed; retained |
| WORKING TOGETHER. | ՀԱՄԱՏԵՂ ԱՇԽԱՏԱՆՔ։ | src/data.js | translations.newsTitle[0] | — | editorial translation | reviewed; retained |
| Published agreements and conversations about the development process. | Հրապարակված համաձայնագրեր և քննարկումներ՝ կառուցապատման գործընթացի մասին։ | src/data.js | translations.newsIntro | — | editorial translation | reviewed; retained |
| Conversations on Dignisi News | Զրույցներ Dignisi News-ում | src/data.js | translations.mediaTitle | — | editorial translation | reviewed; retained |
| Armenian-language interviews | Հայերեն հարցազրույցներ | src/data.js | translations.mediaLanguage | — | editorial translation | reviewed; retained |
| Watch on YouTube | Դիտել YouTube-ում | src/data.js | translations.watch | — | editorial translation | reviewed; retained |
| Compare packages. | Համեմատեք փաթեթները։ | src/data.js | translations.compareTitle | — | editorial translation | reviewed; retained |
| Start with feasibility, develop the concept, or prepare detailed documentation. Each level expands the work before it. | Սկսեք իրագործելիության գնահատումից, մշակեք հայեցակարգը կամ պատրաստեք մանրամասն փաստաթղթերը։ Յուրաքանչյուր փաթեթ ընդլայնում է նախորդի շրջանակում կատարվող աշխատանքները։ | src/data.js | translations.compareIntro | — | editorial translation | corrected |
| View Details | Դիտել մանրամասները | src/data.js | translations.viewDetails | — | editorial translation | reviewed; retained |
| View published scope | Դիտել հրապարակված ծառայությունների ցանկը | src/data.js | translations.sourceScope | — | editorial translation | corrected |
| What is included | Ինչ է ներառված | src/data.js | translations.scopeTitle | — | editorial translation | reviewed; retained |
| The groups below show the combined scope of this package. | Ստորև ներկայացված են այս փաթեթի բոլոր ծառայությունները՝ ներառյալ նախորդ փաթեթներից ներառվածները։ | src/data.js | translations.inherited | — | editorial translation | corrected |
| Explore | Բացահայտեք | src/data.js | translations.exploreFooter | — | editorial translation | reviewed; retained |
| Start a conversation | Սկսենք զրույցը | src/data.js | translations.conversation | — | editorial translation | reviewed; retained |
| Client presentation | Հաճախորդի ներկայացման տարբերակ | src/data.js | translations.prototype | — | editorial translation | reviewed; retained |
| Privacy Policy | Գաղտնիության քաղաքականություն | src/data.js | translations.privacy | — | editorial translation | corrected |
| Terms of Use | Օգտագործման պայմաններ | src/data.js | translations.terms | — | editorial translation | reviewed; retained |
| Presentation Information | Ներկայացման մասին | src/data.js | translations.legalLabel | — | editorial translation | reviewed; retained |
| This presentation has no analytics, tracking cookies, accounts or enquiry database. External article and video links open third-party websites. | Ներկայացման այս տարբերակը չունի վերլուծական գործիքներ, հետևող քուքիներ, հաշիվներ կամ հարցումների տվյալների բազա։ Արտաքին հոդվածներն ու տեսանյութերը բացվում են երրորդ կողմերի կայքերում։ | src/data.js | translations.privacyCopy[0] | — | editorial translation | reviewed; retained |
| The form opens a draft in your email application. The website does not submit or store the enquiry. Your email provider’s terms apply when you send it. | Ձևը բացում է սևագիր ձեր էլեկտրոնային փոստի հավելվածում։ Կայքը չի ուղարկում կամ պահպանում հարցումը։ Ուղարկելիս գործում են ձեր էլեկտրոնային փոստի մատակարարի պայմանները։ | src/data.js | translations.privacyCopy[1] | — | editorial translation | reviewed; retained |
| This notice describes the presentation only. A production privacy policy requires client approval. | Այս տեղեկությունը վերաբերում է միայն ներկայացմանը։ Գործարկվող կայքի գաղտնիության քաղաքականությունը պետք է հաստատվի պատվիրատուի կողմից։ | src/data.js | translations.privacyCopy[2] | — | editorial translation | corrected |
| This is a client presentation of Prospect24’s services using published business information. | Սա Prospect24-ի ծառայությունների՝ հրապարակված գործարար տեղեկությունների վրա հիմնված ներկայացման տարբերակն է։ | src/data.js | translations.termsCopy[0] | — | editorial translation | reviewed; retained |
| Prices are published reference prices and require commercial confirmation. Portfolio imagery does not establish project completion. The hero comparison is illustrative. Permits, investment and financial outcomes are not guaranteed. | Գները հրապարակված հաշվարկային արժեքներ են և պահանջում են առևտրային ճշտում։ Պորտֆոլիոյի պատկերները չեն հաստատում նախագծի ավարտը։ Գլխավոր համեմատությունը պատկերավոր օրինակ է։ Թույլտվությունների ստացումը, ներդրումների ներգրավումն ու ֆինանսական արդյունքները երաշխավորված չեն։ | src/data.js | translations.termsCopy[1] | — | editorial translation | corrected |
| Production legal terms require client approval before launch. | Մինչև գործարկումը անհրաժեշտ է պատվիրատուի կողմից հաստատել օգտագործման իրավական պայմանները։ | src/data.js | translations.termsCopy[2] | — | editorial translation | reviewed; retained |
| Share the location, your idea and the decision you are preparing to make. | Նշեք տեղանքը, ձեր գաղափարը և այն որոշումը, որին պատրաստվում եք։ | src/data.js | translations.contactIntro | — | editorial translation | reviewed; retained |
| Name and surname | Անուն, ազգանուն | src/data.js | translations.name | — | editorial translation | reviewed; retained |
| Email address | Էլ․ հասցե | src/data.js | translations.emailLabel | — | editorial translation | reviewed; retained |
| Phone (optional) | Հեռախոսահամար (ըստ ցանկության) | src/data.js | translations.phoneLabel | — | editorial translation | reviewed; retained |
| Package of interest | Հետաքրքրող փաթեթ | src/data.js | translations.packageSelect | — | editorial translation | reviewed; retained |
| Help me choose | Օգնեք ընտրել | src/data.js | translations.undecided | — | editorial translation | reviewed; retained |
| Your project | Ձեր նախագիծը | src/data.js | translations.message | — | editorial translation | reviewed; retained |
| Location, idea, or the decision ahead… | Տեղանքը, գաղափարը կամ առաջիկա որոշումը… | src/data.js | translations.messagePlaceholder | — | editorial translation | reviewed; retained |
| Prepare Email | Պատրաստել նամակը | src/data.js | translations.prepareEmail | — | editorial translation | reviewed; retained |
| Opens a draft in your email app. This website does not send or store your enquiry. | Բացում է սևագիր ձեր փոստի հավելվածում։ Կայքը չի ուղարկում կամ պահպանում հարցումը։ | src/data.js | translations.draftNote | — | editorial translation | reviewed; retained |
| Email draft requested. If your mail app did not open, contact us directly below. | Նամակի սևագիրը բացելու հարցումն ուղարկված է։ Եթե փոստի հավելվածը չի բացվել, կապվեք ստորև նշված տվյալներով։ | src/data.js | translations.draftReady | — | editorial translation | reviewed; retained |
| Skip to content | Անցնել բովանդակությանը | src/data.js | translations.skip | — | editorial translation | reviewed; retained |
| Main navigation | Հիմնական նավարկում | src/data.js | translations.mainNav | — | editorial translation | reviewed; retained |
| Footer navigation | Ստորին նավարկում | src/data.js | translations.footerNav | — | editorial translation | reviewed; retained |
| Open navigation menu | Բացել ընտրացանկը | src/data.js | translations.openMenu | — | editorial translation | reviewed; retained |
| Close navigation menu | Փակել ընտրացանկը | src/data.js | translations.closeMenu | — | editorial translation | reviewed; retained |
| Site navigation | Կայքի նավարկում | src/data.js | translations.siteNav | — | editorial translation | reviewed; retained |
| Close dialog | Փակել պատուհանը | src/data.js | translations.closeDialog | — | editorial translation | reviewed; retained |
| Back to top | Վերադառնալ վերև | src/data.js | translations.backTop | — | editorial translation | reviewed; retained |
| Previous project | Նախորդ նախագիծ | src/data.js | translations.previousProject | — | editorial translation | reviewed; retained |
| Next project | Հաջորդ նախագիծ | src/data.js | translations.nextProject | — | editorial translation | reviewed; retained |
| Illustrative before and after comparison | Կառուցապատումից առաջ և հետո՝ պատկերավոր համեմատություն | src/data.js | translations.slider | — | editorial translation | reviewed; retained |
| before development | մինչև կառուցապատումը | src/data.js | translations.beforeValue | — | editorial translation | reviewed; retained |
| Language | Լեզու | src/data.js | translations.language | — | editorial translation | reviewed; retained |
| Prospect24 home | Prospect24 գլխավոր էջ | src/data.js | translations.logoHome | — | editorial translation | reviewed; retained |
| Prospect24 — Build with vision. Invest with clarity. | Prospect24 — Կառուցեք տեսլականով։ Ներդրեք հիմնավորված որոշմամբ։ | src/data.js | translations.documentTitle | — | editorial translation | new |
| Prospect24 — Real Estate Development & Investment Advisory. An interactive homepage design prototype. | Prospect24 — անշարժ գույքի զարգացում և ներդրումային խորհրդատվություն։ Գլխավոր էջի ինտերակտիվ նախատիպ։ | src/data.js | translations.metaDescription | — | editorial translation | new |
| Project enquiry — Prospect24 | Նախագծի վերաբերյալ հարցում — Prospect24 | src/data.js | translations.enquirySubject | — | editorial translation | new |
| Please complete this field. | Խնդրում ենք լրացնել այս դաշտը։ | src/data.js | translations.requiredField | — | editorial translation | new |
| Please enter a valid email address. | Խնդրում ենք մուտքագրել վավեր էլ․ հասցե։ | src/data.js | translations.invalidEmail | — | editorial translation | new |
| you@company.com | օրինակ՝ you@company.com | src/data.js | translations.emailPlaceholder | — | editorial translation | new |
| Pre-Investment Package | Նախաներդրումային փաթեթ | src/data.js | packages[0].name | https://prospect24.am/investment-packages/ | verified | reviewed; retained |
| Evaluate a site before committing to development. | Գնահատեք տարածքը՝ նախքան կառուցապատման որոշումը։ | src/data.js | packages[0].description | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Bring location research, an initial planning concept and financial forecasts together to assess a development opportunity. | Տեղանքի ուսումնասիրությունը, նախնական ճարտարապետական լուծումները և ֆինանսական կանխատեսումները միավորվում են՝ կառուցապատման հնարավորությունը գնահատելու համար։ | src/data.js | packages[0].detail | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Market & location research | Շուկայի և տեղանքի ուսումնասիրություն | src/data.js | packages[0].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Preliminary architectural planning | Նախնական ճարտարապետական պլանավորում | src/data.js | packages[0].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year financial forecasts | Հնգամյա ֆինանսական կանխատեսումներ | src/data.js | packages[0].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| The starting point | Մեկնարկային փաթեթ | src/data.js | packages[0].inheritance | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Site research and pricing recommendations | Տեղանքի ուսումնասիրություն և գնային առաջարկներ | src/data.js | packages[0].comparison[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Master-plan concept, parking and typical-floor zoning | Գլխավոր հատակագծի սխեմա, կայանատեղի և տիպային հարկի զոնավորում | src/data.js | packages[0].comparison[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year forecasts and break-even analysis | Հնգամյա կանխատեսումներ և ինքնածախսածածկման հաշվարկ | src/data.js | packages[0].comparison[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Market & location research | Շուկայի և տեղանքի ուսումնասիրություն | src/data.js | packages[0].scope[0].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Selected location and surrounding infrastructure assessment. | Ընտրված տարածքի և հարակից ենթակառուցվածքների գնահատում։ | src/data.js | packages[0].scope[0].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Nearby residential developments: apartment sizes, pricing and building classification. | Հարակից բնակելի շենքերի, բնակարանների մակերեսների ու գների ուսումնասիրություն և շենքի դասակարգում։ | src/data.js | packages[0].scope[0].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Recommendations informed by Dignisi sales data, including landscaping and green-space opportunities. | Dignisi-ի վաճառքի տվյալների հիման վրա առաջարկներ, ներառյալ կանաչապատման և բարեկարգման հնարավորությունները։ | src/data.js | packages[0].scope[0].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Preliminary architectural planning | Նախնական ճարտարապետական պլանավորում | src/data.js | packages[0].scope[1].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Master-plan concept considering planning regulations, fire safety and insolation requirements. | Գլխավոր հատակագծի սխեմա՝ հաշվի առնելով կառուցապատման դրույթները, հակահրդեհային և ինսոլյացիոն նորմերը։ | src/data.js | packages[0].scope[1].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Initial underground parking arrangements and typical-floor zoning. | Ստորգետնյա ավտոկայանատեղիի նախնական սխեմա և տիպային հարկի զոնավորում։ | src/data.js | packages[0].scope[1].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Apartment layout considerations, including depth and number of windows. | Բնակարանների հատակագծային չափորոշիչներ՝ խորություն և պատուհանների քանակ։ | src/data.js | packages[0].scope[1].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year financial forecasting | Հնգամյա ֆինանսական կանխատեսումներ | src/data.js | packages[0].scope[2].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Investment plan over five years. | Ներդրումային պլան՝ հինգ տարվա կտրվածքով։ | src/data.js | packages[0].scope[2].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Cash-flow and financial performance forecasts: monthly in year one, annually in years two to five. | Դրամական միջոցների հոսքերի և ֆինանսական արդյունքների կանխատեսումներ՝ առաջին տարվա համար ամսական, երկրորդից հինգերորդ տարիների համար՝ տարեկան կտրվածքով։ | src/data.js | packages[0].scope[2].items[1] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Financial indicators and break-even calculations. | Ֆինանսական ցուցանիշների և ինքնածախսածածկման հաշվարկներ։ | src/data.js | packages[0].scope[2].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Development Package | Զարգացման փաթեթ | src/data.js | packages[1].name | https://prospect24.am/investment-packages/ | verified | reviewed; retained |
| Develop the architectural concept and business model. | Մշակեք ճարտարապետական հայեցակարգն ու բիզնես մոդելը։ | src/data.js | packages[1].description | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Extend the initial feasibility work with deeper market analysis, architectural layouts and a defined business model. | Իրագործելիության նախնական գնահատումը լրացվում է շուկայի խորացված վերլուծությամբ, ճարտարապետական հատակագծերով և բիզնես մոդելով։ | src/data.js | packages[1].detail | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Expanded market analysis | Շուկայի ընդլայնված վերլուծություն | src/data.js | packages[1].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Architectural layouts & model | Հատակագծեր և սխեմատիկ մոդել | src/data.js | packages[1].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Business-model development | Բիզնես մոդելի մշակում | src/data.js | packages[1].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Includes the Pre-Investment Package | Ներառում է Նախաներդրումային փաթեթը | src/data.js | packages[1].inheritance | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Adds district trends, transactions and price changes | Ավելանում են վարչական շրջանների շուկայական միտումների, գործարքների և գնային փոփոխությունների տվյալները | src/data.js | packages[1].comparison[0] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Adds floor layouts, roads, schematic model and section | Ավելանում են հարկերի հատակագծերը, ճանապարհները, սխեմատիկ մոդելն ու կտրվածքը | src/data.js | packages[1].comparison[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Retains forecasts; adds a business model | Կանխատեսումները լրացվում են բիզնես մոդելով | src/data.js | packages[1].comparison[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Expanded market analysis | Շուկայի ընդլայնված վերլուծություն | src/data.js | packages[1].scope[0].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Location, infrastructure, nearby developments, apartment sizes and pricing, building classification and landscaping recommendations. | Տեղանքի, ենթակառուցվածքների, հարակից կառուցապատման, բնակարանների մակերեսների ու գների ուսումնասիրություն, շենքի դասակարգում և կանաչապատման առաջարկներ։ | src/data.js | packages[1].scope[0].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Real estate trends and apartment transaction distribution across Yerevan’s administrative districts. | Շուկայի միտումներ և Երևանում բնակարանների առքուվաճառքի գործարքների բաշխում՝ ըստ վարչական շրջանների։ | src/data.js | packages[1].scope[0].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Transport availability and relevant Dignisi sales data. | Տրանսպորտի հասանելիություն և Dignisi-ի համապատասխան վաճառքի տվյալներ։ | src/data.js | packages[1].scope[0].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Price-per-square-metre comparisons, percentage changes and analytical conclusions. | Քառակուսի մետրի գների համեմատություն, տոկոսային փոփոխություններ և վերլուծական եզրակացություններ։ | src/data.js | packages[1].scope[0].items[3] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Expanded architectural planning | Ընդլայնված ճարտարապետական պլանավորում | src/data.js | packages[1].scope[1].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Master-plan layout with roads and pathways, considering planning, fire safety and insolation requirements. | Գլխավոր հատակագծի սխեմա՝ ճանապարհներով և ուղիներով, հաշվի առնելով կառուցապատման, հակահրդեհային և ինսոլյացիոն նորմերը։ | src/data.js | packages[1].scope[1].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Ground-floor, typical-floor and underground parking layouts. | Առաջին ու տիպային հարկերի և ստորգետնյա ավտոկայանատեղիի հատակագծեր։ | src/data.js | packages[1].scope[1].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Schematic axonometric model in the existing environment and schematic section. | Սխեմատիկ աքսոնոմետրիկ մոդել՝ գոյություն ունեցող միջավայրում, և սխեմատիկ կտրվածք։ | src/data.js | packages[1].scope[1].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year financial forecasting | Հնգամյա ֆինանսական կանխատեսումներ | src/data.js | packages[1].scope[2].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Investment plan over five years. | Ներդրումային պլան՝ հինգ տարվա կտրվածքով։ | src/data.js | packages[1].scope[2].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Cash-flow and financial performance forecasts: monthly in year one, annually in years two to five. | Դրամական միջոցների հոսքերի և ֆինանսական արդյունքների կանխատեսումներ՝ առաջին տարվա համար ամսական, երկրորդից հինգերորդ տարիների համար՝ տարեկան կտրվածքով։ | src/data.js | packages[1].scope[2].items[1] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Financial indicators and break-even calculations. | Ֆինանսական ցուցանիշների և ինքնածախսածածկման հաշվարկներ։ | src/data.js | packages[1].scope[2].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Business model | Բիզնես մոդել | src/data.js | packages[1].scope[3].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Target-customer profiles and value proposition. | Թիրախային հաճախորդների նկարագիր և արժեքային առաջարկ։ | src/data.js | packages[1].scope[3].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Customer relationships, marketing and communication channels. | Հաճախորդների հետ հարաբերություններ, մարքեթինգային և հաղորդակցման ուղիներ։ | src/data.js | packages[1].scope[3].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Revenue streams, partners, key activities, resources and cost structure. | Եկամտի հոսքեր, գործընկերներ, հիմնական գործողություններ, ռեսուրսներ և ծախսերի կառուցվածք։ | src/data.js | packages[1].scope[3].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Investment Package | Ներդրումային փաթեթ | src/data.js | packages[2].name | https://prospect24.am/investment-packages/ | verified | reviewed; retained |
| Prepare detailed plans and a complete business case. | Պատրաստեք մանրամասն նախագիծն ու ամբողջական բիզնես պլանը։ | src/data.js | packages[2].description | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Combine expanded market research, detailed architecture and a full business plan. The published scope is intended for preparation to obtain the architectural planning assignment (APZ); approval is not guaranteed. | Միավորում է շուկայի ընդլայնված հետազոտությունը, մանրամասն ճարտարապետական փաստաթղթերն ու ամբողջական բիզնես պլանը։ Հրապարակված փաթեթը նախատեսված է ճարտարապետահատակագծային առաջադրանք (ՃՀԱ, APZ) ստանալուն նախապատրաստվելու համար․ հաստատումը երաշխավորված չէ։ | src/data.js | packages[2].detail | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Detailed architectural documentation | Մանրամասն ճարտարապետական փաստաթղթեր | src/data.js | packages[2].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Full business & financial plan | Ամբողջական բիզնես և ֆինանսական պլան | src/data.js | packages[2].items[1] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Risk assessment & mitigation | Ռիսկերի գնահատում և նվազեցում | src/data.js | packages[2].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Earlier research & business-model services included | Ներառում է նախորդ փուլերի ուսումնասիրություններն ու բիզնես մոդելի մշակման ծառայությունները | src/data.js | packages[2].inheritance | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Retains expanded market research | Պահպանվում է շուկայի ընդլայնված ուսումնասիրությունը | src/data.js | packages[2].comparison[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Adds detailed plans, facades and 3D visualizations for APZ preparation | Ավելանում են մանրամասն հատակագծեր, ճակատներ և 3D վիզուալիզացիաներ՝ ճարտարապետահատակագծային առաջադրանքի ստացմանը նախապատրաստվելու համար | src/data.js | packages[2].comparison[1] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Extends the business model into a full business plan with risk mitigation | Բիզնես մոդելը լրացվում է ամբողջական բիզնես պլանով և ռիսկերի նվազեցման միջոցառումներով | src/data.js | packages[2].comparison[2] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Expanded market analysis | Շուկայի ընդլայնված վերլուծություն | src/data.js | packages[2].scope[0].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Location, infrastructure, nearby developments, apartment sizes and pricing, building classification and landscaping recommendations. | Տեղանքի, ենթակառուցվածքների, հարակից կառուցապատման, բնակարանների մակերեսների ու գների ուսումնասիրություն, շենքի դասակարգում և կանաչապատման առաջարկներ։ | src/data.js | packages[2].scope[0].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Real estate trends and apartment transaction distribution across Yerevan’s administrative districts. | Շուկայի միտումներ և Երևանում բնակարանների առքուվաճառքի գործարքների բաշխում՝ ըստ վարչական շրջանների։ | src/data.js | packages[2].scope[0].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Transport availability and relevant Dignisi sales data. | Տրանսպորտի հասանելիություն և Dignisi-ի համապատասխան վաճառքի տվյալներ։ | src/data.js | packages[2].scope[0].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Price-per-square-metre comparisons, percentage changes and analytical conclusions. | Քառակուսի մետրի գների համեմատություն, տոկոսային փոփոխություններ և վերլուծական եզրակացություններ։ | src/data.js | packages[2].scope[0].items[3] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Detailed architectural documentation | Մանրամասն ճարտարապետական փաստաթղթեր | src/data.js | packages[2].scope[1].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Master plan; basement, ground-floor, typical and non-typical floor layouts; underground parking and roof plan. | Գլխավոր հատակագիծ, ստորգետնյա, առաջին, տիպային ու ոչ տիպային հարկերի, ավտոկայանատեղիի և տանիքի հատակագծեր։ | src/data.js | packages[2].scope[1].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Building sections, facades and 3D visualizations integrated into the existing surroundings. | Շենքի կտրվածքներ, ճակատներ և 3D վիզուալիզացիաներ՝ գոյություն ունեցող միջավայրում ներգծմամբ։ | src/data.js | packages[2].scope[1].items[1] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Excavation information where necessary; technical and economic indicators. | Փորվածքներ՝ անհրաժեշտության դեպքում, և տեխնիկատնտեսական ցուցանիշներ։ | src/data.js | packages[2].scope[1].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Planning, fire safety, insolation and apartment-layout considerations from the initial package. | Նախնական փաթեթի կառուցապատման, հակահրդեհային, ինսոլյացիոն և բնակարանների հատակագծման չափորոշիչներ։ | src/data.js | packages[2].scope[1].items[3] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year financial forecasting | Հնգամյա ֆինանսական կանխատեսումներ | src/data.js | packages[2].scope[2].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Investment plan over five years. | Ներդրումային պլան՝ հինգ տարվա կտրվածքով։ | src/data.js | packages[2].scope[2].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Cash-flow and financial performance forecasts: monthly in year one, annually in years two to five. | Դրամական միջոցների հոսքերի և ֆինանսական արդյունքների կանխատեսումներ՝ առաջին տարվա համար ամսական, երկրորդից հինգերորդ տարիների համար՝ տարեկան կտրվածքով։ | src/data.js | packages[2].scope[2].items[1] | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Financial indicators and break-even calculations. | Ֆինանսական ցուցանիշների և ինքնածախսածածկման հաշվարկներ։ | src/data.js | packages[2].scope[2].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Business model | Բիզնես մոդել | src/data.js | packages[2].scope[3].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Target-customer profiles and value proposition. | Թիրախային հաճախորդների նկարագիր և արժեքային առաջարկ։ | src/data.js | packages[2].scope[3].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Customer relationships, marketing and communication channels. | Հաճախորդների հետ հարաբերություններ, մարքեթինգային և հաղորդակցման ուղիներ։ | src/data.js | packages[2].scope[3].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Revenue streams, partners, key activities, resources and cost structure. | Եկամտի հոսքեր, գործընկերներ, հիմնական գործողություններ, ռեսուրսներ և ծախսերի կառուցվածք։ | src/data.js | packages[2].scope[3].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Full business plan | Ամբողջական բիզնես պլան | src/data.js | packages[2].scope[4].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Project presentation and construction-sector research. | Նախագծի ներկայացում և շինարարական ոլորտի հետազոտություն։ | src/data.js | packages[2].scope[4].items[0] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Marketing plan, operational plan and implementation schedule. | Մարքեթինգային ու գործառնական պլաններ և իրականացման ժամանակացույց։ | src/data.js | packages[2].scope[4].items[1] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year financial plan, risk assessment and mitigation measures. | Հնգամյա ֆինանսական պլան, ռիսկերի գնահատում և նվազեցման միջոցառումներ։ | src/data.js | packages[2].scope[4].items[2] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Presentation of the project-management team. | Նախագծի կառավարման թիմի ներկայացում։ | src/data.js | packages[2].scope[4].items[3] | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Market Research & Analysis | Շուկայի ուսումնասիրություն և վերլուծություն | src/data.js | services[0].title | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Location, competition, apartment pricing and market trends. | Տեղանք, մրցակցային միջավայր, բնակարանների գներ և շուկայի միտումներ։ | src/data.js | services[0].description | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Assess the site, surrounding infrastructure and nearby developments. Study apartment sizes, pricing and transaction trends, supported by relevant Dignisi sales data, to inform positioning and development recommendations. | Գնահատվում են տարածքը, ենթակառուցվածքներն ու հարակից կառուցապատումը։ Բնակարանների մակերեսները, գները և գործարքների միտումները՝ Dignisi-ի համապատասխան վաճառքի տվյալների հետ, օգնում են մշակել դիրքավորման և կառուցապատման առաջարկներ։ | src/data.js | services[0].detail | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Architectural development study | Կառուցապատման ճարտարապետական ուսումնասիրություն | src/data.js | services[0].imageLabel | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Architecture & Planning | Ճարտարապետություն և պլանավորում | src/data.js | services[1].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| From master-plan concepts to detailed architectural plans. | Գլխավոր հատակագծի հայեցակարգից մինչև մանրամասն նախագիծ։ | src/data.js | services[1].description | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Develop master plans, floor layouts and parking arrangements with planning, fire safety and insolation requirements in view. Depending on the package, the scope extends to building sections, facades, 3D visualizations and contextual integration. | Մշակվում են գլխավոր հատակագծեր, հարկերի և կայանատեղիների սխեմաներ՝ հաշվի առնելով կառուցապատման, հակահրդեհային և ինսոլյացիոն նորմերը։ Ըստ փաթեթի՝ ավելանում են կտրվածքներ, ճակատներ, 3D վիզուալիզացիաներ և միջավայրում ներգծում։ | src/data.js | services[1].detail | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Facade and architectural detail | Ճակատ և ճարտարապետական մանրամասներ | src/data.js | services[1].imageLabel | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Financial & Business Planning | Ֆինանսական և բիզնես պլանավորում | src/data.js | services[2].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Five-year forecasts, cash flow and business planning. | Հնգամյա կանխատեսումներ, դրամական միջոցների հոսքեր և բիզնես պլանավորում։ | src/data.js | services[2].description | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Build an investment plan, cash-flow and financial performance forecasts, financial indicators and break-even analysis. Broader packages add a business model, marketing and operational plans, and an implementation schedule. | Կազմվում են ներդրումային պլան, դրամական միջոցների հոսքերի և ֆինանսական արդյունքների կանխատեսումներ, ֆինանսական ցուցանիշների ու ինքնածախսածածկման հաշվարկներ։ Ընդլայնված փաթեթները ներառում են բիզնես մոդել, մարքեթինգային ու գործառնական պլաններ և ժամանակացույց։ | src/data.js | services[2].detail | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Financial planning and feasibility | Ֆինանսական պլանավորում և իրագործելիության գնահատում | src/data.js | services[2].imageLabel | https://prospect24.am/investment-packages/ | editorial translation | corrected |
| Investment Preparation | Ներդրումային նախապատրաստում | src/data.js | services[3].title | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Project documentation, business justification and risk review. | Նախագծային փաստաթղթեր, բիզնես հիմնավորում և ռիսկերի գնահատում։ | src/data.js | services[3].description | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Bring architectural documentation, financial and economic justification, and business planning into a coordinated project package. Identify risks and mitigation measures to support evaluation by prospective investors and the relevant authorities. | Ճարտարապետական փաստաթղթերը, ֆինանսատնտեսական հիմնավորումը և բիզնես պլանավորումը միավորվում են նախագծի փաթեթում։ Սահմանվում են ռիսկերն ու դրանց նվազեցման միջոցառումները՝ ներդրողների և համապատասխան մարմինների կողմից գնահատման համար։ | src/data.js | services[3].detail | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Investment analysis and preparation | Ներդրումային վերլուծություն և նախապատրաստում | src/data.js | services[3].imageLabel | https://prospect24.am/investment-packages/ | editorial translation | reviewed; retained |
| Garden Hill Residence | Garden Hill Residence | src/data.js | projects[0].name | https://prospect24.am/projects/ | verified | reviewed; retained |
| Residential portfolio | Բնակելի նախագծերի պորտֆոլիո | src/data.js | projects[0].category | https://prospect24.am/projects/ | editorial translation | reviewed; retained |
| Garden Hill Residence is featured in the official Prospect24 project gallery. This entry presents its published architectural imagery. | Garden Hill Residence-ը ներկայացված է Prospect24-ի պաշտոնական նախագծերի պատկերասրահում։ Այստեղ ցուցադրված է հրապարակված ճարտարապետական պատկերը։ | src/data.js | projects[0].description | https://prospect24.am/projects/ | editorial translation | reviewed; retained |
| Avet Avetisyan, 20 | Ավետ Ավետիսյան, 20 | src/data.js | projects[1].name | https://prospect24.am/projects/ | verified | reviewed; retained |
| Residential portfolio | Բնակելի նախագծերի պորտֆոլիո | src/data.js | projects[1].category | https://prospect24.am/projects/ | editorial translation | reviewed; retained |
| Listed as “Avet Avetisyan, 20” in the official project gallery. Presented as a portfolio reference, without a claim about delivery or completion. | Պաշտոնական պատկերասրահում ներկայացված է «Ավետ Ավետիսյան, 20» անվամբ։ Պորտֆոլիոյի այս օրինակը չի հաստատում նախագծի իրականացումը կամ ավարտը։ | src/data.js | projects[1].description | https://prospect24.am/projects/ | editorial translation | reviewed; retained |
| Khachaturian Architects | Khachaturian Architects | src/data.js | projects[2].name | https://prospect24.am/projects/ | verified | reviewed; retained |
| Architectural studio portfolio | Ճարտարապետական ստուդիայի պորտֆոլիո | src/data.js | projects[2].category | https://prospect24.am/projects/ | editorial translation | reviewed; retained |
| Architectural work published under the Khachaturian Architects label in Prospect24’s gallery. The source identifies the studio, without naming an individual development. | Prospect24-ի պատկերասրահում՝ Khachaturian Architects անվան ներքո հրապարակված ճարտարապետական աշխատանք։ Աղբյուրը նշում է ստուդիան՝ առանց առանձին կառուցապատման անվան։ | src/data.js | projects[2].description | https://prospect24.am/projects/ | editorial translation | reviewed; retained |
| DIGNISI LLC | DIGNISI ՍՊԸ | src/data.js | implementingCompanies[0].name | https://prospect24.am/companies/ | editorial translation | reviewed; retained |
| Market analysis, property pricing and sales insight from the primary market and resale of newly built properties. | Շուկայի վերլուծություն, անշարժ գույքի գնագոյացում և վաճառքի տվյալներ՝ առաջնային շուկայից ու նորակառույցների երկրորդային շուկայից։ | src/data.js | implementingCompanies[0].description | https://prospect24.am/companies/ | editorial translation | corrected |
| Real estate intelligence | Անշարժ գույքի շուկայի վերլուծություն | src/data.js | implementingCompanies[0].role | https://prospect24.am/companies/ | editorial translation | corrected |
| KHACHATURIAN ARCHITECTS | KHACHATURIAN ARCHITECTS | src/data.js | implementingCompanies[1].name | https://prospect24.am/companies/ | verified | reviewed; retained |
| Founded in 2012 by Arthur and Zhanna Khachaturyan. Planning and design for residential, mixed-use, hotel, office and interior projects. | Հիմնադրվել է 2012-ին՝ Արթուր և Ժաննա Խաչատուրյանների կողմից։ Բնակելի շենքերի, բազմաֆունկցիոնալ համալիրների, հյուրանոցների, գրասենյակային շենքերի և ինտերիերների նախագծում։ | src/data.js | implementingCompanies[1].description | https://prospect24.am/companies/ | editorial translation | corrected |
| Architecture & design | Ճարտարապետություն և դիզայն | src/data.js | implementingCompanies[1].role | https://prospect24.am/companies/ | editorial translation | reviewed; retained |
| BSC | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոն | src/data.js | implementingCompanies[2].name | https://prospect24.am/companies/ | verified | corrected |
| Business Support Center contributes business plans, strategy, financial and organizational planning, and business development expertise. | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոնը ներդնում է բիզնես պլանների կազմման, ռազմավարության մշակման, ֆինանսական ու կազմակերպական պլանավորման և բիզնեսի զարգացման իր փորձառությունը։ | src/data.js | implementingCompanies[2].description | https://prospect24.am/companies/ | editorial translation | corrected |
| Business & financial consulting | Բիզնես և ֆինանսական խորհրդատվություն | src/data.js | implementingCompanies[2].role | https://prospect24.am/companies/ | editorial translation | reviewed; retained |
| State property, considered as an investment opportunity. | Պետական գույքը՝ որպես ներդրումային հնարավորություն։ | src/data.js | news[0].title | https://prospect24.am/memorandum-of-cooperation/ | editorial translation | reviewed; retained |
| The State Property Management Committee and Prospect24 signed a memorandum to prepare investment packages for state property intended for disposal, covering development potential, market analysis, architecture and financial planning. | Պետական գույքի կառավարման կոմիտեն և Prospect24-ը ստորագրել են օտարման ենթակա պետական գույքի ներդրումային փաթեթների կազմման հուշագիր՝ ներառելով կառուցապատման ներուժը, շուկայի վերլուծությունը, ճարտարապետությունն ու ֆինանսական պլանավորումը։ | src/data.js | news[0].description | https://prospect24.am/memorandum-of-cooperation/ | editorial translation | corrected |
| State Property Management Committee | Պետական գույքի կառավարման կոմիտե | src/data.js | news[0].organization | https://prospect24.am/memorandum-of-cooperation/ | verified | reviewed; retained |
| Supporting the Chakhruk settlement initiative. | Աջակցություն «Ճախրուկ բնակուտ» բնակավայրի ստեղծման նախաձեռնությանը։ | src/data.js | news[1].title | https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/ | editorial translation | corrected |
| Chakhruk NGO and Prospect24 signed a memorandum supporting the proposed Chakhruk settlement initiative for people with special needs. | «Ճախրուկ» ՀԿ-ն և Prospect24-ը ստորագրել են հատուկ կարիքներ ունեցող անձանց համար առաջարկված «Ճախրուկ բնակուտ» նախաձեռնությանն աջակցելու հուշագիր։ | src/data.js | news[1].description | https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/ | editorial translation | corrected |
| Chakhruk NGO | «Ճախրուկ» ՀԿ | src/data.js | news[1].organization | https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/ | verified | reviewed; retained |
| Connecting property expertise and architecture. | Անշարժ գույքի և ճարտարապետության փորձի միավորում։ | src/data.js | news[2].title | https://prospect24.am/prospect24_archtects-palace/ | editorial translation | reviewed; retained |
| The Chamber of Architects of the RA and Prospect24 signed a memorandum to combine real estate knowledge with architectural design experience and technical capabilities. | ՀՀ ճարտարապետների պալատը և Prospect24-ը ստորագրել են հուշագիր՝ անշարժ գույքի ոլորտի փորձը ճարտարապետական նախագծման ու տեխնիկական կարողությունների հետ համադրելու համար։ | src/data.js | news[2].description | https://prospect24.am/prospect24_archtects-palace/ | editorial translation | reviewed; retained |
| Chamber of Architects of the RA | ՀՀ ճարտարապետների պալատ | src/data.js | news[2].organization | https://prospect24.am/prospect24_archtects-palace/ | verified | reviewed; retained |
| Cooperation rather than competition | Ոչ թե մրցակցել, այլ համագործակցել | src/data.js | videos[0].title | — | editorial translation | reviewed; retained |
| Preparing a property’s package from the beginning | Գույքը ի սկզբանե փաթեթավորվում է Prospect24-ի կողմից | src/data.js | videos[1].title | — | editorial translation | reviewed; retained |
| Discover | Ուսումնասիրել | src/data.js | stages[0].title | — | editorial translation | corrected |
| Define the site and objectives. | Հստակեցնել տարածքն ու նախագծի նպատակները։ | src/data.js | stages[0].text | — | editorial translation | corrected |
| Analyze | Վերլուծել | src/data.js | stages[1].title | — | editorial translation | reviewed; retained |
| Study the location and market. | Ուսումնասիրել տեղանքն ու շուկան։ | src/data.js | stages[1].text | — | editorial translation | reviewed; retained |
| Design | Նախագծել | src/data.js | stages[2].title | — | editorial translation | reviewed; retained |
| Develop the planning concept. | Մշակել կառուցապատման հայեցակարգը։ | src/data.js | stages[2].text | — | editorial translation | reviewed; retained |
| Evaluate | Գնահատել | src/data.js | stages[3].title | — | editorial translation | reviewed; retained |
| Model finances and assess risks. | Մոդելավորել ֆինանսական ցուցանիշներն ու գնահատել ռիսկերը։ | src/data.js | stages[3].text | — | editorial translation | corrected |
| Prepare | Նախապատրաստել | src/data.js | stages[4].title | — | editorial translation | reviewed; retained |
| Assemble the agreed package. | Կազմել համաձայնեցված փաթեթը։ | src/data.js | stages[4].text | — | editorial translation | reviewed; retained |
| About | Մեր մասին | src/data.js | navigation[0] | — | editorial translation | reviewed; retained |
| Packages | Փաթեթներ | src/data.js | navigation[1] | — | editorial translation | reviewed; retained |
| Projects | Նախագծեր | src/data.js | navigation[2] | — | editorial translation | reviewed; retained |
| Services | Ծառայություններ | src/data.js | navigation[3] | — | editorial translation | reviewed; retained |
| Expertise | Փորձառություն | src/data.js | navigation[4] | — | editorial translation | reviewed; retained |
| Partners | Գործընկերներ | src/data.js | navigation[5] | — | editorial translation | reviewed; retained |
| News & Media | Նորություններ և մեդիա | src/data.js | navigation[6] | — | editorial translation | corrected |
| Contact | Կապ | src/data.js | navigation[7] | — | editorial translation | reviewed; retained |
| 1/61 building, Azatutyan Avenue, Yerevan, Armenia | Հայաստան, Երևան, Ազատության պողոտա, 1/61 շենք | src/data.js | contact.location | https://prospect24.am/contact-us/ | verified | reviewed; retained |
| Image in this block | Պատկերն այս բլոկում | src/uiTranslations.js | uiText("Image in this block") | — | editorial translation | new |
| No image. Upload or choose an image to add one. | Պատկեր չկա։ Պատկեր ավելացնելու համար վերբեռնեք նորը կամ ընտրեք առկաներից։ | src/uiTranslations.js | uiText("No image. Upload or choose an image to add one.") | — | editorial translation | new |
| Add Image | Ավելացնել պատկեր | src/uiTranslations.js | uiText("Add Image") | — | editorial translation | new |
| Remove Image | Հեռացնել պատկերը | src/uiTranslations.js | uiText("Remove Image") | — | editorial translation | new |
| Edit Image Settings | Խմբագրել պատկերի կարգավորումները | src/uiTranslations.js | uiText("Edit Image Settings") | — | editorial translation | new |
| drag | քաշել | src/uiTranslations.js | uiText("drag") | — | editorial translation | new |
| Subtle | Նուրբ | src/uiTranslations.js | uiText("Subtle") | — | editorial translation | new |
| Before | Մինչև | src/uiTranslations.js | uiText("Before") | — | editorial translation | new |
| After | Հետո | src/uiTranslations.js | uiText("After") | — | editorial translation | new |
| carousel | նախագծերի սլայդեր | src/uiTranslations.js | uiText("carousel") | — | editorial translation | new |
| slide | սլայդ | src/uiTranslations.js | uiText("slide") | — | editorial translation | new |
| Design | Դիզայն | src/uiTranslations.js | uiText("Design") | — | editorial translation | new |
| Choose design | Ընտրել դիզայնը | src/uiTranslations.js | uiText("Choose design") | — | editorial translation | new |
| current | ընտրված | src/uiTranslations.js | uiText("current") | — | editorial translation | new |
| original | սկզբնական | src/uiTranslations.js | uiText("original") | — | editorial translation | new |
| Original Design | Սկզբնական դիզայն | src/uiTranslations.js | uiText("Original Design") | — | editorial translation | new |
| Original homepage colors | Գլխավոր էջի սկզբնական գույները | src/uiTranslations.js | uiText("Original homepage colors") | — | editorial translation | new |
| Original Prospect24 homepage | Prospect24-ի սկզբնական գլխավոր էջ | src/uiTranslations.js | uiText("Original Prospect24 homepage") | — | editorial translation | new |
| View original homepage ↗ | Դիտել սկզբնական գլխավոր էջը ↗ | src/uiTranslations.js | uiText("View original homepage ↗") | — | editorial translation | new |
| Client presentation / Color system exploration | Ներկայացում պատվիրատուին / Գունային համակարգերի ուսումնասիրություն | src/uiTranslations.js | uiText("Client presentation / Color system exploration") | — | editorial translation | new |
| Six palettes. | Վեց գունապնակ։ | src/uiTranslations.js | uiText("Six palettes.") | — | editorial translation | new |
| One architectural language. | Մեկ ճարտարապետական լեզու։ | src/uiTranslations.js | uiText("One architectural language.") | — | editorial translation | new |
| The same homepage, content and interactions. Explore six coordinated color systems, from neutral graphite to a controlled terracotta accent. | Նույն գլխավոր էջը, բովանդակությունն ու գործառույթները։ Ծանոթացեք վեց ներդաշնակ գունային համակարգերի՝ չեզոք գրաֆիտից մինչև զուսպ թրծակավագույն շեշտադրում։ | src/uiTranslations.js | uiText("The same homepage, content and interactions. Explore six coordinated color systems, from neutral graphite to a controlled terracotta accent.") | — | editorial translation | new |
| Architecture / Strategy / Real estate | Ճարտարապետություն / Ռազմավարություն / Անշարժ գույք | src/uiTranslations.js | uiText("Architecture / Strategy / Real estate") | — | editorial translation | new |
| BUILD WITH | ԿԱՌՈՒՑԵՔ | src/uiTranslations.js | uiText("BUILD WITH") | — | editorial translation | new |
| VISION. | ՏԵՍԼԱԿԱՆՈՎ։ | src/uiTranslations.js | uiText("VISION.") | — | editorial translation | new |
| INVEST WITH | ՆԵՐԴՐԵՔ | src/uiTranslations.js | uiText("INVEST WITH") | — | editorial translation | new |
| CLARITY. | ՀԻՄՆԱՎՈՐՎԱԾ ՈՐՈՇՄԱՄԲ։ | src/uiTranslations.js | uiText("CLARITY.") | — | editorial translation | new |
| Explore our expertise ↗ | Ծանոթացեք մեր փորձառությանը ↗ | src/uiTranslations.js | uiText("Explore our expertise ↗") | — | editorial translation | new |
| ONE VISION. | ՄԵԿ ՏԵՍԼԱԿԱՆ։ | src/uiTranslations.js | uiText("ONE VISION.") | — | editorial translation | new |
| MULTIPLE DISCIPLINES. | ԲԱԶՄԱԿՈՂՄ ՓՈՐՁԱՌՈՒԹՅՈՒՆ։ | src/uiTranslations.js | uiText("MULTIPLE DISCIPLINES.") | — | editorial translation | new |
| Architecture, strategy and real estate — connected. | Ճարտարապետություն, ռազմավարություն և անշարժ գույք՝ մեկ միասնական մոտեցմամբ։ | src/uiTranslations.js | uiText("Architecture, strategy and real estate — connected.") | — | editorial translation | new |
| DEVELOPMENT, | ԿԱՌՈՒՑԱՊԱՏՈՒՄ՝ | src/uiTranslations.js | uiText("DEVELOPMENT,") | — | editorial translation | new |
| FROM EVERY ANGLE. | ԲՈԼՈՐ ՏԵՍԱՆԿՅՈՒՆՆԵՐԻՑ։ | src/uiTranslations.js | uiText("FROM EVERY ANGLE.") | — | editorial translation | new |
| Prospect24 · Private design presentation · | Prospect24 · Դիզայնի մասնավոր ներկայացում · | src/uiTranslations.js | uiText("Prospect24 · Private design presentation ·") | — | editorial translation | new |
| Original homepage | Սկզբնական գլխավոր էջ | src/uiTranslations.js | uiText("Original homepage") | — | editorial translation | new |
| Color system exploration | Գունային համակարգերի ուսումնասիրություն | src/uiTranslations.js | uiText("Color system exploration") | — | editorial translation | new |
| Open design | Բացել դիզայնը | src/uiTranslations.js | uiText("Open design") | — | editorial translation | new |
| Graphite & Ivory | Գրաֆիտ և փղոսկրագույն | src/uiTranslations.js | uiText("Graphite & Ivory") | — | editorial translation | new |
| Modern, elegant, high contrast | Ժամանակակից, նրբագեղ, բարձր հակադրությամբ | src/uiTranslations.js | uiText("Modern, elegant, high contrast") | — | editorial translation | new |
| Stone & Forest | Քար և անտառ | src/uiTranslations.js | uiText("Stone & Forest") | — | editorial translation | new |
| Calm, premium, natural | Հանգիստ, բարձրակարգ, բնական | src/uiTranslations.js | uiText("Calm, premium, natural") | — | editorial translation | new |
| Slate & Ice | Թերթաքար և սառույց | src/uiTranslations.js | uiText("Slate & Ice") | — | editorial translation | new |
| Modern, trusted, professional | Ժամանակակից, վստահություն ներշնչող, մասնագիտական | src/uiTranslations.js | uiText("Modern, trusted, professional") | — | editorial translation | new |
| Espresso & Porcelain | Էսպրեսո և ճենապակի | src/uiTranslations.js | uiText("Espresso & Porcelain") | — | editorial translation | new |
| Warm, sophisticated, timeless | Ջերմ, նրբաճաշակ, ժամանակից անկախ | src/uiTranslations.js | uiText("Warm, sophisticated, timeless") | — | editorial translation | new |
| Sage & Charcoal | Եղեսպակ և ածխագույն | src/uiTranslations.js | uiText("Sage & Charcoal") | — | editorial translation | new |
| Natural, modern, refined | Բնական, ժամանակակից, նուրբ | src/uiTranslations.js | uiText("Natural, modern, refined") | — | editorial translation | new |
| White & Terracotta | Սպիտակ և թրծակավագույն | src/uiTranslations.js | uiText("White & Terracotta") | — | editorial translation | new |
| Clean, contemporary, distinctive | Հստակ, արդիական, ինքնատիպ | src/uiTranslations.js | uiText("Clean, contemporary, distinctive") | — | editorial translation | new |
| Enable Edit Mode | Միացնել խմբագրման ռեժիմը | src/uiTranslations.js | uiText("Enable Edit Mode") | — | editorial translation | new |
| Exit Edit Mode | Դուրս գալ խմբագրման ռեժիմից | src/uiTranslations.js | uiText("Exit Edit Mode") | — | editorial translation | new |
| Edit Mode | Խմբագրման ռեժիմ | src/uiTranslations.js | uiText("Edit Mode") | — | editorial translation | new |
| Customize this presentation | Հարմարեցնել այս ներկայացումը | src/uiTranslations.js | uiText("Customize this presentation") | — | editorial translation | new |
| Select anything on the canvas. Changes save on this browser. | Ընտրեք որևէ տարր աշխատանքային տարածքում։ Փոփոխությունները պահպանվում են այս դիտարկիչում։ | src/uiTranslations.js | uiText("Select anything on the canvas. Changes save on this browser.") | — | editorial translation | new |
| Original appearance restored. Undo is available. | Սկզբնական տեսքը վերականգնված է։ Կարող եք հետարկել փոփոխությունը։ | src/uiTranslations.js | uiText("Original appearance restored. Undo is available.") | — | editorial translation | new |
| Image saved in this browser. Export Project to share it. | Պատկերը պահպանված է այս դիտարկիչում։ Այն փոխանցելու համար արտահանեք նախագիծը։ | src/uiTranslations.js | uiText("Image saved in this browser. Export Project to share it.") | — | editorial translation | new |
| Settings exported. Custom images are only included in Export Project ZIP. | Կարգավորումներն արտահանված են։ Վերբեռնված պատկերները ներառվում են միայն նախագծի ZIP արտահանման մեջ։ | src/uiTranslations.js | uiText("Settings exported. Custom images are only included in Export Project ZIP.") | — | editorial translation | new |
| Project exported with all referenced custom images. | Նախագիծն արտահանված է՝ օգտագործված բոլոր վերբեռնված պատկերներով։ | src/uiTranslations.js | uiText("Project exported with all referenced custom images.") | — | editorial translation | new |
| A saved image is unavailable. Its original is shown; replace it or import its project ZIP. | Պահպանված պատկերը հասանելի չէ։ Ցուցադրված է սկզբնական պատկերը․ փոխարինեք այն կամ ներմուծեք նախագծի ZIP ֆայլը։ | src/uiTranslations.js | uiText("A saved image is unavailable. Its original is shown; replace it or import its project ZIP.") | — | editorial translation | new |
| Design editor | Դիզայնի խմբագրիչ | src/uiTranslations.js | uiText("Design editor") | — | editorial translation | new |
| Design studio | Դիզայնի ստուդիա | src/uiTranslations.js | uiText("Design studio") | — | editorial translation | new |
| Editing | Խմբագրում | src/uiTranslations.js | uiText("Editing") | — | editorial translation | new |
| Live preview | Ընթացիկ նախադիտում | src/uiTranslations.js | uiText("Live preview") | — | editorial translation | new |
| Preview device | Նախադիտման սարք | src/uiTranslations.js | uiText("Preview device") | — | editorial translation | new |
| Desktop | Համակարգիչ | src/uiTranslations.js | uiText("Desktop") | — | editorial translation | new |
| Tablet | Պլանշետ | src/uiTranslations.js | uiText("Tablet") | — | editorial translation | new |
| Mobile | Հեռախոս | src/uiTranslations.js | uiText("Mobile") | — | editorial translation | new |
| Layers | Շերտեր | src/uiTranslations.js | uiText("Layers") | — | editorial translation | new |
| Sections | Բաժիններ | src/uiTranslations.js | uiText("Sections") | — | editorial translation | new |
| Properties | Հատկություններ | src/uiTranslations.js | uiText("Properties") | — | editorial translation | new |
| Undo · Ctrl/Cmd+Z | Հետարկել · Ctrl/Cmd+Z | src/uiTranslations.js | uiText("Undo · Ctrl/Cmd+Z") | — | editorial translation | new |
| Undo | Հետարկել | src/uiTranslations.js | uiText("Undo") | — | editorial translation | new |
| Redo | Կրկնել | src/uiTranslations.js | uiText("Redo") | — | editorial translation | new |
| Reset All | Վերակայել բոլորը | src/uiTranslations.js | uiText("Reset All") | — | editorial translation | new |
| Export Project | Արտահանել նախագիծը | src/uiTranslations.js | uiText("Export Project") | — | editorial translation | new |
| Import | Ներմուծել | src/uiTranslations.js | uiText("Import") | — | editorial translation | new |
| Export | Արտահանել | src/uiTranslations.js | uiText("Export") | — | editorial translation | new |
| Save | Պահպանել | src/uiTranslations.js | uiText("Save") | — | editorial translation | new |
| Reset | Վերակայել | src/uiTranslations.js | uiText("Reset") | — | editorial translation | new |
| Preview | Նախադիտում | src/uiTranslations.js | uiText("Preview") | — | editorial translation | new |
| Return to editing | Վերադառնալ խմբագրմանը | src/uiTranslations.js | uiText("Return to editing") | — | editorial translation | new |
| Close editor | Փակել խմբագրիչը | src/uiTranslations.js | uiText("Close editor") | — | editorial translation | new |
| Exit editor | Դուրս գալ խմբագրիչից | src/uiTranslations.js | uiText("Exit editor") | — | editorial translation | new |
| Working… | Ընթացքի մեջ է… | src/uiTranslations.js | uiText("Working…") | — | editorial translation | new |
| Browser storage unavailable. Export Project to save your changes. | Դիտարկիչի պահոցը հասանելի չէ։ Փոփոխությունները պահպանելու համար արտահանեք նախագիծը։ | src/uiTranslations.js | uiText("Browser storage unavailable. Export Project to save your changes.") | — | editorial translation | new |
| Import design file | Ներմուծել դիզայնի ֆայլը | src/uiTranslations.js | uiText("Import design file") | — | editorial translation | new |
| Expand properties panel | Բացել հատկությունների վահանակը | src/uiTranslations.js | uiText("Expand properties panel") | — | editorial translation | new |
| Collapse properties panel | Ծալել հատկությունների վահանակը | src/uiTranslations.js | uiText("Collapse properties panel") | — | editorial translation | new |
| Editor panels | Խմբագրիչի վահանակներ | src/uiTranslations.js | uiText("Editor panels") | — | editorial translation | new |
| Section visibility | Բաժինների տեսանելիություն | src/uiTranslations.js | uiText("Section visibility") | — | editorial translation | new |
| Hide a section without deleting its content. | Թաքցրեք բաժինը՝ պահպանելով դրա բովանդակությունը։ | src/uiTranslations.js | uiText("Hide a section without deleting its content.") | — | editorial translation | new |
| Hidden with Expertise | Թաքցված է «Փորձառություն» բաժնի հետ | src/uiTranslations.js | uiText("Hidden with Expertise") | — | editorial translation | new |
| Make it yours | Հարմարեցրեք ձեր նախընտրությամբ | src/uiTranslations.js | uiText("Make it yours") | — | editorial translation | new |
| Select a section, image or text on the canvas to start designing. | Դիզայնի խմբագրումը սկսելու համար ընտրեք բաժին, պատկեր կամ տեքստ աշխատանքային տարածքում։ | src/uiTranslations.js | uiText("Select a section, image or text on the canvas to start designing.") | — | editorial translation | new |
| Browse layers | Դիտել շերտերը | src/uiTranslations.js | uiText("Browse layers") | — | editorial translation | new |
| Local to this browser | Պահպանվում է այս դիտարկիչում | src/uiTranslations.js | uiText("Local to this browser") | — | editorial translation | new |
| Export a project to share your design. | Դիզայնը փոխանցելու համար արտահանեք նախագիծը։ | src/uiTranslations.js | uiText("Export a project to share your design.") | — | editorial translation | new |
| ● Saved locally | ● Պահպանված է տեղային պահոցում | src/uiTranslations.js | uiText("● Saved locally") | — | editorial translation | new |
| Settings JSON | Կարգավորումների JSON ֆայլ | src/uiTranslations.js | uiText("Settings JSON") | — | editorial translation | new |
| Original presentation restored. Undo is available. | Սկզբնական ներկայացումը վերականգնված է։ Կարող եք հետարկել փոփոխությունը։ | src/uiTranslations.js | uiText("Original presentation restored. Undo is available.") | — | editorial translation | new |
| Prospect24 live design canvas | Prospect24-ի դիզայնի խմբագրման աշխատանքային տարածք | src/uiTranslations.js | uiText("Prospect24 live design canvas") | — | editorial translation | new |
| Restore original design? | Վերականգնե՞լ սկզբնական դիզայնը։ | src/uiTranslations.js | uiText("Restore original design?") | — | editorial translation | new |
| Restore all images, text, dimensions, styles and sections. You can undo this change. | Վերականգնել բոլոր սկզբնական պատկերները, տեքստերը, չափերը, ոճերն ու բաժինները։ Կարող եք հետարկել այս փոփոխությունը։ | src/uiTranslations.js | uiText("Restore all images, text, dimensions, styles and sections. You can undo this change.") | — | editorial translation | new |
| Cancel | Չեղարկել | src/uiTranslations.js | uiText("Cancel") | — | editorial translation | new |
| Restore original | Վերականգնել սկզբնականը | src/uiTranslations.js | uiText("Restore original") | — | editorial translation | new |
| Restore Original | Վերականգնել սկզբնականը | src/uiTranslations.js | uiText("Restore Original") | — | editorial translation | new |
| Auto | Ինքնաշխատ | src/uiTranslations.js | uiText("Auto") | — | editorial translation | new |
| Element properties | Տարրի հատկություններ | src/uiTranslations.js | uiText("Element properties") | — | editorial translation | new |
| Selected hierarchy | Ընտրված տարրի հիերարխիա | src/uiTranslations.js | uiText("Selected hierarchy") | — | editorial translation | new |
| Base / Desktop | Հիմնական / Համակարգիչ | src/uiTranslations.js | uiText("Base / Desktop") | — | editorial translation | new |
| Close properties | Փակել հատկությունները | src/uiTranslations.js | uiText("Close properties") | — | editorial translation | new |
| Base values apply to every screen unless overridden. | Հիմնական արժեքները կիրառվում են բոլոր էկրանների համար, եթե առանձին արժեքներ չեն սահմանվել։ | src/uiTranslations.js | uiText("Base values apply to every screen unless overridden.") | — | editorial translation | new |
| Text | Տեքստ | src/uiTranslations.js | uiText("Text") | — | editorial translation | new |
| Language | Լեզու | src/uiTranslations.js | uiText("Language") | — | editorial translation | new |
| English | Անգլերեն | src/uiTranslations.js | uiText("English") | — | editorial translation | new |
| Content | Բովանդակություն | src/uiTranslations.js | uiText("Content") | — | editorial translation | new |
| Text content | Տեքստային բովանդակություն | src/uiTranslations.js | uiText("Text content") | — | editorial translation | new |
| Restore original text | Վերականգնել սկզբնական տեքստը | src/uiTranslations.js | uiText("Restore original text") | — | editorial translation | new |
| Image source | Պատկերի աղբյուր | src/uiTranslations.js | uiText("Image source") | — | editorial translation | new |
| Selected image preview | Ընտրված պատկերի նախադիտում | src/uiTranslations.js | uiText("Selected image preview") | — | editorial translation | new |
| Upload New Image | Վերբեռնել նոր պատկեր | src/uiTranslations.js | uiText("Upload New Image") | — | editorial translation | new |
| Upload new image | Վերբեռնել նոր պատկեր | src/uiTranslations.js | uiText("Upload new image") | — | editorial translation | new |
| Choose Existing Image | Ընտրել առկա պատկերներից | src/uiTranslations.js | uiText("Choose Existing Image") | — | editorial translation | new |
| Project image gallery | Նախագծի պատկերասրահ | src/uiTranslations.js | uiText("Project image gallery") | — | editorial translation | new |
| JPG, PNG, WebP or AVIF · up to 12 MB. Stored on this browser. | JPG, PNG, WebP կամ AVIF · մինչև 12 ՄԲ։ Պահպանվում է այս դիտարկիչում։ | src/uiTranslations.js | uiText("JPG, PNG, WebP or AVIF · up to 12 MB. Stored on this browser.") | — | editorial translation | new |
| Before / After Settings | «Մինչև / Հետո» կարգավորումներ | src/uiTranslations.js | uiText("Before / After Settings") | — | editorial translation | new |
| Before Image | «Մինչև» պատկեր | src/uiTranslations.js | uiText("Before Image") | — | editorial translation | new |
| After Image | «Հետո» պատկեր | src/uiTranslations.js | uiText("After Image") | — | editorial translation | new |
| Overlay | Ծածկաշերտ | src/uiTranslations.js | uiText("Overlay") | — | editorial translation | new |
| Before / After Split | «Մինչև / Հետո» բաժանման դիրք | src/uiTranslations.js | uiText("Before / After Split") | — | editorial translation | new |
| Before image opacity | «Մինչև» պատկերի անթափանցիկություն | src/uiTranslations.js | uiText("Before image opacity") | — | editorial translation | new |
| After image opacity | «Հետո» պատկերի անթափանցիկություն | src/uiTranslations.js | uiText("After image opacity") | — | editorial translation | new |
| Show divider while editing | Ցուցադրել բաժանարարը խմբագրման ընթացքում | src/uiTranslations.js | uiText("Show divider while editing") | — | editorial translation | new |
| Restore comparison defaults | Վերականգնել համեմատության սկզբնական կարգավորումները | src/uiTranslations.js | uiText("Restore comparison defaults") | — | editorial translation | new |
| Synchronize image positioning | Համաժամեցնել պատկերների դիրքը | src/uiTranslations.js | uiText("Synchronize image positioning") | — | editorial translation | new |
| Comparison viewport dimensions | Համեմատության տեսադաշտի չափեր | src/uiTranslations.js | uiText("Comparison viewport dimensions") | — | editorial translation | new |
| Size & Dimensions | Չափեր | src/uiTranslations.js | uiText("Size & Dimensions") | — | editorial translation | new |
| Lock aspect ratio | Պահպանել կողմերի հարաբերակցությունը | src/uiTranslations.js | uiText("Lock aspect ratio") | — | editorial translation | new |
| Use Minimum height to give content room to grow. Auto height preserves the content flow. | Օգտագործեք «Նվազագույն բարձրություն» դաշտը՝ բովանդակության ընդլայնման համար տեղ թողնելու նպատակով։ Ինքնաշխատ բարձրությունը պահպանում է բովանդակության բնական դասավորությունը։ | src/uiTranslations.js | uiText("Use Minimum height to give content room to grow. Auto height preserves the content flow.") | — | editorial translation | new |
| Width stays within its grid column. Select the parent layout to change columns. | Լայնությունը սահմանափակվում է ցանցի սյունակով։ Սյունակները փոխելու համար ընտրեք ծնող դասավորությունը։ | src/uiTranslations.js | uiText("Width stays within its grid column. Select the parent layout to change columns.") | — | editorial translation | new |
| Both images share the Hero viewport. Use viewport dimensions to resize the comparison together. | Երկու պատկերներն ունեն գլխավոր հատվածի ընդհանուր տեսադաշտը։ Դրանց չափերը միասին փոխելու համար օգտագործեք տեսադաշտի չափերը։ | src/uiTranslations.js | uiText("Both images share the Hero viewport. Use viewport dimensions to resize the comparison together.") | — | editorial translation | new |
| This size is smaller than the content. Text remains visible. | Այս չափը փոքր է բովանդակությունից։ Տեքստը շարունակում է տեսանելի մնալ։ | src/uiTranslations.js | uiText("This size is smaller than the content. Text remains visible.") | — | editorial translation | new |
| Fit content automatically | Ինքնաշխատ հարմարեցնել բովանդակությանը | src/uiTranslations.js | uiText("Fit content automatically") | — | editorial translation | new |
| Image position | Պատկերի դիրք | src/uiTranslations.js | uiText("Image position") | — | editorial translation | new |
| Object fit | Պատկերի տեղավորում | src/uiTranslations.js | uiText("Object fit") | — | editorial translation | new |
| Cover | Ծածկել տարածքը | src/uiTranslations.js | uiText("Cover") | — | editorial translation | new |
| Contain | Տեղավորել ամբողջությամբ | src/uiTranslations.js | uiText("Contain") | — | editorial translation | new |
| Fill | Լցնել տարածքը | src/uiTranslations.js | uiText("Fill") | — | editorial translation | new |
| Horizontal position | Հորիզոնական դիրք | src/uiTranslations.js | uiText("Horizontal position") | — | editorial translation | new |
| Vertical position | Ուղղահայաց դիրք | src/uiTranslations.js | uiText("Vertical position") | — | editorial translation | new |
| Zoom | Մասշտաբ | src/uiTranslations.js | uiText("Zoom") | — | editorial translation | new |
| Reset Image Settings | Վերակայել պատկերի կարգավորումները | src/uiTranslations.js | uiText("Reset Image Settings") | — | editorial translation | new |
| Appearance | Արտաքին տեսք | src/uiTranslations.js | uiText("Appearance") | — | editorial translation | new |
| Text color | Տեքստի գույն | src/uiTranslations.js | uiText("Text color") | — | editorial translation | new |
| Overlay color | Ծածկաշերտի գույն | src/uiTranslations.js | uiText("Overlay color") | — | editorial translation | new |
| Background color | Ֆոնի գույն | src/uiTranslations.js | uiText("Background color") | — | editorial translation | new |
| Overlay opacity | Ծածկաշերտի անթափանցիկություն | src/uiTranslations.js | uiText("Overlay opacity") | — | editorial translation | new |
| Image opacity | Պատկերի անթափանցիկություն | src/uiTranslations.js | uiText("Image opacity") | — | editorial translation | new |
| Element opacity | Տարրի անթափանցիկություն | src/uiTranslations.js | uiText("Element opacity") | — | editorial translation | new |
| Border radius | Անկյունների կլորացում | src/uiTranslations.js | uiText("Border radius") | — | editorial translation | new |
| Border width | Եզրագծի հաստություն | src/uiTranslations.js | uiText("Border width") | — | editorial translation | new |
| Border color | Եզրագծի գույն | src/uiTranslations.js | uiText("Border color") | — | editorial translation | new |
| Shadow | Ստվեր | src/uiTranslations.js | uiText("Shadow") | — | editorial translation | new |
| Low contrast ( | Ցածր հակադրություն ( | src/uiTranslations.js | uiText("Low contrast (") | — | editorial translation | new |
| :1). Aim for 4.5:1 for readable text. | :1)։ Տեքստի ընթեռնելիության համար ապահովեք առնվազն 4.5:1 հակադրություն։ | src/uiTranslations.js | uiText(":1). Aim for 4.5:1 for readable text.") | — | editorial translation | new |
| Typography | Տպագրություն | src/uiTranslations.js | uiText("Typography") | — | editorial translation | new |
| Font size | Տառաչափ | src/uiTranslations.js | uiText("Font size") | — | editorial translation | new |
| Line height | Տողերի բարձրություն | src/uiTranslations.js | uiText("Line height") | — | editorial translation | new |
| Spacing | Բացատներ | src/uiTranslations.js | uiText("Spacing") | — | editorial translation | new |
| Link sides | Կապակցել կողմերը | src/uiTranslations.js | uiText("Link sides") | — | editorial translation | new |
| Independent | Անկախ | src/uiTranslations.js | uiText("Independent") | — | editorial translation | new |
| Opposite sides | Հակադիր կողմերը | src/uiTranslations.js | uiText("Opposite sides") | — | editorial translation | new |
| All sides | Բոլոր կողմերը | src/uiTranslations.js | uiText("All sides") | — | editorial translation | new |
| Layout | Դասավորություն | src/uiTranslations.js | uiText("Layout") | — | editorial translation | new |
| Gap | Միջակայք | src/uiTranslations.js | uiText("Gap") | — | editorial translation | new |
| Column gap | Սյունակների միջակայք | src/uiTranslations.js | uiText("Column gap") | — | editorial translation | new |
| Row gap | Տողերի միջակայք | src/uiTranslations.js | uiText("Row gap") | — | editorial translation | new |
| Columns | Սյունակներ | src/uiTranslations.js | uiText("Columns") | — | editorial translation | new |
| One | Մեկ | src/uiTranslations.js | uiText("One") | — | editorial translation | new |
| Two | Երկու | src/uiTranslations.js | uiText("Two") | — | editorial translation | new |
| Three | Երեք | src/uiTranslations.js | uiText("Three") | — | editorial translation | new |
| Direction | Ուղղություն | src/uiTranslations.js | uiText("Direction") | — | editorial translation | new |
| Horizontal | Հորիզոնական | src/uiTranslations.js | uiText("Horizontal") | — | editorial translation | new |
| Vertical | Ուղղահայաց | src/uiTranslations.js | uiText("Vertical") | — | editorial translation | new |
| Vertical alignment | Ուղղահայաց հավասարեցում | src/uiTranslations.js | uiText("Vertical alignment") | — | editorial translation | new |
| Horizontal alignment | Հորիզոնական հավասարեցում | src/uiTranslations.js | uiText("Horizontal alignment") | — | editorial translation | new |
| Start | Սկիզբ | src/uiTranslations.js | uiText("Start") | — | editorial translation | new |
| Center | Կենտրոն | src/uiTranslations.js | uiText("Center") | — | editorial translation | new |
| End | Վերջ | src/uiTranslations.js | uiText("End") | — | editorial translation | new |
| Space between | Բաշխել եզրերի միջև | src/uiTranslations.js | uiText("Space between") | — | editorial translation | new |
| Space around | Բաշխել շուրջը | src/uiTranslations.js | uiText("Space around") | — | editorial translation | new |
| Cross-axis alignment | Լայնական առանցքով հավասարեցում | src/uiTranslations.js | uiText("Cross-axis alignment") | — | editorial translation | new |
| Stretch | Ձգել | src/uiTranslations.js | uiText("Stretch") | — | editorial translation | new |
| Select parent | Ընտրել ծնող տարրը | src/uiTranslations.js | uiText("Select parent") | — | editorial translation | new |
| Select card | Ընտրել քարտը | src/uiTranslations.js | uiText("Select card") | — | editorial translation | new |
| Select section | Ընտրել բաժինը | src/uiTranslations.js | uiText("Select section") | — | editorial translation | new |
| Reset Selected | Վերակայել ընտրվածը | src/uiTranslations.js | uiText("Reset Selected") | — | editorial translation | new |
| Reset Section | Վերակայել բաժինը | src/uiTranslations.js | uiText("Reset Section") | — | editorial translation | new |
| Hide section | Թաքցնել բաժինը | src/uiTranslations.js | uiText("Hide section") | — | editorial translation | new |
| Hidden | Թաքցված | src/uiTranslations.js | uiText("Hidden") | — | editorial translation | new |
| Page layers | Էջի շերտեր | src/uiTranslations.js | uiText("Page layers") | — | editorial translation | new |
| Select a parent or a nested element. | Ընտրեք ծնող տարր կամ դրա ներսում գտնվող տարր։ | src/uiTranslations.js | uiText("Select a parent or a nested element.") | — | editorial translation | new |
| Resize width | Փոխել լայնությունը | src/uiTranslations.js | uiText("Resize width") | — | editorial translation | new |
| Resize height | Փոխել բարձրությունը | src/uiTranslations.js | uiText("Resize height") | — | editorial translation | new |
| Resize width and height | Փոխել լայնությունն ու բարձրությունը | src/uiTranslations.js | uiText("Resize width and height") | — | editorial translation | new |
| Width | Լայնություն | src/uiTranslations.js | uiText("Width") | — | editorial translation | new |
| Height | Բարձրություն | src/uiTranslations.js | uiText("Height") | — | editorial translation | new |
| Min Width | Նվազագույն լայնություն | src/uiTranslations.js | uiText("Min Width") | — | editorial translation | new |
| Max Width | Առավելագույն լայնություն | src/uiTranslations.js | uiText("Max Width") | — | editorial translation | new |
| Min Height | Նվազագույն բարձրություն | src/uiTranslations.js | uiText("Min Height") | — | editorial translation | new |
| Max Height | Առավելագույն բարձրություն | src/uiTranslations.js | uiText("Max Height") | — | editorial translation | new |
| Padding | Ներքին բացատ | src/uiTranslations.js | uiText("Padding") | — | editorial translation | new |
| Margin | Արտաքին բացատ | src/uiTranslations.js | uiText("Margin") | — | editorial translation | new |
| Padding Top | Վերևի ներքին բացատ | src/uiTranslations.js | uiText("Padding Top") | — | editorial translation | new |
| Padding Right | Աջ ներքին բացատ | src/uiTranslations.js | uiText("Padding Right") | — | editorial translation | new |
| Padding Bottom | Ներքևի ներքին բացատ | src/uiTranslations.js | uiText("Padding Bottom") | — | editorial translation | new |
| Padding Left | Ձախ ներքին բացատ | src/uiTranslations.js | uiText("Padding Left") | — | editorial translation | new |
| Margin Top | Վերևի արտաքին բացատ | src/uiTranslations.js | uiText("Margin Top") | — | editorial translation | new |
| Margin Right | Աջ արտաքին բացատ | src/uiTranslations.js | uiText("Margin Right") | — | editorial translation | new |
| Margin Bottom | Ներքևի արտաքին բացատ | src/uiTranslations.js | uiText("Margin Bottom") | — | editorial translation | new |
| Margin Left | Ձախ արտաքին բացատ | src/uiTranslations.js | uiText("Margin Left") | — | editorial translation | new |
| None | Առանց ստվերի | src/uiTranslations.js | uiText("None") | — | editorial translation | new |
| Soft | Մեղմ | src/uiTranslations.js | uiText("Soft") | — | editorial translation | new |
| Medium | Միջին | src/uiTranslations.js | uiText("Medium") | — | editorial translation | new |
| Strong | Ուժեղ | src/uiTranslations.js | uiText("Strong") | — | editorial translation | new |
| Hero | Գլխավոր հատված | src/uiTranslations.js | uiText("Hero") | — | editorial translation | new |
| Introduction | Ներածություն | src/uiTranslations.js | uiText("Introduction") | — | editorial translation | new |
| Development Services | Կառուցապատման ծառայություններ | src/uiTranslations.js | uiText("Development Services") | — | editorial translation | new |
| Development Packages | Կառուցապատման նախագծերի փաթեթներ | src/uiTranslations.js | uiText("Development Packages") | — | editorial translation | new |
| Selected Projects | Ընտրված նախագծեր | src/uiTranslations.js | uiText("Selected Projects") | — | editorial translation | new |
| Process | Գործընթաց | src/uiTranslations.js | uiText("Process") | — | editorial translation | new |
| Expertise | Փորձառություն | src/uiTranslations.js | uiText("Expertise") | — | editorial translation | new |
| Partners | Գործընկերներ | src/uiTranslations.js | uiText("Partners") | — | editorial translation | new |
| News & Media | Նորություններ և մեդիա | src/uiTranslations.js | uiText("News & Media") | — | editorial translation | new |
| Start a Conversation | Սկսենք զրույցը | src/uiTranslations.js | uiText("Start a Conversation") | — | editorial translation | new |
| Contact & Footer | Կապ և էջատակ | src/uiTranslations.js | uiText("Contact & Footer") | — | editorial translation | new |
| Navigation background | Նավարկման ֆոն | src/uiTranslations.js | uiText("Navigation background") | — | editorial translation | new |
| About | Մեր մասին | src/uiTranslations.js | uiText("About") | — | editorial translation | new |
| Packages | Փաթեթներ | src/uiTranslations.js | uiText("Packages") | — | editorial translation | new |
| Projects | Նախագծեր | src/uiTranslations.js | uiText("Projects") | — | editorial translation | new |
| Services | Ծառայություններ | src/uiTranslations.js | uiText("Services") | — | editorial translation | new |
| Contact | Կապ | src/uiTranslations.js | uiText("Contact") | — | editorial translation | new |
| Pre-Investment Package | Նախաներդրումային փաթեթ | src/uiTranslations.js | uiText("Pre-Investment Package") | — | editorial translation | new |
| Development Package | Զարգացման փաթեթ | src/uiTranslations.js | uiText("Development Package") | — | editorial translation | new |
| Investment Package | Ներդրումային փաթեթ | src/uiTranslations.js | uiText("Investment Package") | — | editorial translation | new |
| Market Research & Analysis | Շուկայի ուսումնասիրություն և վերլուծություն | src/uiTranslations.js | uiText("Market Research & Analysis") | — | editorial translation | new |
| Architecture & Planning | Ճարտարապետություն և պլանավորում | src/uiTranslations.js | uiText("Architecture & Planning") | — | editorial translation | new |
| Financial & Business Planning | Ֆինանսական և բիզնես պլանավորում | src/uiTranslations.js | uiText("Financial & Business Planning") | — | editorial translation | new |
| Investment Preparation | Ներդրումային նախապատրաստում | src/uiTranslations.js | uiText("Investment Preparation") | — | editorial translation | new |
| Avet Avetisyan, 20 | Ավետ Ավետիսյան, 20 | src/uiTranslations.js | uiText("Avet Avetisyan, 20") | — | editorial translation | new |
| Avet Avetisyan | Ավետ Ավետիսյան | src/uiTranslations.js | uiText("Avet Avetisyan") | — | editorial translation | new |
| DIGNISI LLC | DIGNISI ՍՊԸ | src/uiTranslations.js | uiText("DIGNISI LLC") | — | editorial translation | new |
| BSC | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոն | src/uiTranslations.js | uiText("BSC") | — | editorial translation | new |
| Discover | Ուսումնասիրել | src/uiTranslations.js | uiText("Discover") | — | editorial translation | new |
| Analyze | Վերլուծել | src/uiTranslations.js | uiText("Analyze") | — | editorial translation | new |
| Design stage | Նախագծել | src/uiTranslations.js | uiText("Design stage") | — | editorial translation | new |
| Evaluate | Գնահատել | src/uiTranslations.js | uiText("Evaluate") | — | editorial translation | new |
| Prepare | Նախապատրաստել | src/uiTranslations.js | uiText("Prepare") | — | editorial translation | new |
| Architectural detail | Ճարտարապետական մանրամասն | src/uiTranslations.js | uiText("Architectural detail") | — | editorial translation | new |
| Market analysis | Շուկայի վերլուծություն | src/uiTranslations.js | uiText("Market analysis") | — | editorial translation | new |
| Planning | Պլանավորում | src/uiTranslations.js | uiText("Planning") | — | editorial translation | new |
| Finance | Ֆինանսներ | src/uiTranslations.js | uiText("Finance") | — | editorial translation | new |
| Investment | Ներդրում | src/uiTranslations.js | uiText("Investment") | — | editorial translation | new |
| Development package | Զարգացման փաթեթ | src/uiTranslations.js | uiText("Development package") | — | editorial translation | new |
| Partnership | Գործընկերություն | src/uiTranslations.js | uiText("Partnership") | — | editorial translation | new |
| Architecture | Ճարտարապետություն | src/uiTranslations.js | uiText("Architecture") | — | editorial translation | new |
| Prospect24 wordmark | Prospect24-ի բառանշան | src/uiTranslations.js | uiText("Prospect24 wordmark") | — | editorial translation | new |
| Main Image | Հիմնական պատկեր | src/uiTranslations.js | uiText("Main Image") | — | editorial translation | new |
| Detail Image | Մանրամասնի պատկեր | src/uiTranslations.js | uiText("Detail Image") | — | editorial translation | new |
| Partnership Image | Համագործակցության պատկեր | src/uiTranslations.js | uiText("Partnership Image") | — | editorial translation | new |
| Prospect24 Logo | Prospect24-ի տարբերանշան | src/uiTranslations.js | uiText("Prospect24 Logo") | — | editorial translation | new |
| Image | Պատկեր | src/uiTranslations.js | uiText("Image") | — | editorial translation | new |
| Mobile Image | Պատկեր հեռախոսի համար | src/uiTranslations.js | uiText("Mobile Image") | — | editorial translation | new |
| Background Overlay | Ֆոնի ծածկաշերտ | src/uiTranslations.js | uiText("Background Overlay") | — | editorial translation | new |
| Project Overlay | Նախագծի ծածկաշերտ | src/uiTranslations.js | uiText("Project Overlay") | — | editorial translation | new |
| State Property Management Committee | Պետական գույքի կառավարման կոմիտե | src/uiTranslations.js | uiText("State Property Management Committee") | — | editorial translation | new |
| Chakhruk NGO | «Ճախրուկ» ՀԿ | src/uiTranslations.js | uiText("Chakhruk NGO") | — | editorial translation | new |
| Chamber of Architects of the RA | ՀՀ ճարտարապետների պալատ | src/uiTranslations.js | uiText("Chamber of Architects of the RA") | — | editorial translation | new |
| Connecting property expertise and architecture. | Անշարժ գույքի և ճարտարապետության փորձի միավորում։ | src/uiTranslations.js | uiText("Connecting property expertise and architecture.") | — | editorial translation | new |
| Supporting the Chakhruk settlement initiative. | Աջակցություն «Ճախրուկ բնակուտ» բնակավայրի ստեղծման նախաձեռնությանը։ | src/uiTranslations.js | uiText("Supporting the Chakhruk settlement initiative.") | — | editorial translation | new |
| Cooperation rather than competition | Ոչ թե մրցակցել, այլ համագործակցել | src/uiTranslations.js | uiText("Cooperation rather than competition") | — | editorial translation | new |
| Preparing a property’s package from the beginning | Գույքի փաթեթի կազմում՝ հենց սկզբից | src/uiTranslations.js | uiText("Preparing a property’s package from the beginning") | — | editorial translation | new |
| heading | վերնագիր | src/uiTranslations.js | uiText("heading") | — | editorial translation | new |
| tagline | կարգախոս | src/uiTranslations.js | uiText("tagline") | — | editorial translation | new |
| description | նկարագրություն | src/uiTranslations.js | uiText("description") | — | editorial translation | new |
| subheading | ենթավերնագիր | src/uiTranslations.js | uiText("subheading") | — | editorial translation | new |
| label | պիտակ | src/uiTranslations.js | uiText("label") | — | editorial translation | new |
| caption | պատկերի նկարագրություն | src/uiTranslations.js | uiText("caption") | — | editorial translation | new |
| note | նշում | src/uiTranslations.js | uiText("note") | — | editorial translation | new |
| counter | հաշվիչ | src/uiTranslations.js | uiText("counter") | — | editorial translation | new |
| source | աղբյուր | src/uiTranslations.js | uiText("source") | — | editorial translation | new |
| evidence heading | համագործակցության վերնագիր | src/uiTranslations.js | uiText("evidence heading") | — | editorial translation | new |
| evidence description | համագործակցության նկարագրություն | src/uiTranslations.js | uiText("evidence description") | — | editorial translation | new |
| media heading | մեդիայի վերնագիր | src/uiTranslations.js | uiText("media heading") | — | editorial translation | new |
| media description | մեդիայի նկարագրություն | src/uiTranslations.js | uiText("media description") | — | editorial translation | new |
| email | էլ․ հասցե | src/uiTranslations.js | uiText("email") | — | editorial translation | new |
| phone | հեռախոսահամար | src/uiTranslations.js | uiText("phone") | — | editorial translation | new |
| location | հասցե | src/uiTranslations.js | uiText("location") | — | editorial translation | new |
| wordmark | բառանշան | src/uiTranslations.js | uiText("wordmark") | — | editorial translation | new |
| copyright | հեղինակային իրավունք | src/uiTranslations.js | uiText("copyright") | — | editorial translation | new |
| explore | բացահայտել | src/uiTranslations.js | uiText("explore") | — | editorial translation | new |
| conversation | զրույց | src/uiTranslations.js | uiText("conversation") | — | editorial translation | new |
| hero | գլխավոր հատված | src/uiTranslations.js | uiText("hero") | — | editorial translation | new |
| intro | ներածություն | src/uiTranslations.js | uiText("intro") | — | editorial translation | new |
| development | կառուցապատում | src/uiTranslations.js | uiText("development") | — | editorial translation | new |
| packages | փաթեթներ | src/uiTranslations.js | uiText("packages") | — | editorial translation | new |
| projects | նախագծեր | src/uiTranslations.js | uiText("projects") | — | editorial translation | new |
| process | գործընթաց | src/uiTranslations.js | uiText("process") | — | editorial translation | new |
| expertise | փորձառություն | src/uiTranslations.js | uiText("expertise") | — | editorial translation | new |
| partners | գործընկերներ | src/uiTranslations.js | uiText("partners") | — | editorial translation | new |
| news | նորություններ | src/uiTranslations.js | uiText("news") | — | editorial translation | new |
| cta | գործողության կոչ | src/uiTranslations.js | uiText("cta") | — | editorial translation | new |
| footer | էջատակ | src/uiTranslations.js | uiText("footer") | — | editorial translation | new |
| header | վերնամաս | src/uiTranslations.js | uiText("header") | — | editorial translation | new |
| mobile | հեռախոս | src/uiTranslations.js | uiText("mobile") | — | editorial translation | new |
| scroll | ոլորել | src/uiTranslations.js | uiText("scroll") | — | editorial translation | new |
| learn | մանրամասներ | src/uiTranslations.js | uiText("learn") | — | editorial translation | new |
| compare | համեմատել | src/uiTranslations.js | uiText("compare") | — | editorial translation | new |
| article | հոդված | src/uiTranslations.js | uiText("article") | — | editorial translation | new |
| all | բոլորը | src/uiTranslations.js | uiText("all") | — | editorial translation | new |
| discuss | քննարկել | src/uiTranslations.js | uiText("discuss") | — | editorial translation | new |
| top | վերև | src/uiTranslations.js | uiText("top") | — | editorial translation | new |
| privacy | գաղտնիության քաղաքականություն | src/uiTranslations.js | uiText("privacy") | — | editorial translation | new |
| terms | օգտագործման պայմաններ | src/uiTranslations.js | uiText("terms") | — | editorial translation | new |
| previous | նախորդ | src/uiTranslations.js | uiText("previous") | — | editorial translation | new |
| next | հաջորդ | src/uiTranslations.js | uiText("next") | — | editorial translation | new |
| inheritance | ներառված ծառայություններ | src/uiTranslations.js | uiText("inheritance") | — | editorial translation | new |
| price | գին | src/uiTranslations.js | uiText("price") | — | editorial translation | new |
| button | կոճակ | src/uiTranslations.js | uiText("button") | — | editorial translation | new |
| detail | մանրամասներ | src/uiTranslations.js | uiText("detail") | — | editorial translation | new |
| category | կատեգորիա | src/uiTranslations.js | uiText("category") | — | editorial translation | new |
| role | դեր | src/uiTranslations.js | uiText("role") | — | editorial translation | new |
| content | բովանդակություն | src/uiTranslations.js | uiText("content") | — | editorial translation | new |
| buttons | կոճակներ | src/uiTranslations.js | uiText("buttons") | — | editorial translation | new |
| layout | դասավորություն | src/uiTranslations.js | uiText("layout") | — | editorial translation | new |
| composition | կոմպոզիցիա | src/uiTranslations.js | uiText("composition") | — | editorial translation | new |
| image Container | պատկերի տարա | src/uiTranslations.js | uiText("image Container") | — | editorial translation | new |
| detail Container | մանրամասնի տարա | src/uiTranslations.js | uiText("detail Container") | — | editorial translation | new |
| list | ցանկ | src/uiTranslations.js | uiText("list") | — | editorial translation | new |
| visual | պատկերային հատված | src/uiTranslations.js | uiText("visual") | — | editorial translation | new |
| viewport | տեսադաշտ | src/uiTranslations.js | uiText("viewport") | — | editorial translation | new |
| text | տեքստ | src/uiTranslations.js | uiText("text") | — | editorial translation | new |
| section | բաժին | src/uiTranslations.js | uiText("section") | — | editorial translation | new |
| image | պատկեր | src/uiTranslations.js | uiText("image") | — | editorial translation | new |
| overlay | ծածկաշերտ | src/uiTranslations.js | uiText("overlay") | — | editorial translation | new |
| container | տարա | src/uiTranslations.js | uiText("container") | — | editorial translation | new |
| card | քարտ | src/uiTranslations.js | uiText("card") | — | editorial translation | new |
| navigation | նավարկում | src/uiTranslations.js | uiText("navigation") | — | editorial translation | new |
| properties | հատկություններ | src/uiTranslations.js | uiText("properties") | — | editorial translation | new |
| layers | շերտեր | src/uiTranslations.js | uiText("layers") | — | editorial translation | new |
| sections | բաժիններ | src/uiTranslations.js | uiText("sections") | — | editorial translation | new |
| tablet | պլանշետ | src/uiTranslations.js | uiText("tablet") | — | editorial translation | new |
| Image storage is unavailable in this browser. | Այս դիտարկիչում պատկերների պահոցը հասանելի չէ։ | src/uiTranslations.js | uiText("Image storage is unavailable in this browser.") | — | editorial translation | new |
| Choose an image smaller than 12 MB. | Ընտրեք 12 ՄԲ-ից փոքր պատկեր։ | src/uiTranslations.js | uiText("Choose an image smaller than 12 MB.") | — | editorial translation | new |
| Use a genuine JPG, PNG, WebP or AVIF image. SVG and HTML are not supported. | Օգտագործեք JPG, PNG, WebP կամ AVIF ձևաչափի իրական պատկեր։ SVG և HTML ձևաչափերը չեն աջակցվում։ | src/uiTranslations.js | uiText("Use a genuine JPG, PNG, WebP or AVIF image. SVG and HTML are not supported.") | — | editorial translation | new |
| This image cannot be decoded by your browser. | Ձեր դիտարկիչը չի կարող կարդալ այս պատկերը։ | src/uiTranslations.js | uiText("This image cannot be decoded by your browser.") | — | editorial translation | new |
| Image dimensions are too large. Use up to 16,384 pixels per side and 60 megapixels. | Պատկերի չափերը չափազանց մեծ են։ Յուրաքանչյուր կողմը պետք է լինի առավելագույնը 16 384 պիքսել, ընդհանուր չափը՝ 60 մեգապիքսել։ | src/uiTranslations.js | uiText("Image dimensions are too large. Use up to 16,384 pixels per side and 60 megapixels.") | — | editorial translation | new |
| Browser image storage is full or unavailable. The design was not changed. Free browser storage and try again. | Դիտարկիչի պատկերների պահոցը լիքն է կամ հասանելի չէ։ Դիզայնը չի փոփոխվել։ Ազատեք տեղ դիտարկիչի պահոցում և կրկին փորձեք։ | src/uiTranslations.js | uiText("Browser image storage is full or unavailable. The design was not changed. Free browser storage and try again.") | — | editorial translation | new |
| A custom image is unavailable. Replace or restore it before exporting. | Վերբեռնված պատկերներից մեկը հասանելի չէ։ Փոխարինեք կամ վերականգնեք այն՝ նախքան արտահանումը։ | src/uiTranslations.js | uiText("A custom image is unavailable. Replace or restore it before exporting.") | — | editorial translation | new |
| Project archives must be smaller than 80 MB. | Նախագծի արխիվը պետք է լինի 80 ՄԲ-ից փոքր։ | src/uiTranslations.js | uiText("Project archives must be smaller than 80 MB.") | — | editorial translation | new |
| Settings files must be smaller than 1 MB. | Կարգավորումների ֆայլը պետք է լինի 1 ՄԲ-ից փոքր։ | src/uiTranslations.js | uiText("Settings files must be smaller than 1 MB.") | — | editorial translation | new |
| Some images were unavailable; their originals are shown. Use a ZIP to transfer custom images. | Որոշ պատկերներ հասանելի չէին․ ցուցադրված են սկզբնական պատկերները։ Վերբեռնված պատկերները փոխանցելու համար օգտագործեք ZIP ֆայլ։ | src/uiTranslations.js | uiText("Some images were unavailable; their originals are shown. Use a ZIP to transfer custom images.") | — | editorial translation | new |
| Archive expands beyond the supported size. | Ապասեղմված արխիվի չափը գերազանցում է թույլատրելի սահմանը։ | src/uiTranslations.js | uiText("Archive expands beyond the supported size.") | — | editorial translation | new |
| Unexpected archive path. | Արխիվում կա չնախատեսված ֆայլի ուղի։ | src/uiTranslations.js | uiText("Unexpected archive path.") | — | editorial translation | new |
| The archive needs a valid design.json. | Արխիվը պետք է պարունակի վավեր design.json ֆայլ։ | src/uiTranslations.js | uiText("The archive needs a valid design.json.") | — | editorial translation | new |
| Invalid image map. | Պատկերների համապատասխանությունների ցանկը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid image map.") | — | editorial translation | new |
| Invalid image reference. | Պատկերի հղումը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid image reference.") | — | editorial translation | new |
| Invalid archive image path. | Արխիվում պատկերի ուղին վավեր չէ։ | src/uiTranslations.js | uiText("Invalid archive image path.") | — | editorial translation | new |
| Image checksum or extension does not match. | Պատկերի ստուգիչ գումարը կամ ընդլայնումը չի համապատասխանում։ | src/uiTranslations.js | uiText("Image checksum or extension does not match.") | — | editorial translation | new |
| Some images were missing from this archive; their originals are shown. | Որոշ պատկերներ բացակայում էին արխիվում․ ցուցադրված են սկզբնական պատկերները։ | src/uiTranslations.js | uiText("Some images were missing from this archive; their originals are shown.") | — | editorial translation | new |
| Unsupported design version. | Դիզայնի այս տարբերակը չի աջակցվում։ | src/uiTranslations.js | uiText("Unsupported design version.") | — | editorial translation | new |
| Invalid style map. | Ոճերի համապատասխանությունների ցանկը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid style map.") | — | editorial translation | new |
| This property is global. | Այս հատկությունը ընդհանուր է բոլոր էկրանների համար։ | src/uiTranslations.js | uiText("This property is global.") | — | editorial translation | new |
| Invalid section visibility. | Բաժնի տեսանելիության կարգավորումը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid section visibility.") | — | editorial translation | new |
| Invalid breakpoint. | Էկրանի չափի սահմանումը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid breakpoint.") | — | editorial translation | new |
| Invalid language. | Լեզվի արժեքը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid language.") | — | editorial translation | new |
| Invalid text. | Տեքստը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid text.") | — | editorial translation | new |
| Invalid comparison setting. | Համեմատության կարգավորումը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid comparison setting.") | — | editorial translation | new |
| Invalid aspect ratio lock. | Կողմերի հարաբերակցության ամրագրման կարգավորումը վավեր չէ։ | src/uiTranslations.js | uiText("Invalid aspect ratio lock.") | — | editorial translation | new |


## Generated editor labels

These labels are assembled from the reviewed dictionary without translating target IDs, CSS properties, saved values, storage keys or imported object keys. The design-process stage uses Նախագծել in its specific context; the visual-design control remains Դիզայն.

| Original English label | Final Armenian label | Source file | Stable target ID | Status |
| --- | --- | --- | --- | --- |
| Hero | Գլխավոր հատված | src/editor/editorConfig.js | hero.section | editorial translation |
| Introduction | Ներածություն | src/editor/editorConfig.js | intro.section | editorial translation |
| Development Services | Կառուցապատման ծառայություններ | src/editor/editorConfig.js | development.section | editorial translation |
| Development Packages | Կառուցապատման նախագծերի փաթեթներ | src/editor/editorConfig.js | packages.section | editorial translation |
| Selected Projects | Ընտրված նախագծեր | src/editor/editorConfig.js | projects.section | editorial translation |
| Process | Գործընթաց | src/editor/editorConfig.js | process.section | editorial translation |
| Expertise | Փորձառություն | src/editor/editorConfig.js | expertise.section | editorial translation |
| Partners | Գործընկերներ | src/editor/editorConfig.js | partners.section | editorial translation |
| News & Media | Նորություններ և մեդիա | src/editor/editorConfig.js | news.section | editorial translation |
| Start a Conversation | Սկսենք զրույցը | src/editor/editorConfig.js | cta.section | editorial translation |
| Contact & Footer | Կապ և էջատակ | src/editor/editorConfig.js | footer.section | editorial translation |
| Hero · heading | Գլխավոր հատված · վերնագիր | src/editor/editorConfig.js | hero.heading | editorial translation |
| Hero · tagline | Գլխավոր հատված · կարգախոս | src/editor/editorConfig.js | hero.tagline | editorial translation |
| Hero · description | Գլխավոր հատված · նկարագրություն | src/editor/editorConfig.js | hero.description | editorial translation |
| Introduction · label | Ներածություն · պիտակ | src/editor/editorConfig.js | intro.label | editorial translation |
| Introduction · heading | Ներածություն · վերնագիր | src/editor/editorConfig.js | intro.heading | editorial translation |
| Introduction · subheading | Ներածություն · ենթավերնագիր | src/editor/editorConfig.js | intro.subheading | editorial translation |
| Introduction · description | Ներածություն · նկարագրություն | src/editor/editorConfig.js | intro.description | editorial translation |
| Introduction · caption | Ներածություն · պատկերի նկարագրություն | src/editor/editorConfig.js | intro.caption | editorial translation |
| Development Services · label | Կառուցապատման ծառայություններ · պիտակ | src/editor/editorConfig.js | development.label | editorial translation |
| Development Services · heading | Կառուցապատման ծառայություններ · վերնագիր | src/editor/editorConfig.js | development.heading | editorial translation |
| Development Services · description | Կառուցապատման ծառայություններ · նկարագրություն | src/editor/editorConfig.js | development.description | editorial translation |
| Development Packages · label | Կառուցապատման նախագծերի փաթեթներ · պիտակ | src/editor/editorConfig.js | packages.label | editorial translation |
| Development Packages · heading | Կառուցապատման նախագծերի փաթեթներ · վերնագիր | src/editor/editorConfig.js | packages.heading | editorial translation |
| Development Packages · note | Կառուցապատման նախագծերի փաթեթներ · նշում | src/editor/editorConfig.js | packages.note | editorial translation |
| Selected Projects · label | Ընտրված նախագծեր · պիտակ | src/editor/editorConfig.js | projects.label | editorial translation |
| Selected Projects · heading | Ընտրված նախագծեր · վերնագիր | src/editor/editorConfig.js | projects.heading | editorial translation |
| Selected Projects · note | Ընտրված նախագծեր · նշում | src/editor/editorConfig.js | projects.note | editorial translation |
| Selected Projects · counter | Ընտրված նախագծեր · հաշվիչ | src/editor/editorConfig.js | projects.counter | editorial translation |
| Selected Projects · source | Ընտրված նախագծեր · աղբյուր | src/editor/editorConfig.js | projects.source | editorial translation |
| Process · label | Գործընթաց · պիտակ | src/editor/editorConfig.js | process.label | editorial translation |
| Process · heading | Գործընթաց · վերնագիր | src/editor/editorConfig.js | process.heading | editorial translation |
| Process · note | Գործընթաց · նշում | src/editor/editorConfig.js | process.note | editorial translation |
| Expertise · label | Փորձառություն · պիտակ | src/editor/editorConfig.js | expertise.label | editorial translation |
| Expertise · heading | Փորձառություն · վերնագիր | src/editor/editorConfig.js | expertise.heading | editorial translation |
| Expertise · description | Փորձառություն · նկարագրություն | src/editor/editorConfig.js | expertise.description | editorial translation |
| Expertise · evidence heading | Փորձառություն · համագործակցության վերնագիր | src/editor/editorConfig.js | expertise.evidence.heading | editorial translation |
| Expertise · evidence description | Փորձառություն · համագործակցության նկարագրություն | src/editor/editorConfig.js | expertise.evidence.description | editorial translation |
| Partners · heading | Գործընկերներ · վերնագիր | src/editor/editorConfig.js | partners.heading | editorial translation |
| Partners · description | Գործընկերներ · նկարագրություն | src/editor/editorConfig.js | partners.description | editorial translation |
| News & Media · label | Նորություններ և մեդիա · պիտակ | src/editor/editorConfig.js | news.label | editorial translation |
| News & Media · heading | Նորություններ և մեդիա · վերնագիր | src/editor/editorConfig.js | news.heading | editorial translation |
| News & Media · description | Նորություններ և մեդիա · նկարագրություն | src/editor/editorConfig.js | news.description | editorial translation |
| News & Media · media heading | Նորություններ և մեդիա · մեդիայի վերնագիր | src/editor/editorConfig.js | news.media.heading | editorial translation |
| News & Media · media description | Նորություններ և մեդիա · մեդիայի նկարագրություն | src/editor/editorConfig.js | news.media.description | editorial translation |
| Start a Conversation · label | Սկսենք զրույցը · պիտակ | src/editor/editorConfig.js | cta.label | editorial translation |
| Start a Conversation · heading | Սկսենք զրույցը · վերնագիր | src/editor/editorConfig.js | cta.heading | editorial translation |
| Start a Conversation · description | Սկսենք զրույցը · նկարագրություն | src/editor/editorConfig.js | cta.description | editorial translation |
| Start a Conversation · email | Սկսենք զրույցը · էլ․ հասցե | src/editor/editorConfig.js | cta.email | editorial translation |
| Contact & Footer · tagline | Կապ և էջատակ · կարգախոս | src/editor/editorConfig.js | footer.tagline | editorial translation |
| Contact & Footer · explore | Կապ և էջատակ · բացահայտել | src/editor/editorConfig.js | footer.explore | editorial translation |
| Contact & Footer · conversation | Կապ և էջատակ · զրույց | src/editor/editorConfig.js | footer.conversation | editorial translation |
| Contact & Footer · phone | Կապ և էջատակ · հեռախոսահամար | src/editor/editorConfig.js | footer.phone | editorial translation |
| Contact & Footer · email | Կապ և էջատակ · էլ․ հասցե | src/editor/editorConfig.js | footer.email | editorial translation |
| Contact & Footer · location | Կապ և էջատակ · հասցե | src/editor/editorConfig.js | footer.location | editorial translation |
| Contact & Footer · wordmark | Կապ և էջատակ · բառանշան | src/editor/editorConfig.js | footer.wordmark | editorial translation |
| Contact & Footer · copyright | Կապ և էջատակ · հեղինակային իրավունք | src/editor/editorConfig.js | footer.copyright | editorial translation |
| Contact & Footer · note | Կապ և էջատակ · նշում | src/editor/editorConfig.js | footer.note | editorial translation |
| hero · explore | գլխավոր հատված · բացահայտել | src/editor/editorConfig.js | hero.explore | editorial translation |
| hero · projects | գլխավոր հատված · նախագծեր | src/editor/editorConfig.js | hero.projects | editorial translation |
| hero · scroll | գլխավոր հատված · ոլորել | src/editor/editorConfig.js | hero.scroll | editorial translation |
| intro · learn | ներածություն · մանրամասներ | src/editor/editorConfig.js | intro.learn | editorial translation |
| packages · compare | փաթեթներ · համեմատել | src/editor/editorConfig.js | packages.compare | editorial translation |
| expertise · article | փորձառություն · հոդված | src/editor/editorConfig.js | expertise.article | editorial translation |
| partners · all | գործընկերներ · բոլորը | src/editor/editorConfig.js | partners.all | editorial translation |
| cta · discuss | գործողության կոչ · քննարկել | src/editor/editorConfig.js | cta.discuss | editorial translation |
| footer · top | էջատակ · վերև | src/editor/editorConfig.js | footer.top | editorial translation |
| footer · privacy | էջատակ · գաղտնիության քաղաքականություն | src/editor/editorConfig.js | footer.privacy | editorial translation |
| footer · terms | էջատակ · օգտագործման պայմաններ | src/editor/editorConfig.js | footer.terms | editorial translation |
| projects · previous | նախագծեր · նախորդ | src/editor/editorConfig.js | projects.previous | editorial translation |
| projects · next | նախագծեր · հաջորդ | src/editor/editorConfig.js | projects.next | editorial translation |
| projects · all | նախագծեր · բոլորը | src/editor/editorConfig.js | projects.all | editorial translation |
| Navigation background | Նավարկման ֆոն | src/editor/editorConfig.js | header.navigation | editorial translation |
| header · About | վերնամաս · Մեր մասին | src/editor/editorConfig.js | header.nav.about | editorial translation |
| footer · About | էջատակ · Մեր մասին | src/editor/editorConfig.js | footer.nav.about | editorial translation |
| mobile · About | հեռախոս · Մեր մասին | src/editor/editorConfig.js | mobile.nav.about | editorial translation |
| header · Packages | վերնամաս · Փաթեթներ | src/editor/editorConfig.js | header.nav.packages | editorial translation |
| footer · Packages | էջատակ · Փաթեթներ | src/editor/editorConfig.js | footer.nav.packages | editorial translation |
| mobile · Packages | հեռախոս · Փաթեթներ | src/editor/editorConfig.js | mobile.nav.packages | editorial translation |
| header · Projects | վերնամաս · Նախագծեր | src/editor/editorConfig.js | header.nav.projects | editorial translation |
| footer · Projects | էջատակ · Նախագծեր | src/editor/editorConfig.js | footer.nav.projects | editorial translation |
| mobile · Projects | հեռախոս · Նախագծեր | src/editor/editorConfig.js | mobile.nav.projects | editorial translation |
| header · Services | վերնամաս · Ծառայություններ | src/editor/editorConfig.js | header.nav.services | editorial translation |
| footer · Services | էջատակ · Ծառայություններ | src/editor/editorConfig.js | footer.nav.services | editorial translation |
| mobile · Services | հեռախոս · Ծառայություններ | src/editor/editorConfig.js | mobile.nav.services | editorial translation |
| header · Expertise | վերնամաս · Փորձառություն | src/editor/editorConfig.js | header.nav.expertise | editorial translation |
| footer · Expertise | էջատակ · Փորձառություն | src/editor/editorConfig.js | footer.nav.expertise | editorial translation |
| mobile · Expertise | հեռախոս · Փորձառություն | src/editor/editorConfig.js | mobile.nav.expertise | editorial translation |
| header · Partners | վերնամաս · Գործընկերներ | src/editor/editorConfig.js | header.nav.partners | editorial translation |
| footer · Partners | էջատակ · Գործընկերներ | src/editor/editorConfig.js | footer.nav.partners | editorial translation |
| mobile · Partners | հեռախոս · Գործընկերներ | src/editor/editorConfig.js | mobile.nav.partners | editorial translation |
| header · News & Media | վերնամաս · Նորություններ և մեդիա | src/editor/editorConfig.js | header.nav.news-media | editorial translation |
| footer · News & Media | էջատակ · Նորություններ և մեդիա | src/editor/editorConfig.js | footer.nav.news-media | editorial translation |
| mobile · News & Media | հեռախոս · Նորություններ և մեդիա | src/editor/editorConfig.js | mobile.nav.news-media | editorial translation |
| header · Contact | վերնամաս · Կապ | src/editor/editorConfig.js | header.nav.contact | editorial translation |
| footer · Contact | էջատակ · Կապ | src/editor/editorConfig.js | footer.nav.contact | editorial translation |
| mobile · Contact | հեռախոս · Կապ | src/editor/editorConfig.js | mobile.nav.contact | editorial translation |
| Pre-Investment Package | Նախաներդրումային փաթեթ | src/editor/editorConfig.js | packages.card.pre-investment-package | editorial translation |
| Pre-Investment Package · heading | Նախաներդրումային փաթեթ · վերնագիր | src/editor/editorConfig.js | packages.card.pre-investment-package.heading | editorial translation |
| Pre-Investment Package · description | Նախաներդրումային փաթեթ · նկարագրություն | src/editor/editorConfig.js | packages.card.pre-investment-package.description | editorial translation |
| Pre-Investment Package · inheritance | Նախաներդրումային փաթեթ · ներառված ծառայություններ | src/editor/editorConfig.js | packages.card.pre-investment-package.inheritance | editorial translation |
| Pre-Investment Package · price | Նախաներդրումային փաթեթ · գին | src/editor/editorConfig.js | packages.card.pre-investment-package.price | editorial translation |
| Pre-Investment Package · button | Նախաներդրումային փաթեթ · կոճակ | src/editor/editorConfig.js | packages.card.pre-investment-package.button | editorial translation |
| Development Package | Զարգացման փաթեթ | src/editor/editorConfig.js | packages.card.development-package | editorial translation |
| Development Package · heading | Զարգացման փաթեթ · վերնագիր | src/editor/editorConfig.js | packages.card.development-package.heading | editorial translation |
| Development Package · description | Զարգացման փաթեթ · նկարագրություն | src/editor/editorConfig.js | packages.card.development-package.description | editorial translation |
| Development Package · inheritance | Զարգացման փաթեթ · ներառված ծառայություններ | src/editor/editorConfig.js | packages.card.development-package.inheritance | editorial translation |
| Development Package · price | Զարգացման փաթեթ · գին | src/editor/editorConfig.js | packages.card.development-package.price | editorial translation |
| Development Package · button | Զարգացման փաթեթ · կոճակ | src/editor/editorConfig.js | packages.card.development-package.button | editorial translation |
| Investment Package | Ներդրումային փաթեթ | src/editor/editorConfig.js | packages.card.investment-package | editorial translation |
| Investment Package · heading | Ներդրումային փաթեթ · վերնագիր | src/editor/editorConfig.js | packages.card.investment-package.heading | editorial translation |
| Investment Package · description | Ներդրումային փաթեթ · նկարագրություն | src/editor/editorConfig.js | packages.card.investment-package.description | editorial translation |
| Investment Package · inheritance | Ներդրումային փաթեթ · ներառված ծառայություններ | src/editor/editorConfig.js | packages.card.investment-package.inheritance | editorial translation |
| Investment Package · price | Ներդրումային փաթեթ · գին | src/editor/editorConfig.js | packages.card.investment-package.price | editorial translation |
| Investment Package · button | Ներդրումային փաթեթ · կոճակ | src/editor/editorConfig.js | packages.card.investment-package.button | editorial translation |
| Market Research & Analysis | Շուկայի ուսումնասիրություն և վերլուծություն | src/editor/editorConfig.js | development.card.market-research-analysis | editorial translation |
| Market Research & Analysis · heading | Շուկայի ուսումնասիրություն և վերլուծություն · վերնագիր | src/editor/editorConfig.js | development.card.market-research-analysis.heading | editorial translation |
| Market Research & Analysis · description | Շուկայի ուսումնասիրություն և վերլուծություն · նկարագրություն | src/editor/editorConfig.js | development.card.market-research-analysis.description | editorial translation |
| Market Research & Analysis · detail | Շուկայի ուսումնասիրություն և վերլուծություն · մանրամասներ | src/editor/editorConfig.js | development.card.market-research-analysis.detail | editorial translation |
| Market Research & Analysis · button | Շուկայի ուսումնասիրություն և վերլուծություն · կոճակ | src/editor/editorConfig.js | development.card.market-research-analysis.button | editorial translation |
| Architecture & Planning | Ճարտարապետություն և պլանավորում | src/editor/editorConfig.js | development.card.architecture-planning | editorial translation |
| Architecture & Planning · heading | Ճարտարապետություն և պլանավորում · վերնագիր | src/editor/editorConfig.js | development.card.architecture-planning.heading | editorial translation |
| Architecture & Planning · description | Ճարտարապետություն և պլանավորում · նկարագրություն | src/editor/editorConfig.js | development.card.architecture-planning.description | editorial translation |
| Architecture & Planning · detail | Ճարտարապետություն և պլանավորում · մանրամասներ | src/editor/editorConfig.js | development.card.architecture-planning.detail | editorial translation |
| Architecture & Planning · button | Ճարտարապետություն և պլանավորում · կոճակ | src/editor/editorConfig.js | development.card.architecture-planning.button | editorial translation |
| Financial & Business Planning | Ֆինանսական և բիզնես պլանավորում | src/editor/editorConfig.js | development.card.financial-business-planning | editorial translation |
| Financial & Business Planning · heading | Ֆինանսական և բիզնես պլանավորում · վերնագիր | src/editor/editorConfig.js | development.card.financial-business-planning.heading | editorial translation |
| Financial & Business Planning · description | Ֆինանսական և բիզնես պլանավորում · նկարագրություն | src/editor/editorConfig.js | development.card.financial-business-planning.description | editorial translation |
| Financial & Business Planning · detail | Ֆինանսական և բիզնես պլանավորում · մանրամասներ | src/editor/editorConfig.js | development.card.financial-business-planning.detail | editorial translation |
| Financial & Business Planning · button | Ֆինանսական և բիզնես պլանավորում · կոճակ | src/editor/editorConfig.js | development.card.financial-business-planning.button | editorial translation |
| Investment Preparation | Ներդրումային նախապատրաստում | src/editor/editorConfig.js | development.card.investment-preparation | editorial translation |
| Investment Preparation · heading | Ներդրումային նախապատրաստում · վերնագիր | src/editor/editorConfig.js | development.card.investment-preparation.heading | editorial translation |
| Investment Preparation · description | Ներդրումային նախապատրաստում · նկարագրություն | src/editor/editorConfig.js | development.card.investment-preparation.description | editorial translation |
| Investment Preparation · detail | Ներդրումային նախապատրաստում · մանրամասներ | src/editor/editorConfig.js | development.card.investment-preparation.detail | editorial translation |
| Investment Preparation · button | Ներդրումային նախապատրաստում · կոճակ | src/editor/editorConfig.js | development.card.investment-preparation.button | editorial translation |
| Garden Hill Residence | Garden Hill Residence | src/editor/editorConfig.js | projects.card.garden-hill-residence | editorial translation |
| Garden Hill Residence · heading | Garden Hill Residence · վերնագիր | src/editor/editorConfig.js | projects.card.garden-hill-residence.heading | editorial translation |
| Garden Hill Residence · category | Garden Hill Residence · կատեգորիա | src/editor/editorConfig.js | projects.card.garden-hill-residence.category | editorial translation |
| Garden Hill Residence · button | Garden Hill Residence · կոճակ | src/editor/editorConfig.js | projects.card.garden-hill-residence.button | editorial translation |
| Avet Avetisyan, 20 | Ավետ Ավետիսյան, 20 | src/editor/editorConfig.js | projects.card.avet-avetisyan-20 | editorial translation |
| Avet Avetisyan, 20 · heading | Ավետ Ավետիսյան, 20 · վերնագիր | src/editor/editorConfig.js | projects.card.avet-avetisyan-20.heading | editorial translation |
| Avet Avetisyan, 20 · category | Ավետ Ավետիսյան, 20 · կատեգորիա | src/editor/editorConfig.js | projects.card.avet-avetisyan-20.category | editorial translation |
| Avet Avetisyan, 20 · button | Ավետ Ավետիսյան, 20 · կոճակ | src/editor/editorConfig.js | projects.card.avet-avetisyan-20.button | editorial translation |
| Khachaturian Architects | Khachaturian Architects | src/editor/editorConfig.js | projects.card.khachaturian-architects | editorial translation |
| Khachaturian Architects · heading | Khachaturian Architects · վերնագիր | src/editor/editorConfig.js | projects.card.khachaturian-architects.heading | editorial translation |
| Khachaturian Architects · category | Khachaturian Architects · կատեգորիա | src/editor/editorConfig.js | projects.card.khachaturian-architects.category | editorial translation |
| Khachaturian Architects · button | Khachaturian Architects · կոճակ | src/editor/editorConfig.js | projects.card.khachaturian-architects.button | editorial translation |
| Discover | Ուսումնասիրել | src/editor/editorConfig.js | process.card.discover | editorial translation |
| Discover · heading | Ուսումնասիրել · վերնագիր | src/editor/editorConfig.js | process.card.discover.heading | editorial translation |
| Discover · description | Ուսումնասիրել · նկարագրություն | src/editor/editorConfig.js | process.card.discover.description | editorial translation |
| Analyze | Վերլուծել | src/editor/editorConfig.js | process.card.analyze | editorial translation |
| Analyze · heading | Վերլուծել · վերնագիր | src/editor/editorConfig.js | process.card.analyze.heading | editorial translation |
| Analyze · description | Վերլուծել · նկարագրություն | src/editor/editorConfig.js | process.card.analyze.description | editorial translation |
| Design | Նախագծել | src/editor/editorConfig.js | process.card.design | editorial translation |
| Design · heading | Նախագծել · վերնագիր | src/editor/editorConfig.js | process.card.design.heading | editorial translation |
| Design · description | Նախագծել · նկարագրություն | src/editor/editorConfig.js | process.card.design.description | editorial translation |
| Evaluate | Գնահատել | src/editor/editorConfig.js | process.card.evaluate | editorial translation |
| Evaluate · heading | Գնահատել · վերնագիր | src/editor/editorConfig.js | process.card.evaluate.heading | editorial translation |
| Evaluate · description | Գնահատել · նկարագրություն | src/editor/editorConfig.js | process.card.evaluate.description | editorial translation |
| Prepare | Նախապատրաստել | src/editor/editorConfig.js | process.card.prepare | editorial translation |
| Prepare · heading | Նախապատրաստել · վերնագիր | src/editor/editorConfig.js | process.card.prepare.heading | editorial translation |
| Prepare · description | Նախապատրաստել · նկարագրություն | src/editor/editorConfig.js | process.card.prepare.description | editorial translation |
| DIGNISI LLC | DIGNISI ՍՊԸ | src/editor/editorConfig.js | expertise.card.dignisi-llc | editorial translation |
| DIGNISI LLC · heading | DIGNISI ՍՊԸ · վերնագիր | src/editor/editorConfig.js | expertise.card.dignisi-llc.heading | editorial translation |
| DIGNISI LLC · role | DIGNISI ՍՊԸ · դեր | src/editor/editorConfig.js | expertise.card.dignisi-llc.role | editorial translation |
| DIGNISI LLC · description | DIGNISI ՍՊԸ · նկարագրություն | src/editor/editorConfig.js | expertise.card.dignisi-llc.description | editorial translation |
| KHACHATURIAN ARCHITECTS | KHACHATURIAN ARCHITECTS | src/editor/editorConfig.js | expertise.card.khachaturian-architects | editorial translation |
| KHACHATURIAN ARCHITECTS · heading | KHACHATURIAN ARCHITECTS · վերնագիր | src/editor/editorConfig.js | expertise.card.khachaturian-architects.heading | editorial translation |
| KHACHATURIAN ARCHITECTS · role | KHACHATURIAN ARCHITECTS · դեր | src/editor/editorConfig.js | expertise.card.khachaturian-architects.role | editorial translation |
| KHACHATURIAN ARCHITECTS · description | KHACHATURIAN ARCHITECTS · նկարագրություն | src/editor/editorConfig.js | expertise.card.khachaturian-architects.description | editorial translation |
| BSC | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոն | src/editor/editorConfig.js | expertise.card.bsc | editorial translation |
| BSC · heading | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոն · վերնագիր | src/editor/editorConfig.js | expertise.card.bsc.heading | editorial translation |
| BSC · role | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոն · դեր | src/editor/editorConfig.js | expertise.card.bsc.role | editorial translation |
| BSC · description | «Բի Էս Սի» Բիզնեսի Աջակցման Կենտրոն · նկարագրություն | src/editor/editorConfig.js | expertise.card.bsc.description | editorial translation |
| Supporting the Chakhruk settlement initiative. | Աջակցություն «Ճախրուկ բնակուտ» բնակավայրի ստեղծման նախաձեռնությանը։ | src/editor/editorConfig.js | news.card.memorandum-chakhruk-ngo-and-prospect24 | editorial translation |
| Supporting the Chakhruk settlement initiative. · heading | Աջակցություն «Ճախրուկ բնակուտ» բնակավայրի ստեղծման նախաձեռնությանը։ · վերնագիր | src/editor/editorConfig.js | news.card.memorandum-chakhruk-ngo-and-prospect24.heading | editorial translation |
| Supporting the Chakhruk settlement initiative. · description | Աջակցություն «Ճախրուկ բնակուտ» բնակավայրի ստեղծման նախաձեռնությանը։ · նկարագրություն | src/editor/editorConfig.js | news.card.memorandum-chakhruk-ngo-and-prospect24.description | editorial translation |
| Supporting the Chakhruk settlement initiative. · button | Աջակցություն «Ճախրուկ բնակուտ» բնակավայրի ստեղծման նախաձեռնությանը։ · կոճակ | src/editor/editorConfig.js | news.card.memorandum-chakhruk-ngo-and-prospect24.button | editorial translation |
| Connecting property expertise and architecture. | Անշարժ գույքի և ճարտարապետության փորձի միավորում։ | src/editor/editorConfig.js | news.card.prospect24_archtects-palace | editorial translation |
| Connecting property expertise and architecture. · heading | Անշարժ գույքի և ճարտարապետության փորձի միավորում։ · վերնագիր | src/editor/editorConfig.js | news.card.prospect24_archtects-palace.heading | editorial translation |
| Connecting property expertise and architecture. · description | Անշարժ գույքի և ճարտարապետության փորձի միավորում։ · նկարագրություն | src/editor/editorConfig.js | news.card.prospect24_archtects-palace.description | editorial translation |
| Connecting property expertise and architecture. · button | Անշարժ գույքի և ճարտարապետության փորձի միավորում։ · կոճակ | src/editor/editorConfig.js | news.card.prospect24_archtects-palace.button | editorial translation |
| Cooperation rather than competition | Ոչ թե մրցակցել, այլ համագործակցել | src/editor/editorConfig.js | news.video.jn9iFdgyBg8 | editorial translation |
| Cooperation rather than competition · heading | Ոչ թե մրցակցել, այլ համագործակցել · վերնագիր | src/editor/editorConfig.js | news.video.jn9iFdgyBg8.heading | editorial translation |
| Preparing a property’s package from the beginning | Գույքի փաթեթի կազմում՝ հենց սկզբից | src/editor/editorConfig.js | news.video.NamajLyCY3k | editorial translation |
| Preparing a property’s package from the beginning · heading | Գույքի փաթեթի կազմում՝ հենց սկզբից · վերնագիր | src/editor/editorConfig.js | news.video.NamajLyCY3k.heading | editorial translation |
| Before Image | «Մինչև» պատկեր | src/editor/editorConfig.js | hero.beforeImage | editorial translation |
| After Image | «Հետո» պատկեր | src/editor/editorConfig.js | hero.afterImage | editorial translation |
| Main Image | Հիմնական պատկեր | src/editor/editorConfig.js | intro.image | editorial translation |
| Detail Image | Մանրամասնի պատկեր | src/editor/editorConfig.js | intro.detailImage | editorial translation |
| Partnership Image | Համագործակցության պատկեր | src/editor/editorConfig.js | expertise.image | editorial translation |
| Prospect24 Logo | Prospect24-ի տարբերանշան | src/editor/editorConfig.js | header.logo | editorial translation |
| Prospect24 Logo | Prospect24-ի տարբերանշան | src/editor/editorConfig.js | footer.logo | editorial translation |
| Prospect24 Logo | Prospect24-ի տարբերանշան | src/editor/editorConfig.js | mobile.logo | editorial translation |
| Pre-Investment Package · Image | Նախաներդրումային փաթեթ · Պատկեր | src/editor/editorConfig.js | packages.card.pre-investment-package.image | editorial translation |
| Development Package · Image | Զարգացման փաթեթ · Պատկեր | src/editor/editorConfig.js | packages.card.development-package.image | editorial translation |
| Investment Package · Image | Ներդրումային փաթեթ · Պատկեր | src/editor/editorConfig.js | packages.card.investment-package.image | editorial translation |
| Market Research & Analysis · Mobile Image | Շուկայի ուսումնասիրություն և վերլուծություն · Պատկեր հեռախոսի համար | src/editor/editorConfig.js | development.card.market-research-analysis.image | editorial translation |
| Market Research & Analysis · Image | Շուկայի ուսումնասիրություն և վերլուծություն · Պատկեր | src/editor/editorConfig.js | development.image.market-research-analysis | editorial translation |
| Architecture & Planning · Mobile Image | Ճարտարապետություն և պլանավորում · Պատկեր հեռախոսի համար | src/editor/editorConfig.js | development.card.architecture-planning.image | editorial translation |
| Architecture & Planning · Image | Ճարտարապետություն և պլանավորում · Պատկեր | src/editor/editorConfig.js | development.image.architecture-planning | editorial translation |
| Financial & Business Planning · Mobile Image | Ֆինանսական և բիզնես պլանավորում · Պատկեր հեռախոսի համար | src/editor/editorConfig.js | development.card.financial-business-planning.image | editorial translation |
| Financial & Business Planning · Image | Ֆինանսական և բիզնես պլանավորում · Պատկեր | src/editor/editorConfig.js | development.image.financial-business-planning | editorial translation |
| Investment Preparation · Mobile Image | Ներդրումային նախապատրաստում · Պատկեր հեռախոսի համար | src/editor/editorConfig.js | development.card.investment-preparation.image | editorial translation |
| Investment Preparation · Image | Ներդրումային նախապատրաստում · Պատկեր | src/editor/editorConfig.js | development.image.investment-preparation | editorial translation |
| Garden Hill Residence | Garden Hill Residence | src/editor/editorConfig.js | projects.visual.garden-hill-residence | editorial translation |
| Garden Hill Residence · Image | Garden Hill Residence · Պատկեր | src/editor/editorConfig.js | projects.visual.garden-hill-residence.image | editorial translation |
| Garden Hill Residence · Overlay | Garden Hill Residence · Ծածկաշերտ | src/editor/editorConfig.js | projects.visual.garden-hill-residence.overlay | editorial translation |
| Avet Avetisyan, 20 | Ավետ Ավետիսյան, 20 | src/editor/editorConfig.js | projects.visual.avet-avetisyan-20 | editorial translation |
| Avet Avetisyan, 20 · Image | Ավետ Ավետիսյան, 20 · Պատկեր | src/editor/editorConfig.js | projects.visual.avet-avetisyan-20.image | editorial translation |
| Avet Avetisyan, 20 · Overlay | Ավետ Ավետիսյան, 20 · Ծածկաշերտ | src/editor/editorConfig.js | projects.visual.avet-avetisyan-20.overlay | editorial translation |
| Khachaturian Architects | Khachaturian Architects | src/editor/editorConfig.js | projects.visual.khachaturian-architects | editorial translation |
| Khachaturian Architects · Image | Khachaturian Architects · Պատկեր | src/editor/editorConfig.js | projects.visual.khachaturian-architects.image | editorial translation |
| Khachaturian Architects · Overlay | Khachaturian Architects · Ծածկաշերտ | src/editor/editorConfig.js | projects.visual.khachaturian-architects.overlay | editorial translation |
| Chakhruk NGO · Image | «Ճախրուկ» ՀԿ · Պատկեր | src/editor/editorConfig.js | news.card.memorandum-chakhruk-ngo-and-prospect24.image | editorial translation |
| Chamber of Architects of the RA · Image | ՀՀ ճարտարապետների պալատ · Պատկեր | src/editor/editorConfig.js | news.card.prospect24_archtects-palace.image | editorial translation |
| Araratbank | Araratbank | src/editor/editorConfig.js | partners.logo.araratbank | editorial translation |
| Inecobank | Inecobank | src/editor/editorConfig.js | partners.logo.inecobank | editorial translation |
| Amio Bank | Amio Bank | src/editor/editorConfig.js | partners.logo.amio-bank | editorial translation |
| Byblos Bank Armenia | Byblos Bank Armenia | src/editor/editorConfig.js | partners.logo.byblos-bank-armenia | editorial translation |
| Decoree Holding | Decoree Holding | src/editor/editorConfig.js | partners.logo.decoree-holding | editorial translation |
| Ador | Ador | src/editor/editorConfig.js | partners.logo.ador | editorial translation |
| Cerama Casa | Cerama Casa | src/editor/editorConfig.js | partners.logo.cerama-casa | editorial translation |
| Zigzag | Zigzag | src/editor/editorConfig.js | partners.logo.zigzag | editorial translation |
| Nine Architects | Nine Architects | src/editor/editorConfig.js | partners.logo.nine-architects | editorial translation |
| Storaket Studio | Storaket Studio | src/editor/editorConfig.js | partners.logo.storaket-studio | editorial translation |
| CUP Bureau | CUP Bureau | src/editor/editorConfig.js | partners.logo.cup-bureau | editorial translation |
| Architects Palace | Architects Palace | src/editor/editorConfig.js | partners.logo.architects-palace | editorial translation |
| Art Deco | Art Deco | src/editor/editorConfig.js | partners.logo.art-deco | editorial translation |
| Petro Stone | Petro Stone | src/editor/editorConfig.js | partners.logo.petro-stone | editorial translation |
| ALT Architectural Studio | ALT Architectural Studio | src/editor/editorConfig.js | partners.logo.alt-architectural-studio | editorial translation |
| MEK Furniture | MEK Furniture | src/editor/editorConfig.js | partners.logo.mek-furniture | editorial translation |
| Graphit | Graphit | src/editor/editorConfig.js | partners.logo.graphit | editorial translation |
| Atrium | Atrium | src/editor/editorConfig.js | partners.logo.atrium | editorial translation |
| Anarch | Anarch | src/editor/editorConfig.js | partners.logo.anarch | editorial translation |
| Futuris Architects | Futuris Architects | src/editor/editorConfig.js | partners.logo.futuris-architects | editorial translation |
| AGL Projects | AGL Projects | src/editor/editorConfig.js | partners.logo.agl-projects | editorial translation |
| Domus | Domus | src/editor/editorConfig.js | partners.logo.domus | editorial translation |
| Chakhruk NGO | «Ճախրուկ» ՀԿ | src/editor/editorConfig.js | partners.logo.chakhruk-ngo | editorial translation |
| Kult Home | Kult Home | src/editor/editorConfig.js | partners.logo.kult-home | editorial translation |
| Valan Decor | Valan Decor | src/editor/editorConfig.js | partners.logo.valan-decor | editorial translation |
| Asedl | Asedl | src/editor/editorConfig.js | partners.logo.asedl | editorial translation |
| Tognana | Tognana | src/editor/editorConfig.js | partners.logo.tognana | editorial translation |
| Mer Ankyun | Mer Ankyun | src/editor/editorConfig.js | partners.logo.mer-ankyun | editorial translation |
| ANZ Facade | ANZ Facade | src/editor/editorConfig.js | partners.logo.anz-facade | editorial translation |
| Exterior Group | Exterior Group | src/editor/editorConfig.js | partners.logo.exterior-group | editorial translation |
| content | բովանդակություն | src/editor/editorConfig.js | hero.content | editorial translation |
| buttons | կոճակներ | src/editor/editorConfig.js | hero.buttons | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | intro.layout | editorial translation |
| composition | կոմպոզիցիա | src/editor/editorConfig.js | intro.composition | editorial translation |
| image Container | պատկերի տարա | src/editor/editorConfig.js | intro.imageContainer | editorial translation |
| detail Container | մանրամասնի տարա | src/editor/editorConfig.js | intro.detailContainer | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | development.layout | editorial translation |
| list | ցանկ | src/editor/editorConfig.js | development.list | editorial translation |
| visual | պատկերային հատված | src/editor/editorConfig.js | development.visual | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | packages.layout | editorial translation |
| viewport | տեսադաշտ | src/editor/editorConfig.js | projects.viewport | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | process.layout | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | expertise.layout | editorial translation |
| image Container | պատկերի տարա | src/editor/editorConfig.js | expertise.imageContainer | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | partners.layout | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | news.layout | editorial translation |
| content | բովանդակություն | src/editor/editorConfig.js | cta.content | editorial translation |
| layout | դասավորություն | src/editor/editorConfig.js | footer.layout | editorial translation |
| Background Overlay | Ֆոնի ծածկաշերտ | src/editor/editorConfig.js | hero.overlay | editorial translation |
| Project Overlay | Նախագծի ծածկաշերտ | src/editor/editorConfig.js | projects.overlay | editorial translation |


## Formatted prices and dates

| Original English rendering | Final Armenian rendering | Source file | Rendering key | Official source | Status |
| --- | --- | --- | --- | --- | --- |
| Published package price: 2 400 000 AMD | 2 400 000 դրամ | src/main.jsx | price(packages[0]) | https://prospect24.am/investment-packages/ | verified |
| Starting from 4 800 000 AMD | Սկսած 4 800 000 դրամից | src/main.jsx | price(packages[1]) | https://prospect24.am/investment-packages/ | verified |
| Starting from 11 200 000 AMD | Սկսած 11 200 000 դրամից | src/main.jsx | price(packages[2]) | https://prospect24.am/investment-packages/ | verified |
| Signed 24 January 2025 | Ստորագրվել է 2025 թ․ հունվարի 24 | src/main.jsx | date(news[0].signed) | https://prospect24.am/memorandum-of-cooperation/ | verified |
| Published 28 January 2025 | Հրապարակվել է 2025 թ․ հունվարի 28 | src/main.jsx | date(news[0].published) | https://prospect24.am/memorandum-of-cooperation/ | verified |
| Signed 20 January 2025 | Ստորագրվել է 2025 թ․ հունվարի 20 | src/main.jsx | date(news[1].signed) | https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/ | verified |
| Published 25 February 2025 | Հրապարակվել է 2025 թ․ փետրվարի 25 | src/main.jsx | date(news[1].published) | https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/ | verified |
| Signed 21 March 2025 | Ստորագրվել է 2025 թ․ մարտի 21 | src/main.jsx | date(news[2].signed) | https://prospect24.am/prospect24_archtects-palace/ | verified |
| Published 26 March 2025 | Հրապարակվել է 2025 թ․ մարտի 26 | src/main.jsx | date(news[2].published) | https://prospect24.am/prospect24_archtects-palace/ | verified |


## Dynamic status and accessible-label templates

| Original English template | Final Armenian template | Source file | Translation key | Status |
| --- | --- | --- | --- | --- |
| Reset {property} | Վերակայել՝ {հատկություն} | src/uiTranslations.js | uiText: Reset template | editorial translation |
| Show {section} | Ցուցադրել՝ {բաժին} | src/uiTranslations.js | uiText: Show template | editorial translation |
| Hide {section} | Թաքցնել՝ {բաժին} | src/uiTranslations.js | uiText: Hide template | editorial translation |
| {property} value | {հատկություն}՝ արժեք | src/uiTranslations.js | uiText: value suffix | editorial translation |
| {property} unit | {հատկություն}՝ չափման միավոր | src/uiTranslations.js | uiText: unit suffix | editorial translation |
| {property} hex | {հատկություն}՝ տասնվեցական գույնի կոդ | src/uiTranslations.js | uiText: hex suffix | editorial translation |
| {device} changes override inherited sizes and spacing. Colors stay global. | {սարք}․ այստեղ սահմանված չափերն ու բացատները փոխարինում են ժառանգված արժեքներին։ Գույները մնում են ընդհանուր։ | src/uiTranslations.js | uiText: responsive scope | editorial translation |
| {section} restored / hidden. | {բաժին}․ վերականգնված է / թաքցված է։ | src/uiTranslations.js | uiText: visibility status | editorial translation |
| Image not saved: {error} | Պատկերը չի պահպանվել․ {սխալ} | src/uiTranslations.js | uiText: image error | editorial translation |
| Export failed: {error} | Արտահանումը ձախողվել է․ {սխալ} | src/uiTranslations.js | uiText: export error | editorial translation |
| Import failed: {error} | Ներմուծումը ձախողվել է․ {սխալ} | src/uiTranslations.js | uiText: import error | editorial translation |
| Project imported. Undo is available. {warning} | Նախագիծը ներմուծված է։ Կարող եք հետարկել փոփոխությունը։ {զգուշացում} | src/uiTranslations.js | uiText: import status | editorial translation |
| Unrecognized browser/JSON/storage diagnostic | Չհաջողվեց մշակել տվյալները։ Ստուգեք ֆայլի ձևաչափն ու դիտարկիչի պահոցի հասանելիությունը։ | src/uiTranslations.js | uiError: native error fallback | editorial translation |

