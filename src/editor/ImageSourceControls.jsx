import React, { useState } from "react";
import { useEditor, elementSelector } from "./EditorProvider";
import { assets, resolveProjectAsset, targets, REMOVED_IMAGE } from "./editorConfig";
import { useUi } from "../localization";

export function ImageSourceControls({ ids, owner }) {
  const t = useUi();
  const editor = useEditor();
  const [chosen, setChosen] = useState(null);
  const [gallery, setGallery] = useState(false);
  const doc = editor.frameRef.current?.contentDocument;
  // Stacked service/project photos can exist together; start with the active one.
  const active = ids.find((id) => {
    const el = doc?.querySelector(elementSelector(id));
    return el?.matches(".active, .is-active") ||
      el?.closest(".active, .is-active") != null;
  });
  const id = ids.includes(chosen) ? chosen : active || ids[0];
  const source = editor.design.images[id];
  const removed = source === REMOVED_IMAGE;
  const preview = source?.startsWith("asset:")
    ? editor.assetURLs[source]
    : resolveProjectAsset(source) || doc?.querySelector(elementSelector(id))?.src;
  const reveal = (key) => editor.frameRef.current?.contentWindow?.postMessage(
    { channel: "prospect24-editor-v2", type: "scroll", id: key }, location.origin,
  );

  return (
    <details className="p24-group" open>
      <summary>{t("Image source")}</summary>
      <div>
        {ids.length > 1 && (
          <div className="p24-field">
            <label htmlFor="p24-block-image">{t("Image in this block")}</label>
            <select id="p24-block-image" value={id} onChange={(e) => {
              setChosen(e.target.value);
              setGallery(false);
              reveal(e.target.value);
            }}>
              {ids.map((key) => <option key={key} value={key}>{t(targets[key].label)}</option>)}
            </select>
          </div>
        )}
        <div className="p24-image-preview">
          {removed ? <p className="p24-hint">{t("No image. Upload or choose an image to add one.")}</p> :
            <img src={preview} alt={t("Selected image preview")} />}
        </div>
        <label className="p24-upload">
          {t(removed ? "Add Image" : "Upload New Image")}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif"
            aria-label={t("Upload new image")} disabled={editor.busy}
            onChange={(e) => {
              editor.uploadImage(e.target.files?.[0], id);
              e.target.value = "";
            }} />
        </label>
        <div className="p24-inline-buttons p24-image-actions">
          <button onClick={() => setGallery(!gallery)}>{t("Choose Existing Image")}</button>
          <button disabled={removed || editor.busy} onClick={() => editor.updateImage(id, REMOVED_IMAGE)}>{t("Remove Image")}</button>
          <button disabled={!source || editor.busy} onClick={() => editor.updateImage(id, null)}>{t("Restore Original")}</button>
          {id !== owner && <button onClick={() => { editor.select(id); reveal(id); }}>{t("Edit Image Settings")}</button>}
        </div>
        {gallery && (
          <div className="p24-gallery" aria-label={t("Project image gallery")}>
            {assets.map((asset) => (
              <button key={asset.ref} title={t(asset.label)} onClick={() => {
                editor.updateImage(id, asset.ref);
                setGallery(false);
              }}>
                <img src={asset.src} alt="" loading="lazy" />
                <span>{t(asset.label)}</span>
              </button>
            ))}
          </div>
        )}
        <p className="p24-hint">{t("JPG, PNG, WebP or AVIF · up to 12 MB. Stored on this browser.")}</p>
      </div>
    </details>
  );
}
