import React, { forwardRef } from "react";
import { useEditor } from "./EditorProvider";
import { targets, resolveProjectAsset, REMOVED_IMAGE } from "./editorConfig";

// The existing tags, children, refs and handlers remain the presentation. Only saved
// copy and image sources are substituted, directly in React's render tree.
export const EditorElement = forwardRef(function EditorElement(
  { as: Tag = "div", children, ...props },
  ref,
) {
  const editor = useEditor(),
    id = props["data-edit-id"];
  if (!editor || !id)
    return (
      <Tag {...props} ref={ref}>
        {children}
      </Tag>
    );
  const { design, assetURLs, lang } = editor;
  if (Tag === "img") {
    const source = design.images[id];
    return (
      <Tag
        {...props}
        ref={ref}
        src={
          source?.startsWith("asset:")
            ? assetURLs[source] || props.src
            : (source !== REMOVED_IMAGE && resolveProjectAsset(source)) || props.src
        }
        draggable={editor.mode === "edit" ? false : props.draggable}
      />
    );
  }
  const text = design.texts[lang]?.[id];
  if (text !== undefined && targets[id]?.textEditable) {
    if (/^h[12]$/.test(Tag) && props.className?.includes("display"))
      children = text.split("\n").map((line, i) => (
        <span className="line-mask" key={i}>
          <span style={{ "--line": i }}>{line}</span>
        </span>
      ));
    else {
      const icons = React.Children.toArray(children).filter(
        (child) =>
          React.isValidElement(child) &&
          (child.type === "svg" || child.type?.editorIcon),
      );
      children = (
        <>
          {text}
          {icons}
        </>
      );
    }
  }
  return (
    <Tag {...props} ref={ref}>
      {children}
    </Tag>
  );
});
