import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { assets, targets, validateDesign } from "./editorConfig.js";
import { getAsset, inspectImage, storeAssets } from "./editorStorage.js";
export async function exportProject(design) {
  const copy = structuredClone(design),
    files = {};
  for (const id of new Set(
    Object.values(copy.images).filter((v) => v.startsWith("asset:")),
  )) {
    const asset = await getAsset(id);
    if (!asset)
      throw new Error(
        "A custom image is unavailable. Replace or restore it before exporting.",
      );
    const path = `images/${id.slice(6)}.${asset.extension}`;
    files[`prospect24-client-design/${path}`] = new Uint8Array(
      await asset.blob.arrayBuffer(),
    );
    Object.keys(copy.images).forEach((key) => {
      if (copy.images[key] === id) copy.images[key] = path;
    });
  }
  files["prospect24-client-design/design.json"] = strToU8(
    JSON.stringify(copy, null, 2),
  );
  return new Blob([zipSync(files, { level: 0 })], { type: "application/zip" });
}
export async function importProject(file) {
  if (file.size > 80 * 1024 * 1024)
    throw new Error("Project archives must be smaller than 80 MB.");
  if (file.name.toLowerCase().endsWith(".json")) {
    if (file.size > 1024 * 1024)
      throw new Error("Settings files must be smaller than 1 MB.");
    const design = validateDesign(JSON.parse(await file.text()));
    const missing = [];
    for (const [id, ref] of Object.entries(design.images))
      if (ref.startsWith("asset:") && !(await getAsset(ref))) {
        delete design.images[id];
        missing.push(id);
      }
    return {
      design,
      warning: missing.length
        ? "Some images were unavailable; their originals are shown. Use a ZIP to transfer custom images."
        : "",
    };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  let total = 0,
    count = 0;
  const files = unzipSync(bytes, {
    filter: (entry) => {
      if (
        ++count > 150 ||
        entry.originalSize > 12 * 1024 * 1024 ||
        (total += entry.originalSize) > 100 * 1024 * 1024
      )
        throw new Error("Archive expands beyond the supported size.");
      if (
        !/^prospect24-client-design\/(design\.json|images\/[a-f0-9]{64}\.(jpg|png|webp|avif))$/.test(
          entry.name,
        )
      )
        throw new Error("Unexpected archive path.");
      return true;
    },
  });
  const config = files["prospect24-client-design/design.json"];
  if (!config || config.length > 1024 * 1024)
    throw new Error("The archive needs a valid design.json.");
  const input = JSON.parse(strFromU8(config)),
    stored = [],
    missing = [];
  if (
    input.images &&
    (typeof input.images !== "object" || Array.isArray(input.images))
  )
    throw new Error("Invalid image map.");
  for (const [id, ref] of Object.entries(input.images || {})) {
    if (targets[id]?.kind !== "image" || typeof ref !== "string")
      throw new Error("Invalid image reference.");
    if (assets.some((a) => a.ref === ref)) continue;
    if (!/^images\/[a-f0-9]{64}\.(jpg|png|webp|avif)$/.test(ref))
      throw new Error("Invalid archive image path.");
    const content = files[`prospect24-client-design/${ref}`];
    if (!content) {
      delete input.images[id];
      missing.push(id);
      continue;
    }
    const asset = await inspectImage(new Blob([content]));
    if (ref !== `images/${asset.id.slice(6)}.${asset.extension}`)
      throw new Error("Image checksum or extension does not match.");
    input.images[id] = asset.id;
    stored.push(asset);
  }
  const design = validateDesign(input);
  if (stored.length) await storeAssets(stored);
  return {
    design,
    warning: missing.length
      ? "Some images were missing from this archive; their originals are shown."
      : "",
  };
}
export function download(blob, name) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
