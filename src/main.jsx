import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import './styles.css';
import { contact, packages, services, projects, stages, translations } from './data';

const asset = path => window.__PROSPECT_ASSETS__?.[path] || path;
const img = name => asset(`/images/${name}.webp`);
const Arrow = ({ direction = 'up', ...props }) => <svg {...props} className={`arrow ${direction}`} width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2" /></svg>;
const Logo = ({ onClick }) => <a onClick={onClick} href="#home" className="logo" aria-label="Prospect24 home"><img src={asset('/images/brand-wordmark.png')} alt="PROSPECT24" width="700" height="103" /></a>;
const Heading = ({ lines, hero, className = '' }) => { const Tag = hero ? 'h1' : 'h2'; return <Tag className={`display ${hero ? 'hero-title' : ''} ${className}`}>{lines.map((line, i) => <span className="line-mask" key={i}><span style={{ '--line': i }}>{line}</span></span>)}</Tag>; };
const Label = ({ children }) => <p className="eyebrow">{children}</p>;
const Action = ({ children, onClick, href, filled, className = '', ...rest }) => href ? <a href={href} className={`action ${filled ? 'filled' : ''} ${className}`} {...rest}>{children}<Arrow /></a> : <button onClick={onClick} className={`action ${filled ? 'filled' : ''} ${className}`} {...rest}>{children}<Arrow /></button>;

