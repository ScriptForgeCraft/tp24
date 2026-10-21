import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { catalog, readData, readDataSource, uiCatalog, uiText } from './localization-catalog.mjs';

const revision = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const source = execFileSync('git',['show',`${revision}:src/data.js`],{encoding:'utf8'});
const before = new Map(catalog(await readDataSource(source)).map(row=>[row.key,row.am]));
const data = await readData();
const rows = [...catalog(data),...uiCatalog()];
const counts = {
  reviewed: rows.length,
  corrected: rows.filter(row=>before.has(row.key)&&before.get(row.key)!==row.am).length,
  added: rows.filter(row=>!before.has(row.key)).length,
  retained: rows.filter(row=>before.has(row.key)&&before.get(row.key)===row.am).length,
};
const official = {
  packages:'https://prospect24.am/investment-packages/', companies:'https://prospect24.am/companies/',
  projects:'https://prospect24.am/projects/', partners:'https://prospect24.am/partners/',
  contact:'https://prospect24.am/contact-us/', en:'https://prospect24.am/en/',
  state:'https://prospect24.am/memorandum-of-cooperation/',
  architects:'https://prospect24.am/prospect24_archtects-palace/',
  chakhruk:'https://prospect24.am/memorandum-chakhruk-ngo-and-prospect24/',
};
function reference(row){
  if(row.key.startsWith('packages'))return official.packages;
  if(row.key.startsWith('services'))return official.packages;
  if(row.key.startsWith('projects'))return official.projects;
  if(row.key.startsWith('implementingCompanies'))return official.companies;
  if(row.key.startsWith('news[0]'))return official.state;
  if(row.key.startsWith('news[1]'))return official.chakhruk;
  if(row.key.startsWith('news[2]'))return official.architects;
  if(row.key.startsWith('contact'))return official.contact;
  return '';
}
const exactVerified = new Set(['packages[0].name','packages[1].name','packages[2].name','projects[0].name','projects[1].name','projects[2].name','implementingCompanies[1].name','implementingCompanies[2].name','news[0].organization','news[1].organization','news[2].organization','contact.location']);
const cell=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n','<br>');
const table=(head,entries)=>`| ${head.join(' | ')} |\n| ${head.map(()=>'---').join(' | ')} |\n${entries.map(row=>`| ${row.map(cell).join(' | ')} |`).join('\n')}\n`;
const updates=rows.map(row=>[row.en,row.am,row.file,row.key,reference(row)||'—',exactVerified.has(row.key)?'verified':'editorial translation',before.has(row.key)?before.get(row.key)===row.am?'reviewed; retained':'corrected':'new']);
let config=await fs.readFile('src/editor/editorConfig.js','utf8');
const dataSource=(await fs.readFile('src/data.js','utf8')).replace(/import\.meta\.glob\([^;]+\)/g,'{}');
config=config.replace('"../data.js"',JSON.stringify(`data:text/javascript;base64,${Buffer.from(dataSource).toString('base64')}`));
const editor=await import(`data:text/javascript;base64,${Buffer.from(config).toString('base64')}`);
const labels=Object.values(editor.targets).map(target=>[target.label,uiText(target.label,'am',target.id),'src/editor/editorConfig.js',target.id,'editorial translation']);
const facts=[
  ['Published package price: 2 400 000 AMD','2 400 000 դրամ','src/main.jsx','price(packages[0])',official.packages,'verified'],
  ['Starting from 4 800 000 AMD','Սկսած 4 800 000 դրամից','src/main.jsx','price(packages[1])',official.packages,'verified'],
  ['Starting from 11 200 000 AMD','Սկսած 11 200 000 դրամից','src/main.jsx','price(packages[2])',official.packages,'verified'],
  ['Signed 24 January 2025','Ստորագրվել է 2025 թ․ հունվարի 24','src/main.jsx','date(news[0].signed)',official.state,'verified'],
  ['Published 28 January 2025','Հրապարակվել է 2025 թ․ հունվարի 28','src/main.jsx','date(news[0].published)',official.state,'verified'],
  ['Signed 20 January 2025','Ստորագրվել է 2025 թ․ հունվարի 20','src/main.jsx','date(news[1].signed)',official.chakhruk,'verified'],
  ['Published 25 February 2025','Հրապարակվել է 2025 թ․ փետրվարի 25','src/main.jsx','date(news[1].published)',official.chakhruk,'verified'],
  ['Signed 21 March 2025','Ստորագրվել է 2025 թ․ մարտի 21','src/main.jsx','date(news[2].signed)',official.architects,'verified'],
  ['Published 26 March 2025','Հրապարակվել է 2025 թ․ մարտի 26','src/main.jsx','date(news[2].published)',official.architects,'verified'],
];
const dynamic=[
  ['Reset {property}','Վերակայել՝ {հատկություն}','src/uiTranslations.js','uiText: Reset template'],
  ['Show {section}','Ցուցադրել՝ {բաժին}','src/uiTranslations.js','uiText: Show template'],
  ['Hide {section}','Թաքցնել՝ {բաժին}','src/uiTranslations.js','uiText: Hide template'],
  ['{property} value','{հատկություն}՝ արժեք','src/uiTranslations.js','uiText: value suffix'],
  ['{property} unit','{հատկություն}՝ չափման միավոր','src/uiTranslations.js','uiText: unit suffix'],
  ['{property} hex','{հատկություն}՝ տասնվեցական գույնի կոդ','src/uiTranslations.js','uiText: hex suffix'],
  ['{device} changes override inherited sizes and spacing. Colors stay global.','{սարք}․ այստեղ սահմանված չափերն ու բացատները փոխարինում են ժառանգված արժեքներին։ Գույները մնում են ընդհանուր։','src/uiTranslations.js','uiText: responsive scope'],
  ['{section} restored / hidden.','{բաժին}․ վերականգնված է / թաքցված է։','src/uiTranslations.js','uiText: visibility status'],
  ['Image not saved: {error}','Պատկերը չի պահպանվել․ {սխալ}','src/uiTranslations.js','uiText: image error'],
  ['Export failed: {error}','Արտահանումը ձախողվել է․ {սխալ}','src/uiTranslations.js','uiText: export error'],
  ['Import failed: {error}','Ներմուծումը ձախողվել է․ {սխալ}','src/uiTranslations.js','uiText: import error'],
  ['Project imported. Undo is available. {warning}','Նախագիծը ներմուծված է։ Կարող եք հետարկել փոփոխությունը։ {զգուշացում}','src/uiTranslations.js','uiText: import status'],
  ['Unrecognized browser/JSON/storage diagnostic','Չհաջողվեց մշակել տվյալները։ Ստուգեք ֆայլի ձևաչափն ու դիտարկիչի պահոցի հասանելիությունը։','src/uiTranslations.js','uiError: native error fallback'],
];
const files=[
  ['src/data.js','Existing EN/AM keys, package scope, services, companies, news, metadata and form messages.'],
  ['src/main.jsx','Shared language state, dates, currency inflection, mail draft copy, validation and illustrative image description.'],
  ['src/localization.jsx','Small shared language context for the existing presentation, previews and editor.'],
  ['src/uiTranslations.js','Customer-facing editor and preview dictionary; generated labels and error templates.'],
  ['src/armenian.css','Armenian font family, glyph-safe line heights, long headings and button text.'],
  ['src/components/SelectedPortfolio.jsx','Localized accessible carousel/slide descriptions; slider behavior unchanged.'],
  ['src/preview/PreviewHost.jsx','Localized selector, all palette names/descriptions, overview and active title.'],
  ['src/editor/EditorProvider.jsx','Localized toolbar, status, section controls, reset dialog and canvas labels.'],
  ['src/editor/PropertiesPanel.jsx','Localized properties and accessible labels; copy language follows canvas.'],
  ['src/editor/LayersPanel.jsx','Localized layer labels and states.'],
  ['src/editor/SelectionOverlay.jsx','Localized selection labels, hide and resize controls.'],
  ['src/editor/ImageSourceControls.jsx','Concurrent image-control component uses the shared localization helper.'],
  ['package.json; package-lock.json','Locally bundled Noto Sans Armenian and Noto Serif Armenian.'],
  ['scripts/verify-editor.mjs','Expect Armenian labels after switching the editor language.'],
  ['scripts/verify-content.mjs','Accept Armenian space-separated reference areas alongside English comma grouping.'],
  ['scripts/verify-color-previews.mjs','Correct stale final-section expectation to the existing conversation anchor.'],
  ['scripts/verify-preview-motion.mjs','Target the existing active portfolio action, whose accessible name includes the project.'],
  ['scripts/verify-portfolio.mjs','Wait for fonts and the final rail position before the existing native-touch gesture assertion.'],
  ['scripts/localization-catalog.mjs; scripts/verify-armenian.mjs; scripts/write-localization-audit.mjs','Reproducible inventory, dedicated Armenian regression checks and report.'],
];
const report=`# Armenian localization audit — Prospect24

Reviewed 21 October 2026. Local repository implementation only; no deployment, publication, commit or push was performed.

## Scope and counts

- **${counts.reviewed} catalog entries reviewed**: ${catalog(data).length} existing structured-content paths and ${uiCatalog().length} editor/preview dictionary entries.
- **${counts.corrected} existing Armenian entries corrected**; **${counts.added} new Armenian entries**; **${counts.retained} reviewed entries retained**.
- Comparison baseline: Git revision \`${revision}\`.
- Counts use one effective key or array-element path per entry. Shared financial-scope text appears at each package path. Dictionary entries include reusable control/property terms, including labels exposed conditionally. Generated editor labels, price/date renderings and dynamic templates are listed separately below and are not added again to the catalog count.
- No missing Armenian catalog values. Proper names, logos, URLs, email addresses, file formats, units and internal identifiers are intentionally retained where appropriate.

## Implementation

${table(['File','Change'],files)}
The existing translations, keys, anchors, prices, imagery, state and interactions were retained. The shared context coordinates the current translation system across parent and editor canvas; it does not replace the content dictionaries. EN/AM updates HTML language to en/hy, title and description without navigation. Switching preserves scroll, selected portfolio project, dialog state, theme and independent saved English/Armenian copy. Contact fields remain in place and the form still prepares a mailto draft.

Concurrent image-editor changes were present during this audit. Their behavior was preserved and their new controls localized; changes to EditorElement.jsx, editorConfig.js, editorExport.js, editor.css and the image-control verification script belong to that concurrent work, not to a localization redesign.

## Official references and verification standard

${Object.entries(official).map(([name,link])=>`- [${name}](${link})`).join('\n')}

The Armenian package page and Chakhruk article timed out or were inaccessible in the web text reader but their complete HTML was fetched directly from the same official URLs. Armenian package titles, listed prices and area were confirmed against that HTML and the English package page. Official company/project/partner/contact pages and the state-property and architects articles were read successfully. The official article calls the initiative **«Ճախրուկ բնակուտ»**; the earlier «Ճախրուկ ավան» wording was corrected. Signing dates and publication dates are kept distinct.

**verified** means the stated name, fact or official Armenian wording was found in the official reference; harmless capitalization/address expansion is permitted. **editorial translation** means a contextual Armenian rendering of the existing English meaning. A reference attached to an editorial row supports the business context, not a claim that its exact prose is official. **needs approval** is reserved for unresolved business/commercial/legal choices, not used to mislabel editorial copy as verified.

## Typography and visual QA

The actual bundled Latin WOFF2 cmaps contain zero Armenian glyphs for Manrope and Cormorant Garamond. Noto Sans Armenian and Noto Serif Armenian each contain 85 Armenian code points and cover the full alphabet used here. They are bundled through Fontsource/Vite with no runtime font CDN. English font choices remain unchanged. See [font coverage](qa/localization/font-coverage.json).

Armenian was checked at 1920, 1440, 1280, 1024, 850, 768, 700, 650, 600, 390, 375 and 320 px. The dedicated suite checks heading width and horizontal page/dialog overflow. Long Armenian process-stage text wraps within the existing tablet columns. Desktop/mobile screenshots cover the hero, introduction, packages, portfolio, news, package scopes, comparison, contact, editor/gallery and overview. Representative files are under [qa/localization](qa/localization). Mobile layout, swipe, arrows and slider geometry were retained; the Armenian project action gets sufficient text width.

## Validation

Final results are recorded in [validation.json](qa/localization/validation.json). The original general UI, accessibility and editor suites remain in place; assertions were not removed to hide failures.

${await fs.readFile('qa/localization/validation.json','utf8').then(text=>table(['Command / check','Result','Evidence / limitation'],JSON.parse(text).tests.map(test=>[test.command,test.status,test.detail]))).catch(()=>'Validation summary pending final test completion.')}

Known pre-existing findings were reproduced against the original Git revision:

1. The photo-background contrast sampler fails on the desktop portfolio number (baseline and current minimum 3.10:1, required 4.5:1) and the English project title (baseline and current 2.94:1 against a 3:1 requirement). Armenian reports one desktop number failure in each of the six palettes and no mobile failures. These failures are reported, not suppressed or described as passing. No portfolio shade/design change was introduced for this localization task. The longer Armenian scroll badge was raised above the comparison divider to prevent its text crossing underneath that line in the light palette.
2. The broader content suite stops on the English ARCHITECTURAL portfolio heading at 768 px. Original baseline and current both measure 363 px text in a 352 px line. The Armenian dedicated width checks pass.
3. The design-switcher suite detects an English header overflow at 320 px: 336 px scroll width in a 320 px header, reproduced unchanged on the original revision. Armenian page-overflow checks pass; this existing header issue is documented.

Baseline evidence: [contrast](qa/localization/baseline-contrast.json) and [geometry](qa/localization/baseline-geometry.json). The final baseline run loaded all original fonts successfully and recorded no blocked resource requests; an earlier run with blocked fonts was discarded.

Automatic approval review rejected deletion of the temporary comparison fixture with the reason “blocked by policy”. Temporary files remain under output/localization and are not part of the application build. The baseline server was stopped.

## Terminology and business questions

${table(['Topic','Decision / unresolved question','Status'],[
['Architectural planning assignment','Use ճարտարապետահատակագծային առաջադրանք (ՃՀԱ, APZ). The source uses АПЗ/APZ; approval remains explicitly unguaranteed.','editorial translation'],
['Excavation information','Retain the official փորվածքներ terminology where needed. Exact technical deliverable remains part of the agreed commercial scope.','verified'],
['Commercial offer','Listed prices, starting-price distinction and 1 200–1 500 մ² reference area are unchanged. Final scope and commercial offer still require confirmation.','needs approval'],
['Legal notices','Prototype notices are translated faithfully; final production privacy policy/terms require client approval before launch.','needs approval'],
['Portfolio evidence','Preserve the three official identities. Completion status, construction authorship and commercial outcomes are not established by the gallery. No extra claims added.','needs approval'],
['Partner names','Keep official logo identities and supplied international names; no unsupported Armenian brand names created.','verified'],
])}

No customer-facing English sentence remains intentionally untranslated in Armenian mode. Retained English/Latin content consists of proper names, channels (Dignisi News, YouTube), APZ, file formats, keyboard shortcuts, units, email/URL examples and technical identifiers. User-authored editor text is preserved verbatim and is not automatically translated. Native browser/JSON error diagnostics receive a localized fallback; English retains the original diagnostic.

## Complete effective localization catalog

${table(['Original English string','Final Armenian translation','Source file','Translation key','Official source / factual context','Status','Audit change'],updates)}

## Generated editor labels

These labels are assembled from the reviewed dictionary without translating target IDs, CSS properties, saved values, storage keys or imported object keys. The design-process stage uses Նախագծել in its specific context; the visual-design control remains Դիզայն.

${table(['Original English label','Final Armenian label','Source file','Stable target ID','Status'],labels)}

## Formatted prices and dates

${table(['Original English rendering','Final Armenian rendering','Source file','Rendering key','Official source','Status'],facts)}

## Dynamic status and accessible-label templates

${table(['Original English template','Final Armenian template','Source file','Translation key','Status'],dynamic.map(row=>[...row,'editorial translation']))}
`;
await fs.writeFile('ARMENIAN_LOCALIZATION_AUDIT.md',report);
await fs.writeFile('qa/localization/catalog.json',JSON.stringify({baseline:revision,counts,rows},null,2));
console.log(JSON.stringify({...counts,generatedEditorLabels:labels.length}));
