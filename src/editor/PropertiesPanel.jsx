import React, { useLayoutEffect, useState } from "react";
import { useEditor, elementSelector } from "./EditorProvider";
import {
  assets,
  resolveProjectAsset,
  targets,
  dimensionKeys,
  spacingKeys,
  responsiveKeys,
  shadows,
} from "./editorConfig";
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
  const editor = useEditor(),
    { design, device, lang, frameRef, updateStyle, select, commit, tree } =
      editor,
    target = targets[id];
  const [computed, setComputed] = useState({}),
    [ancestors, setAncestors] = useState([]),
    [overflow, setOverflow] = useState(false),
    [linkSpacing, setLinkSpacing] = useState("none"),
    [gallery, setGallery] = useState(false),
    [language, setLanguage] = useState(lang);
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
  const changed = (key) => Object.hasOwn(currentMap(key)[id] || {}, key);
  const value = (key) => styles[key] ?? computed[key];
  function set(key, v) {
    updateStyle(id, key, v);
  }
  function reset(key) {
    commit();
    updateStyle(id, key, null, false);
  }
  const resetButton = (key) =>
    changed(key) && (
      <button
        className="p24-property-reset"
        title={`Reset ${title(key)}`}
        aria-label={`Reset ${title(key)}`}
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
          {label}
          {changed(key) && <i />}
        </label>
        <input
          id={`p24-${key}`}
          aria-label={label}
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
          {label}
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
            aria-label={label}
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
            aria-label={`${label} value`}
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
          {label}
          {changed(key) && <i />}
        </label>
        <select
          id={`p24-${key}`}
          aria-label={label}
          value={value(key) || options[0][0]}
          {...inputEvents}
          onChange={(e) => set(key, e.target.value)}
        >
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
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
          {label}
          {changed(key) && <i />}
        </label>
        <input
          id={`p24-${key}`}
          aria-label={label}
          type="number"
          disabled={unit === "auto"}
          min="0"
          max={unit === "px" ? 5000 : 100}
          value={unit === "auto" ? "" : Math.round(number * 100) / 100}
          placeholder="Auto"
          {...inputEvents}
          onChange={(e) => {
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
              const ratio =
                parseFloat(computed.width) / parseFloat(computed.height);
              if (ratio > 0 && Number.isFinite(ratio))
                set(
                  key === "width" ? "height" : "width",
                  `${Math.round(key === "width" ? n / ratio : n * ratio)}px`,
                );
            }
          }}
        />
        <select
          aria-label={`${label} unit`}
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
            <option key={u}>{u}</option>
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
          {label}
          {changed(key) && <i />}
        </label>
        <input
          id={`p24-${key}`}
          aria-label={label}
          type="color"
          value={v}
          {...inputEvents}
          onInput={(e) => set(key, e.target.value)}
          onChange={(e) => set(key, e.target.value)}
        />
        <input
          className="p24-hex"
          aria-label={`${label} hex`}
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
      <summary>{label}</summary>
      <div>{children}</div>
    </details>
  );
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
      aria-label="Element properties"
    >
      <nav className="p24-breadcrumb" aria-label="Selected hierarchy">
        {[...ancestors, id].map((key) => (
          <button
            key={key}
            disabled={key === id}
            title={targets[key]?.label}
            onClick={() => select(key)}
          >
            {targets[key]?.label}
          </button>
        ))}
      </nav>
      <div className="p24-panel-heading">
        <div>
          <small>
            {target.kind} ·{" "}
            {device === "base" ? "Base / Desktop" : title(device)}
          </small>
          <h2>{target.label}</h2>
        </div>
        <button
          className="p24-icon"
          aria-label="Close properties"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className="p24-scope">
        {device === "base"
          ? "Base values apply to every screen unless overridden."
          : `${title(device)} changes override inherited sizes and spacing. Colors stay global.`}
      </p>
      {target.textEditable &&
        group(
          "Text",
          <>
            <div className="p24-field">
              <label htmlFor="p24-copy-language">Language</label>
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
                <option value="en">English</option>
                <option value="am">Հայերեն</option>
              </select>
            </div>
            <label className="p24-text-label" htmlFor="p24-copy">
              Content
            </label>
            <textarea
              id="p24-copy"
              aria-label="Text content"
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
            >
              Restore original text
            </button>
          </>,
          true,
        )}
      {target.kind === "image" &&
        group(
          "Image source",
          <>
            <div className="p24-image-preview">
              <img
                src={
                  design.images[id]?.startsWith("asset:")
                    ? editor.assetURLs[design.images[id]]
                    : resolveProjectAsset(design.images[id]) ||
                      frameRef.current?.contentDocument?.querySelector(
                        elementSelector(id),
                      )?.src
                }
                alt="Selected image preview"
              />
            </div>
            <label className="p24-upload">
              Upload New Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                aria-label="Upload new image"
                disabled={editor.busy}
                onChange={(e) => {
                  editor.uploadImage(e.target.files?.[0], id);
                  e.target.value = "";
                }}
              />
            </label>
            <div className="p24-inline-buttons">
              <button onClick={() => setGallery(!gallery)}>
                Choose Existing Image
              </button>
              <button
                disabled={!design.images[id]}
                onClick={() => editor.updateImage(id, null)}
              >
                Restore Original
              </button>
            </div>
            {gallery && (
              <div className="p24-gallery" aria-label="Project image gallery">
                {assets.map((asset) => (
                  <button
                    key={asset.src}
                    title={asset.label}
                    onClick={() => {
                      editor.updateImage(id, asset.ref);
                      setGallery(false);
                    }}
                  >
                    <img src={asset.src} alt="" loading="lazy" />
                    <span>{asset.label}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="p24-hint">
              JPG, PNG, WebP or AVIF · up to 12 MB. Stored on this browser.
            </p>
          </>,
          true,
        )}
      {id.startsWith("hero.") &&
        ["section", "image", "overlay", "container"].includes(target.kind) &&
        group(
          "Before / After Settings",
          <>
            <div className="p24-inline-buttons">
              <button onClick={() => select("hero.beforeImage")}>
                Before Image
              </button>
              <button onClick={() => select("hero.afterImage")}>
                After Image
              </button>
              <button onClick={() => select("hero.overlay")}>Overlay</button>
            </div>
            <label className="p24-range">
              Before / After Split{" "}
              <output>{design.comparison.initialSplit ?? 50}%</output>
              <input
                aria-label="Before / After Split"
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
              <span>Before image opacity</span>
              <input
                aria-label="Before image opacity"
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
              <span>After image opacity</span>
              <input
                aria-label="After image opacity"
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
            {["labels", "divider"].map((key) => (
              <label className="p24-check" key={key}>
                <input
                  type="checkbox"
                  checked={design.comparison[key] !== false}
                  onChange={(e) => {
                    commit();
                    editor.comparison(key, e.target.checked);
                    commit();
                  }}
                />
                {key === "labels"
                  ? "Show before / after labels"
                  : "Show divider while editing"}
              </label>
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
            >
              Restore comparison defaults
            </button>
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
            >
              Synchronize image positioning
            </button>
            <button onClick={() => select("hero.section")}>
              Comparison viewport dimensions
            </button>
          </>,
          id === "hero.section",
        )}
      {target.kind !== "overlay" &&
        group(
          "Size & Dimensions",
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
              />
              Lock aspect ratio
            </label>
            {target.kind === "section" && (
              <p className="p24-hint">
                Use Minimum height to give content room to grow. Auto height
                preserves the content flow.
              </p>
            )}
            {target.kind === "card" && (
              <p className="p24-hint">
                Width stays within its grid column. Select the parent layout to
                change columns.
              </p>
            )}
            {id.startsWith("hero.") && target.kind === "image" && (
              <p className="p24-hint">
                Both images share the Hero viewport. Use viewport dimensions to
                resize the comparison together.
              </p>
            )}
            {overflow && (
              <div className="p24-warning" role="status">
                This size is smaller than the content. Text remains visible.
                <button
                  onClick={() => {
                    commit();
                    set("height", "auto");
                    set("maxHeight", "auto");
                    commit();
                  }}
                >
                  Fit content automatically
                </button>
              </div>
            )}
          </>,
          true,
        )}
      {target.kind === "image" &&
        group(
          "Image position",
          <>
            {choice("objectFit", "Object fit", [
              ["cover", "Cover"],
              ["contain", "Contain"],
              ["fill", "Fill"],
            ])}
            {range("objectPositionX", "Horizontal position", 0, 100)}
            {range("objectPositionY", "Vertical position", 0, 100)}
            {range("zoom", "Zoom", 1, 3, 0.01)}
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
            >
              Reset Image Settings
            </button>
          </>,
          true,
        )}
      {group(
        "Appearance",
        <>
          {target.properties.includes("color") && color("color", "Text color")}
          {target.properties.includes("backgroundColor") &&
            color(
              "backgroundColor",
              target.kind === "overlay" ? "Overlay color" : "Background color",
            )}
          {range(
            "opacity",
            target.kind === "overlay"
              ? "Overlay opacity"
              : target.kind === "image"
                ? "Image opacity"
                : "Element opacity",
            0,
            1,
            0.01,
            100,
          )}
          {target.kind !== "overlay" && (
            <>
              {range("borderRadius", "Border radius", 0, 500)}
              {numeric("borderWidth", "Border width", 0, 30)}
              {color("borderColor", "Border color")}
              {choice(
                "boxShadow",
                "Shadow",
                Object.entries(shadows).map(([l, v]) => [v, l]),
              )}
            </>
          )}
          {contrast < 4.5 && (
            <p className="p24-warning" role="status">
              Low contrast ({contrast.toFixed(2)}:1). Aim for 4.5:1 for readable
              text.
            </p>
          )}
        </>,
        target.kind !== "image",
      )}
      {target.textEditable &&
        group(
          "Typography",
          <>
            {numeric("fontSize", "Font size", 8, 240)}
            {numeric("lineHeight", "Line height", 0.7, 3, 0.05)}
          </>,
        )}
      {target.kind !== "overlay" &&
        group(
          "Spacing",
          <>
            <div className="p24-field">
              <label htmlFor="p24-link-spacing">Link sides</label>
              <select
                id="p24-link-spacing"
                value={linkSpacing}
                onChange={(e) => setLinkSpacing(e.target.value)}
              >
                <option value="none">Independent</option>
                <option value="opposite">Opposite sides</option>
                <option value="all">All sides</option>
              </select>
            </div>
            {["padding", "margin"].map((type) => (
              <div className="p24-spacing" key={type}>
                <strong>{title(type)}</strong>
                {spacingKeys
                  .filter((k) => k.startsWith(type))
                  .map((key) => (
                    <div className="p24-field" key={key}>
                      <label htmlFor={`p24-${key}`}>
                        {title(key)}
                        {changed(key) && <i />}
                      </label>
                      <input
                        id={`p24-${key}`}
                        aria-label={title(key)}
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
          "Layout",
          <>
            {numeric("gap", "Gap", 0, 300)}
            {computed.layout === "grid" ? (
              <>
                {numeric("columnGap", "Column gap", 0, 300)}
                {numeric("rowGap", "Row gap", 0, 300)}
                {choice("gridTemplateColumns", "Columns", [
                  ["repeat(1, minmax(0, 1fr))", "One"],
                  ["repeat(2, minmax(0, 1fr))", "Two"],
                  ["repeat(3, minmax(0, 1fr))", "Three"],
                ])}
              </>
            ) : (
              <>
                {choice("flexDirection", "Direction", [
                  ["row", "Horizontal"],
                  ["column", "Vertical"],
                ])}
                {choice(
                  "justifyContent",
                  computed.flexDirection === "column"
                    ? "Vertical alignment"
                    : "Horizontal alignment",
                  [
                    ["flex-start", "Start"],
                    ["center", "Center"],
                    ["flex-end", "End"],
                    ["space-between", "Space between"],
                    ["space-around", "Space around"],
                  ],
                )}
                {choice("alignItems", "Cross-axis alignment", [
                  ["stretch", "Stretch"],
                  ["flex-start", "Start"],
                  ["center", "Center"],
                  ["flex-end", "End"],
                ])}
              </>
            )}
          </>,
        )}
      <div className="p24-panel-actions">
        {parent && (
          <button onClick={() => select(parent)}>Select parent</button>
        )}
        {card && <button onClick={() => select(card)}>Select card</button>}
        {targets[sectionID] && id !== sectionID && (
          <button onClick={() => select(sectionID)}>Select section</button>
        )}
        <button onClick={() => editor.resetElement(id)}>Reset Selected</button>
        {targets[sectionID] && (
          <>
            <button onClick={() => editor.resetElement(sectionID, true)}>
              Reset Section
            </button>
            <button onClick={() => editor.setVisibility(section, false)}>
              Hide section
            </button>
          </>
        )}
      </div>
    </div>
  );
}
