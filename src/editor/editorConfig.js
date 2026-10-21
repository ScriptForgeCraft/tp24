import {
  packages,
  services,
  projects,
  stages,
  implementingCompanies,
  news,
  videos,
  navigation,
  partners,
} from "../data.js";

export const STORAGE_KEY = "prospect24-client-editor-v1";
export const VERSION = 2;
export const semanticId = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const sections = [
  ["hero", "Hero", "home"],
  ["intro", "Introduction", "approach"],
  ["development", "Development Services", "development"],
  ["packages", "Development Packages", "packages"],
  ["projects", "Selected Projects", "projects"],
  ["process", "Process", "process"],
  ["expertise", "Expertise", "about"],
  ["partners", "Partners", "partners", "expertise"],
  ["news", "News & Media", "news"],
  ["cta", "Start a Conversation", "conversation"],
  ["footer", "Contact & Footer", "contact"],
].map(([id, label, anchor, parent]) => ({ id, label, anchor, parent }));
const properties = {
  text: ["color"],
  section: ["backgroundColor", "color"],
  card: ["backgroundColor", "color", "borderColor"],
  button: ["backgroundColor", "color", "borderColor"],
  navigation: ["color", "backgroundColor"],
};
export const targets = Object.create(null);
function add(id, kind, label, supported = properties[kind]) {
  targets[id] = { id, kind, label, properties: supported };
}
sections.forEach((section) =>
  add(`${section.id}.section`, "section", section.label),
);
const textTargets = {
  hero: ["heading", "tagline", "description"],
  intro: ["label", "heading", "subheading", "description", "caption"],
  development: ["label", "heading", "description"],
  packages: ["label", "heading", "note"],
  projects: ["label", "heading", "note", "counter", "source"],
  process: ["label", "heading", "note"],
  expertise: [
    "label",
    "heading",
    "description",
    "evidence.heading",
    "evidence.description",
  ],
  partners: ["heading", "description"],
  news: [
    "label",
    "heading",
    "description",
    "media.heading",
    "media.description",
  ],
  cta: ["label", "heading", "description", "email"],
  footer: [
    "tagline",
    "explore",
    "conversation",
    "phone",
    "email",
    "location",
    "wordmark",
    "copyright",
    "note",
  ],
};
Object.entries(textTargets).forEach(([section, names]) =>
  names.forEach((name) =>
    add(
      `${section}.${name}`,
      "text",
      `${sections.find((s) => s.id === section).label} · ${name.replaceAll(".", " ")}`,
    ),
  ),
);
[
  "hero.explore",
  "hero.projects",
  "hero.scroll",
  "intro.learn",
  "packages.compare",
  "expertise.article",
  "partners.all",
  "cta.discuss",
  "footer.top",
  "footer.privacy",
  "footer.terms",
  "projects.previous",
  "projects.next",
].forEach((id) => add(id, "button", id.replaceAll(".", " · ")));
add("header.navigation", "navigation", "Navigation background");
navigation.forEach((item) =>
  ["header", "footer", "mobile"].forEach((place) =>
    add(
      `${place}.nav.${semanticId(item.en)}`,
      "navigation",
      `${place} · ${item.en}`,
    ),
  ),
);
function card(prefix, label, fields, bordered = true) {
  add(
    prefix,
    "card",
    label,
    bordered ? properties.card : ["backgroundColor", "color"],
  );
  fields.forEach((field) =>
    add(
      `${prefix}.${field}`,
      field === "button" ? "button" : "text",
      `${label} · ${field}`,
    ),
  );
}
packages.forEach((p) =>
  card(`packages.card.${semanticId(p.name)}`, p.name, [
    "heading",
    "description",
    "inheritance",
    "price",
    "button",
  ]),
);
services.forEach((s) =>
  card(`development.card.${semanticId(s.title)}`, s.title, [
    "heading",
    "description",
    "detail",
    "button",
  ]),
);
projects.forEach((p) =>
  card(
    `projects.card.${semanticId(p.name)}`,
    p.name,
    ["heading", "category", "button"],
    false,
  ),
);
stages.forEach(([title]) =>
  card(
    `process.card.${semanticId(title)}`,
    title,
    ["heading", "description"],
    false,
  ),
);
implementingCompanies.forEach((c) =>
  card(`expertise.card.${semanticId(c.name)}`, c.name, [
    "heading",
    "role",
    "description",
  ]),
);
news
  .slice(1)
  .forEach((n) =>
    card(
      `news.card.${n.slug}`,
      n.title,
      ["heading", "description", "button"],
      false,
    ),
  );
