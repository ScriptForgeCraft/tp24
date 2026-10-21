import { useUi } from "../localization";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEditor, elementSelector } from "./EditorProvider";
import {
  targets,
  dimensionKeys,
  spacingKeys,
  responsiveKeys,
  shadows,
} from "./editorConfig";
import { ImageSourceControls } from "./ImageSourceControls";
const title = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
function hex(value) {
  const c = document.createElement("canvas").getContext("2d");
  c.fillStyle = value || "#ffffff";
  c.fillRect(0, 0, 1, 1);
  return (
    "#" +
    Array.from(c.getImageData(0, 0, 1, 1).data)
      .slice(0, 3)
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}
function luminance(color) {
  return (color.match(/\w\w/g) || [])
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
}
export function PropertiesPanel({ id, onClose }) {
  const t = useUi();
  const editor = useEditor(),
    { design, device, lang, frameRef, updateStyle, select, commit, tree } =
      editor,
    target = targets[id];
  const overlayOwner = id.startsWith("packages.card.")
    ? target.kind === "card" ? id : target.kind === "image" ? id.slice(0, -6) : null
    : null;
  const dimensionGesture = useRef(null);
  const [dimensionDraft, setDimensionDraft] = useState({});
  const [computed, setComputed] = useState({}),
    [ancestors, setAncestors] = useState([]),
    [overflow, setOverflow] = useState(false),
    [linkSpacing, setLinkSpacing] = useState("none"),
    [language, setLanguage] = useState(lang);
  useEffect(() => { setLanguage(lang); }, [lang]);
  useLayoutEffect(() => {
    const el = frameRef.current?.contentDocument?.querySelector(
      elementSelector(id),
    );
    if (!el) return;
    const win = el.ownerDocument.defaultView,
      style = win.getComputedStyle(el);
    const next = {};
    for (const key of [
      ...dimensionKeys,
      ...spacingKeys,
      "gap",
      "columnGap",
      "rowGap",
      "fontSize",
      "lineHeight",
      "color",
      "backgroundColor",
      "borderColor",
      "borderWidth",
      "borderRadius",
      "opacity",
      "objectFit",
      "flexDirection",
      "alignItems",
      "justifyContent",
      "gridTemplateColumns",
    ])
      next[key] = style[key];
    next.text = el.matches("h1,h2")
      ? Array.from(el.children)
          .map((c) => c.textContent)
          .join("\n") || el.textContent
      : el.textContent.replace(/↗$/, "").trim();
    next.layout = style.display;
    const pos = style.objectPosition.split(" ");
    next.objectPositionX = parseFloat(pos[0]) || 50;
    next.objectPositionY = parseFloat(pos[1]) || 50;
    next.zoom = 1;
    if (overlayOwner) {
      const owner = el.ownerDocument.querySelector(elementSelector(overlayOwner));
      const overlay = win.getComputedStyle(owner, "::after");
      next.overlayColor = overlay.backgroundColor === "rgba(0, 0, 0, 0)"
        ? "#141615" : overlay.backgroundColor;
      const alpha = overlay.backgroundColor.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/)?.[1];
      next.overlayOpacity = Number(overlay.opacity) * (alpha === undefined || Number(alpha) === 0 ? 1 : Number(alpha));
    }
    next.lineHeight =
      style.lineHeight === "normal"
        ? 1.5
        : parseFloat(style.lineHeight) / parseFloat(style.fontSize);
    setComputed(next);
    const chain = [];
    for (
      let p = el.parentElement?.closest("[data-edit-id]");
      p;
      p = p.parentElement?.closest("[data-edit-id]")
    )
      chain.unshift(p.dataset.editId);
    setAncestors(chain);
    const check = () =>
      setOverflow(
        el.scrollHeight > el.clientHeight + 3 &&
          !["image", "overlay"].includes(target.kind) &&
          !["hero.section", "projects.viewport", "development.visual"].includes(
            id,
          ),
      );
    const observer = new win.ResizeObserver(check);
    observer.observe(el);
    check();
    return () => observer.disconnect();
  }, [id, design, device, tree]);
  const styles = {
    ...design.overrides[id],
    ...(device !== "base" ? design.responsive.tablet[id] : {}),
    ...(device === "mobile" ? design.responsive.mobile[id] : {}),
  };
  const currentMap = (key) =>
    device === "base" || !responsiveKeys.includes(key)
      ? design.overrides
      : design.responsive[device];
  const propertyOwner = (key) => key.startsWith("overlay") ? overlayOwner : id;
  const changed = (key) => Object.hasOwn(currentMap(key)[propertyOwner(key)] || {}, key);
  const value = (key) => (key.startsWith("overlay")
    ? design.overrides[overlayOwner]?.[key] : styles[key]) ?? computed[key];
  function set(key, v) {
    if (key === "overlayOpacity" && !changed("overlayColor"))
      updateStyle(overlayOwner, "overlayColor", hex(value("overlayColor")));
    if (key === "overlayColor" && !changed("overlayOpacity"))
      updateStyle(overlayOwner, "overlayOpacity", Number(value("overlayOpacity")));
    updateStyle(propertyOwner(key), key, v);
  }
  function reset(key) {
    commit();
    updateStyle(propertyOwner(key), key, null, false);
  }
  const resetButton = (key) =>
    changed(key) && (
      <button
        className="p24-property-reset"
        title={t(`Reset ${title(key)}`)}
        aria-label={t(`Reset ${title(key)}`)}
        onClick={() => reset(key)}
      >
        ↶
      </button>
    );
  const inputEvents = { onFocus: commit, onBlur: commit };
  function numeric(key, label = title(key), min = 0, max = 5000, step = 1) {
    return (
      <div className="p24-field" key={key}>
        <label htmlFor={`p24-${key}`}>
          {t(label)}
          {changed(key) && <i />}
        </label>
        <input
          id={`p24-${key}`}
          aria-label={t(label)}
          type="number"
          min={min}
          max={max}
          step={step}
          value={parseFloat(value(key)) || 0}
          {...inputEvents}
          onChange={(e) => {
            if (e.target.value === "") return;
            set(
              key,
              [
                "opacity",
                "overlayOpacity",
                "zoom",
                "objectPositionX",
                "objectPositionY",
                "lineHeight",
              ].includes(key)
                ? Math.max(min, Math.min(max, Number(e.target.value)))
                : `${Math.max(min, Math.min(max, Number(e.target.value)))}px`,
            );
          }}
        />
        {resetButton(key)}
      </div>
    );
  }
  function range(key, label, min, max, step = 1, multiplier = 1) {
    const pixels = key === "borderRadius";
    const v = parseFloat(value(key) ?? min);
    const write = (number) => set(key, pixels ? `${number}px` : number);
    return (
      <div className="p24-range" key={key}>
        <label htmlFor={`p24-slider-${key}`}>
          {t(label)}
          {changed(key) && <i />}
          <output>
            {key === "zoom" ? v.toFixed(2) : Math.round(v * multiplier)}
            {multiplier === 100 || key.startsWith("objectPosition")
              ? "%"
              : key === "zoom"
                ? "×"
                : pixels
                  ? "px"
                  : ""}
          </output>
        </label>
        <div>
          <input
            id={`p24-slider-${key}`}
            aria-label={t(label)}
            type="range"
            min={min}
            max={max}
            step={step}
            value={v}
            {...inputEvents}
            onPointerDown={commit}
            onPointerUp={commit}
            onChange={(e) => write(Number(e.target.value))}
          />
          <input
            aria-label={`${t(label)} value`}
            type="number"
            min={min * multiplier}
            max={max * multiplier}
            step={step * multiplier}
            value={Math.round(v * multiplier * 100) / 100}
            {...inputEvents}
            onChange={(e) =>
              write(
                Math.min(
                  max,
                  Math.max(min, Number(e.target.value) / multiplier),
                ),
              )
            }
          />
          {resetButton(key)}
        </div>
      </div>
    );
  }
  function choice(key, label, options) {
    return (
      <div className="p24-field" key={key}>
        <label htmlFor={`p24-${key}`}>
          {t(label)}
          {changed(key) && <i />}
        </label>
        <select
          id={`p24-${key}`}
          aria-label={t(label)}
          value={value(key) || options[0][0]}
          {...inputEvents}
          onChange={(e) => set(key, e.target.value)}
        >
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {t(l)}
            </option>
          ))}
        </select>
        {resetButton(key)}
      </div>
    );
  }
  function dimension(key) {
    const raw = String(value(key) || "auto"),
      val = raw === "none" ? "auto" : raw,
      unit = val === "auto" ? "auto" : val.match(/[a-z%]+$/)?.[0] || "px";
    const choices =
      /Height$/.test(key) || key === "height"
        ? ["px", "vh", "vw", "auto"]
        : ["px", "%", "vw", "vh", "auto"];
    const number = parseFloat(val) || 0;
    const label = title(key);
    return (
      <div className="p24-dimension" key={key}>
        <label htmlFor={`p24-${key}`}>
          {t(label)}
          {changed(key) && <i />}
        </label>
        <input
          id={`p24-${key}`}
          aria-label={t(label)}
          type="number"
          disabled={unit === "auto"}
          min="0"
          max={unit === "px" ? 5000 : 100}
          value={dimensionDraft[key] ?? (unit === "auto" ? "" : Math.round(number * 100) / 100)}
          placeholder={t("Auto")}
          onFocus={() => {
            commit();
            dimensionGesture.current = parseFloat(computed.width) / parseFloat(computed.height);
          }}
          onBlur={() => {
            setDimensionDraft({});
            dimensionGesture.current = null;
            commit();
          }}
          onChange={(e) => {
            setDimensionDraft({ [key]: e.target.value });
            if (e.target.value === "") return;
            const n = Math.max(
              0,
              Math.min(unit === "px" ? 5000 : 100, Number(e.target.value)),
            );
            set(key, `${n}${unit}`);
            if (
              (design.locks?.[id] ?? target.kind === "image") &&
              ["width", "height"].includes(key) &&
              unit === "px"
            ) {
              const ratio = dimensionGesture.current;
              if (ratio > 0 && Number.isFinite(ratio))
                set(
                  key === "width" ? "height" : "width",
                  `${Math.round(key === "width" ? n / ratio : n * ratio)}px`,
                );
            }
          }}
        />
        <select
          aria-label={`${t(label)} unit`}
          value={unit}
          {...inputEvents}
          onChange={(e) => {
            const u = e.target.value;
            set(
              key,
              u === "auto"
                ? "auto"
                : `${u === "px" ? Math.round(parseFloat(computed[key]) || 100) : u === "%" ? 100 : 50}${u}`,
            );
          }}
        >
          {choices.map((u) => (
            <option key={u} value={u}>{u === "auto" ? t("Auto") : u}</option>
          ))}
        </select>
        {resetButton(key)}
      </div>
    );
  }
  function color(key, label) {
    const v = value(key)?.startsWith("#") ? value(key) : hex(value(key));
    return (
      <div className="p24-color" key={key}>
        <label htmlFor={`p24-${key}`}>
          {t(label)}
          {changed(key) && <i />}
        </label>
        <input
          id={`p24-${key}`}
          aria-label={t(label)}
          type="color"
          value={v}
          {...inputEvents}
          onInput={(e) => set(key, e.target.value)}
          onChange={(e) => set(key, e.target.value)}
        />
        <input
          className="p24-hex"
          aria-label={`${t(label)} hex`}
          defaultValue={v}
          key={v}
          maxLength="7"
          onFocus={commit}
          onBlur={(e) => {
            if (/^#[a-f0-9]{6}$/i.test(e.target.value))
              set(key, e.target.value);
            else e.target.value = v;
            commit();
          }}
        />
        {resetButton(key)}
      </div>
    );
  }
  const group = (label, children, open = false) => (
    <details className="p24-group" open={open}>
      <summary>{t(label)}</summary>
      <div>{children}</div>
    </details>
  );
  const parents = new Map(tree.map((item) => [item.id, item.parent]));
  const imageIDs = tree.filter((item) => {
    if (targets[item.id]?.kind !== "image") return false;
    for (let key = item.id; key; key = parents.get(key))
      if (key === id) return true;
    return false;
  }).map((item) => item.id);
  const section = id.split(".")[0];
  const sectionID = `${section}.section`;
  const parent = ancestors.at(-1),
    card = ancestors.findLast((key) => targets[key]?.kind === "card");
  const bg = styles.backgroundColor,
    fg = styles.color;
  const contrast =
    bg && fg
      ? (Math.max(luminance(bg.slice(1)), luminance(fg.slice(1))) + 0.05) /
        (Math.min(luminance(bg.slice(1)), luminance(fg.slice(1))) + 0.05)
      : 21;
  return (
    <div
      className="p24-properties"
      role="region"
      aria-label={t("Element properties")}
    >
      <nav className="p24-breadcrumb" aria-label={t("Selected hierarchy")}>
        {[...ancestors, id].map((key) => (
          <button
            key={key}
            disabled={key === id}
            title={t(targets[key]?.label, key)}
            onClick={() => select(key)}
          >
            {t(targets[key]?.label, key)}
          </button>
        ))}
      </nav>
      <div className="p24-panel-heading">
        <div>
          <small>
            {t(target.kind)} ·{" "}
            {device === "base" ? t("Base / Desktop") : t(title(device))}
          </small>
          <h2>{t(target.label, id)}</h2>
        </div>
        <button
          className="p24-icon"
          aria-label={t("Close properties")}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="p24-scope">
        {device === "base"
          ? t("Base values apply to every screen unless overridden.")
          : t(`${title(device)} changes override inherited sizes and spacing. Colors stay global.`)}
      </p>
      <div className="p24-inline-buttons">
        <button onClick={() => editor.setRemoved(id, !design.removed?.[id])}>
          {t(design.removed?.[id] ? "Restore element" : "Delete element")}
        </button>
      </div>
      {target.textEditable &&
        group(
          t("Text"),
          <>
            <div className="p24-field">
              <label htmlFor="p24-copy-language">{t("Language")}</label>
              <select
                id="p24-copy-language"
                value={language}
                onChange={(e) => {
                  commit();
                  setLanguage(e.target.value);
                  const button = frameRef.current.contentDocument.querySelector(
                    `.header .language button:${e.target.value === "en" ? "first" : "last"}-child`,
                  );
                  button?.click();
                }}
              >
                <option value="en">{t("English")}</option>
                <option value="am">Հայերեն</option>
              </select>
            </div>
            <label className="p24-text-label" htmlFor="p24-copy">{t("Content")}</label>
            <textarea
              id="p24-copy"
              aria-label={t("Text content")}
              rows="4"
              value={
                design.texts[language][id] ??
                (language === lang ? computed.text || "" : "")
              }
              {...inputEvents}
              onChange={(e) => editor.updateText(id, e.target.value, language)}
            />
            <button
              disabled={!Object.hasOwn(design.texts[language], id)}
              onClick={() => {
                commit();
                editor.change((current) => {
                  const next = structuredClone(current);
                  delete next.texts[language][id];
                  return next;
                });
              }}
            >{t("Restore original text")}</button>
          </>,
          true,
        )}
      {imageIDs.length > 0 && <ImageSourceControls key={id} ids={imageIDs} owner={id} />}
      {overlayOwner && group(
        t("Image darkening"),
        <>
          {color("overlayColor", t("Overlay color"))}
          {range("overlayOpacity", t("Darkening strength"), 0, 1, 0.01, 100)}
        </>,
        true,
      )}
      {id.startsWith("hero.") &&
        ["section", "image", "overlay", "container"].includes(target.kind) &&
        group(
          t("Before / After Settings"),
          <>
            <div className="p24-inline-buttons">
              <button onClick={() => select("hero.beforeImage")}>{t("Before Image")}</button>
              <button onClick={() => select("hero.afterImage")}>{t("After Image")}</button>
              <button onClick={() => select("hero.overlay")}>{t("Overlay")}</button>
            </div>
            <label className="p24-range">{t("Before / After Split")}{" "}
              <output>{design.comparison.initialSplit ?? 50}%</output>
              <input
                aria-label={t("Before / After Split")}
                type="range"
                min="0"
                max="100"
                value={design.comparison.initialSplit ?? 50}
                {...inputEvents}
                onPointerDown={commit}
                onPointerUp={commit}
                onChange={(e) =>
                  editor.comparison("initialSplit", Number(e.target.value))
                }
              />
            </label>
            <div className="p24-field">
              <span>{t("Before image opacity")}</span>
              <input
                aria-label={t("Before image opacity")}
                type="number"
                min="0"
                max="100"
                value={Math.round(
                  (design.overrides["hero.beforeImage"]?.opacity ?? 1) * 100,
                )}
                {...inputEvents}
                onChange={(e) =>
                  editor.updateStyle(
                    "hero.beforeImage",
                    "opacity",
                    Math.max(0, Math.min(100, Number(e.target.value))) / 100,
                  )
                }
              />
            </div>
            <div className="p24-field">
              <span>{t("After image opacity")}</span>
              <input
                aria-label={t("After image opacity")}
                type="number"
                min="0"
                max="100"
                value={Math.round(
                  (design.overrides["hero.afterImage"]?.opacity ?? 1) * 100,
                )}
                {...inputEvents}
                onChange={(e) =>
                  editor.updateStyle(
                    "hero.afterImage",
                    "opacity",
                    Math.max(0, Math.min(100, Number(e.target.value))) / 100,
                  )
                }
              />
            </div>
            {["divider"].map((key) => (
              <label className="p24-check" key={key}>
                <input
                  type="checkbox"
                  checked={design.comparison[key] !== false}
                  onChange={(e) => {
                    commit();
                    editor.comparison(key, e.target.checked);
                    commit();
                  }}
                />{t("Show divider while editing")}</label>
            ))}
            <button
              onClick={() => {
                commit();
                editor.change((current) => {
                  const next = structuredClone(current);
                  next.comparison = {};
                  for (const map of [
                    next.overrides,
                    next.responsive.tablet,
                    next.responsive.mobile,
                  ]) {
                    for (const key of dimensionKeys)
                      if (map["hero.section"]) delete map["hero.section"][key];
                    for (const id of ["hero.beforeImage", "hero.afterImage"]) {
                      if (map[id])
                        for (const key of [
                          "opacity",
                          "objectPositionX",
                          "objectPositionY",
                          "objectFit",
                          "zoom",
                        ])
                          delete map[id][key];
                    }
                  }
                  return next;
                });
              }}
            >{t("Restore comparison defaults")}</button>
            <button
              onClick={() => {
                commit();
                editor.change((current) => {
                  const next = structuredClone(current);
                  for (const scope of [
                    next.overrides,
                    next.responsive.tablet,
                    next.responsive.mobile,
                  ])
                    for (const key of ["hero.beforeImage", "hero.afterImage"])
                      for (const prop of [
                        "objectPositionX",
                        "objectPositionY",
                        "zoom",
                        "objectFit",
                      ])
                        if (scope[key]) delete scope[key][prop];
                  return next;
                });
              }}
            >{t("Synchronize image positioning")}</button>
            <button onClick={() => select("hero.section")}>{t("Comparison viewport dimensions")}</button>
          </>,
          id === "hero.section",
        )}
      {target.kind !== "overlay" &&
        group(
          t("Size & Dimensions"),
          <>
            {dimensionKeys.map(dimension)}
            <label className="p24-check">
              <input
                type="checkbox"
                checked={design.locks?.[id] ?? target.kind === "image"}
                onChange={(e) => {
                  commit();
                  editor.change((current) => ({
                    ...current,
                    locks: { ...current.locks, [id]: e.target.checked },
                  }));
                }}
              />{t("Lock aspect ratio")}</label>
            {target.kind === "section" && (
              <p className="p24-hint">{t("Use Minimum height to give content room to grow. Auto height preserves the content flow.")}</p>
            )}
            {target.kind === "card" && (
              <p className="p24-hint">{t("Select the parent layout to adjust columns and spacing around this card.")}</p>
            )}
            {id.startsWith("hero.") && target.kind === "image" && (
              <p className="p24-hint">{t("Both images share the Hero viewport. Use viewport dimensions to resize the comparison together.")}</p>
            )}
            {overflow && (
              <div className="p24-warning" role="status">{t("This size is smaller than the content. Text remains visible.")}<button
                  onClick={() => {
                    commit();
                    set("height", "auto");
                    set("maxHeight", "auto");
                    commit();
                  }}
                >{t("Fit content automatically")}</button>
              </div>
            )}
          </>,
          true,
        )}
      {target.kind === "image" &&
        group(
          t("Image position"),
          <>
            {choice("objectFit", t("Object fit"), [
              ["cover", t("Cover")],
              ["contain", t("Contain")],
              ["fill", t("Fill")],
            ])}
            {range("objectPositionX", t("Horizontal position"), 0, 100)}
            {range("objectPositionY", t("Vertical position"), 0, 100)}
            {range("zoom", t("Zoom"), 1, 3, 0.01)}
            <button
              onClick={() => {
                commit();
                editor.change((current) => {
                  const next = structuredClone(current);
                  for (const map of [
                    next.overrides,
                    next.responsive.tablet,
                    next.responsive.mobile,
                  ])
                    delete map[id];
                  delete next.locks[id];
                  return next;
                });
              }}
            >{t("Reset Image Settings")}</button>
          </>,
          true,
        )}
      {group(
        t("Appearance"),
        <>
          {target.properties.includes("color") && color("color", t("Text color"))}
          {target.properties.includes("backgroundColor") &&
            color(
              "backgroundColor",
              target.kind === "overlay" ? t("Overlay color") : t("Background color"),
            )}
          {range(
            "opacity",
            target.kind === "overlay"
              ? t("Overlay opacity")
              : target.kind === "image"
                ? t("Image opacity")
                : t("Element opacity"),
            0,
            1,
            0.01,
            100,
          )}
          {target.kind !== "overlay" && (
            <>
              {range("borderRadius", t("Border radius"), 0, 500)}
              {numeric("borderWidth", t("Border width"), 0, 30)}
              {color("borderColor", t("Border color"))}
              {choice(
                "boxShadow",
                t("Shadow"),
                Object.entries(shadows).map(([l, v]) => [v, l]),
              )}
            </>
          )}
          {contrast < 4.5 && (
            <p className="p24-warning" role="status">{t("Low contrast (")}{contrast.toFixed(2)}{t(":1). Aim for 4.5:1 for readable text.")}</p>
          )}
        </>,
        target.kind !== "image",
      )}
      {target.textEditable &&
        group(
          t("Typography"),
          <>
            {numeric("fontSize", t("Font size"), 8, 240)}
            {numeric("lineHeight", t("Line height"), 0.7, 3, 0.05)}
          </>,
        )}
      {target.kind !== "overlay" &&
        group(
          t("Spacing"),
          <>
            <div className="p24-field">
              <label htmlFor="p24-link-spacing">{t("Link sides")}</label>
              <select
                id="p24-link-spacing"
                value={linkSpacing}
                onChange={(e) => setLinkSpacing(e.target.value)}
              >
                <option value="none">{t("Independent")}</option>
                <option value="opposite">{t("Opposite sides")}</option>
                <option value="all">{t("All sides")}</option>
              </select>
            </div>
            {["padding", "margin"].map((type) => (
              <div className="p24-spacing" key={type}>
                <strong>{t(title(type))}</strong>
                {spacingKeys
                  .filter((k) => k.startsWith(type))
                  .map((key) => (
                    <div className="p24-field" key={key}>
                      <label htmlFor={`p24-${key}`}>
                        {t(title(key))}
                        {changed(key) && <i />}
                      </label>
                      <input
                        id={`p24-${key}`}
                        aria-label={t(title(key))}
                        type="number"
                        min={type === "margin" ? -500 : 0}
                        max="1000"
                        value={parseFloat(value(key)) || 0}
                        {...inputEvents}
                        onChange={(e) => {
                          const n = Math.max(
                            type === "margin" ? -500 : 0,
                            Math.min(1000, Number(e.target.value)),
                          );
                          const keys =
                            linkSpacing === "all"
                              ? spacingKeys.filter((k) => k.startsWith(type))
                              : linkSpacing === "opposite"
                                ? [
                                    key,
                                    key.replace(
                                      /Top|Bottom|Left|Right/,
                                      (v) =>
                                        ({
                                          Top: "Bottom",
                                          Bottom: "Top",
                                          Left: "Right",
                                          Right: "Left",
                                        })[v],
                                    ),
                                  ]
                                : [key];
                          keys.forEach((k) => set(k, `${n}px`));
                        }}
                      />
                      {resetButton(key)}
                    </div>
                  ))}
              </div>
            ))}
          </>,
        )}
      {["flex", "inline-flex", "grid"].includes(computed.layout) &&
        group(
          t("Layout"),
          <>
            {numeric("gap", t("Gap"), 0, 300)}
            {computed.layout === "grid" ? (
              <>
                {numeric("columnGap", t("Column gap"), 0, 300)}
                {numeric("rowGap", t("Row gap"), 0, 300)}
                {choice("gridTemplateColumns", t("Columns"), [
                  ["repeat(1, minmax(0, 1fr))", t("One")],
                  ["repeat(2, minmax(0, 1fr))", t("Two")],
                  ["repeat(3, minmax(0, 1fr))", t("Three")],
                ])}
              </>
            ) : (
              <>
                {choice("flexDirection", t("Direction"), [
                  ["row", t("Horizontal")],
                  ["column", t("Vertical")],
                ])}
                {choice(
                  "justifyContent",
                  computed.flexDirection === "column"
                    ? t("Vertical alignment")
                    : t("Horizontal alignment"),
                  [
                    ["flex-start", t("Start")],
                    ["center", t("Center")],
                    ["flex-end", t("End")],
                    ["space-between", t("Space between")],
                    ["space-around", t("Space around")],
                  ],
                )}
                {choice("alignItems", t("Cross-axis alignment"), [
                  ["stretch", t("Stretch")],
                  ["flex-start", t("Start")],
                  ["center", t("Center")],
                  ["flex-end", t("End")],
                ])}
              </>
            )}
          </>,
        )}
      <div className="p24-panel-actions">
        {parent && (
          <button onClick={() => select(parent)}>{t("Select parent")}</button>
        )}
        {card && <button onClick={() => select(card)}>{t("Select card")}</button>}
        {targets[sectionID] && id !== sectionID && (
          <button onClick={() => select(sectionID)}>{t("Select section")}</button>
        )}
        <button onClick={() => editor.resetElement(id)}>{t("Reset Selected")}</button>
        {targets[sectionID] && (
          <>
            <button onClick={() => editor.resetElement(sectionID, true)}>{t("Reset Section")}</button>
            <button onClick={() => editor.setVisibility(section, false)}>{t("Hide section")}</button>
          </>
        )}
      </div>
    </div>
  );
}
