import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import './styles.css';
import { contact, packages as packageData, services as serviceData, projects as projectData, stages, translations, navigation, implementingCompanies, partners, news as newsData, videos as videoData, officialUrl } from './data';
import { PreviewHost, PreviewOverview, NavbarDesignSelector } from './preview/PreviewHost';
import { previewRoute } from './preview/themes';
import { EditorElement } from './editor/EditorElement';
import { EditorProvider, EditorToggle, useComparisonSplit } from './editor/EditorProvider';
import { edit, sectionEdit, semanticId } from './editor/editorConfig';
import { SelectedPortfolio } from './components/SelectedPortfolio';

const asset = path => window.__PROSPECT_ASSETS__?.[path] || path;
const img = name => asset(`/images/${name}.webp`);
const Arrow = ({ direction = 'up', ...props }) => <svg {...props} className={`arrow ${direction}`} width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2" /></svg>;
Arrow.editorIcon = true;
const Logo = ({ onClick, editId, label = 'Prospect24 home' }) => <a onClick={onClick} href="#home" className="logo" aria-label={label}><EditorElement as="img" {...(editId ? edit(editId) : {})} src={asset('/images/brand-wordmark.png')} alt="PROSPECT24" width="700" height="103" /></a>;
const Heading = ({ lines, hero, className = '', editId }) => { const Tag = hero ? 'h1' : 'h2'; return <EditorElement as={Tag} {...(editId ? edit(editId) : {})} className={`display ${hero ? 'hero-title' : ''} ${className}`}>{lines.map((line, i) => <span className="line-mask" key={i}><span style={{ '--line': i }}>{line}</span></span>)}</EditorElement>; };
const Label = ({ children, editId }) => <EditorElement as="p" {...(editId ? edit(editId) : {})} className="eyebrow">{children}</EditorElement>;
const Action = ({ children, onClick, href, filled, className = '', editId, ...rest }) => href ? <EditorElement as="a" {...(editId ? edit(editId) : {})} href={href} className={`action ${filled ? 'filled' : ''} ${className}`} {...rest}>{children}<Arrow /></EditorElement> : <EditorElement as="button" {...(editId ? edit(editId) : {})} onClick={onClick} className={`action ${filled ? 'filled' : ''} ${className}`} {...rest}>{children}<Arrow /></EditorElement>;

