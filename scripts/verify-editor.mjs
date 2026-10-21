import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { unzipSync, strFromU8, zipSync, strToU8 } from "fflate";
import { editorReducer, initialHistory } from "../src/editor/editorHistory.js";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage(),
  url = process.env.PREVIEW_URL || "http://localhost:5173/",
  key = "prospect24-client-editor-v1";
const checks = [],
  errors = [];
const directory = "qa/editor";
await fs.mkdir(directory, { recursive: true });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const check = (name, value) => {
  assert.ok(value, name);
  checks.push(name);
  console.log("PASS", name);
};
const toolbar = () =>
  page.getByRole("region", { name: "Design editor", exact: true });
const click = async (name) => {
  await toolbar().getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(100);
};
let frame;
async function canvas() {
  await page.locator("iframe").waitFor();
  await page.waitForFunction(() =>
    document
      .querySelector("iframe")
      ?.contentDocument?.querySelector('[data-edit-id="hero.heading"]'),
  );
  frame = page.frames().find((f) => f.url().includes("editorCanvas=1"));
  await frame.locator('[data-edit-id="hero.heading"]').waitFor();
  await page.waitForTimeout(500);
}
const target = (id) => frame.locator(`[data-edit-id="${id}"]`);
async function select(id) {
  await click("Layers");
  const button = page.locator(`[data-layer-id="${id}"]`);
  await button.click();
  await page
    .getByRole("region", { name: "Element properties", exact: true })
    .waitFor();
  await page.waitForTimeout(100);
}
async function computed(id, property) {
  return target(id).evaluate((e, k) => getComputedStyle(e)[k], property);
}
async function group(name) {
  const d = page.locator(".p24-group").filter({
    has: page.locator("summary").filter({
      hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
    }),
  });
  if (!((await d.getAttribute("open")) !== null))
    await d.locator("summary").click();
}
async function number(label, value) {
  const input = page.getByLabel(label, { exact: true });
  await input.fill(String(value));
  await input.blur();
  await page.waitForTimeout(90);
}
async function range(label, value) {
  await page.getByLabel(label, { exact: true }).evaluate((input, v) => {
    input.focus();
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.getByLabel(label, { exact: true }).blur();
  await page.waitForTimeout(100);
}
async function color(label, value) {
  await page.getByLabel(label, { exact: true }).evaluate((input, v) => {
    input.focus();
    input.value = v;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await page.getByLabel(label, { exact: true }).blur();
  await page.waitForTimeout(80);
}
async function saved() {
  await page.waitForTimeout(400);
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
}
async function importFile(file) {
  await page.getByLabel("Import design file").setInputFiles(file);
  await page.waitForTimeout(400);
}
async function reset() {
  await click("Reset All");
  await page
    .getByRole("button", { name: "Restore original", exact: true })
    .click();
  await page.waitForTimeout(150);
}
async function visible(id) {
  await page.waitForTimeout(80);
  return target(`${id}.section`).isVisible();
}
async function audit(name) {
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1000);
  const r = await new AxeBuilder({ page })
    .include(".p24-editor")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await fs.writeFile(
    `${directory}/a11y-${name}.json`,
    JSON.stringify(r.violations, null, 2),
  );
  check(`Editor accessibility ${name}`, r.violations.length === 0);
}
try {
  let state = initialHistory({ v: 0 });
  for (let v = 1; v <= 100; v++)
    state = editorReducer(state, {
      type: "change",
      continuous: true,
      value: { v },
    });
  state = editorReducer(state, { type: "undo" });
  check("Continuous gestures undo as one operation", state.present.v === 0);
  state = editorReducer(state, { type: "redo" });
  check("Redo restores gesture", state.present.v === 100);
  state = editorReducer(state, {
    type: "change",
    continuous: true,
    value: { v: 200 },
  });
  state = editorReducer(state, { type: "cancel" });
  check(
    "Escape cancellation preserves previous state",
    state.present.v === 100,
  );
  await page.goto(url);
  check(
    "Editor optional at normal startup",
    (await page.locator(".p24-toolbar").count()) === 0,
  );
  const originalHeading = await page
    .locator('[data-edit-id="hero.heading"]')
    .textContent();
  await page
    .getByRole("button", { name: "Enable Edit Mode", exact: true })
    .click();
  await canvas();
  check(
    "Live canvas has unique stable IDs",
    await frame
      .locator("[data-edit-id]")
      .evaluateAll(
        (els) => new Set(els.map((e) => e.dataset.editId)).size === els.length,
      ),
  );
  check(
    "Every major section has a hide control",
    (await frame.locator(".p24-hide").count()) === 11,
  );
  await target("hero.heading").click();
  check(
    "Direct nested selection opens properties",
    await page
      .locator(".p24-panel-heading")
      .textContent()
      .then((s) => s.includes("heading")),
  );
  await group("Appearance");
  await color("Text color", "#cc3333");
  check(
    "Color updates the real heading",
    (await computed("hero.heading", "color")) === "rgb(204, 51, 51)",
  );
  await click("Undo");
  check(
    "Color undo",
    (await computed("hero.heading", "color")) !== "rgb(204, 51, 51)",
  );
  await click("Redo");
  check(
    "Color redo",
    (await computed("hero.heading", "color")) === "rgb(204, 51, 51)",
  );
  await page.getByRole("button", { name: "Reset Color", exact: true }).click();
  await page
    .getByLabel("Text content", { exact: true })
    .fill("A client heading\nSecond line");
  await page.getByLabel("Text content", { exact: true }).blur();
  check(
    "English copy applies through React",
    (await target("hero.heading").textContent()) ===
      "A client headingSecond line",
  );
  await page.locator("#p24-copy-language").selectOption("am");
  await page.waitForTimeout(150);
  await page
    .getByLabel("Text content", { exact: true })
    .fill("Հայերեն վերնագիր");
  await page.getByLabel("Text content", { exact: true }).blur();
  check(
    "Armenian copy applies independently",
    (await target("hero.heading").textContent()) === "Հայերեն վերնագիր",
  );
  await page.locator("#p24-copy-language").selectOption("en");
  await page.waitForTimeout(150);
  check(
    "English copy survives Armenian changes",
    (await target("hero.heading").textContent()) ===
      "A client headingSecond line",
  );
  await page
    .getByRole("button", { name: "Reset Selected", exact: true })
    .click();
  await page.waitForTimeout(100);
  check(
    "Element reset restores default copy",
    (await target("hero.heading").textContent()) === originalHeading,
  );
  await select("hero.explore");
  await page
    .getByLabel("Text content", { exact: true })
    .fill("Explore this presentation");
  await page.getByLabel("Text content", { exact: true }).blur();
  await page.waitForTimeout(100);
  check(
    "Button label edits preserve the arrow icon in production",
    (await target("hero.explore").locator("svg").count()) === 1 &&
      (await target("hero.explore").textContent()).includes(
        "Explore this presentation",
      ),
  );
  await target("hero.explore").click();
  check(
    "Selection prevents link navigation",
    !frame.url().includes("#development"),
  );
  await select("hero.section");
  await number("Min Height", 1100);
  check(
    "Hero minimum height changes",
    (await computed("hero.section", "minHeight")) === "1100px",
  );
  await click("Mobile");
  await number("Min Height", 820);
  check(
    "Mobile min height updates",
    (await computed("hero.section", "minHeight")) === "820px",
  );
  await click("Desktop");
  await page.waitForTimeout(100);
  check(
    "Mobile override leaves desktop intact",
    (await computed("hero.section", "minHeight")) === "1100px",
  );
  await page
    .getByRole("button", { name: "Collapse properties panel", exact: true })
    .click();
  await target("hero.section").evaluate((el) =>
    el.scrollIntoView({ block: "end", behavior: "instant" }),
  );
  await frame.evaluate(() => window.scrollBy({ top: 40, behavior: "instant" }));
  await page.waitForTimeout(150);
  const heroHandle = await frame
    .getByRole("button", { name: "Resize height", exact: true })
    .boundingBox();
  const heroHeight = parseFloat(await computed("hero.section", "height"));
  await page.mouse.move(
    heroHandle.x + heroHandle.width / 2,
    heroHandle.y + heroHandle.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    heroHandle.x + heroHandle.width / 2,
    heroHandle.y + heroHandle.height / 2 - 45,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.waitForTimeout(150);
  check(
    "Hero drag can shrink its existing viewport height",
    parseFloat(await computed("hero.section", "height")) < heroHeight - 20,
  );
  await click("Undo");
  await page
    .getByRole("button", { name: "Expand properties panel", exact: true })
    .click();
  await select("packages.card.pre-investment-package");
  await number("Height", 900);
  check(
    "Card height changes independently",
    Math.round(
      parseFloat(
        await computed("packages.card.pre-investment-package", "height"),
      ),
    ) === 900,
  );
  await select("packages.card.pre-investment-package.image");
  await page.getByLabel("Lock aspect ratio", { exact: true }).uncheck();
  await number("Height", 320);
  check(
    "Image height changes independently",
    (await computed("packages.card.pre-investment-package.image", "height")) ===
      "320px",
  );
  check(
    "Image height leaves card unchanged",
    Math.round(
      parseFloat(
        await computed("packages.card.pre-investment-package", "height"),
      ),
    ) === 900,
  );
  await select("intro.imageContainer");
  await page
    .getByRole("button", { name: "Collapse properties panel", exact: true })
    .click();
  await page.waitForTimeout(150);
  const handle = frame.getByRole("button", {
    name: "Resize width and height",
    exact: true,
  });
  const box = await handle.boundingBox();
  const before = await target("intro.imageContainer").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 40,
    box.y + box.height / 2 + 30,
    { steps: 8 },
  );
  await page.mouse.up();
  await page.waitForTimeout(150);
  check(
    "Dragging resize handles changes actual dimensions",
    (await target("intro.imageContainer").boundingBox()).width >
      before.width + 20,
  );
  await click("Undo");
  await page.waitForTimeout(150);
  check(
    "Resize is one undo step",
    Math.abs(
      (await target("intro.imageContainer").boundingBox()).width - before.width,
    ) < 2,
  );
  const box2 = await handle.boundingBox();
  await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box2.x + box2.width / 2 + 30,
    box2.y + box2.height / 2 + 30,
    { steps: 5 },
  );
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await page.waitForTimeout(150);
  check(
    "Escape cancels active resize",
    Math.abs(
      (await target("intro.imageContainer").boundingBox()).width - before.width,
    ) < 2,
  );
  await page
    .getByRole("button", { name: "Expand properties panel", exact: true })
    .click();
  await select("intro.section");
  await group("Spacing");
  await page.getByLabel("Link sides", { exact: true }).selectOption("opposite");
  await number("Padding Top", 88);
  check(
    "Linked spacing applies opposite sides",
    (await computed("intro.section", "paddingTop")) === "88px" &&
      (await computed("intro.section", "paddingBottom")) === "88px",
  );
  await page
    .getByRole("button", { name: "Reset Padding Top", exact: true })
    .click();
  check(
    "Individual property reset works",
    (await computed("intro.section", "paddingTop")) !== "88px",
  );
  await select("hero.beforeImage");
  await page
    .getByLabel("Upload new image", { exact: true })
    .setInputFiles("public/images/market.webp");
  await page.waitForTimeout(400);
  const beforeSrc = await target("hero.beforeImage").getAttribute("src");
  check("Upload creates a persisted blob asset", beforeSrc.startsWith("blob:"));
  await page.getByLabel("Object fit", { exact: true }).selectOption("contain");
  await range("Horizontal position", 24);
  await range("Vertical position", 70);
  await range("Zoom", 1.25);
  await group("Appearance");
  await range("Image opacity", 0.6);
  await range("Border radius", 24);
  check(
    "Radius slider updates a real image border",
    (await computed("hero.beforeImage", "borderRadius")) === "24px",
  );
  check(
    "Image fit, crop, zoom and opacity apply",
    (await computed("hero.beforeImage", "objectFit")) === "contain" &&
      (await computed("hero.beforeImage", "objectPosition")) === "24% 70%" &&
      (await computed("hero.beforeImage", "opacity")) === "0.6" &&
      (await computed("hero.beforeImage", "scale")) === "1.25",
  );
  await page
    .getByRole("button", { name: "Reset Image Settings", exact: true })
    .click();
  await page.waitForTimeout(100);
  check(
    "Reset image settings restores appearance and preserves its source",
    (await computed("hero.beforeImage", "opacity")) === "1" &&
      (await computed("hero.beforeImage", "objectPosition")) === "50% 51%" &&
      (await target("hero.beforeImage").getAttribute("src")) === beforeSrc,
  );
  await click("Undo");
  await select("hero.afterImage");
  await page
    .getByLabel("Upload new image", { exact: true })
    .setInputFiles("public/images/planning.webp");
  await page.waitForTimeout(400);
  check(
    "Before and After uploads stay independent",
    (await target("hero.afterImage").getAttribute("src")) !== beforeSrc &&
      (await computed("hero.afterImage", "opacity")) === "1",
  );
  await page.getByLabel("Object fit", { exact: true }).selectOption("cover");
  await range("Vertical position", 40);
  await page
    .getByRole("button", { name: "Choose Existing Image", exact: true })
    .click();
  await page.getByRole("button", { name: "Garden Hill", exact: true }).click();
  await page.waitForTimeout(100);
  check(
    "Gallery changes selected image",
    (await target("hero.afterImage").getAttribute("src")) ===
      "/images/garden-hill.webp",
  );
  await page
    .getByRole("button", { name: "Restore Original", exact: true })
    .click();
  await page.waitForTimeout(100);
  check(
    "Restore original image works",
    (await target("hero.afterImage").getAttribute("src")) ===
      "/images/hero-after.webp",
  );
  await click("Undo");
  await click("Undo");
  await select("hero.section");
  await group("Before / After Settings");
  await range("Before / After Split", 35);
  check(
    "Comparison split updates immediately",
    (await frame.getByRole("slider").getAttribute("aria-valuenow")) === "35",
  );
  await page.getByRole("button", { name: "Overlay", exact: true }).click();
  await range("Overlay opacity", 0.45);
  check(
    "Overlay opacity independent of hero content",
    (await computed("hero.overlay", "opacity")) === "0.45" &&
      (await computed("hero.content", "opacity")) === "1",
  );
  await click("Sections");
  await page
    .getByRole("checkbox", { name: "Show News & Media", exact: true })
    .uncheck();
  check("Hiding section removes layout space", !(await visible("news")));
  await click("Undo");
  check("Undo visibility", await visible("news"));
  await click("Redo");
  check("Redo visibility", !(await visible("news")));
  await click("Sections");
  await page
    .getByRole("checkbox", { name: "Show News & Media", exact: true })
    .check();
  check("Sections view restores content", await visible("news"));
  await page
    .getByRole("checkbox", { name: "Show News & Media", exact: true })
    .uncheck();
  await click("Preview");
  check(
    "Preview removes canvas editing controls",
    (await frame.locator(".p24-hide,.p24-outline").count()) === 0,
  );
  await frame.getByRole("slider").focus();
  await frame.getByRole("slider").press("ArrowRight");
  check(
    "Preview restores comparison keyboard input",
    (await frame.getByRole("slider").getAttribute("aria-valuenow")) === "37",
  );
  await frame.getByRole("slider").press("Home");
  check(
    "Comparison Home range preserved",
    (await frame.getByRole("slider").getAttribute("aria-valuenow")) === "4",
  );
  await frame
    .getByRole("button", { name: "Next project", exact: true })
    .click();
  check(
    "Preview restores project carousel",
    (await frame.locator(".project-card.active .project-info h3").textContent()).includes("Avet"),
  );
  await frame
    .getByRole("button", { name: "Compare Packages", exact: true })
    .click();
  check(
    "Preview restores package dialog",
    await frame.locator(".modal").evaluate((e) => e.open),
  );
  await frame.locator(".modal .close-button").click();
  await frame.locator(".modal").waitFor({ state: "hidden" });
  await click("Return to editing");
  await select("hero.heading");
  await group("Appearance");
  await color("Text color", "#eeeecc");
  const original = await saved();
  check(
    "Configuration does not store binary images",
    !JSON.stringify(original).includes("data:image") &&
      !JSON.stringify(original).includes("blob:"),
  );
  const downloadPromise = page.waitForEvent("download");
  await click("Export Project");
  const download = await downloadPromise;
  const archivePath = `${directory}/prospect24-client-design.zip`;
  await download.saveAs(archivePath);
  const archive = unzipSync(new Uint8Array(await fs.readFile(archivePath)));
  const manifest = JSON.parse(
    strFromU8(archive["prospect24-client-design/design.json"]),
  );
  check(
    "ZIP contains two uploaded images",
    Object.keys(archive).filter((k) => k.includes("/images/")).length === 2,
  );
  check(
    "Export uses portable paths",
    Object.values(manifest.images).every(
      (v) => !v.startsWith("asset:") && !v.startsWith("blob:"),
    ),
  );
  await reset();
  check(
    "Reset restores original image and section visibility",
    (await target("hero.beforeImage").getAttribute("src")) ===
      "/images/hero-before.webp" && (await visible("news")),
  );
  await importFile(archivePath);
  const roundTrip = await saved();
  check(
    "ZIP import restores every design setting",
    JSON.stringify(roundTrip) === JSON.stringify(original),
  );
  check(
    "ZIP import restores image bytes",
    (await target("hero.beforeImage").getAttribute("src")) === beforeSrc,
  );
  const fresh = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const freshPage = await fresh.newPage();
  freshPage.on("pageerror", (e) => errors.push(e.message));
  await freshPage.goto(url + "?editor=1");
  await freshPage.getByLabel("Import design file").setInputFiles(archivePath);
  await freshPage.waitForTimeout(600);
  const freshFrame = freshPage
    .frames()
    .find((f) => f.url().includes("editorCanvas=1"));
  check(
    "A fresh browser imports both image binaries from the ZIP",
    await freshFrame
      .locator(
        '[data-edit-id="hero.beforeImage"],[data-edit-id="hero.afterImage"]',
      )
      .evaluateAll((els) =>
        els.every(
          (e) => e.src.startsWith("blob:") && e.complete && e.naturalWidth > 0,
        ),
      ),
  );
  const assetCount = await freshPage.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("prospect24-editor-assets", 1);
        request.onsuccess = () => {
          const count = request.result
            .transaction("images")
            .objectStore("images")
            .count();
          count.onsuccess = () => resolve(count.result);
          count.onerror = () => reject(count.error);
        };
        request.onerror = () => reject(request.error);
      }),
  );
  check(
    "ZIP import persists exactly two deduplicated uploaded assets",
    assetCount === 2,
  );
  await freshPage
    .getByLabel("Import design file")
    .setInputFiles({
      name: "gallery.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          version: 2,
          images: {
            "hero.beforeImage": "project:news.memorandum-of-cooperation",
          },
        }),
      ),
    });
  await freshPage.waitForTimeout(400);
  check(
    "Bundled gallery references resolve through stable project aliases",
    (
      await freshFrame
        .locator('[data-edit-id="hero.beforeImage"]')
        .getAttribute("src")
    ).includes("cooperation"),
  );
  await fresh.close();
  await click("Undo");
  check("Import is undoable", await visible("news"));
  await click("Redo");
  await page.reload();
  await canvas();
  check("Query parameter reactivates editing", await toolbar().isVisible());
  check(
    "Reload restores uploaded images from IndexedDB",
    (await target("hero.beforeImage").getAttribute("src")).startsWith("blob:"),
  );
  check(
    "Reload retains responsive settings",
    (await saved()).responsive.mobile["hero.section"].minHeight === "820px",
  );
  const beforeInvalid = await saved();
  const invalids = [
    "{",
    { version: 99 },
    { version: 2, overrides: { "hero.heading": { position: "fixed" } } },
    {
      version: 2,
      overrides: { "hero.heading": { color: "url(javascript:bad)" } },
    },
    { version: 2, overrides: { "hero.heading": { width: "-1px" } } },
    { version: 2, overrides: { "hero.heading": { height: "50%" } } },
    {
      version: 2,
      images: { "hero.beforeImage": "https://example.com/evil.svg" },
    },
    { version: 2, texts: { en: { "unknown.element": "x" } } },
    { version: 2, visibility: { hero: "false" } },
    { version: 2, overrides: { "unknown.element": { opacity: 1 } } },
  ];
  for (const value of invalids) {
    await importFile({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        typeof value === "string" ? value : JSON.stringify(value),
      ),
    });
    check(
      "Invalid import rejected atomically",
      JSON.stringify(await saved()) === JSON.stringify(beforeInvalid) &&
        (await page.locator(".p24-status").textContent()).includes(
          "Import failed:",
        ),
    );
  }
  await select("hero.beforeImage");
  await page.getByLabel("Upload new image", { exact: true }).setInputFiles({
    name: "unsafe.png",
    mimeType: "image/png",
    buffer: Buffer.from('<svg onload="alert(1)"></svg>'),
  });
  await page.waitForTimeout(150);
  check(
    "Image magic bytes reject disguised SVG",
    (await page.locator(".p24-status").textContent()).includes(
      "Image not saved:",
    ),
  );
  const badArchive = zipSync({
    "prospect24-client-design/../bad.js": strToU8("bad"),
  });
  await importFile({
    name: "unsafe.zip",
    mimeType: "application/zip",
    buffer: Buffer.from(badArchive),
  });
  check(
    "Archive paths are validated",
    (await page.locator(".p24-status").textContent()).includes(
      "Unexpected archive path",
    ),
  );
  const missing = structuredClone(manifest);
  const missingArchive = zipSync({
    "prospect24-client-design/design.json": strToU8(JSON.stringify(missing)),
  });
  await importFile({
    name: "missing.zip",
    mimeType: "application/zip",
    buffer: Buffer.from(missingArchive),
  });
  check(
    "Missing images warn and fall back to originals",
    (await page.locator(".p24-status").textContent()).includes(
      "missing from this archive",
    ),
  );
  await reset();
  for (const width of [1440, 1024, 768, 430, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await select("hero.heading");
    check(
      `Editor panels fit ${width}`,
      await page.locator(".p24-sidebar").evaluate((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.left >= 0 &&
          r.right <= innerWidth &&
          r.top >= 0 &&
          r.bottom <= innerHeight
        );
      }),
    );
    check(
      `No host overflow ${width}`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await click("Desktop");
  await select("hero.heading");
  await audit("desktop");
  await page.screenshot({ path: `${directory}/desktop-editing.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await click("Mobile");
  await audit("mobile");
  await page.screenshot({ path: `${directory}/mobile-editing.png` });
  for (const [name, width] of [
    ["Desktop", 1440],
    ["Tablet", 768],
    ["Mobile", 390],
  ]) {
    await click(name);
    await page.waitForTimeout(100);
    check(
      `${name} renders an actual ${width}px viewport`,
      (await frame.evaluate(() => innerWidth)) === width,
    );
    check(
      `No canvas overflow ${name}`,
      await frame.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await click("Preview");
  await frame
    .getByRole("button", { name: "Open navigation menu", exact: true })
    .click();
  check(
    "Preview preserves mobile menu",
    await frame.locator(".mobile-menu").evaluate((e) => e.open),
  );
  await frame.locator(".mobile-menu .language button").last().click();
  check(
    "Preview preserves language switching",
    (await frame.locator("html").getAttribute("lang")) === "hy",
  );
  await frame.locator(".mobile-menu .close-button").click();
  await click("Return to editing");
  await page.getByRole("button", { name: "Close editor", exact: true }).click();
  check(
    "Exit restores the presentation",
    (await page.locator(".p24-toolbar,iframe").count()) === 0 &&
      (await page.locator(".hero").isVisible()),
  );
  const blocked = await browser.newContext();
  await blocked.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Unavailable");
      },
    }),
  );
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(url + "?editor=1");
  await blockedPage.waitForTimeout(600);
  check(
    "Blocked browser storage reports clearly",
    (await blockedPage.locator(".p24-status").textContent()).includes(
      "storage unavailable",
    ),
  );
  await blocked.close();
  check("No browser or React errors", errors.length === 0);
} finally {
  await fs.writeFile(
    `${directory}/results.json`,
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
console.log(`Editor: ${checks.length} checks passed.`);
