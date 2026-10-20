import React from "react";
import { useEditor } from "./EditorProvider";
import { targets } from "./editorConfig";
export function LayersPanel() {
  const { tree, selected, select, frameRef } = useEditor();
  const pick = (id) => {
    select(id);
    frameRef.current?.contentWindow?.postMessage(
      { channel: "prospect24-editor-v2", type: "scroll", id },
      location.origin,
    );
  };
  const branch = (parent) =>
    tree
      .filter((t) => t.parent === parent)
      .map((t) => {
        const children = tree.some((c) => c.parent === t.id);
        return (
          <div className="p24-layer-branch" key={t.id}>
            {children ? (
              <details open>
                <summary>
                  <button
                    data-layer-id={t.id}
                    aria-pressed={selected === t.id}
                    onClick={(e) => {
                      e.preventDefault();
                      pick(t.id);
                    }}
                  >
                    <span>
                      {targets[t.id]?.kind === "section"
                        ? "▤"
                        : targets[t.id]?.kind === "image"
                          ? "▧"
                          : "◇"}
                    </span>
                    {targets[t.id]?.label}
                    {!t.visible && <small>Hidden</small>}
                  </button>
                </summary>
                <div className="p24-layer-children">{branch(t.id)}</div>
              </details>
            ) : (
              <button
                data-layer-id={t.id}
                className="p24-layer-leaf"
                aria-pressed={selected === t.id}
                onClick={() => pick(t.id)}
              >
                <span>{targets[t.id]?.kind === "image" ? "▧" : "T"}</span>
                {targets[t.id]?.label}
                {!t.visible && <small>Hidden</small>}
              </button>
            )}
          </div>
        );
      });
  return (
    <div className="p24-layers" role="region" aria-label="Page layers">
      <h2>Page layers</h2>
      <p>Select a parent or a nested element.</p>
      {branch(null)}
    </div>
  );
}