function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [closing, setClosing] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [project, setProject] = useState(0);
  const [split, setSplit] = useState(50);
  const [heroReady, setHeroReady] = useState(false);
  const [draft, setDraft] = useState(false);
  const heroRef = useRef(null), timelineRef = useRef(null), dialogRef = useRef(null), menuRef = useRef(null);
  const drag = useRef(false), touched = useRef(false), swipeStart = useRef(null), closeTimer = useRef(null);
  const links = ['#development', '#packages', '#projects', '#about', '#contact'];

  useEffect(() => {
    document.documentElement.lang = lang === 'am' ? 'hy' : 'en';
  }, [lang]);
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
  function changeProject(delta) { setProject(p => (p + delta + projects.length) % projects.length); }
  function languageButtons() { return <div className="language" aria-label="Language"><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button><span>/</span><button className={lang === 'am' ? 'active' : ''} onClick={() => setLang('am')} aria-pressed={lang === 'am'}>AM</button></div>; }
  const current = projects[project];

  return <>
    <a className="skip-link" href="#approach">Skip to content</a>
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <Logo />
      <nav className="desktop-nav" aria-label="Main navigation">{t.nav.slice(0, 4).map((name, i) => <a key={i} href={links[i]}>{name}</a>)}</nav>
      <div className="header-actions">{languageButtons()}<Action className="header-talk" onClick={() => openModal({ type: 'contact' })}>{t.talk}</Action><button className="menu-toggle" aria-label="Open navigation menu" aria-expanded={menu} onClick={() => setMenu(true)}><span /><span /></button></div>
    </header>

    <main>
      <section id="home" ref={heroRef} className={`hero ${heroReady ? 'ready' : ''}`} style={{ '--split': `${split}%` }} onPointerDown={e => { if (e.target.closest('a,button,[role="slider"],.hero-copy')) return; touched.current = true; setPosition(e); }}>
        <div className="hero-visual" aria-hidden="true"><img className="hero-after" src={img('hero-after')} alt="" fetchPriority="high" /><div className="hero-before"><img src={img('hero-before')} alt="" fetchPriority="high" /></div></div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <Heading hero lines={t.hero} />
          <p className="hero-tagline">{t.tagline}</p>
          <p className="hero-description">{t.heroText}</p>
          <div className="hero-buttons"><Action filled href="#development">{t.explore}</Action><Action href="#projects">{t.view}</Action></div>
        </div>
        <div className="compare-divider" style={{ left: `${split}%` }}>
          <div className="compare-handle" role="slider" tabIndex="0" aria-label="Before and after development comparison" aria-valuemin="4" aria-valuemax="96" aria-valuenow={Math.round(split)} aria-valuetext={`${Math.round(split)}% before development`} onPointerDown={e => { e.preventDefault(); touched.current = true; drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); }} onPointerMove={e => { if (drag.current) setPosition(e); }} onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }} onKeyDown={e => { const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (keys.includes(e.key)) { e.preventDefault(); touched.current = true; setSplit(v => e.key === 'Home' ? 4 : e.key === 'End' ? 96 : Math.max(4, Math.min(96, v + (e.key === 'ArrowRight' ? 2 : -2)))); } }}><span>‹</span><span>›</span></div>
        </div>
        <div className="comparison-labels"><span>{t.before}</span><span>{t.after}</span></div>
        <div className="hero-bottom"><a href="#approach" className="scroll-hint"><span /> Scroll to discover</a><span>From possibility to perspective</span><span className="visual-note">Illustrative development vision</span></div>
      </section>

      <section id="approach" className="intro section light">
        <Label>01 <span>/</span> Our Approach</Label>
        <div className="intro-grid">
          <div className="reveal"><Heading lines={t.intro} /><a className="text-link" href="#about">{t.learn}<Arrow /></a></div>
          <div className="intro-composition reveal" style={{ '--delay': '100ms' }}><div className="intro-main image-clip"><img loading="lazy" src={img('intro')} alt="Sculptural contemporary architecture among trees" /></div><div className="intro-detail image-clip"><img loading="lazy" src={img('intro-detail')} alt="Architectural facade and urban streetscape" /></div><span className="image-caption">A considered perspective.</span></div>
          <div className="intro-text reveal" style={{ '--delay': '200ms' }}><h3>{t.introSub}</h3><p>{t.introText}</p><span className="small-rule" /></div>
        </div>
      </section>

      <section id="development" className="development section dark">
        <div className="development-grid"><div><div className="reveal"><Label>02 / End-to-end Development</Label><Heading lines={t.development} /><p className="section-subtitle">{t.devSub}</p></div>
          <div className="service-list">{services.map((service, i) => <div key={service.title} className={`service reveal ${activeService === i ? 'selected' : ''} ${expanded === i ? 'expanded' : ''}`} style={{ '--delay': `${i * 70}ms` }} onMouseEnter={() => setActiveService(i)}>
            <button className="service-trigger" aria-expanded={expanded === i} aria-controls={`service-${i}`} onFocus={() => setActiveService(i)} onClick={() => { setActiveService(i); setExpanded(expanded === i ? null : i); }}><span className="service-number">0{i + 1}</span><span className="service-heading"><strong>{lang === 'am' ? service.am : service.title}</strong><span>{service.description}</span></span><Arrow direction="right" /><span className="accordion-mark">{expanded === i ? '−' : '+'}</span></button>
            <div className="service-expansion" id={`service-${i}`} inert={expanded !== i ? true : undefined}><div><p>{service.detail}</p><img loading="lazy" src={img(service.image)} alt={service.imageLabel} /></div></div>
          </div>)}</div>
        </div><div className="service-visual reveal"><div className="service-visual-label"><span>{services[activeService].title}</span><span>0{activeService + 1} / 04</span></div>{services.map((s, i) => <img loading="lazy" key={s.image} className={activeService === i ? 'active' : ''} src={img(s.image)} alt={activeService === i ? s.imageLabel : ''} />)}<span className="service-caption">Intelligence. Architecture. Strategy.</span></div></div>
      </section>

      <section id="packages" className="packages section light">
        <div className="section-top reveal"><div><Label>03 / Development Packages</Label><Heading lines={t.packages} /></div><Action className="dark-button" onClick={() => openModal({ type: 'compare' })}>{t.compare}</Action></div>
        <div className="package-grid">{packages.map((p, i) => <article className={`package-card ${p.tone} reveal`} key={p.name} style={{ '--delay': `${i * 100}ms` }}>
          {<img className="package-photo" loading="lazy" src={img(p.image)} alt="Contemporary residential development" />}
          <div className="package-content"><span className="package-index">0{i + 1} /</span><h3>{lang === 'am' ? p.am : p.name}</h3><p>{p.description}</p><ul>{p.items.map(item => <li key={item}><span>↗</span>{item}</li>)}</ul><div className="package-price"><small>{i > 0 ? 'from ' : ''}</small>{p.price}<span> AMD</span><p>for {p.area}</p></div><Action onClick={() => openModal({ type: 'package', index: i })}>{t.package}</Action></div>
        </article>)}</div><p className="pricing-note">Indicative pricing from the design concept. Scope and fees are subject to confirmation.</p>
      </section>

      <section id="projects" className="projects section dark">
        <div className="section-top reveal"><div><Label>04 / Selected Projects</Label><Heading lines={t.project} /></div><span className="section-side-note">A selection from our perspective</span></div>
        <div className="project-stage reveal" tabIndex="0" role="region" aria-roledescription="carousel" aria-label="Selected projects" onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); changeProject(e.key === 'ArrowRight' ? 1 : -1); } }} onTouchStart={e => { swipeStart.current = e.touches[0].clientX; }} onTouchEnd={e => { const distance = e.changedTouches[0].clientX - swipeStart.current; if (Math.abs(distance) > 45) changeProject(distance < 0 ? 1 : -1); }}>
          {projects.map((p, i) => <div className={`project-image ${project === i ? 'active' : ''}`} key={p.name}><img loading="lazy" src={img(p.image)} alt={project === i ? p.name : ''} /></div>)}
          <div className="project-shade" /><div className="project-counter" aria-live="polite">0{project + 1}<span>/ 0{projects.length}</span></div>
          <div key={project} className="project-info"><p className="eyebrow">Selected perspective</p><h3 className="display">{current.name}</h3><p>{current.category}</p><Action onClick={() => openModal({ type: 'project', index: project })}>{t.exploreProject}</Action></div>
          <div className="project-nav"><button aria-label="Previous project" onClick={() => changeProject(-1)}><Arrow direction="left" /></button><button aria-label="Next project" onClick={() => changeProject(1)}><Arrow direction="right" /></button></div>
          <span className="project-source">Supplied architectural visualization</span>
        </div>
      </section>

      <section id="process" className="process section light" ref={timelineRef}>
        <div className="reveal"><Label>05 / How We Work</Label><Heading lines={t.process} /></div>
        <div className="timeline"><div className="timeline-track"><span /></div>{stages.map(([title, text], i) => <div className="stage" key={title}><span className="stage-dot" /><div className="stage-content"><span className="stage-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></div></div>)}</div>
      </section>

      <section id="about" className="expertise section light">
        <div className="expertise-grid"><div><div className="reveal"><Label>06 / Expertise & Partnership</Label><Heading lines={t.expertise} /><p className="expertise-description">{t.expertiseText}</p></div><div className="partners">{[['DIGNISI', 'Real Estate Intelligence'], ['KHACHATURIAN ARCHITECTS', 'Architectural Expertise'], ['BSC', 'Business & Financial Consulting']].map(([name, desc], i) => <div className="partner reveal" key={name} style={{ '--delay': `${i * 100}ms` }}><span className={`partner-name partner-${i}`}>{name}</span><p>{desc}</p></div>)}</div></div>
        <figure className="partnership-photo reveal"><div className="image-clip"><img loading="lazy" src={img('partnership')} alt="Professional collaboration in the supplied Prospect24 photography" /></div><figcaption><strong>A shared perspective</strong><p>Bringing complementary disciplines to the same table.</p><a className="text-link" href="#development">{t.learn}<Arrow /></a></figcaption></figure></div>
      </section>

      <section className="final-cta dark"><img loading="lazy" src={img('hero-after')} alt="" className="cta-background" /><div className="cta-shade" /><div className="cta-content section reveal"><Label>07 / The Next Chapter</Label><Heading lines={t.cta} /><div className="cta-bottom"><p>{t.ctaText}</p><Action filled onClick={() => openModal({ type: 'contact' })}>{t.discuss}</Action></div></div></section>
    </main>

    <footer id="contact" className="footer dark"><div className="footer-top section"><div className="footer-brand reveal"><Logo /><p>Real Estate Development<br />& Investment Advisory</p></div><nav className="footer-nav reveal" aria-label="Footer navigation"><span className="footer-label">Explore</span>{t.nav.map((name, i) => <a key={i} href={links[i]}>{name}</a>)}</nav><div className="footer-contact reveal"><span className="footer-label">Start a conversation</span><a href={`tel:${contact.phoneHref}`}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}<Arrow /></a><p>{contact.location}</p></div><button className="back-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Arrow /></button></div><div className="footer-wordmark reveal" aria-hidden="true"><svg viewBox="0 -24 1440 256" fill="currentColor"><text x="20" y="175" fontSize="185" textLength="1400" lengthAdjust="spacingAndGlyphs">PROSPECT24</text></svg></div><div className="footer-legal"><span>© {new Date().getFullYear()} Prospect24</span><span>Design concept · For presentation</span><div><button onClick={() => openModal({ type: 'privacy' })}>Privacy Policy</button><button onClick={() => openModal({ type: 'terms' })}>Terms of Use</button></div></div></footer>

    <dialog ref={menuRef} className="mobile-menu" aria-label="Site navigation" onCancel={e => { e.preventDefault(); closeMenu(); }}><div className="menu-header"><Logo onClick={e => { e.preventDefault(); closeMenu('#home'); }} /><button className="close-button" aria-label="Close navigation menu" onClick={() => closeMenu()}>×</button></div><nav aria-label="Mobile navigation">{t.nav.map((name, i) => <a key={i} style={{ '--i': i }} href={links[i]} onClick={e => { e.preventDefault(); closeMenu(links[i]); }}>{name}<Arrow /></a>)}</nav><div className="menu-bottom">{languageButtons()}<a href={`tel:${contact.phoneHref}`}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><p>{contact.location}</p></div></dialog>

    <dialog ref={dialogRef} className={`modal ${closing ? 'closing' : ''} ${modal?.type === 'compare' ? 'wide-modal' : ''}`} onCancel={e => { e.preventDefault(); closeModal(); }} onClick={e => { if (e.target === e.currentTarget) closeModal(); }} aria-labelledby="modal-title"><div className="modal-shell"><button className="close-button" autoFocus aria-label="Close dialog" onClick={closeModal}>×</button>
      {modal?.type === 'package' && (() => { const p = packages[modal.index]; return <><div className="modal-image"><img src={img(p.image)} alt="Architectural and planning perspective" /></div><div className="modal-body"><Label>Development Packages / 0{modal.index + 1}</Label><h2 id="modal-title" className="display">{lang === 'am' ? p.am : p.name}</h2><p>{p.detail}</p><ul className="modal-services">{p.items.map(item => <li key={item}><Arrow />{item}</li>)}</ul><div className="modal-price">{modal.index > 0 && <small>from </small>}{p.price} AMD<span>Illustrative concept pricing · {p.area}</span></div><Action filled onClick={() => openModal({ type: 'contact', interest: p.name })}>{t.discuss}</Action></div></>; })()}
      {modal?.type === 'compare' && <div className="modal-body"><Label>A Clearer Perspective</Label><h2 id="modal-title" className="display">Compare packages.</h2><p>Choose the starting point that fits your project’s next decision.</p><div className="comparison-grid">{packages.map((p, i) => <div className="comparison-column" key={p.name}><span className="eyebrow">0{i + 1}</span><h3>{p.name}</h3><p>{p.description}</p><ul>{p.items.map(item => <li key={item}>{item}</li>)}</ul><strong>{i > 0 ? 'from ' : ''}{p.price} AMD</strong><small>Concept pricing · {p.area}</small><Action onClick={() => openModal({ type: 'package', index: i })}>View Details</Action></div>)}</div><p className="pricing-note">Illustrative pricing from the supplied design reference. Final scope and fees require confirmation.</p></div>}
      {modal?.type === 'project' && (() => { const p = projects[modal.index]; return <><div className="modal-image project-modal-image"><img src={img(p.image)} alt={p.name} /></div><div className="modal-body"><Label>{p.category}</Label><h2 id="modal-title" className="display">{p.name}</h2><p>{p.description}</p><p className="muted">Architectural imagery supplied for this prototype. Completion status and additional project details have not been specified.</p>{p.gallery.length > 1 && <div className="project-gallery">{p.gallery.map(name => <img key={name} loading="lazy" src={img(name)} alt={`${p.name} architectural perspective`} />)}</div>}<Action filled onClick={() => openModal({ type: 'contact', interest: p.name })}>Discuss a Similar Vision</Action></div></>; })()}
      {modal?.type === 'contact' && <div className="modal-body contact-body"><Label>Your Next Chapter</Label><h2 id="modal-title" className="display">{t.contact}</h2><p>Tell us a little about your opportunity. We’ll help you find the right starting point.</p><form onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const body = `Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`; window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(modal.interest || 'Project enquiry — Prospect24')}&body=${encodeURIComponent(body)}`; setDraft(true); }}><label>Your name<input name="name" autoComplete="name" placeholder="Name and surname" required /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label><label>Your project<textarea key={modal.interest} name="message" rows="3" placeholder="Location, idea, or the decision ahead…" defaultValue={modal.interest ? `I’m interested in ${modal.interest}.` : ''} required /></label><button className="action filled" type="submit">Prepare Email<Arrow /></button><p className="form-note" role="status">{draft ? `Your email draft is ready in your mail app. You can also write directly to ${contact.email}.` : 'Opens your email app with a draft. No information is stored by this prototype.'}</p></form><div className="contact-direct"><a href={`tel:${contact.phoneHref}`}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><span>{contact.location}</span></div></div>}
      {(modal?.type === 'privacy' || modal?.type === 'terms') && <div className="modal-body legal-body"><Label>Prototype Information</Label><h2 id="modal-title" className="display">{modal.type === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}</h2>{modal.type === 'privacy' ? <><p>This local presentation prototype does not use analytics, tracking cookies, accounts, or a server database.</p><p>The enquiry form prepares a draft in your own email application. Form content is not submitted to or stored by the website. Your email provider’s terms apply when you choose to send it.</p></> : <><p>This homepage demonstrates a proposed visual and interactive direction for Prospect24. It is a client presentation prototype.</p><p>Package pricing is illustrative and subject to confirmation. Architectural visualizations do not establish completion status. The generated hero shows an illustrative development vision.</p><p>Production legal terms will need to be approved before a public launch.</p></>}<a className="text-link" href={`mailto:${contact.email}`}>{contact.email}<Arrow /></a></div>}
    </div></dialog>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);

import './presentation.css';