function App() {
  const [lang, setLang] = useState(() => new URLSearchParams(window.location.search).get('editorLanguage') === 'am' ? 'am' : 'en');
  const t = translations[lang];
  const localize = item => ({ ...item, ...(lang === 'am' ? item.hy : {}), editKey: semanticId(item.name || item.title || item.slug || item.id || '') });
  const packages = packageData.map(localize), services = serviceData.map(localize), projects = projectData.map(localize);
  const news = newsData.map(localize), videos = videoData.map(localize);
  const location = lang === 'am' ? contact.amLocation : contact.location;
  const date = value => { const [year, month, day] = value.split('-'); return `${Number(day)} ${t.months[Number(month) - 1]} ${year}`; };
  const price = p => <>{p.from && <small>{t.from} </small>}{p.price}<span> {t.currency}</span></>;
  const partnerGrid = all => <EditorElement as="div" {...(!all ? edit("partners.layout") : {})} className="network-grid">{(all ? partners : partners.slice(0, 12)).map(p => <div className="network-logo" key={p.name}><EditorElement as="img" {...(!all ? edit(`partners.logo.${semanticId(p.name)}`) : {})} loading="lazy" src={p.image} alt={p.name} width="150" height="90" /></div>)}</EditorElement>;
  const articleLink = item => officialUrl(item.slug, lang);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [closing, setClosing] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [split, setSplit] = useComparisonSplit();
  const [heroReady, setHeroReady] = useState(false);
  const [draft, setDraft] = useState(false);
  const heroRef = useRef(null), timelineRef = useRef(null), dialogRef = useRef(null), menuRef = useRef(null);
  const drag = useRef(false), touched = useRef(false), closeTimer = useRef(null);
  const navItems = navigation.map(item => ({ ...item, label: item[lang] }));
  const navItem = (item, mobile = false, i = 0, place = mobile ? 'mobile' : 'header') => item.href ? <EditorElement as="a" {...edit(`${place}.nav.${semanticId(item.en)}`)} key={item.en} href={item.href} style={mobile ? { '--i': i } : undefined} onClick={mobile ? e => { e.preventDefault(); closeMenu(item.href); } : undefined}>{item.label}{mobile && <Arrow />}</EditorElement> : <span key={item.en} className="nav-unavailable" aria-disabled="true" style={mobile ? { '--i': i } : undefined}>{item.label}</span>;

  // Clear settings from the retired design chooser, including already-open tabs.
  useLayoutEffect(() => {
    const root = document.documentElement;
    delete root.dataset.design;
    delete root.dataset.palette;
    ['ink', 'deep', 'paper', 'panel', 'stone', 'text-on-light', 'text-on-dark', 'accent-on-light', 'accent-on-dark', 'bronze', 'overlay-rgb'].forEach(key => root.style.removeProperty(`--${key}`));
    try {
      localStorage.removeItem('prospect24-design');
      localStorage.removeItem('prospect24-palette');
      const url = new URL(window.location.href);
      if (url.searchParams.has('design') || url.searchParams.has('palette')) {
        url.searchParams.delete('design');
        url.searchParams.delete('palette');
        history.replaceState(history.state, '', url);
      }
    } catch { /* The local presentation also works with storage disabled. */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'am' ? 'hy' : 'en';
  }, [lang]);
  useEffect(() => {
    const revealEditorLayer = event => {
      const id = event.detail;
      if (id.startsWith('development.')) {
        const index = serviceData.findIndex(item => id.includes(semanticId(item.title)));
        if (index >= 0) {
          setActiveService(index);
          if (id.endsWith('.image') || id.endsWith('.detail')) setExpanded(index);
        }
      }
    };
    window.addEventListener('p24-editor-reveal', revealEditorLayer);
    return () => window.removeEventListener('p24-editor-reveal', revealEditorLayer);
  }, []);
  useEffect(() => {
    let raf = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observe = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.dataset.revealed = 'true'; observe.unobserve(e.target); } }), { threshold: .1 });
    document.querySelectorAll('.reveal').forEach(el => observe.observe(el));
    const update = () => {
      setScrolled(window.scrollY > 80);
      if (!reduced && heroRef.current) heroRef.current.style.setProperty('--parallax', `${Math.min(window.scrollY * .18, 140)}px`);
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (innerHeight * .9 - rect.top) / (innerHeight * .65 + rect.height * .25)));
        timelineRef.current.style.setProperty('--progress', progress);
        timelineRef.current.querySelectorAll('.stage').forEach((el, i) => el.classList.toggle('active', progress >= i / 5));
      }
      raf = 0;
    };
    const scroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', scroll);
    const timer = setTimeout(() => setHeroReady(true), 70);
    return () => { observe.disconnect(); clearTimeout(timer); cancelAnimationFrame(raf); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); };
  }, []);
  useEffect(() => {
    if (menu) menuRef.current?.showModal();
    else if (menuRef.current?.open) menuRef.current.close();
  }, [menu]);
  useEffect(() => {
    if (modal) { dialogRef.current?.showModal(); if (dialogRef.current) dialogRef.current.scrollTop = 0; setDraft(false); }
    else if (dialogRef.current?.open) dialogRef.current.close();
  }, [modal]);
  useEffect(() => {
    document.body.style.overflow = menu || modal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menu, modal]);

  function openModal(value) { clearTimeout(closeTimer.current); setClosing(false); setModal(value); }
  function closeModal() { setClosing(true); clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => { setModal(null); setClosing(false); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 320); }
  function closeMenu(href) {
    menuRef.current?.classList.add('leaving');
    setTimeout(() => { setMenu(false); menuRef.current?.classList.remove('leaving'); if (href) document.querySelector(href)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }, 300);
  }
  function setPosition(event) {
    const rect = heroRef.current.getBoundingClientRect();
    setSplit(Math.max(4, Math.min(96, (event.clientX - rect.left) / rect.width * 100)));
  }
  function languageButtons() { return <div className="language" aria-label={t.language}><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button><span>/</span><button className={lang === 'am' ? 'active' : ''} onClick={() => setLang('am')} aria-pressed={lang === 'am'}>AM</button></div>; }

  return <>
    <a className="skip-link" href="#main">{t.skip}</a>
    <EditorElement as="header" {...edit("header.navigation")} className={`header ${scrolled ? 'scrolled' : ''}`}>
      <Logo editId="header.logo" label={t.logoHome} />
      <nav className="desktop-nav" aria-label={t.mainNav}>{navItems.map(item => navItem(item))}</nav>
      <div className="header-actions"><NavbarDesignSelector />{languageButtons()}<EditorToggle /><button className="menu-toggle" aria-label={t.openMenu} aria-expanded={menu} aria-controls="site-menu" onClick={() => setMenu(true)}><span /><span /></button></div>
    </EditorElement>

    <main id="main" tabIndex="-1" data-design-layout="atelier">
      <EditorElement as="section" {...sectionEdit("hero")} id="home" ref={heroRef} className={`hero ${heroReady ? 'ready' : ''}`} style={{ '--split': `${split}%` }} onPointerDown={e => { if (e.target.closest('a,button,[role="slider"],.hero-copy')) return; touched.current = true; setPosition(e); }}>
        <div className="hero-visual" aria-hidden="true"><EditorElement as="img" {...edit("hero.afterImage")} className="hero-after" src={img('hero-after')} alt="" fetchPriority="high" /><div className="hero-before"><EditorElement as="img" {...edit("hero.beforeImage")} src={img('hero-before')} alt="" fetchPriority="high" /></div></div>
        <EditorElement as="div" {...edit("hero.overlay")} className="hero-shade" />
        <EditorElement as="div" {...edit("hero.content")} className="hero-copy">
          <Heading hero editId="hero.heading" lines={t.hero} />
          <EditorElement as="p" {...edit("hero.tagline")} className="hero-tagline">{t.tagline}</EditorElement>
          <EditorElement as="p" {...edit("hero.description")} className="hero-description">{t.heroText}</EditorElement>
          <EditorElement as="div" {...edit("hero.buttons")} className="hero-buttons"><Action editId="hero.explore" filled href="#development">{t.explore}</Action><Action editId="hero.projects" href="#projects">{t.view}</Action></EditorElement>
        </EditorElement>
        <div className="compare-divider" style={{ left: `${split}%` }}>
          <div className="compare-handle" role="slider" tabIndex="0" aria-label={t.slider} aria-valuemin="4" aria-valuemax="96" aria-valuenow={Math.round(split)} aria-valuetext={`${Math.round(split)}% ${t.beforeValue}`} onPointerDown={e => { e.preventDefault(); touched.current = true; drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); }} onPointerMove={e => { if (drag.current) setPosition(e); }} onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }} onKeyDown={e => { const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (keys.includes(e.key)) { e.preventDefault(); touched.current = true; setSplit(v => e.key === 'Home' ? 4 : e.key === 'End' ? 96 : Math.max(4, Math.min(96, v + (e.key === 'ArrowRight' ? 2 : -2)))); } }}><span>‹</span><span>›</span></div>
        </div>
        <div className="hero-bottom"><EditorElement as="a" {...edit("hero.scroll")} href="#approach" className="scroll-hint"><span /> {t.scroll}</EditorElement></div>
      </EditorElement>

      <EditorElement as="section" {...sectionEdit("intro")} id="approach" className="intro section light">
        <Label editId="intro.label">01 <span>/</span> {t.approachLabel}</Label>
        <EditorElement as="div" {...edit("intro.layout")} className="intro-grid">
          <div className="reveal"><Heading editId="intro.heading" lines={t.intro} /><EditorElement as="a" {...edit("intro.learn")} className="text-link" href="#about">{t.learn}<Arrow /></EditorElement></div>
          <EditorElement as="div" {...edit("intro.composition")} className="intro-composition reveal" style={{ '--delay': '100ms' }}><EditorElement as="div" {...edit("intro.imageContainer")} className="intro-main image-clip"><EditorElement as="img" {...edit("intro.image")} loading="lazy" src={img('intro')} alt={t.introImage} /></EditorElement><EditorElement as="div" {...edit("intro.detailContainer")} className="intro-detail image-clip"><EditorElement as="img" {...edit("intro.detailImage")} loading="lazy" src={img('intro-detail')} alt={t.introDetailImage} /></EditorElement><EditorElement as="span" {...edit("intro.caption")} className="image-caption">{t.caption}</EditorElement></EditorElement>
          <div className="intro-text reveal" style={{ '--delay': '200ms' }}><EditorElement as="h3" {...edit("intro.subheading")}>{t.introSub}</EditorElement><EditorElement as="p" {...edit("intro.description")}>{t.introText}</EditorElement><span className="small-rule" /></div>
        </EditorElement>
      </EditorElement>

      <EditorElement as="section" {...sectionEdit("development")} id="development" className="development section dark">
        <EditorElement as="div" {...edit("development.layout")} className="development-grid"><div><div className="reveal"><Label editId="development.label">02 / {t.serviceLabel}</Label><Heading editId="development.heading" lines={t.development} /><EditorElement as="p" {...edit("development.description")} className="section-subtitle">{t.devSub}</EditorElement></div>
          <EditorElement as="div" {...edit("development.list")} className="service-list">{services.map((service, i) => <EditorElement as="div" {...edit(`development.card.${service.editKey}`)} key={service.title} className={`service reveal ${activeService === i ? 'selected' : ''} ${expanded === i ? 'expanded' : ''}`} style={{ '--delay': `${i * 70}ms` }} onMouseEnter={() => setActiveService(i)}>
            <EditorElement as="button" {...edit(`development.card.${service.editKey}.button`)} className="service-trigger" aria-expanded={expanded === i} aria-controls={`service-${i}`} onFocus={() => setActiveService(i)} onClick={() => { setActiveService(i); setExpanded(expanded === i ? null : i); }}><span className="service-number">0{i + 1}</span><span className="service-heading"><EditorElement as="strong" {...edit(`development.card.${service.editKey}.heading`)}>{lang === 'am' ? service.am : service.title}</EditorElement><EditorElement as="span" {...edit(`development.card.${service.editKey}.description`)}>{service.description}</EditorElement></span><Arrow direction="right" /><span className="accordion-mark">{expanded === i ? '−' : '+'}</span></EditorElement>
            <div className="service-expansion" id={`service-${i}`} aria-hidden={expanded !== i} inert={expanded !== i ? true : undefined}><div><EditorElement as="p" {...edit(`development.card.${service.editKey}.detail`)}>{service.detail}</EditorElement><EditorElement as="img" {...edit(`development.card.${service.editKey}.image`)} loading="lazy" src={img(service.image)} alt={service.imageLabel} /></div></div>
          </EditorElement>)}</EditorElement>
        </div><EditorElement as="div" {...edit("development.visual")} className="service-visual reveal"><div className="service-visual-label"><span>{lang === 'am' ? services[activeService].am : services[activeService].title}</span><span>0{activeService + 1} / 04</span></div>{services.map((s, i) => <EditorElement as="img" {...edit(`development.image.${s.editKey}`)} loading="lazy" key={s.image} className={activeService === i ? 'active' : ''} src={img(s.image)} alt={activeService === i ? s.imageLabel : ''} />)}<span className="service-caption">{t.serviceCaption}</span></EditorElement></EditorElement>
      </EditorElement>

      <EditorElement as="section" {...sectionEdit("packages")} id="packages" className="packages section light">
        <div className="section-top reveal"><div><Label editId="packages.label">03 / {t.packageLabel}</Label><Heading editId="packages.heading" lines={t.packages} /></div><Action editId="packages.compare" className="dark-button" onClick={() => openModal({ type: 'compare' })}>{t.compare}</Action></div>
        <EditorElement as="div" {...edit("packages.layout")} className="package-grid">{packages.map((p, i) => <EditorElement as="article" {...edit(`packages.card.${p.editKey}`)} className={`package-card ${p.tone} reveal`} key={p.name} style={{ '--delay': `${i * 100}ms` }}>
          {<EditorElement as="img" {...edit(`packages.card.${p.editKey}.image`)} className="package-photo" loading="lazy" src={img(p.image)} alt="" />}
          <div className="package-content"><span className="package-index">0{i + 1} /</span><EditorElement as="h3" {...edit(`packages.card.${p.editKey}.heading`)}>{lang === 'am' ? p.am : p.name}</EditorElement><EditorElement as="p" {...edit(`packages.card.${p.editKey}.description`)}>{p.description}</EditorElement><ul>{p.items.map(item => <li key={item}><span>↗</span>{item}</li>)}</ul><EditorElement as="p" {...edit(`packages.card.${p.editKey}.inheritance`)} className="package-inheritance">{p.inheritance}</EditorElement><EditorElement as="div" {...edit(`packages.card.${p.editKey}.price`)} className="package-price">{price(p)}<p>{t.area}</p><p className="area-caption">{t.referenceArea}</p></EditorElement><Action editId={`packages.card.${p.editKey}.button`} onClick={() => openModal({ type: 'package', index: i })}>{t.package}</Action></div>
        </EditorElement>)}</EditorElement><EditorElement as="p" {...edit("packages.note")} className="pricing-note">{t.pricingNote}</EditorElement>
      </EditorElement>

      <SelectedPortfolio projects={projects} t={t} lang={lang} img={img} onOpen={index => openModal({ type: 'project', index })} />

      <EditorElement as="section" {...sectionEdit("process")} id="process" className="process section light" ref={timelineRef}>
        <div className="reveal"><Label editId="process.label">05 / {t.processLabel}</Label><Heading editId="process.heading" lines={t.process} /></div>
        <EditorElement as="p" {...edit("process.note")} className="process-note">{t.processNote}</EditorElement><EditorElement as="div" {...edit("process.layout")} className="timeline"><div className="timeline-track"><span /></div>{stages.map(([title, text, amTitle, amText], i) => <EditorElement as="div" {...edit(`process.card.${semanticId(title)}`)} className="stage" key={title}><span className="stage-dot" /><div className="stage-content"><span className="stage-number">0{i + 1}</span><div><EditorElement as="h3" {...edit(`process.card.${semanticId(title)}.heading`)}>{lang === 'am' ? amTitle : title}</EditorElement><EditorElement as="p" {...edit(`process.card.${semanticId(title)}.description`)}>{lang === 'am' ? amText : text}</EditorElement></div></div></EditorElement>)}</EditorElement>
      </EditorElement>

      <EditorElement as="section" {...sectionEdit("expertise")} id="about" className="expertise section light">
        <EditorElement as="div" {...edit("expertise.layout")} className="expertise-grid"><div><div className="reveal"><Label editId="expertise.label">06 / {t.expertiseLabel}</Label><Heading editId="expertise.heading" lines={t.expertise} /><EditorElement as="p" {...edit("expertise.description")} className="expertise-description">{t.expertiseText}</EditorElement></div><div className="partners">{implementingCompanies.map(localize).map((company, i) => <EditorElement as="div" {...edit(`expertise.card.${company.editKey}`)} className="partner reveal" key={company.name} style={{ '--delay': `${i * 100}ms` }}><EditorElement as="h3" {...edit(`expertise.card.${company.editKey}.heading`)} className={`partner-name partner-${i}`}>{company.name}</EditorElement><EditorElement as="p" {...edit(`expertise.card.${company.editKey}.role`)} className="company-role">{company.role}</EditorElement><EditorElement as="p" {...edit(`expertise.card.${company.editKey}.description`)}>{company.description}</EditorElement></EditorElement>)}</div></div>
        <figure className="partnership-photo reveal"><EditorElement as="div" {...edit("expertise.imageContainer")} className="image-clip"><EditorElement as="img" {...edit("expertise.image")} loading="lazy" src={news[0].image} alt={news[0].organization} /></EditorElement><figcaption><span className="evidence-date">{t.signed} <time dateTime={news[0].signed}>{date(news[0].signed)}</time></span><EditorElement as="h3" {...edit("expertise.evidence.heading")}>{news[0].title}</EditorElement><EditorElement as="p" {...edit("expertise.evidence.description")}>{news[0].description}</EditorElement><span className="evidence-date">{t.published} <time dateTime={news[0].published}>{date(news[0].published)}</time></span><EditorElement as="a" {...edit("expertise.article")} className="text-link" href={articleLink(news[0])} target="_blank" rel="noopener noreferrer">{t.article}<Arrow /></EditorElement></figcaption></figure></EditorElement>
        <EditorElement as="div" {...sectionEdit("partners")} id="partners" className="partner-network reveal"><div className="network-top"><div><EditorElement as="h3" {...edit("partners.heading")}>{t.network}</EditorElement><EditorElement as="p" {...edit("partners.description")}>{t.networkText}</EditorElement></div><Action editId="partners.all" onClick={() => openModal({ type: 'partners' })}>{t.allPartners}</Action></div>{partnerGrid(false)}</EditorElement>
      </EditorElement>

      <EditorElement as="section" {...sectionEdit("news")} id="news" className="news section light">
        <div className="section-top reveal"><div><Label editId="news.label">07 / {t.newsLabel}</Label><Heading editId="news.heading" lines={t.newsTitle} /></div><EditorElement as="p" {...edit("news.description")} className="section-side-note">{t.newsIntro}</EditorElement></div>
        <EditorElement as="div" {...edit("news.layout")} className="news-media-grid"><div className="news-list">{news.slice(1).reverse().map(item => <EditorElement as="article" {...edit(`news.card.${item.slug}`)} className="news-item reveal" key={item.slug}><EditorElement as="img" {...edit(`news.card.${item.slug}.image`)} loading="lazy" src={item.image} alt={item.organization} width="160" height="120" /><div><p className="evidence-date">{t.signed} <time dateTime={item.signed}>{date(item.signed)}</time></p><EditorElement as="h3" {...edit(`news.card.${item.slug}.heading`)}>{item.title}</EditorElement><EditorElement as="p" {...edit(`news.card.${item.slug}.description`)}>{item.description}</EditorElement><p className="evidence-date">{t.published} <time dateTime={item.published}>{date(item.published)}</time></p><EditorElement as="a" {...edit(`news.card.${item.slug}.button`)} className="text-link" href={articleLink(item)} target="_blank" rel="noopener noreferrer">{t.article}<Arrow /></EditorElement></div></EditorElement>)}</div>
          <aside className="media-list reveal"><EditorElement as="h3" {...edit("news.media.heading")}>{t.mediaTitle}</EditorElement><EditorElement as="p" {...edit("news.media.description")}>{t.mediaLanguage}</EditorElement>{videos.map(video => <EditorElement as="a" {...edit(`news.video.${video.id}`)} key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer"><span className="video-play" aria-hidden="true">▷</span><span><small>DIGNISI NEWS</small><EditorElement as="strong" {...edit(`news.video.${video.id}.heading`)}>{video.title}</EditorElement><span>{t.watch} ↗</span></span></EditorElement>)}</aside>
        </EditorElement>
      </EditorElement>

      <EditorElement as="section" {...sectionEdit("cta")} id="conversation" className="final-cta light">
        <EditorElement as="div" {...edit("cta.content")} className="cta-content section">
          <div className="cta-heading reveal"><Label editId="cta.label">08 / {t.nextLabel}</Label><Heading editId="cta.heading" lines={t.cta} /></div>
          <div className="cta-bottom reveal"><EditorElement as="p" {...edit("cta.description")}>{t.ctaText}</EditorElement><Action editId="cta.discuss" filled onClick={() => openModal({ type: 'contact' })}>{t.discuss}</Action><EditorElement as="a" {...edit("cta.email")} className="cta-email" href={`mailto:${contact.email}`}>{contact.email}<Arrow /></EditorElement></div>
        </EditorElement>
      </EditorElement>
    </main>

    <EditorElement as="footer" {...sectionEdit("footer")} id="contact" className="footer dark"><EditorElement as="div" {...edit("footer.layout")} className="footer-top section"><div className="footer-brand reveal"><Logo editId="footer.logo" label={t.logoHome} /><EditorElement as="p" {...edit("footer.tagline")}>{t.tagline}</EditorElement></div><nav className="footer-nav reveal" aria-label={t.footerNav}><EditorElement as="span" {...edit("footer.explore")} className="footer-label">{t.exploreFooter}</EditorElement>{navItems.map(item => navItem(item, false, 0, 'footer'))}</nav><div className="footer-contact reveal"><EditorElement as="span" {...edit("footer.conversation")} className="footer-label">{t.conversation}</EditorElement><EditorElement as="a" {...edit("footer.phone")} href={`tel:${contact.phoneHref}`}>{contact.phone}</EditorElement><EditorElement as="a" {...edit("footer.email")} href={`mailto:${contact.email}`}>{contact.email}<Arrow /></EditorElement><EditorElement as="p" {...edit("footer.location")}>{location}</EditorElement></div><EditorElement as="button" {...edit("footer.top")} className="back-top" aria-label={t.backTop} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Arrow /></EditorElement></EditorElement><EditorElement as="div" {...edit("footer.wordmark")} className="footer-wordmark reveal" aria-hidden="true"><svg viewBox="0 -24 1440 256" fill="currentColor"><text x="20" y="175" fontSize="185" textLength="1400" lengthAdjust="spacingAndGlyphs">PROSPECT24</text></svg></EditorElement><div className="footer-legal"><EditorElement as="span" {...edit("footer.copyright")}>© {new Date().getFullYear()} Prospect24</EditorElement><EditorElement as="span" {...edit("footer.note")}>{t.prototype}</EditorElement><div><EditorElement as="button" {...edit("footer.privacy")} onClick={() => openModal({ type: 'privacy' })}>{t.privacy}</EditorElement><EditorElement as="button" {...edit("footer.terms")} onClick={() => openModal({ type: 'terms' })}>{t.terms}</EditorElement></div></div></EditorElement>

    <dialog id="site-menu" ref={menuRef} className="mobile-menu" aria-label={t.siteNav} onCancel={e => { e.preventDefault(); closeMenu(); }}><div className="menu-header"><Logo editId="mobile.logo" label={t.logoHome} onClick={e => { e.preventDefault(); closeMenu('#home'); }} /><button className="close-button" aria-label={t.closeMenu} onClick={() => closeMenu()}>×</button></div><nav aria-label={t.siteNav}>{navItems.map((item, i) => navItem(item, true, i))}</nav><div className="menu-bottom">{languageButtons()}<a href={`tel:${contact.phoneHref}`}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><p>{location}</p></div></dialog>

    <dialog ref={dialogRef} className={['modal', closing ? 'closing' : '', ['compare', 'partners'].includes(modal?.type) ? 'wide-modal' : ''].join(' ')} onCancel={e => { e.preventDefault(); closeModal(); }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }} aria-labelledby="modal-title"><div className="modal-shell"><button className="close-button" autoFocus aria-label={t.closeDialog} onClick={closeModal}>×</button>
      {modal?.type === 'package' && (() => { const p = packages[modal.index]; return <><div className="modal-image"><img src={img(p.image)} alt="" /></div><div className="modal-body"><Label>{t.packageLabel} / 0{modal.index + 1}</Label><h2 id="modal-title" className="display">{lang === 'am' ? p.am : p.name}</h2><p>{p.detail}</p><p className="scope-inheritance">{p.inheritance}{modal.index > 0 && <>. {t.inherited}</>}</p><h3 className="scope-heading">{t.scopeTitle}</h3><div className="scope-groups">{p.scope.map(localize).map(group => <section key={group.title}><h4>{group.title}</h4><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}</div><div className="modal-price">{price(p)}<span>{p.from ? t.startingPrice : t.fixedPrice} · {t.area}</span></div><p className="pricing-note">{t.pricingNote}</p><div className="modal-actions"><Action filled onClick={() => openModal({ type: 'contact', packageIndex: modal.index })}>{t.discuss}</Action><a className="text-link" href={officialUrl('investment-packages', lang)} target="_blank" rel="noopener noreferrer">{t.sourceScope}<Arrow /></a></div></div></>; })()}
      {modal?.type === 'compare' && <div className="modal-body"><Label>{t.packageLabel}</Label><h2 id="modal-title" className="display">{t.compareTitle}</h2><p>{t.compareIntro}</p><div className="comparison-grid">{packages.map((p, i) => <div className="comparison-column" key={p.name}><span className="eyebrow">0{i + 1}</span><h3>{lang === 'am' ? p.am : p.name}</h3><p>{p.description}</p><p className="scope-inheritance">{p.inheritance}</p><ul>{p.comparison.map(item => <li key={item}>{item}</li>)}</ul><strong>{price(p)}</strong><small>{p.from ? t.startingPrice : t.fixedPrice} · {t.area}</small><Action onClick={() => openModal({ type: 'package', index: i })}>{t.viewDetails}</Action></div>)}</div><p className="pricing-note">{t.pricingNote}</p></div>}
      {modal?.type === 'project' && (() => { const p = projects[modal.index]; return <><div className="modal-image project-modal-image"><img src={img(p.image)} alt={p.name} /></div><div className="modal-body"><Label>{p.category}</Label><h2 id="modal-title" className="display">{p.name}</h2><p>{p.description}</p><p className="muted">{t.projectLimit}</p><div className="modal-actions"><Action filled onClick={() => openModal({ type: 'contact', interest: p.name })}>{t.similar}</Action><a className="text-link" href={officialUrl('projects', lang)} target="_blank" rel="noopener noreferrer">{t.sourceProject}<Arrow /></a></div></div></>; })()}
      {modal?.type === 'partners' && <div className="modal-body"><Label>{t.network}</Label><h2 id="modal-title" className="display">{t.network}</h2><p>{t.networkText}</p>{partnerGrid(true)}<p className="muted">{t.networkNote}</p></div>}
      {modal?.type === 'contact' && <div className="modal-body contact-body"><Label>{t.nextLabel}</Label><h2 id="modal-title" className="display">{t.contact}</h2><p>{t.contactIntro}</p><form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const body = [t.name + ': ' + form.get('name'), t.emailLabel + ': ' + form.get('email'), t.phoneLabel + ': ' + form.get('phone'), t.packageSelect + ': ' + form.get('package'), '', form.get('message')].join('\n'); window.location.href = 'mailto:' + contact.email + '?subject=' + encodeURIComponent(modal.interest || 'Project enquiry — Prospect24') + '&body=' + encodeURIComponent(body); setDraft(true); }}><label>{t.packageSelect}<select name="package" defaultValue={modal.packageIndex === undefined ? '' : packageData[modal.packageIndex].name}><option value="">{t.undecided}</option>{packages.map(p => <option key={p.name} value={p.name}>{lang === 'am' ? p.am : p.name}</option>)}</select></label><div className="form-row"><label>{t.name}<input name="name" autoComplete="name" required /></label><label>{t.phoneLabel}<input name="phone" type="tel" autoComplete="tel" /></label></div><label>{t.emailLabel}<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label><label>{t.message}<textarea name="message" rows="3" placeholder={t.messagePlaceholder} defaultValue={modal.interest || ''} required /></label><button className="action filled" type="submit">{t.prepareEmail}<Arrow /></button><p className="form-note" role="status">{draft ? t.draftReady : t.draftNote}</p></form><div className="contact-direct"><a href={'tel:' + contact.phoneHref}>{contact.phone}</a><a href={'mailto:' + contact.email}>{contact.email}</a><span>{location}</span></div></div>}
      {(modal?.type === 'privacy' || modal?.type === 'terms') && <div className="modal-body legal-body"><Label>{t.legalLabel}</Label><h2 id="modal-title" className="display">{modal.type === 'privacy' ? t.privacy : t.terms}</h2>{(modal.type === 'privacy' ? t.privacyCopy : t.termsCopy).map(copy => <p key={copy}>{copy}</p>)}<a className="text-link" href={'mailto:' + contact.email}>{contact.email}<Arrow /></a></div>}
    </div></dialog>
  </>;
}

const preview = previewRoute();
createRoot(document.getElementById('root')).render(preview === 'overview' ? <PreviewOverview /> : <PreviewHost theme={preview}><EditorProvider><App /></EditorProvider></PreviewHost>);

import './presentation.css';
import './editor/editor.css';