videos.forEach((v) => card(`news.video.${v.id}`, v.title, ["heading"], false));

export const assets = [
  ["hero-before", "Hero · Before"],
  ["hero-after", "Hero · After"],
  ["intro", "Introduction"],
  ["intro-detail", "Architectural detail"],
  ["market", "Market analysis"],
  ["planning", "Planning"],
  ["finance", "Finance"],
  ["investment", "Investment"],
  ["package", "Development package"],
  ["garden-hill", "Garden Hill"],
  ["avet", "Avet Avetisyan"],
  ["khachaturian", "Khachaturian"],
  ["partnership", "Partnership"],
  ["cta", "Architecture"],
]
  .map(([file, label]) => ({ src: `/images/${file}.webp`, label }))
  .concat(
    news.map((n) => ({
      src: n.image,
      label: n.organization,
      ref: `project:news.${n.slug}`,
    })),
    partners.map((p) => ({
      src: p.image,
      label: p.name,
      ref: `project:partner.${semanticId(p.name)}`,
    })),
    [{ src: "/images/brand-wordmark.png", label: "Prospect24 wordmark" }],
  )
  .map((asset) => ({ ...asset, ref: asset.ref || asset.src }));
// Stable aliases avoid saving build-specific hashed URLs in exported designs.
export const resolveProjectAsset = (ref) =>
  assets.find((asset) => asset.ref === ref)?.src || ref;
const image = (id, label) => add(id, "image", label, []);
image("hero.beforeImage", "Before Image");
image("hero.afterImage", "After Image");
image("intro.image", "Main Image");
image("intro.detailImage", "Detail Image");
image("expertise.image", "Partnership Image");
["header", "footer", "mobile"].forEach((p) =>
  image(`${p}.logo`, "Prospect24 Logo"),
);
packages.forEach((p) =>
  image(`packages.card.${semanticId(p.name)}.image`, `${p.name} · Image`),
);
services.forEach((s) => {
  image(
    `development.card.${semanticId(s.title)}.image`,
    `${s.title} · Mobile Image`,
  );
  image(`development.image.${semanticId(s.title)}`, `${s.title} · Image`);
});
projects.forEach((p) => {
  add(`projects.visual.${semanticId(p.name)}`, "container", p.name, []);
  image(`projects.visual.${semanticId(p.name)}.image`, `${p.name} · Image`);
});
news
  .slice(1)
  .forEach((n) =>
    image(`news.card.${n.slug}.image`, `${n.organization} · Image`),
  );
partners.forEach((p) => image(`partners.logo.${semanticId(p.name)}`, p.name));
[
  "hero.content",
  "hero.buttons",
  "intro.layout",
  "intro.composition",
  "intro.imageContainer",
  "intro.detailContainer",
  "development.layout",
  "development.list",
  "development.visual",
  "packages.layout",
  "projects.viewport",
  "process.layout",
  "expertise.layout",
  "expertise.imageContainer",
  "partners.layout",
  "news.layout",
  "cta.content",
  "footer.layout",
].forEach((id) =>
  add(
    id,
    "container",
    id
      .split(".")
      .at(-1)
      .replace(/([A-Z])/g, " $1"),
    [],
  ),
);
add("hero.overlay", "overlay", "Background Overlay", ["backgroundColor"]);
add("projects.overlay", "overlay", "Project Overlay", ["backgroundColor"]);
// Only simple copy is replaceable. Prices, counters, SVG lettering and structured labels stay structured.
Object.values(targets).forEach((t) => {
  t.textEditable =
    ["text", "button", "navigation"].includes(t.kind) &&
    !/\.(price|counter|wordmark|previous|next|top|label|copyright)$/.test(
      t.id,
    ) &&
    t.id !== "header.navigation" &&
    !(t.id.startsWith("development.card.") && t.id.endsWith(".button"));
});

