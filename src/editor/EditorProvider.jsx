import { useUi, useLanguage } from "../localization";
import { uiError } from "../uiTranslations";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  designCSS,
  emptyDesign,
  isSectionHidden,
  loadDesign,
  sections,
  STORAGE_KEY,
  targets,
  responsiveKeys,
} from "./editorConfig";
import { editorReducer, initialHistory } from "./editorHistory";
import { getAsset, inspectImage, storeAssets } from "./editorStorage";
import { download, exportProject, importProject } from "./editorExport";
import { PropertiesPanel } from "./PropertiesPanel";
import { CanvasEditing } from "./SelectionOverlay";
import { LayersPanel } from "./LayersPanel";

const EditorContext = createContext(null);
export const useEditor = () => useContext(EditorContext);
const channel = "prospect24-editor-v2";
const isCanvas =
  new URLSearchParams(location.search).get("editorCanvas") === "1" &&
  window.parent !== window;
const tellHost = (payload) =>
  window.parent.postMessage({ channel, ...payload }, location.origin);
export const elementSelector = (id) => `[data-edit-id="${id}"]`;
export function EditorToggle() {
  const t = useUi();
  const { mode, setMode } = useEditor();
  return (
    <button
      data-editor-ui
      className="p24-pencil"
      aria-label={mode === "off" ? t("Enable Edit Mode") : t("Exit Edit Mode")}
      aria-pressed={mode !== "off"}
      title={t("Customize this presentation")}
      onClick={() => setMode(mode === "off" ? "edit" : "off")}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m15 5 4 4M4 20l5-1L20 8a2.83 2.83 0 0 0-4-4L5 15l-1 5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
// Comparison interaction state remains local to App. Saved split changes are an explicit event,
// so a resize or color drag does not rerender the entire presentation component.
export function useComparisonSplit() {
  const [split, setSplit] = useState(50);
  useEffect(() => {
    const update = (e) => setSplit(e.detail);
    window.addEventListener("p24-comparison", update);
    return () => window.removeEventListener("p24-comparison", update);
  }, []);
  return [split, setSplit];
}
function PresentationEffects({ design, mode }) {
  useEffect(() => {
    const timer = setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("p24-comparison", {
            detail: design.comparison.initialSplit ?? 50,
          }),
        ),
      0,
    );
    return () => clearTimeout(timer);
  }, [design.comparison.initialSplit]);
  useLayoutEffect(() => {
    const links = [];
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const dest = document.getElementById(link.getAttribute("href").slice(1));
      const hidden = dest?.closest("[data-edit-section]");
      if (
        !hidden ||
        !isSectionHidden(
          design,
          sections.find((s) => s.id === hidden.dataset.editSection),
        )
      )
        return;
      links.push([link, link.getAttribute("aria-disabled")]);
      link.dataset.editorHiddenLink = "true";
      link.setAttribute("aria-disabled", "true");
    });
    const block = (e) => {
      if (e.target.closest?.("[data-editor-hidden-link]")) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    document.addEventListener("click", block, true);
    return () => {
      document.removeEventListener("click", block, true);
      links.forEach(([el, prev]) => {
        delete el.dataset.editorHiddenLink;
        if (prev === null) el.removeAttribute("aria-disabled");
        else el.setAttribute("aria-disabled", prev);
      });
    };
  });
  useEffect(() => {
    document.documentElement.classList.toggle("p24-editing", mode === "edit");
    return () => document.documentElement.classList.remove("p24-editing");
  }, [mode]);
  return <style data-editor-overrides>{designCSS(design)}</style>;
}
function CanvasProvider({ children }) {
  const [snapshot, setSnapshot] = useState({
    design: emptyDesign(),
    mode: "edit",
    selected: null,
    device: "base",
    assetURLs: {},
  });
  const { lang, setLang } = useLanguage();
  const remote = (type, payload = {}) => tellHost({ type, ...payload });
  useEffect(() => {
    const receive = (e) => {
      if (
        e.source === parent &&
        e.origin === location.origin &&
        e.data?.channel === channel &&
        e.data.type === "snapshot"
      )
        setSnapshot(e.data.snapshot);
      if (
        e.source === parent &&
        e.origin === location.origin &&
        e.data?.channel === channel &&
        e.data.type === "scroll"
      ) {
        window.dispatchEvent(
          new CustomEvent("p24-editor-reveal", { detail: e.data.id }),
        );
        requestAnimationFrame(() =>
          document
            .querySelector(elementSelector(e.data.id))
            ?.scrollIntoView({ behavior: "instant", block: "center" }),
        );
      }
    };
    window.addEventListener("message", receive);
    remote("ready");
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    let timer;
    const report = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const language = document.documentElement.lang === "hy" ? "am" : "en";
        setLang(language);
        const tree = Array.from(document.querySelectorAll("[data-edit-id]"))
          .filter((el) => !el.closest("dialog"))
          .map((el) => ({
            id: el.dataset.editId,
            parent:
              el.parentElement?.closest("[data-edit-id]")?.dataset.editId ||
              null,
            tag: el.tagName.toLowerCase(),
            display: getComputedStyle(el).display,
            layout: getComputedStyle(el).display,
            visible: !!el.getClientRects().length,
          }));
        remote("tree", { tree, lang: language });
      }, 50);
    };
    const observer = new MutationObserver(report);
    observer.observe(document.getElementById("root"), {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "data-edit-id"],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    report();
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);
  const context = {
    ...snapshot,
    lang,
    select: (id) => remote("select", { id }),
    setMode: (mode) => remote("mode", { mode }),
    commit: () => remote("commit"),
    updateStyle: (id, key, value, continuous = true, scope = snapshot.device) =>
      remote("style", { id, key, value, continuous, scope }),
    cancelResize: () => remote("cancelResize"),
    setVisibility: (id, visible) => remote("visibility", { id, visible }),
    undo: () => remote("undo"),
    redo: () => remote("redo"),
  };
  return (
    <EditorContext.Provider value={context}>
      <PresentationEffects design={snapshot.design} mode={snapshot.mode} />
      {children}
      {snapshot.mode === "edit" && <CanvasEditing />}
    </EditorContext.Provider>
  );
}
export function EditorProvider({ children }) {
  return isCanvas ? (
    <CanvasProvider>{children}</CanvasProvider>
  ) : (
    <HostProvider>{children}</HostProvider>
  );
}
function HostProvider({ children }) {
  const { lang, setLang } = useLanguage();
  const t = useUi();
  const [history, dispatch] = useReducer(editorReducer, undefined, () => {
    try {
      return initialHistory(loadDesign(localStorage));
    } catch {
      return initialHistory(emptyDesign());
    }
  });
  const design = history.present;
  const [mode, changeMode] = useState(() =>
    new URLSearchParams(location.search).get("editor") === "1" ? "edit" : "off",
  );
  const [selected, setSelected] = useState(null),
    [device, setDevice] = useState("base"),
    [view, setView] = useState("properties"),
    [collapsed, setCollapsed] = useState(false),
    [confirmReset, setConfirmReset] = useState(false),
    [notice, setNotice] = useState(
      "Select anything on the canvas. Changes save on this browser.",
    ),
    [storageFailed, setStorageFailed] = useState(false),
    [busy, setBusy] = useState(false),
    [tree, setTree] = useState([]),
    [assetURLs, setAssetURLs] = useState({}),
    [ready, setReady] = useState(0);
  const frameRef = useRef(null),
    inputRef = useRef(null),
    urls = useRef({}),
    loading = useRef(new Set()),
    apiRef = useRef(null),
    designRef = useRef(design);
  const mounted = useRef(true);
  designRef.current = design;
  const commit = () => dispatch({ type: "commit" });
  const change = (value, continuous = false) =>
    dispatch({ type: "change", value, continuous });
  function setMode(next) {
    if (next === "off") {
      const languageButton = document.querySelector(
        `.p24-original .header .language button:${lang === "am" ? "last" : "first"}-child`,
      );
      languageButton?.click();
    }
    commit();
    setSelected(null);
    changeMode(next);
    setConfirmReset(false);
    const url = new URL(location.href);
    if (next === "off") url.searchParams.delete("editor");
    else url.searchParams.set("editor", "1");
    window.history.replaceState(window.history.state, "", url);
  }
  function select(id) {
    commit();
    setSelected(id);
    setView("properties");
    if (id) setCollapsed(false);
  }
  function updateStyle(id, key, value, continuous = true, scope = device) {
    if (!Object.hasOwn(targets, id)) return;
    const global = !responsiveKeys.includes(key) || scope === "base";
    change((current) => {
      const next = structuredClone(current),
        map = global ? next.overrides : next.responsive[scope];
      map[id] = { ...map[id] };
      if (value === undefined || value === null) delete map[id][key];
      else map[id][key] = value;
      if (!Object.keys(map[id]).length) delete map[id];
      return next;
    }, continuous);
  }
  const updateImage = (id, ref) => {
    commit();
    change((current) => {
      const next = { ...current, images: { ...current.images } };
      if (ref) next.images[id] = ref;
      else delete next.images[id];
      return next;
    });
  };
  const updateText = (id, text, language = lang) =>
    change(
      (current) => ({
        ...current,
        texts: {
          ...current.texts,
          [language]: { ...current.texts[language], [id]: text },
        },
      }),
      true,
    );
  const comparison = (key, value) =>
    change(
      (current) => ({
        ...current,
        comparison: { ...current.comparison, [key]: value },
      }),
      true,
    );
  const setVisibility = (id, visible) => {
    commit();
    change((current) => {
      const next = { ...current, visibility: { ...current.visibility } };
      if (visible) delete next.visibility[id];
      else next.visibility[id] = false;
      return next;
    });
    setSelected(null);
    setNotice(
      `${sections.find((s) => s.id === id)?.label} ${visible ? "restored" : "hidden"}.`,
    );
  };
  function resetElement(id, section = false) {
    commit();
    change((current) => {
      const next = structuredClone(current);
      const sectionNames = [id.split(".")[0]];
      if (section)
        for (const item of sections)
          if (sectionNames.includes(item.parent)) sectionNames.push(item.id);
      const match = (key) =>
        section
          ? sectionNames.some((name) => key.startsWith(name + "."))
          : key === id;
      for (const map of [
        next.overrides,
        next.responsive.tablet,
        next.responsive.mobile,
        next.images,
        next.texts.en,
        next.texts.am,
        next.locks,
      ])
        Object.keys(map)
          .filter(match)
          .forEach((key) => delete map[key]);
      if (section) {
        sectionNames.forEach((name) => delete next.visibility[name]);
        if (id === "hero.section") next.comparison = {};
      }
      return next;
    });
    setNotice("Original appearance restored. Undo is available.");
  }
  async function uploadImage(file, id) {
    if (!file) return;
    setBusy(true);
    try {
      const asset = await inspectImage(file);
      if (!(await getAsset(asset.id))) await storeAssets([asset]);
      updateImage(id, asset.id);
      setNotice("Image saved in this browser. Export Project to share it.");
    } catch (e) {
      setNotice(`Image not saved: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  async function exportDesign(settings = false) {
    commit();
    setBusy(true);
    try {
      if (settings) {
        download(
          new Blob([JSON.stringify(design, null, 2)], {
            type: "application/json",
          }),
          "prospect24-settings.json",
        );
        setNotice(
          "Settings exported. Custom images are only included in Export Project ZIP.",
        );
      } else {
        download(await exportProject(design), "prospect24-client-design.zip");
        setNotice("Project exported with all referenced custom images.");
      }
    } catch (e) {
      setNotice(`Export failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  async function importDesign(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    commit();
    setBusy(true);
    try {
      const result = await importProject(file);
      change(result.design);
      setSelected(null);
      setNotice(`Project imported. Undo is available. ${result.warning}`);
    } catch (e) {
      setNotice(`Import failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    for (const ref of new Set(Object.values(design.images))) {
      if (
        !ref.startsWith("asset:") ||
        urls.current[ref] ||
        loading.current.has(ref)
      )
        continue;
      loading.current.add(ref);
      getAsset(ref)
        .then((asset) => {
          if (!mounted.current) return;
          if (!asset) {
            setNotice(
              "A saved image is unavailable. Its original is shown; replace it or import its project ZIP.",
            );
            return;
          }
          urls.current[ref] = URL.createObjectURL(asset.blob);
          setAssetURLs({ ...urls.current });
        })
        .catch((e) => {
          setNotice(e.message);
        })
        .finally(() => loading.current.delete(ref));
    }
  }, [design.images]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Object.values(urls.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(designRef.current));
        setStorageFailed(false);
      } catch {
        setStorageFailed(true);
      }
    };
    const timer = setTimeout(save, 300);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [design]);
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setLang(document.documentElement.lang === "hy" ? "am" : "en"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (mode === "off") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode]);
  const snapshot = { design, mode, selected, device, assetURLs };
  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { channel, type: "snapshot", snapshot },
      location.origin,
    );
  }, [design, mode, selected, device, assetURLs, ready]);
  apiRef.current = { select, setMode, updateStyle, setVisibility, commit };
  useEffect(() => {
    const receive = (e) => {
      if (
        e.source !== frameRef.current?.contentWindow ||
        e.origin !== location.origin ||
        e.data?.channel !== channel
      )
        return;
      const d = e.data,
        api = apiRef.current;
      if (d.type === "ready") setReady((n) => n + 1);
      else if (d.type === "tree") {
        setTree(d.tree);
        setLang(d.lang);
      } else if (d.type === "select") api.select(d.id);
      else if (d.type === "style")
        api.updateStyle(d.id, d.key, d.value, d.continuous, d.scope);
      else if (d.type === "visibility") api.setVisibility(d.id, d.visible);
      else if (d.type === "mode") api.setMode(d.mode);
      else if (d.type === "commit") api.commit();
      else if (["undo", "redo", "cancelResize"].includes(d.type))
        dispatch({ type: d.type === "cancelResize" ? "cancel" : d.type });
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (mode === "off") return;
    const key = (e) => {
      if (e.key === "Escape" && !confirmReset) {
        commit();
        setSelected(null);
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "z" &&
        !e.target.closest("input,textarea,select,[contenteditable]")
      ) {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [mode, confirmReset]);
  const context = {
    design,
    mode,
    setMode,
    selected,
    select,
    device,
    setDevice,
    lang,
    assetURLs,
    commit,
    change,
    updateStyle,
    updateImage,
    updateText,
    comparison,
    setVisibility,
    resetElement,
    uploadImage,
    frameRef,
    tree,
    notice,
    setNotice,
    busy,
  };
  return (
    <EditorContext.Provider value={context}>
      <PresentationEffects design={design} mode="off" />
      <div
        className="p24-original"
        style={{ display: mode === "off" ? "contents" : "none" }}
      >
        {children}
      </div>
      {mode !== "off" &&
        createPortal(
          <div
            className={`p24-editor ${mode === "preview" ? "is-preview" : ""} ${collapsed ? "is-collapsed" : ""}`}
            data-editor-ui
          >
            <div
              className="p24-toolbar"
              role="region"
              aria-label={t("Design editor")}
              data-editor-toolbar
            >
              <div className="p24-brand">
                <span className="p24-brand-icon">
                  P<span>24</span>
                </span>
                <div>
                  <strong>{t("Design studio")}</strong>
                  <small>
                    <i />
                    {mode === "edit" ? t("Editing") : t("Live preview")}
                  </small>
                </div>
              </div>
              <div className="p24-devices" aria-label={t("Preview device")}>
                {[
                  ["base", t("Desktop"), 1440],
                  ["tablet", t("Tablet"), 768],
                  ["mobile", t("Mobile"), 390],
                ].map(([id, label, width]) => (
                  <button
                    key={id}
                    aria-pressed={device === id}
                    title={`${label} · ${width}px`}
                    onClick={() => {
                      commit();
                      setDevice(id);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="p24-tools">
                {mode === "edit" ? (
                  <>
                    <button
                      aria-pressed={view === "layers" && !collapsed}
                      onClick={() => {
                        setView("layers");
                        setCollapsed(false);
                      }}
                    >{t("Layers")}</button>
                    <button
                      aria-pressed={view === "sections" && !collapsed}
                      onClick={() => {
                        setView("sections");
                        setCollapsed(false);
                      }}
                    >{t("Sections")}</button>
                    <button
                      disabled={!history.past.length && !history.pending}
                      onClick={() => dispatch({ type: "undo" })}
                      title={t("Undo · Ctrl/Cmd+Z")}
                    >{t("Undo")}</button>
                    <button
                      disabled={!history.future.length}
                      onClick={() => dispatch({ type: "redo" })}
                    >{t("Redo")}</button>
                    <button
                      onClick={() => {
                        commit();
                        setConfirmReset(true);
                      }}
                    >{t("Reset All")}</button>
                    <button disabled={busy} onClick={() => exportDesign()}>{t("Export Project")}</button>
                    <button
                      disabled={busy}
                      onClick={() => inputRef.current.click()}
                    >{t("Import")}</button>
                    <button
                      className="p24-primary"
                      onClick={() => setMode("preview")}
                    >{t("Preview")}</button>
                  </>
                ) : (
                  <button
                    className="p24-primary"
                    onClick={() => setMode("edit")}
                  >{t("Return to editing")}</button>
                )}
                <button
                  aria-label={t("Close editor")}
                  title={t("Exit editor")}
                  className="p24-icon"
                  onClick={() => setMode("off")}
                >
                  ×
                </button>
              </div>
              <p className="p24-status" role="status">
                {busy
                  ? t("Working…")
                  : storageFailed
                    ? t("Browser storage unavailable. Export Project to save your changes.")
                    : uiError(notice, lang)}
              </p>
              <input
                ref={inputRef}
                type="file"
                hidden
                accept=".zip,.json,application/zip,application/json"
                aria-label={t("Import design file")}
                onChange={importDesign}
              />
            </div>
            <ResponsivePreview
              frameRef={frameRef}
              device={device}
              collapsed={collapsed}
              mode={mode}
            />
            {mode === "edit" && (
              <>
                <button
                  className="p24-panel-toggle"
                  aria-label={
                    collapsed
                      ? t("Expand properties panel")
                      : t("Collapse properties panel")
                  }
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? "‹" : "›"}
                </button>
                {!collapsed && (
                  <aside className="p24-sidebar" aria-label={t("Editor panels")}>
                    <div className="p24-tabs">
                      {["properties", "layers", "sections"].map((tab) => (
                        <button
                          key={tab}
                          aria-pressed={view === tab}
                          onClick={() => {
                            commit();
                            setView(tab);
                          }}
                        >
                          {t(tab)}
                        </button>
                      ))}
                    </div>
                    {view === "layers" ? (
                      <LayersPanel />
                    ) : view === "sections" ? (
                      <div
                        className="p24-sections"
                        role="region"
                        aria-label={t("Section visibility")}
                      >
                        <h2>{t("Sections")}</h2>
                        <p>{t("Hide a section without deleting its content.")}</p>
                        {sections.map((s) => (
                          <label key={s.id}>
                            <span>
                              {t(s.label)}
                              {s.parent &&
                                design.visibility[s.parent] === false && (
                                  <small>{t("Hidden with Expertise")}</small>
                                )}
                            </span>
                            <input
                              type="checkbox"
                              checked={design.visibility[s.id] !== false}
                              aria-label={t(`Show ${s.label}`)}
                              onChange={(e) =>
                                setVisibility(s.id, e.target.checked)
                              }
                            />
                          </label>
                        ))}
                      </div>
                    ) : selected ? (
                      <PropertiesPanel
                        key={selected}
                        id={selected}
                        onClose={() => {
                          commit();
                          setSelected(null);
                        }}
                      />
                    ) : (
                      <div className="p24-empty">
                        <span>↖</span>
                        <h2>{t("Make it yours")}</h2>
                        <p>{t("Select a section, image or text on the canvas to start designing.")}</p>
                        <button onClick={() => setView("layers")}>{t("Browse layers")}</button>
                        <div>{t("Local to this browser")}<br />{t("Export a project to share your design.")}</div>
                      </div>
                    )}
                    <div className="p24-sidebar-footer">
                      <span>{t("● Saved locally")}</span>
                      <button onClick={() => exportDesign(true)}>{t("Settings JSON")}</button>
                    </div>
                  </aside>
                )}
              </>
            )}
            {confirmReset && (
              <ResetConfirmation
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => {
                  change(emptyDesign());
                  setSelected(null);
                  setConfirmReset(false);
                  setNotice(
                    "Original presentation restored. Undo is available.",
                  );
                }}
              />
            )}
          </div>,
          document.body,
        )}
    </EditorContext.Provider>
  );
}
function ResponsivePreview({ frameRef, device, collapsed, mode }) {
  const t = useUi();
  const box = useRef(null),
    [size, setSize] = useState({ width: 800, height: 700 });
  useLayoutEffect(() => {
    const update = () => {
      if (box.current)
        setSize({
          width: box.current.clientWidth,
          height: box.current.clientHeight,
        });
    };
    const observer = new ResizeObserver(update);
    observer.observe(box.current);
    update();
    return () => observer.disconnect();
  }, []);
  const width = { base: 1440, tablet: 768, mobile: 390 }[device],
    scale = Math.min(1, (size.width - 32) / width),
    height = Math.max(320, (size.height - 40) / scale);
  const src = useMemo(() => {
    const url = new URL(location.href);
    url.searchParams.delete("editor");
    url.searchParams.set("editorCanvas", "1");
    url.searchParams.set(
      "editorLanguage",
      document.documentElement.lang === "hy" ? "am" : "en",
    );
    url.hash = "";
    return url.href;
  }, []);
  return (
    <div ref={box} className="p24-workspace">
      <div className="p24-canvas-caption">
        {device === "base"
          ? t("Desktop")
          : device === "tablet"
            ? t("Tablet")
            : t("Mobile")}{" "}
        <span>
          {width} px · {Math.round(scale * 100)}%
        </span>
      </div>
      <div
        className="p24-frame-space"
        style={{ width: width * scale, height: height * scale }}
      >
        <iframe
          ref={frameRef}
          title={t("Prospect24 live design canvas")}
          src={src}
          style={{ width, height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
function ResetConfirmation({ onCancel, onConfirm }) {
  const t = useUi();
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      data-editor-ui
      className="p24-reset"
      aria-labelledby="p24-reset-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id="p24-reset-title">{t("Restore original design?")}</h2>
      <p>{t("Restore all images, text, dimensions, styles and sections. You can undo this change.")}</p>
      <div>
        <button autoFocus onClick={onCancel}>{t("Cancel")}</button>
        <button className="p24-primary" onClick={onConfirm}>{t("Restore original")}</button>
      </div>
    </dialog>
  );
}
