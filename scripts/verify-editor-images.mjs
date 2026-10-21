import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const key = "prospect24-client-editor-v1";
const url = process.env.PREVIEW_URL || "http://localhost:5173/";
let frame;
const toolbar = () => page.getByRole("region", { name: "Design editor", exact: true });
const button = name => page.getByRole("button", { name, exact: true });
const image = id => frame.locator(`[data-edit-id="${id}"]`);
const check = (name, condition) => { assert.ok(condition, name); console.log("PASS", name); };
async function canvas() {
  await page.waitForFunction(() => document.querySelector("iframe")?.contentDocument?.querySelector('[data-edit-id="development.visual"]'));
  frame = page.frames().find(frame => frame.url().includes("editorCanvas=1"));
  await page.locator('[data-layer-id="development.visual"]').count();
}
async function select(id) {
  await toolbar().getByRole("button", { name: "Layers", exact: true }).click();
  await page.locator(`[data-layer-id="${id}"]`).click();
  await page.locator(".p24-properties .p24-image-preview").waitFor();
}
async function gallery(name) {
  await button("Choose Existing Image").click();
  await page.getByRole("region", { name: "Element properties", exact: true }).getByRole("button", { name, exact: true }).click();
}
async function visibility(id) {
  return image(id).evaluate(el => getComputedStyle(el).visibility);
}
async function waitRemoved(id) {
  await image(id).evaluate(el => new Promise(resolve => {
    const check = () => getComputedStyle(el).visibility === "hidden" ? resolve() : requestAnimationFrame(check);
    check();
  }));
}
try {
  await page.goto(`${url}?editor=1`);
  await canvas();
  await select("development.visual");
  const serviceIDs = await page.getByLabel("Image in this block").locator("option").evaluateAll(options => options.map(option => option.value));
  check("Service visual exposes all four photos", serviceIDs.length === 4);
  for (const id of serviceIDs) {
    await page.getByLabel("Image in this block").selectOption(id);
    await gallery("Garden Hill");
    await image(id).waitFor({ state: "attached" });
    await page.waitForFunction(id => document.querySelector("iframe").contentDocument.querySelector(`[data-edit-id="${id}"]`).src.endsWith("garden-hill.webp"), id);
    check(`Service photo can be replaced: ${id}`, (await image(id).getAttribute("src")).endsWith("garden-hill.webp"));
    await button("Restore Original").click();
  }
  const service = serviceIDs[0];
  await page.getByLabel("Image in this block").selectOption(service);
  await button("Remove Image").click();
  await waitRemoved(service);
  check("Remove service photo preserves the visual and labels", await image("development.visual").isVisible());
  await toolbar().getByRole("button", { name: "Undo", exact: true }).click();
  await page.waitForTimeout(100);
  check("Undo restores removed photo", await visibility(service) === "visible");
  await toolbar().getByRole("button", { name: "Redo", exact: true }).click();
  await waitRemoved(service);
  await page.getByLabel("Upload new image", { exact: true }).setInputFiles("public/images/planning.webp");
  await page.waitForFunction(id => document.querySelector("iframe").contentDocument.querySelector(`[data-edit-id="${id}"]`).src.startsWith("blob:"), service);
  check("Upload adds a photo back into the same visual", await visibility(service) === "visible");
  await button("Restore Original").click();

  const cards = ["pre-investment-package", "development-package", "investment-package"];
  for (const card of cards) {
    const id = `packages.card.${card}`;
    await select(id);
    await gallery("Market analysis");
    await page.waitForTimeout(100);
    check(`Card background can be replaced from card properties: ${card}`, (await image(`${id}.image`).getAttribute("src")).endsWith("market.webp"));
    await button("Remove Image").click();
    await waitRemoved(`${id}.image`);
    check(`Removing card background preserves content: ${card}`, await image(`${id}.heading`).isVisible());
  }
  await fs.mkdir("output/editor-images", { recursive: true });
  await page.screenshot({ path: "output/editor-images/removed-card.png" });
  await page.waitForTimeout(450);
  await page.reload();
  await canvas();
  check("Removed photos survive reload", await visibility("packages.card.investment-package.image") === "hidden");
  await select("packages.card.investment-package");
  await gallery("Garden Hill");
  await page.waitForTimeout(100);
  check("Gallery adds a photo after reload", await visibility("packages.card.investment-package.image") === "visible");

  const downloadPromise = page.waitForEvent("download");
  await toolbar().getByRole("button", { name: "Export Project", exact: true }).click();
  const download = await downloadPromise;
  const zipPath = "output/editor-images/design.zip";
  await download.saveAs(zipPath);
  const fresh = await browser.newContext();
  const imported = await fresh.newPage();
  await imported.goto(`${url}?editor=1`);
  await imported.getByLabel("Import design file").setInputFiles(zipPath);
  await imported.waitForFunction(key => JSON.parse(localStorage.getItem(key) || "{}").images?.["packages.card.pre-investment-package.image"] === "none", key);
  check("ZIP import preserves removed images without warnings", !(await imported.locator(".p24-editor").innerText()).includes("Import failed"));
  await fresh.close();

  await toolbar().getByRole("button", { name: "Mobile", exact: true }).click();
  await select("development.card.market-research-analysis");
  await gallery("Garden Hill");
  await button("Edit Image Settings").click();
  check("Mobile service photo has image controls and can be revealed", await image("development.card.market-research-analysis.image").isVisible());
  await page.screenshot({ path: "output/editor-images/mobile-service.png" });
  await toolbar().getByRole("button", { name: "Preview", exact: true }).click();
  check("Removed package photo stays removed in preview", await visibility("packages.card.pre-investment-package.image") === "hidden");
  check("No browser runtime errors", errors.length === 0);
} finally {
  await browser.close();
}
