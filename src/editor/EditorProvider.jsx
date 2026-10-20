import React, { createContext, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { designCSS, emptyDesign, isSectionHidden, loadDesign, sections, STORAGE_KEY, targets, validateDesign } from './editorConfig';
import { editorReducer, initialHistory } from './editorHistory';

const EditorContext = createContext(null);
export const useEditor = () => useContext(EditorContext);
const selector = id => `[data-edit-id="${id}"]`;
const editorUI = target => target.closest('[data-editor-ui],.language,.navbar-design');

export function EditorToggle() {
  const { mode, setMode } = useEditor();
  return <button data-editor-ui className="p24-pencil" aria-label={mode === 'off' ? 'Enable Edit Mode' : 'Exit Edit Mode'} aria-pressed={mode !== 'off'} title={mode === 'off' ? 'Customize this presentation' : 'Exit editor'} onClick={() => setMode(mode === 'off' ? 'edit' : 'off')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5 4 4M4 20l5-1L20 8a2.83 2.83 0 0 0-4-4L5 15l-1 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg></button>;
}

export function EditorProvider({ children }) {
  const [history, dispatch] = useReducer(editorReducer, undefined, () => {
    try { return initialHistory(loadDesign(window.localStorage)); } catch { return initialHistory(emptyDesign()); }
  });
  const design = history.present;
  const [mode, changeMode] = useState('off');
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageFailed, setStorageFailed] = useState(false);
  const inputRef = useRef(null);
  const commit = () => dispatch({ type: 'commit' });
  const select = id => { commit(); setSectionsOpen(false); setSelected(id); };
  const setMode = next => { commit(); setSelected(null); setHovered(null); setSectionsOpen(false); setConfirmReset(false); changeMode(next); };
  const change = value => dispatch({ type: 'change', value });
  const setVisibility = (id, visible) => {
    change(current => ({ ...current, visibility: Object.fromEntries(Object.entries({ ...current.visibility, [id]: visible }).filter(([, value]) => !value)) }));
    setSelected(null); setHovered(null); setNotice(`${sections.find(s => s.id === id).label} ${visible ? 'restored' : 'hidden'}.`);
  };
  const resetSelected = () => {
    change(current => ({ ...current, overrides: Object.fromEntries(Object.entries(current.overrides).filter(([id]) => id !== selected)) }));
    setNotice('Selected element restored to its original colors.');
  };
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(design)); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  }, [design]);

  // Keep components mounted, including their interaction state. Hidden anchors are disabled
  // in every mode, and become normal links again when their section is restored.
  useLayoutEffect(() => {
    const links = [];
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const destination = document.getElementById(link.getAttribute('href').slice(1));
      const hidden = destination?.closest('[data-edit-section]');
      if (!hidden || !isSectionHidden(design, sections.find(s => s.id === hidden.dataset.editSection))) return;
      links.push([link, link.getAttribute('aria-disabled'), link.getAttribute('title')]);
      link.dataset.editorHiddenLink = 'true'; link.setAttribute('aria-disabled', 'true'); link.title = 'This section is hidden in the current design';
    });
    return () => links.forEach(([link, disabled, title]) => {
      delete link.dataset.editorHiddenLink;
      if (disabled === null) link.removeAttribute('aria-disabled'); else link.setAttribute('aria-disabled', disabled);
      if (title === null) link.removeAttribute('title'); else link.setAttribute('title', title);
    });
  });

  useEffect(() => {
    const preventHidden = event => { if (event.target.closest?.('[data-editor-hidden-link]')) { event.preventDefault(); event.stopImmediatePropagation(); } };
    document.addEventListener('click', preventHidden, true);
    return () => document.removeEventListener('click', preventHidden, true);
  }, []);

  useLayoutEffect(() => {
    if (mode !== 'edit') return;
    document.documentElement.classList.add('p24-editing');
    const touched = new Map();
    const prepare = () => document.querySelectorAll('[data-edit-id]').forEach(el => {
      if (touched.has(el)) return;
      touched.set(el, el.getAttribute('tabindex'));
      if (!el.matches('a,button,input,select,textarea') && !el.closest('[aria-hidden="true"],[inert]')) el.tabIndex = 0;
    });
    prepare();
    const observer = new MutationObserver(prepare);
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    const blockInteraction = event => {
      if (editorUI(event.target)) return;
      // Pointer movement and keyboard input must never start a hero drag/carousel action.
      if (event.target.closest('main,header,footer')) { event.stopImmediatePropagation(); }
    };
    const click = event => {
      if (editorUI(event.target)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const element = event.target.closest('[data-edit-id]');
      select(element?.dataset.editId || null);
    };
    const hover = event => {
      const element = editorUI(event.target) ? null : event.target.closest('[data-edit-id]');
      setHovered(element?.dataset.editId || null);
    };
    const keydown = event => {
      if (event.key === 'Escape') {
        if (confirmReset) return;
        event.preventDefault(); event.stopImmediatePropagation();
        const element = selected && document.querySelector(selector(selected));
        setSelected(null); setSectionsOpen(false); element?.focus({ preventScroll: true });
      } else if (!editorUI(event.target)) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
          event.preventDefault(); dispatch({ type: event.shiftKey ? 'redo' : 'undo' });
        } else if (event.key === 'Enter' || event.key === ' ') click(event);
        else if (event.target.closest('[role="slider"],[aria-roledescription="carousel"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); }
      }
    };
    const events = ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'mouseover'];
    events.forEach(type => document.addEventListener(type, blockInteraction, true));
    document.addEventListener('click', click, true); document.addEventListener('pointerover', hover, true); document.addEventListener('keydown', keydown, true);
    return () => {
      document.documentElement.classList.remove('p24-editing'); observer.disconnect();
      touched.forEach((value, el) => { if (value === null) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', value); });
      events.forEach(type => document.removeEventListener(type, blockInteraction, true));
      document.removeEventListener('click', click, true); document.removeEventListener('pointerover', hover, true); document.removeEventListener('keydown', keydown, true);
    };
  }, [mode, selected, confirmReset]);

  async function importDesign(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('Design files must be smaller than 1 MB.');
      const value = validateDesign(JSON.parse(await file.text()));
      change(value); setSelected(null); setNotice('Design imported. Undo is available.');
    } catch (error) { setNotice(`Import failed: ${error.message}`); }
  }
  function exportDesign() {
    commit();
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...design, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'prospect24-design.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Design exported.');
  }
  const value = { mode, setMode, design, selected, select, commit, setVisibility, setColor: (id, property, color) => dispatch({ type: 'change', continuous: true, value: current => ({ ...current, overrides: { ...current.overrides, [id]: { ...current.overrides[id], [property]: color } } }) }) };
  return <EditorContext.Provider value={value}>
    <style data-editor-overrides>{designCSS(design)}</style>
    {children}
    {mode !== 'off' && createPortal(<div className="p24-editor" data-editor-ui>
      <div className="p24-toolbar" data-editor-toolbar role="region" aria-label="Design editor">
        <span className="p24-mode"><i />{mode === 'edit' ? 'Editing' : 'Preview'}</span>
        {mode === 'preview' ? <button onClick={() => setMode('edit')}>Return to editing</button> : <>
          <button title="Preview with normal site interactions" onClick={() => setMode('preview')}>Preview</button>
          <button aria-expanded={sectionsOpen} aria-controls="p24-sections" onClick={() => { commit(); setSelected(null); setSectionsOpen(!sectionsOpen); }}>Sections</button>
          <button title="Undo last change (Ctrl/Cmd+Z)" disabled={!history.past.length && !history.pending} onClick={() => dispatch({ type: 'undo' })}>Undo</button>
          <button title="Redo last change" disabled={!history.future.length} onClick={() => dispatch({ type: 'redo' })}>Redo</button>
          <button disabled={!selected || !design.overrides[selected]} onClick={resetSelected}>Reset Selected</button>
          <button onClick={() => { commit(); setConfirmReset(true); }}>Reset All</button>
          <button title="Export Design as JSON" onClick={exportDesign}>Export</button>
          <button title="Import Design from JSON" onClick={() => { commit(); inputRef.current?.click(); }}>Import</button>
        </>}
        <button className="p24-icon" aria-label="Close editor" title="Close editor" onClick={() => setMode('off')}>×</button>
        <input ref={inputRef} type="file" accept=".json,application/json" aria-label="Import design file" hidden onChange={importDesign} />
        {mode === 'edit' && <p className="p24-status" role="status">{storageFailed ? 'Browser storage unavailable. Export to save your changes.' : notice || 'Select an element to change its colors. Changes save on this browser.'}</p>}
      </div>
      {mode === 'edit' && <>
        <ElementOutline id={selected} selected /><ElementOutline id={hovered !== selected ? hovered : null} />
        {sections.filter(s => !isSectionHidden(design, s)).map(section => {
          const element = document.querySelector(`[data-edit-section="${section.id}"]`);
          return element && createPortal(<button data-editor-ui className="p24-hide" key={section.id} aria-label={`Hide ${section.label}`} title={`Hide ${section.label}`} onClick={() => setVisibility(section.id, false)}>×</button>, element, section.id);
        })}
        {selected && <PropertiesPanel key={selected} id={selected} onClose={() => { commit(); setSelected(null); }} />}
        {sectionsOpen && <div id="p24-sections" className="p24-sections" role="region" aria-label="Section visibility"><div className="p24-panel-heading"><strong>Sections</strong><button className="p24-icon" aria-label="Close Sections panel" onClick={() => setSectionsOpen(false)}>×</button></div><p>Show or hide sections. Your content stays saved.</p>{sections.map(section => <label key={section.id}><span>{section.label}{section.parent && design.visibility[section.parent] === false && <small>Hidden with Expertise</small>}</span><input type="checkbox" checked={design.visibility[section.id] !== false} onChange={event => setVisibility(section.id, event.target.checked)} aria-label={`Show ${section.label}`} /></label>)}</div>}
      </>}
      {confirmReset && <ResetConfirmation onCancel={() => setConfirmReset(false)} onConfirm={() => { change(emptyDesign()); setConfirmReset(false); setNotice('Original presentation restored. Undo is available.'); }} />}
    </div>, document.body)}
  </EditorContext.Provider>;
}

