import { packages, services, projects, stages, implementingCompanies, news, videos, navigation } from '../data';

export const STORAGE_KEY = 'prospect24-client-editor-v1';
export const VERSION = 1;
export const semanticId = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const sections = [
  ['hero', 'Hero', 'home'], ['intro', 'Introduction', 'approach'],
  ['development', 'Development Services', 'development'], ['packages', 'Development Packages', 'packages'],
  ['projects', 'Selected Projects', 'projects'], ['process', 'Process', 'process'],
  ['expertise', 'Expertise', 'about'], ['partners', 'Partners', 'partners', 'expertise'],
  ['news', 'News & Media', 'news'], ['cta', 'Start a Conversation', 'conversation'], ['footer', 'Contact & Footer', 'contact'],
].map(([id, label, anchor, parent]) => ({ id, label, anchor, parent }));
const properties = {
  text: ['color'], section: ['backgroundColor', 'color'], card: ['backgroundColor', 'color', 'borderColor'],
  button: ['backgroundColor', 'color', 'borderColor'], navigation: ['color', 'backgroundColor'],
};
export const targets = Object.create(null);
function add(id, kind, label, supported = properties[kind]) { targets[id] = { id, kind, label, properties: supported }; }
sections.forEach(section => add(`${section.id}.section`, 'section', section.label));
const textTargets = {
  hero: ['heading', 'tagline', 'description', 'perspective', 'note'],
  intro: ['label', 'heading', 'subheading', 'description', 'caption'],
  development: ['label', 'heading', 'description'], packages: ['label', 'heading', 'note'],
  projects: ['label', 'heading', 'note', 'counter', 'source'], process: ['label', 'heading', 'note'],
  expertise: ['label', 'heading', 'description', 'evidence.heading', 'evidence.description'],
  partners: ['heading', 'description'], news: ['label', 'heading', 'description', 'media.heading', 'media.description'],
  cta: ['label', 'heading', 'description', 'email'],
  footer: ['tagline', 'explore', 'conversation', 'phone', 'email', 'location', 'wordmark', 'copyright', 'note'],
};
Object.entries(textTargets).forEach(([section, names]) => names.forEach(name => add(`${section}.${name}`, 'text', `${sections.find(s => s.id === section).label} · ${name.replaceAll('.', ' ')}`)));
['hero.explore', 'hero.projects', 'hero.scroll', 'intro.learn', 'packages.compare', 'expertise.article', 'partners.all', 'cta.discuss', 'footer.top', 'footer.privacy', 'footer.terms', 'projects.previous', 'projects.next'].forEach(id => add(id, 'button', id.replaceAll('.', ' · ')));
add('header.navigation', 'navigation', 'Navigation background');
navigation.forEach(item => ['header', 'footer', 'mobile'].forEach(place => add(`${place}.nav.${semanticId(item.en)}`, 'navigation', `${place} · ${item.en}`)));
function card(prefix, label, fields, bordered = true) {
  add(prefix, 'card', label, bordered ? properties.card : ['backgroundColor', 'color']);
  fields.forEach(field => add(`${prefix}.${field}`, field === 'button' ? 'button' : 'text', `${label} · ${field}`));
}
packages.forEach(p => card(`packages.card.${semanticId(p.name)}`, p.name, ['heading', 'description', 'inheritance', 'price', 'button']));
services.forEach(s => card(`development.card.${semanticId(s.title)}`, s.title, ['heading', 'description', 'detail', 'button']));
projects.forEach(p => card(`projects.card.${semanticId(p.name)}`, p.name, ['heading', 'category', 'button'], false));
stages.forEach(([title]) => card(`process.card.${semanticId(title)}`, title, ['heading', 'description'], false));
implementingCompanies.forEach(c => card(`expertise.card.${semanticId(c.name)}`, c.name, ['heading', 'role', 'description']));
news.slice(1).forEach(n => card(`news.card.${n.slug}`, n.title, ['heading', 'description', 'button'], false));
videos.forEach(v => card(`news.video.${v.id}`, v.title, ['heading'], false));

export function edit(id) {
  if (!targets[id]) throw new Error(`Unknown editor target: ${id}`);
  return { 'data-edit-id': id };
}
export function sectionEdit(id) { return { ...edit(`${id}.section`), 'data-edit-section': id }; }
export const emptyDesign = () => ({ version: VERSION, visibility: {}, overrides: {} });

// Unknown IDs are ignored for forward compatibility. Known targets are strictly validated.
export function validateDesign(input) {
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  if (!record(input) || input.version !== VERSION) throw new Error('Unsupported design version. Please use a version 1 design file.');
  const result = emptyDesign();
  if (input.visibility !== undefined) {
    if (!record(input.visibility)) throw new Error('Section visibility must be an object.');
    for (const [id, visible] of Object.entries(input.visibility)) {
      if (!sections.some(s => s.id === id)) continue;
      if (typeof visible !== 'boolean') throw new Error(`Invalid visibility for ${id}.`);
      if (!visible) result.visibility[id] = false;
    }
  }
  if (input.overrides !== undefined) {
    if (!record(input.overrides)) throw new Error('Style overrides must be an object.');
    for (const [id, styles] of Object.entries(input.overrides)) {
      if (!Object.hasOwn(targets, id)) continue;
      if (!record(styles)) throw new Error(`Invalid styles for ${id}.`);
      const safe = {};
      for (const [property, color] of Object.entries(styles)) {
        if (!targets[id].properties.includes(property)) throw new Error(`Unsupported property: ${property}.`);
        if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Invalid color for ${id}. Use six-digit hex colors.`);
        safe[property] = color.toLowerCase();
      }
      if (Object.keys(safe).length) result.overrides[id] = safe;
    }
  }
  return result;
}
export function loadDesign(storage) {
  try { const value = storage.getItem(STORAGE_KEY); return value ? validateDesign(JSON.parse(value)) : emptyDesign(); }
  catch { return emptyDesign(); }
}
export const isSectionHidden = (design, section) => design.visibility[section.id] === false || (section.parent && design.visibility[section.parent] === false);

// Variables inherit through a section/card, while a nested local override wins naturally.
// Only targets with saved overrides receive rules; original tokens and animations remain intact.
export function designCSS(design) {
  const rules = sections.filter(s => design.visibility[s.id] === false).map(s => `[data-edit-section="${s.id}"]{display:none!important}`);
  for (const [id, styles] of Object.entries(design.overrides)) {
    const selector = `[data-edit-id="${id}"]`;
    if (styles.color) {
      rules.push(`${selector}{--p24-text:${styles.color};color:var(--p24-text)!important}`);
      rules.push(`${selector} :where(h1,h2,h3,h4,p,span,strong,small,li,a,button,svg,text):not(:where([data-editor-ui],[data-editor-ui] *)){color:var(--p24-text)!important}`);
    }
    if (styles.backgroundColor) {
      rules.push(`${selector}{--p24-background:${styles.backgroundColor};background:var(--p24-background)!important}`);
      // The photo stays in the DOM. A solid chosen surface replaces its dark tint.
      if (id.startsWith('packages.card.') && targets[id].kind === 'card') rules.push(`${selector}::after{background:var(--p24-background)!important}`);
      if (id === 'hero.section') rules.push(`${selector} .hero-shade{background:var(--p24-background)!important}`);
    }
    if (styles.borderColor) rules.push(`${selector}{--p24-border:${styles.borderColor};border-color:var(--p24-border)!important}`);
  }
  return rules.join('\n');
}
