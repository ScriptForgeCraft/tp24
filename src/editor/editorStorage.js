export const MAX_IMAGE = 12 * 1024 * 1024;
const mimeExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
let database;
function db() {
  if (!database)
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open("prospect24-editor-assets", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("images", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        database = null;
        reject(new Error("Image storage is unavailable in this browser."));
      };
    });
  return database;
}
export async function getAsset(id) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction("images")
      .objectStore("images")
      .get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function inspectImage(file) {
  if (!file.size || file.size > MAX_IMAGE)
    throw new Error("Choose an image smaller than 12 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  const detected =
    bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      ? "image/jpeg"
      : bytes[0] === 137 && ascii(1, 4) === "PNG"
        ? "image/png"
        : ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP"
          ? "image/webp"
          : ascii(4, 8) === "ftyp" && /avif|avis/.test(ascii(8, 32))
            ? "image/avif"
            : null;
  if (
    !detected ||
    (file.type &&
      file.type !== "application/octet-stream" &&
      file.type !== detected)
  )
    throw new Error(
      "Use a genuine JPG, PNG, WebP or AVIF image. SVG and HTML are not supported.",
    );
  const blob = new Blob([bytes], { type: detected });
  const objectURL = URL.createObjectURL(blob);
  let size;
  try {
    size = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () =>
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () =>
        reject(new Error("This image cannot be decoded by your browser."));
      image.src = objectURL;
    });
  } finally {
    URL.revokeObjectURL(objectURL);
  }
  if (
    size.width > 16384 ||
    size.height > 16384 ||
    size.width * size.height > 60000000
  )
    throw new Error(
      "Image dimensions are too large. Use up to 16,384 pixels per side and 60 megapixels.",
    );
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
  return {
    id: `asset:${hash}`,
    blob,
    extension: mimeExtensions[detected],
    ...size,
  };
}
export async function storeAssets(assets) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction("images", "readwrite");
    for (const asset of new Map(assets.map((a) => [a.id, a])).values())
      transaction.objectStore("images").put(asset);
    transaction.oncomplete = () => resolve();
    transaction.onabort = transaction.onerror = () =>
      reject(
        new Error(
          "Browser image storage is full or unavailable. The design was not changed. Free browser storage and try again.",
        ),
      );
  });
}