function useElementRect(id) {
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    if (!id) { setRect(null); return; }
    let frame;
    const update = () => {
      const el = document.querySelector(selector(id));
      if (!el || !el.getClientRects().length) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      const next = { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, right: r.right, viewportWidth: innerWidth, viewportHeight: innerHeight, theme: el.closest('[data-preview-theme]')?.dataset.previewTheme, toolbarHeight: document.querySelector('[data-editor-toolbar]')?.offsetHeight || 0 };
      setRect(old => JSON.stringify(old) === JSON.stringify(next) ? old : next);
    };
    // Follow reveal transforms and scrolling without modifying the selected element.
    const follow = () => { update(); frame = requestAnimationFrame(follow); };
    follow(); return () => cancelAnimationFrame(frame);
  }, [id]);
  return rect;
}
function ElementOutline({ id, selected }) {
  const rect = useElementRect(id);
  return rect && <div className={`p24-outline ${selected ? 'is-selected' : ''}`} aria-hidden="true" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />;
}

let colorContext;
function rgba(value) {
  if (!value) return [0, 0, 0, 0];
  if (value.startsWith('rgb')) {
    const parts = value.match(/[\d.]+/g).map(Number);
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  }
  // Browser-computed color-mix() values may use color(srgb ...) rather than rgb().
  // Let the browser normalize supported color spaces for the native hex picker.
  if (!colorContext) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    colorContext = canvas.getContext('2d', { willReadFrequently: true });
  }
  colorContext.clearRect(0, 0, 1, 1); colorContext.fillStyle = value; colorContext.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = colorContext.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}
