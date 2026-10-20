import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, elementSelector } from "./EditorProvider";
import { isSectionHidden, sections, targets } from "./editorConfig";
let ignoreClicksUntil = 0;
const ui = (target) =>
  target.closest?.("[data-editor-ui],.language,.navbar-design");
export function useElementRect(id) {
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    if (!id) {
      setRect(null);
      return;
    }
    let frame;
    const follow = () => {
      const el = document.querySelector(elementSelector(id));
      if (!el?.getClientRects().length)
        setRect((old) => (old === null ? old : null));
      else {
        const r = el.getBoundingClientRect();
        const next = {
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        };
        setRect((old) =>
          old &&
          Object.keys(next).every((k) => Math.abs(old[k] - next[k]) < 0.2)
            ? old
            : next,
        );
      }
      frame = requestAnimationFrame(follow);
    };
    follow();
    return () => cancelAnimationFrame(frame);
  }, [id]);
  return rect;
}
export function CanvasEditing() {
  const editor = useEditor(),
    api = useRef(editor);
  api.current = editor;
  const [hovered, setHovered] = useState(null);
  useEffect(() => {
    const touched = new Map();
    const prepare = () =>
      document.querySelectorAll("[data-edit-id]").forEach((el) => {
        if (touched.has(el)) return;
        touched.set(el, el.getAttribute("tabindex"));
        if (
          !el.matches("a,button,input,select,textarea") &&
          !el.closest('[aria-hidden="true"],[inert]')
        )
          el.tabIndex = 0;
      });
    prepare();
    const observer = new MutationObserver(prepare);
    observer.observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
    });
    const block = (e) => {
      if (ui(e.target)) return;
      if (e.target.closest("main,header,footer")) e.stopImmediatePropagation();
    };
    const click = (e) => {
      if (performance.now() < ignoreClicksUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (ui(e.target)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      api.current.select(
        e.target.closest("[data-edit-id]")?.dataset.editId || null,
      );
    };
    const hover = (e) =>
      setHovered(
        ui(e.target)
          ? null
          : e.target.closest("[data-edit-id]")?.dataset.editId || null,
      );
    const key = (e) => {
      if (e.target.closest("input,textarea,select,[contenteditable]")) return;
      if (e.key === "Escape") {
        if (document.documentElement.classList.contains("p24-resizing")) return;
        e.preventDefault();
        api.current.select(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? api.current.redo() : api.current.undo();
      } else if (!ui(e.target)) {
        if (["Enter", " "].includes(e.key)) click(e);
        else if (
          ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) &&
          e.target.closest('[role="slider"],[aria-roledescription="carousel"]')
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };
    const events = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "touchstart",
      "touchend",
      "mousedown",
      "mouseup",
      "mouseover",
      "dragstart",
    ];
    events.forEach((type) => document.addEventListener(type, block, true));
    document.addEventListener("click", click, true);
    document.addEventListener("pointerover", hover, true);
    document.addEventListener("keydown", key, true);
    return () => {
      observer.disconnect();
      touched.forEach((v, el) => {
        if (v === null) el.removeAttribute("tabindex");
        else el.setAttribute("tabindex", v);
      });
      events.forEach((type) => document.removeEventListener(type, block, true));
      document.removeEventListener("click", click, true);
      document.removeEventListener("pointerover", hover, true);
      document.removeEventListener("keydown", key, true);
    };
  }, []);
  return createPortal(
    <div className="p24-canvas-ui" data-editor-ui>
      <Outline id={hovered !== editor.selected ? hovered : null} />
      <Outline id={editor.selected} selected />
      {sections
        .filter((s) => !isSectionHidden(editor.design, s))
        .map((s) => {
          const el = document.querySelector(`[data-edit-section="${s.id}"]`);
          return (
            el &&
            createPortal(
              <button
                data-editor-ui
                className="p24-hide"
                key={s.id}
                aria-label={`Hide ${s.label}`}
                title={`Hide ${s.label}`}
                onClick={() => editor.setVisibility(s.id, false)}
              >
                ×
              </button>,
              el,
              s.id,
            )
          );
        })}
    </div>,
    document.body,
  );
}
function Outline({ id, selected }) {
  const rect = useElementRect(id),
    editor = useEditor(),
    cleanup = useRef(null);
  useEffect(() => () => cleanup.current?.(), []);
  if (!rect || !targets[id]) return null;
  const begin = (event, axis) => {
    event.preventDefault();
    event.stopPropagation();
    editor.commit();
    const target = document.querySelector(elementSelector(id)),
      start = {
        x: event.clientX,
        y: event.clientY,
        width: target.getBoundingClientRect().width,
        height: target.getBoundingClientRect().height,
      };
    const handle = event.currentTarget,
      pointer = event.pointerId;
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(pointer);
    document.documentElement.classList.add("p24-resizing");
    const locked = editor.design.locks?.[id] ?? targets[id].kind === "image";
    const ratio = start.width / start.height;
    let pending, frame;
    const apply = () => {
      if (!pending) return;
      const { x, y } = pending;
      let width = Math.max(24, Math.min(5000, start.width + x - start.x)),
        height = Math.max(24, Math.min(5000, start.height + y - start.y));
      if (locked) {
        if (axis === "y") width = height * ratio;
        else height = width / ratio;
      }
      const scope = editor.device;
      if (axis !== "y" || locked)
        editor.updateStyle(id, "width", `${Math.round(width)}px`, true, scope);
      if (axis !== "x" || locked) {
        editor.updateStyle(
          id,
          targets[id].kind === "section" ? "minHeight" : "height",
          `${Math.round(height)}px`,
          true,
          scope,
        );
        // Hero has an existing viewport-based height. Its minimum alone cannot
        // shrink that height, so keep both constraints synchronized while dragging.
        if (id === "hero.section")
          editor.updateStyle(
            id,
            "height",
            `${Math.round(height)}px`,
            true,
            scope,
          );
      }
      pending = null;
      frame = null;
    };
    const move = (e) => {
      if (e.pointerId !== pointer) return;
      pending = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const finish = (cancel) => {
      ignoreClicksUntil = performance.now() + 250;
      if (frame) cancelAnimationFrame(frame);
      if (!cancel) apply();
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", abort);
      document.removeEventListener("keydown", key, true);
      if (handle.hasPointerCapture(pointer))
        handle.releasePointerCapture(pointer);
      document.documentElement.classList.remove("p24-resizing");
      cancel ? editor.cancelResize() : editor.commit();
      cleanup.current = null;
    };
    const up = () => finish(false),
      abort = () => finish(true),
      key = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopImmediatePropagation();
          finish(true);
        }
      };
    cleanup.current = () => finish(true);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", abort);
    document.addEventListener("keydown", key, true);
  };
  return (
    <div
      className={`p24-outline ${selected ? "is-selected" : ""}`}
      style={rect}
    >
      {selected && (
        <>
          <span className="p24-selection-label">{targets[id].label}</span>
          {targets[id].kind !== "overlay" && (
            <>
              {[
                ["x", "right", "Resize width"],
                ["y", "bottom", "Resize height"],
                ["xy", "corner", "Resize width and height"],
              ].map(([axis, position, label]) => (
                <button
                  key={axis}
                  data-editor-ui
                  className={`p24-resize ${position}`}
                  aria-label={label}
                  title={`${label} · drag`}
                  onPointerDown={(e) => begin(e, axis)}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
