import React, { useEffect, useRef, useState } from 'react';
import { previewThemes, themeTokens, previewHref } from './themes';
import './preview.css';

const asset = path => window.__PROSPECT_ASSETS__?.[path] || path;

function DesignSelector({ theme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const button = useRef(null);
  useEffect(() => {
    const outside = event => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape' && open) { setOpen(false); button.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <aside ref={ref} className="preview-selector" data-open={open} aria-label="Client color design selector">
    <span className="preview-selector-label">Design</span>
    <button ref={button} className="preview-selector-toggle" aria-expanded={open} aria-controls="preview-design-links" onClick={() => setOpen(!open)}><span>Design {theme.id} / 06</span><span>{theme.name}</span><span aria-hidden="true">{open ? '−' : '+'}</span></button>
    <nav id="preview-design-links" aria-label="Color variants">{previewThemes.map(item => <a key={item.id} href={previewHref(item.id)} aria-current={item.id === theme.id ? 'page' : undefined} aria-label={`${item.id} — ${item.name}`} title={item.name}><span>{item.id}</span><span className="preview-selector-theme-name">{item.name}</span></a>)}</nav>
    <a className="preview-selector-all" href="/design-preview">All designs ↗</a>
  </aside>;
}

export function PreviewHost({ theme, children }) {
  useEffect(() => { document.title = `Prospect24 — ${theme.id} ${theme.name}`; }, [theme]);
  return <div className="preview-theme-shell" data-preview-theme={theme.slug} data-preview-id={theme.id} style={themeTokens(theme)}><DesignSelector theme={theme} />{children}</div>;
}

export function PreviewOverview() {
  useEffect(() => { document.title = 'Prospect24 — Color system exploration'; }, []);
  return <main className="preview-overview">
    <header><a href="/" aria-label="Original Prospect24 homepage"><img src={asset('/images/brand-wordmark.png')} width="700" height="103" alt="PROSPECT24" /></a><a href="/">View original homepage ↗</a></header>
    <div className="preview-overview-intro"><p>Client presentation / Color system exploration</p><h1>Six palettes.<br /><em>One architectural language.</em></h1><p>The same homepage, content and interactions. Explore six coordinated color systems, from neutral graphite to a controlled terracotta accent.</p></div>
    <div className="preview-overview-grid">{previewThemes.map(theme => <a className="preview-overview-card" data-color-theme={theme.slug} key={theme.id} href={previewHref(theme.id)} style={themeTokens(theme)}>
      <div className="preview-overview-card-title"><span>{theme.id}</span><div><h2>{theme.name}</h2><p>{theme.description}</p></div><span aria-hidden="true">↗</span></div>
      <div className="preview-mini-home" aria-hidden="true"><div className="preview-mini-header">PROSPECT24 <span>Architecture / Strategy / Real estate</span></div><div className="preview-mini-hero"><img src={asset('/images/hero-after.webp')} alt="" /><div><strong>BUILD WITH<br />VISION.<br />INVEST WITH<br />CLARITY.</strong><span className="preview-mini-button">Explore our expertise ↗</span></div></div><div className="preview-mini-light"><span>ONE VISION.<br />MULTIPLE DISCIPLINES.</span><span>Architecture, strategy and real estate — connected.</span></div><div className="preview-mini-dark">DEVELOPMENT,<br />FROM EVERY ANGLE.</div></div>
      <div className="preview-overview-swatches">{theme.palette.map(color => <span key={color}><i style={{ backgroundColor: color }} /><small>{color}</small></span>)}<strong>Open design {theme.id} ↗</strong></div>
    </a>)}</div>
    <footer>Prospect24 · Private design presentation · <a href="/">Original homepage</a></footer>
  </main>;
}