function blend(front, back) { return front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3])); }
function background(element) {
  let result = [255, 255, 255];
  const layers = [];
  for (let el = element; el; el = el.parentElement) {
    const group = [rgba(getComputedStyle(el).backgroundColor)];
    if (el.matches('.package-card')) group.push(rgba(getComputedStyle(el, '::after').backgroundColor));
    if (el.matches('.hero')) group.push(rgba(getComputedStyle(el.querySelector('.hero-shade')).backgroundColor));
    layers.unshift(...group);
  }
  layers.forEach(layer => { result = blend(layer, result); });
  return result;
}
const hex = rgb => '#' + rgb.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
function luminance(rgb) { return rgb.slice(0, 3).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0); }

function PropertiesPanel({ id, onClose }) {
  const { design, setColor, commit, select, setVisibility } = useEditor();
  const target = targets[id];
  const rect = useElementRect(id);
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ right: 16, top: 100 });
  const [computed, setComputed] = useState({ color: '#141615', backgroundColor: '#ffffff', borderColor: '#141615', contrast: 21 });
  useLayoutEffect(() => {
    const element = document.querySelector(selector(id));
    if (!element) return;
    const frame = requestAnimationFrame(() => {
      const style = getComputedStyle(element), bg = background(element), fg = blend(rgba(style.color), bg);
      const a = luminance(fg), b = luminance(bg);
      const borderSide = ['Top', 'Right', 'Bottom', 'Left'].find(side => parseFloat(style[`border${side}Width`]) > 0) || 'Top';
      setComputed({ color: hex(fg), backgroundColor: hex(bg), borderColor: hex(blend(rgba(style[`border${borderSide}Color`]), bg)), contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) });
    });
    return () => cancelAnimationFrame(frame);
  }, [id, design, rect?.theme]);
  useLayoutEffect(() => {
    if (!rect || !panelRef.current) return;
    const height = panelRef.current.offsetHeight, width = Math.min(288, innerWidth - 24);
    const toolbarHeight = document.querySelector('[data-editor-toolbar]')?.offsetHeight || 100;
    if (innerWidth <= 600) {
      const availableBottom = innerHeight - toolbarHeight - 24;
      const above = rect.top - height - 12;
      const below = rect.bottom + 12;
      const maxHeight = Math.max(150, innerHeight - toolbarHeight - 120);
      if (above >= 86) setPosition({ left: 12, right: 12, top: above, maxHeight });
      else if (below + height <= availableBottom) setPosition({ left: 12, right: 12, top: below, maxHeight });
      else setPosition({ left: 12, right: 12, bottom: toolbarHeight + 24, maxHeight });
    }
    else {
      const left = rect.right + width + 24 <= innerWidth ? rect.right + 12 : rect.left - width - 12 >= 12 ? rect.left - width - 12 : innerWidth - width - 16;
      const top = Math.max(92, Math.min(rect.bottom + 12, innerHeight - height - toolbarHeight - 32));
      setPosition({ left, top, maxHeight: Math.max(150, innerHeight - toolbarHeight - 130) });
    }
  }, [rect, computed.contrast]);
  useEffect(() => { panelRef.current?.querySelector('button')?.focus({ preventScroll: true }); return commit; }, []);
  const section = document.querySelector(selector(id))?.closest('[data-edit-section]')?.dataset.editSection;
  const card = document.querySelector(selector(id))?.parentElement?.closest('[data-edit-id]')?.dataset.editId;
  const parentCard = card && targets[card]?.kind === 'card' ? card : null;
  const labels = { color: 'Text color', backgroundColor: 'Background color', borderColor: 'Border color' };
  return <div ref={panelRef} className="p24-properties" role="region" aria-label="Element properties" style={position}>
    <div className="p24-panel-heading"><div><small>{target.kind} · local change</small><strong>{target.label}</strong></div><button className="p24-icon" aria-label="Close properties" onClick={onClose}>×</button></div>
    {target.properties.map(property => <label className="p24-color" key={property}><span>{labels[property]}<small>{design.overrides[id]?.[property] || computed[property]}</small></span><input aria-label={labels[property]} type="color" value={design.overrides[id]?.[property] || computed[property]} onFocus={commit} onPointerDown={commit} onInput={event => setColor(id, property, event.currentTarget.value)} onChange={event => setColor(id, property, event.currentTarget.value)} onBlur={commit} /></label>)}
    {computed.contrast < 4.5 && <p className="p24-warning" role="status">Low contrast ({computed.contrast.toFixed(2)}:1). Aim for 4.5:1 for readable text.</p>}
    <p className="p24-hint">Changes apply to this element{target.kind === 'section' || target.kind === 'card' ? ' and its contents' : ''}. Contrast on images is an estimate.</p>
    {section && <div className="p24-panel-actions">{parentCard && <button onClick={() => select(parentCard)}>Select card</button>}{id !== `${section}.section` && <button onClick={() => select(`${section}.section`)}>Select section</button>}<button onClick={() => setVisibility(section, false)}>Hide section</button></div>}
  </div>;
}

function ResetConfirmation({ onCancel, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); return () => ref.current?.close(); }, []);
  return <dialog ref={ref} data-editor-ui className="p24-reset" aria-labelledby="p24-reset-title" onCancel={event => { event.preventDefault(); onCancel(); }}><h2 id="p24-reset-title">Restore original design?</h2><p>This restores all colors and shows every section. You can undo this change.</p><div><button autoFocus onClick={onCancel}>Cancel</button><button className="p24-primary" onClick={onConfirm}>Restore original</button></div></dialog>;
}
