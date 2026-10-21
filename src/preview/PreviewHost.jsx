import { useUi, useLanguage } from '../localization';
import { translations } from '../data';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { previewThemes, themeTokens, previewHref } from './themes';
import './preview.css';
import './navbar-design.css';

const asset = path => window.__PROSPECT_ASSETS__?.[path] || path;

const DesignContext = createContext(null);

export function NavbarDesignSelector() {
  const t = useUi();
  const { theme, selectTheme } = useContext(DesignContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const button = useRef(null);
  useEffect(() => {
    const outside = event => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape' && open) { setOpen(false); button.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={ref} className="navbar-design" data-open={open}>
    <span className="navbar-design-label" id="navbar-design-label">{t("Design")}</span>
    <button ref={button} className="navbar-design-toggle" aria-expanded={open} aria-controls="navbar-design-options" aria-label={[t('Choose design'), theme ? `${t('current')} ${theme.id} ${t(theme.name)}` : t('original')].join(', ')} onClick={() => setOpen(!open)}><span>{t("Design")} {theme?.id || '—'}</span><span aria-hidden="true">{open ? '−' : '+'}</span></button>
    <div id="navbar-design-options" className="navbar-design-options" role="group" aria-labelledby="navbar-design-label">{previewThemes.map(item => <button key={item.id} type="button" onClick={() => { selectTheme(item); setOpen(false); if (matchMedia('(max-width: 767px)').matches) button.current?.focus(); }} aria-pressed={item.id === theme?.id} aria-label={`${item.id} — ${t(item.name)}`} title={t(item.name)}><span>{item.id}</span><span className="navbar-design-name">{t(item.name)}</span><span className="navbar-design-swatch" aria-hidden="true" style={{ background: item.colors.dark }} /></button>)}</div>
    <span className="sr-only" role="status">{theme ? `${t("Design")} ${theme.id}: ${t(theme.name)}` : t('Original homepage colors')}</span>
  </div>;
}

export function PreviewHost({ theme, children }) {
  const { lang } = useLanguage();
  const t = useUi();
  const [active, setActive] = useState(() => {
    const requested = new URL(location.href).searchParams.get('theme');
    return theme || previewThemes.find(item => item.id === requested) || null;
  });
  function selectTheme(next) {
    setActive(next);
    const url = new URL(location.href);
    if (/^\/design-preview\/0[1-6]\/?$/.test(url.pathname)) url.pathname = previewHref(next.id);
    else url.searchParams.set('theme', next.id);
    history.replaceState(history.state, '', url);
  }
  useEffect(() => { document.title = active ? `Prospect24 — ${active.id} ${t(active.name)}` : translations[lang].documentTitle; }, [active, lang]);
  return <DesignContext.Provider value={{ theme: active, selectTheme }}><div className="preview-theme-shell" data-preview-theme={active?.slug} data-preview-id={active?.id} style={active ? themeTokens(active) : undefined}>{children}</div></DesignContext.Provider>;
}

export function PreviewOverview() {
  const t = useUi();
  const { lang, setLang } = useLanguage();
  useEffect(() => { document.title = `Prospect24 — ${t('Color system exploration')}`; document.querySelector('meta[name=description]')?.setAttribute('content', translations[lang].metaDescription); }, [lang]);
  return <main className="preview-overview">
    <header><div className="language" aria-label={translations[lang].language}><button aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button><span>/</span><button aria-pressed={lang === "am"} onClick={() => setLang("am")}>AM</button></div><a href="/" aria-label={t("Original Prospect24 homepage")}><img src={asset('/images/brand-wordmark.png')} width="700" height="103" alt="PROSPECT24" /></a><a href="/">{t("View original homepage ↗")}</a></header>
    <div className="preview-overview-intro"><p>{t("Client presentation / Color system exploration")}</p><h1>{t("Six palettes.")}<br /><em>{t("One architectural language.")}</em></h1><p>{t("The same homepage, content and interactions. Explore six coordinated color systems, from neutral graphite to a controlled terracotta accent.")}</p></div>
    <div className="preview-overview-grid">{previewThemes.map(theme => <a className="preview-overview-card" data-color-theme={theme.slug} key={theme.id} href={`${previewHref(theme.id)}${lang === "am" ? "?editorLanguage=am" : ""}`} style={themeTokens(theme)}>
      <div className="preview-overview-card-title"><span>{theme.id}</span><div><h2>{t(theme.name)}</h2><p>{t(theme.description)}</p></div><span aria-hidden="true">↗</span></div>
      <div className="preview-mini-home" aria-hidden="true"><div className="preview-mini-header">PROSPECT24 <span>{t("Architecture / Strategy / Real estate")}</span></div><div className="preview-mini-hero"><img src={asset('/images/hero-after.webp')} alt="" /><div><strong>{t("BUILD WITH")}<br />{t("VISION.")}<br />{t("INVEST WITH")}<br />{t("CLARITY.")}</strong><span className="preview-mini-button">{t("Explore our expertise ↗")}</span></div></div><div className="preview-mini-light"><span>{t("ONE VISION.")}<br />{t("MULTIPLE DISCIPLINES.")}</span><span>{t("Architecture, strategy and real estate — connected.")}</span></div><div className="preview-mini-dark">{t("DEVELOPMENT,")}<br />{t("FROM EVERY ANGLE.")}</div></div>
      <div className="preview-overview-swatches">{theme.palette.map(color => <span key={color}><i style={{ backgroundColor: color }} /><small>{color}</small></span>)}<strong>{t("Open design")} {theme.id} ↗</strong></div>
    </a>)}</div>
    <footer>{t("Prospect24 · Private design presentation ·")}<a href="/">{t("Original homepage")}</a></footer>
  </main>;
}
