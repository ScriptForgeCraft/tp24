import { useUi } from "../localization";
import React from "react";
import { useEditor } from "./EditorProvider";
import { targets } from "./editorConfig";
export function LayersPanel() {
  const t = useUi();
  const { tree, selected, select, frameRef, design, setRemoved } = useEditor();
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
      .map((layer) => {
        const children = tree.some((c) => c.parent === layer.id);
        return (
          <div className="p24-layer-branch" key={layer.id}>
            {design.removed?.[layer.id] && (
              <button className="p24-restore-layer" aria-label={`${t("Restore element")}: ${t(targets[layer.id]?.label, layer.id)}`} onClick={() => setRemoved(layer.id, false)}>
                ↶ {t("Restore element")}
              </button>
            )}
            {children ? (
              <details open>
                <summary>
                  <button
                    data-layer-id={layer.id}
                    aria-pressed={selected === layer.id}
                    onClick={(e) => {
                      e.preventDefault();
                      pick(layer.id);
                    }}
                  >
                    <span>
                      {targets[layer.id]?.kind === "section"
                        ? "▤"
                        : targets[layer.id]?.kind === "image"
                          ? "▧"
                          : "◇"}
                    </span>
                    {t(targets[layer.id]?.label, layer.id)}
                    {!layer.visible && <small>{t("Hidden")}</small>}
                  </button>
                </summary>
                <div className="p24-layer-children">{branch(layer.id)}</div>
              </details>
            ) : (
              <button
                data-layer-id={layer.id}
                className="p24-layer-leaf"
                aria-pressed={selected === layer.id}
                onClick={() => pick(layer.id)}
              >
                <span>{targets[layer.id]?.kind === "image" ? "▧" : "T"}</span>
                {t(targets[layer.id]?.label, layer.id)}
                {!layer.visible && <small>{t("Hidden")}</small>}
              </button>
            )}
          </div>
        );
      });
  return (
    <div className="p24-layers" role="region" aria-label={t("Page layers")}>
      <h2>{t("Page layers")}</h2>
      <p>{t("Select a parent or a nested element.")}</p>
      {branch(null)}
    </div>
  );
}
