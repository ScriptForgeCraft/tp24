import React, { useEffect, useRef, useState } from 'react';
import { EditorElement } from '../editor/EditorElement';
import { edit, sectionEdit } from '../editor/editorConfig';
import { officialUrl } from '../data';
import './selected-portfolio.css';

const number = value => String(value + 1).padStart(2, '0');
const Chevron = ({ previous = false }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={previous ? 'm14 4-8 8 8 8' : 'm10 4 8 8-8 8'} stroke="currentColor" strokeWidth="1.25" /></svg>;
const ProjectArrow = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2" /></svg>;
ProjectArrow.editorIcon = true;

function snapPosition(track, index) {
  const card = track.querySelectorAll('.project-card')[index];
  if (!card) return 0;
  const endPadding = parseFloat(getComputedStyle(track).paddingRight) || 0;
  return Math.max(0, Math.min(track.scrollWidth - track.clientWidth, card.offsetLeft - (track.clientWidth - endPadding - card.offsetWidth) / 2));
}

function nearestProject(track) {
  return [...track.querySelectorAll('.project-card')].reduce((nearest, _, index) =>
    Math.abs(track.scrollLeft - snapPosition(track, index)) < Math.abs(track.scrollLeft - snapPosition(track, nearest)) ? index : nearest, 0);
}

export function SelectedPortfolio({ projects, t, lang, img, onOpen }) {
  const [project, setProject] = useState(0);
  const trackRef = useRef(null);
  const projectRef = useRef(0);
  const pendingScroll = useRef(null);
  const dragRef = useRef(null);
  const scrollFrame = useRef(0);

  function goToProject(index, behavior) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(projects.length - 1, index));
    const left = snapPosition(track, next);
    pendingScroll.current = left;
    projectRef.current = next;
    setProject(next);
    track.scrollTo({ left, behavior: behavior || (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth') });
    if (Math.abs(track.scrollLeft - left) < 1) pendingScroll.current = null;
  }

  function syncProject() {
    if (scrollFrame.current) return;
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = 0;
      const track = trackRef.current;
      if (!track) return;
      // Keep the requested number stable during a smooth scroll. Touch, wheel
      // and mouse gestures take over immediately and follow the visible card.
      if (pendingScroll.current !== null) {
        if (Math.abs(track.scrollLeft - pendingScroll.current) > 1) return;
        pendingScroll.current = null;
      }
      const next = nearestProject(track);
      projectRef.current = next;
      setProject(next);
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    const resize = new ResizeObserver(() => goToProject(projectRef.current, 'instant'));
    resize.observe(track);
    const reveal = event => {
      const index = projects.findIndex(item => event.detail.startsWith('projects.') && event.detail.includes(item.editKey));
      if (index >= 0) goToProject(index, 'instant');
    };
    window.addEventListener('p24-editor-reveal', reveal);
    return () => { resize.disconnect(); cancelAnimationFrame(scrollFrame.current); window.removeEventListener('p24-editor-reveal', reveal); };
  }, [projects.map(item => item.editKey).join('|')]);

  function startDrag(event) {
    pendingScroll.current = null;
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button, a')) return;
    dragRef.current = { x: event.clientX, left: event.currentTarget.scrollLeft };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
    event.preventDefault();
  }

  function endDrag(event) {
    if (!dragRef.current) return;
    dragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    goToProject(nearestProject(event.currentTarget));
  }

  return <EditorElement as="section" {...sectionEdit('projects')} id="projects" className="projects section dark portfolio-section">
    <div className="portfolio-side" aria-hidden="true"><span /><p>{t.scrollProjects}</p><svg width="18" height="26" viewBox="0 0 18 26" fill="none"><path d="M9 1v23M2 17l7 7 7-7" stroke="currentColor" strokeWidth="1.1" /></svg></div>
    <div className="portfolio-header reveal">
      <div className="portfolio-title">
        <EditorElement as="p" {...edit('projects.label')} className="eyebrow">04 <span>/</span> {t.projectLabel}</EditorElement>
        <EditorElement as="h2" {...edit('projects.heading')} className="display">{t.project.map((line, i) => <span className="line-mask" key={i}><span>{line}</span></span>)}</EditorElement>
      </div>
      <EditorElement as="p" {...edit('projects.note')} className="portfolio-note">{t.portfolioNote}</EditorElement>
      <EditorElement as="a" {...edit('projects.all')} className="portfolio-all" href={officialUrl('projects', lang)} target="_blank" rel="noopener noreferrer">{t.allProjects}<svg width="26" height="24" viewBox="0 0 26 24" fill="none" aria-hidden="true"><path d="M2 12h21M16 5l7 7-7 7" stroke="currentColor" strokeWidth="1.1" /></svg></EditorElement>
      <div className="portfolio-controls" role="group" aria-label={t.projectNavigation}>
        <div className="portfolio-arrows">
          <EditorElement as="button" {...edit('projects.previous')} type="button" aria-label={t.previousProject} aria-controls="portfolio-track" disabled={project === 0} onClick={() => goToProject(projectRef.current - 1)}><Chevron previous /></EditorElement>
          <EditorElement as="button" {...edit('projects.next')} type="button" aria-label={t.nextProject} aria-controls="portfolio-track" disabled={project === projects.length - 1} onClick={() => goToProject(projectRef.current + 1)}><Chevron /></EditorElement>
        </div>
        <div className="portfolio-pagination">{projects.map((p, i) => <button type="button" key={p.editKey} aria-label={`${t.viewProject}: ${p.name}`} aria-current={project === i ? 'true' : undefined} aria-controls="portfolio-track" onClick={() => goToProject(i)}>{number(i)}<span aria-hidden="true" /></button>)}</div>
      </div>
    </div>
    <EditorElement as="div" {...edit('projects.viewport')} ref={trackRef} id="portfolio-track" className="project-stage portfolio-track reveal" tabIndex={0} role="region" aria-roledescription="carousel" aria-label={t.projectLabel} onScroll={syncProject} onScrollEnd={() => { pendingScroll.current = null; syncProject(); }} onWheel={() => { pendingScroll.current = null; }} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        goToProject(event.key === 'Home' ? 0 : event.key === 'End' ? projects.length - 1 : projectRef.current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    }} onPointerDown={startDrag} onPointerMove={event => {
      if (dragRef.current) event.currentTarget.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x);
    }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={event => { if (dragRef.current) endDrag(event); }}>
      {projects.map((p, i) => <EditorElement as="article" {...edit(`projects.card.${p.editKey}`)} key={p.editKey} className={`project-card ${project === i ? 'active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${number(i)} / ${number(projects.length - 1)} · ${p.name}`} onFocusCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) goToProject(i); }}>
        <EditorElement as="div" {...edit(`projects.visual.${p.editKey}`)} className="portfolio-image"><EditorElement as="img" {...edit(`projects.visual.${p.editKey}.image`)} loading="lazy" src={img(p.image)} alt={p.name} draggable={false} /></EditorElement>
        <EditorElement as="div" {...edit(i === 0 ? 'projects.overlay' : `projects.visual.${p.editKey}.overlay`)} className="portfolio-shade" />
        <div className="project-info portfolio-card-info">
          <span className="portfolio-card-number" aria-hidden="true">{number(i)}<span /></span>
          <EditorElement as="h3" {...edit(`projects.card.${p.editKey}.heading`)} className="display">{p.name}</EditorElement>
          <EditorElement as="p" {...edit(`projects.card.${p.editKey}.category`)} className="portfolio-category">{p.category}</EditorElement>
          <EditorElement as="button" {...edit(`projects.card.${p.editKey}.button`)} type="button" className="portfolio-explore" onClick={() => onOpen(i)} aria-label={`${t.exploreProject}: ${p.name}`}>{t.exploreProject}<ProjectArrow /></EditorElement>
        </div>
      </EditorElement>)}
    </EditorElement>
    <div className="portfolio-footer">
      <div className="portfolio-progress" aria-hidden="true"><span style={{ transform: `translateX(${project * 100}%)`, width: `${100 / projects.length}%` }} /></div>
      <div className="portfolio-meta"><span className="portfolio-gesture"><span className="portfolio-desktop-hint">{t.dragProjects}</span><span className="portfolio-mobile-hint">{t.swipeProjects}</span><span aria-hidden="true">↔</span></span><EditorElement as="span" {...edit('projects.source')} className="portfolio-source">{t.projectSource}</EditorElement><EditorElement as="span" {...edit('projects.counter')} className="portfolio-count" aria-live="polite" aria-atomic="true">{number(project)} <span>/ {number(projects.length - 1)}</span></EditorElement></div>
    </div>
  </EditorElement>;
}