export const dimensionKeys = [
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
];
export const spacingKeys = [
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
];
export const globalKeys = [
  "color",
  "backgroundColor",
  "borderColor",
  "borderWidth",
  "borderRadius",
  "boxShadow",
  "opacity",
];
export const responsiveKeys = [
  ...dimensionKeys,
  ...spacingKeys,
  "gap",
  "columnGap",
  "rowGap",
  "fontSize",
  "lineHeight",
  "objectPositionX",
  "objectPositionY",
  "zoom",
  "objectFit",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "gridTemplateColumns",
];
export const choices = {
  objectFit: ["cover", "contain", "fill"],
  flexDirection: ["row", "column"],
  justifyContent: [
    "flex-start",
    "center",
    "flex-end",
    "space-between",
    "space-around",
  ],
  alignItems: ["stretch", "flex-start", "center", "flex-end"],
  gridTemplateColumns: [
    "repeat(1, minmax(0, 1fr))",
    "repeat(2, minmax(0, 1fr))",
    "repeat(3, minmax(0, 1fr))",
  ],
};
export const shadows = {
  None: "none",
  Subtle: "0 2px 8px #00000014",
  Medium: "0 8px 24px #00000026",
  Strong: "0 16px 48px #00000040",
};
export const allowedKeys = [...globalKeys, ...responsiveKeys];
export function edit(id) {
  if (!Object.hasOwn(targets, id))
    throw new Error(`Unknown editor target: ${id}`);
  return { "data-edit-id": id };
}
export function sectionEdit(id) {
  return { ...edit(`${id}.section`), "data-edit-section": id };
}
export const emptyDesign = () => ({
  version: VERSION,
  visibility: {},
  overrides: {},
  responsive: { tablet: {}, mobile: {} },
  images: {},
  texts: { en: {}, am: {} },
  comparison: {},
  locks: {},
});
const record = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
export function validateProperty(key, value) {
  if (!allowedKeys.includes(key))
    throw new Error(`Unsupported property: ${key}.`);
  if (["color", "backgroundColor", "borderColor"].includes(key))
    return typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
  if (choices[key]) return choices[key].includes(value);
  if (key === "boxShadow") return Object.values(shadows).includes(value);
  if (
    [
      "opacity",
      "objectPositionX",
      "objectPositionY",
      "zoom",
      "lineHeight",
    ].includes(key)
  )
    return (
      typeof value === "number" &&
      Number.isFinite(value) &&
      value >= (key === "zoom" ? 1 : 0) &&
      value <=
        (key === "opacity"
          ? 1
          : key === "zoom"
            ? 3
            : key === "lineHeight"
              ? 3
              : 100)
    );
  if (value === "auto") return dimensionKeys.includes(key);
  if (
    typeof value !== "string" ||
    !/^-?\d+(\.\d{1,3})?(px|%|vw|vh)$/.test(value)
  )
    return false;
  const n = parseFloat(value),
    unit = value.match(/[a-z%]+$/)[0];
  if (n < 0 && !key.startsWith("margin")) return false;
  if (["height", "minHeight", "maxHeight"].includes(key) && unit === "%")
    return false;
  return Math.abs(n) <= (unit === "px" ? 5000 : 100);
}
export function validateDesign(input) {
  if (!record(input) || ![1, 2].includes(input.version))
    throw new Error("Unsupported design version.");
  const result = emptyDesign();
  const readMap = (map, out, scope) => {
    if (map === undefined) return;
    if (!record(map)) throw new Error("Invalid style map.");
    for (const [id, styles] of Object.entries(map)) {
      if (!Object.hasOwn(targets, id))
        throw new Error(`Unsupported element: ${id}.`);
      if (!record(styles)) throw new Error(`Invalid styles: ${id}.`);
      const safe = {};
      for (const [key, value] of Object.entries(styles)) {
        if (scope && !responsiveKeys.includes(key))
          throw new Error("This property is global.");
        if (!validateProperty(key, value))
          throw new Error(`Invalid value for ${key}.`);
        safe[key] = value;
      }
      if (Object.keys(safe).length) out[id] = safe;
    }
  };
  readMap(input.overrides, result.overrides);
  if (input.visibility !== undefined) {
    if (!record(input.visibility))
      throw new Error("Invalid section visibility.");
    for (const [id, v] of Object.entries(input.visibility)) {
      if (!sections.some((s) => s.id === id) || typeof v !== "boolean")
        throw new Error("Invalid section visibility.");
      if (!v) result.visibility[id] = false;
    }
  }
  if (input.responsive !== undefined) {
    if (
      !record(input.responsive) ||
      Object.keys(input.responsive).some(
        (k) => !["tablet", "mobile"].includes(k),
      )
    )
      throw new Error("Invalid breakpoint.");
    ["tablet", "mobile"].forEach((k) =>
      readMap(input.responsive[k], result.responsive[k], k),
    );
  }
  for (const name of ["images", "texts", "comparison", "locks"])
    if (input[name] !== undefined && !record(input[name]))
      throw new Error(`Invalid ${name}.`);
  for (const [id, ref] of Object.entries(input.images || {})) {
    if (
      targets[id]?.kind !== "image" ||
      typeof ref !== "string" ||
      !(assets.some((a) => a.ref === ref) || /^asset:[a-f0-9]{64}$/.test(ref))
    )
      throw new Error("Invalid image reference.");
    result.images[id] = ref;
  }
  for (const [lang, map] of Object.entries(input.texts || {})) {
    if (!["en", "am"].includes(lang) || !record(map))
      throw new Error("Invalid language.");
    for (const [id, text] of Object.entries(map)) {
      if (
        !targets[id]?.textEditable ||
        typeof text !== "string" ||
        text.length > 10000
      )
        throw new Error("Invalid text.");
      result.texts[lang][id] = text;
    }
  }
  for (const [key, val] of Object.entries(input.comparison || {})) {
    if (
      key === "initialSplit"
        ? !(Number.isFinite(val) && val >= 0 && val <= 100)
        : !(["labels", "divider"].includes(key) && typeof val === "boolean")
    )
      throw new Error("Invalid comparison setting.");
    result.comparison[key] = val;
  }
  for (const [id, value] of Object.entries(input.locks || {})) {
    if (!Object.hasOwn(targets, id) || typeof value !== "boolean")
      throw new Error("Invalid aspect ratio lock.");
    result.locks[id] = value;
  }
  return result;
}
export function loadDesign(storage) {
  try {
    const v = storage.getItem(STORAGE_KEY);
    return v ? validateDesign(JSON.parse(v)) : emptyDesign();
  } catch {
    return emptyDesign();
  }
}
export const isSectionHidden = (design, section) =>
  section &&
  (design.visibility[section.id] === false ||
    (section.parent && design.visibility[section.parent] === false));
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
export function designCSS(design) {
  const rules = sections
    .filter((s) => design.visibility[s.id] === false)
    .map((s) => `[data-edit-section="${s.id}"]{display:none!important}`);
  const emit = (map) =>
    Object.entries(map)
      .map(([id, styles]) => {
        const sel = `[data-edit-id="${id}"]`;
        let body = "",
          extra = "";
        for (const [key, v] of Object.entries(styles)) {
          if (["objectPositionX", "objectPositionY", "zoom"].includes(key)) {
            body +=
              key === "zoom"
                ? `scale:${v}!important;`
                : `--p24-pos-${key === "objectPositionX" ? "x" : "y"}:${v}%;`;
            if (key !== "zoom")
              body +=
                "object-position:var(--p24-pos-x,var(--p24-original-x,50%)) var(--p24-pos-y,var(--p24-original-y,50%))!important;";
          } else if (key === "color") {
            body += `--p24-text:${v};color:var(--p24-text)!important;`;
            extra += `${sel} :where(h1,h2,h3,h4,p,span,strong,small,li,a,button,svg,text):not(:where([data-editor-ui],[data-editor-ui] *)){color:var(--p24-text)!important}`;
          } else
            body += `${kebab(key)}:${v === "auto" && ["maxHeight", "maxWidth"].includes(key) ? "none" : v}!important;`;
          if (
            key === "backgroundColor" &&
            id.startsWith("packages.card.") &&
            targets[id].kind === "card"
          )
            extra += `${sel}::after{background:${v}!important}`;
        }
        if (parseFloat(styles.borderWidth) > 0)
          body += "border-style:solid!important;";
        if (styles.width || styles.height)
          extra += `${sel}:is(span,strong,small){display:inline-block!important}`;
        // Content-bearing elements expand rather than clipping a client's copy.
        if (
          targets[id].kind !== "image" &&
          ![
            "hero.section",
            "projects.viewport",
            "intro.imageContainer",
            "intro.detailContainer",
            "expertise.imageContainer",
            "development.visual",
          ].includes(id) &&
          (styles.height || styles.maxHeight)
        )
          body += "overflow:visible!important;";
        if (
          styles.width &&
          [
            "card",
            "text",
            "button",
            "section",
            "container",
            "navigation",
          ].includes(targets[id].kind)
        )
          body += "min-width:0;max-width:100%;flex-shrink:0;";
        return `${sel}{${body}}${extra}`;
      })
      .join("\n");
  rules.push(emit(design.overrides));
  rules.push(
    `@media(max-width:1024px){${emit(design.responsive.tablet)}}`,
    `@media(max-width:600px){${emit(design.responsive.mobile)}}`,
  );
  if (design.comparison.labels === false)
    rules.push(".comparison-labels{display:none!important}");
  if (design.comparison.divider === false)
    rules.push(".p24-editing .compare-divider{visibility:hidden!important}");
  return rules.join("\n");
}
