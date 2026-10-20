// Color roles only. Geometry, content, media and behavior belong to the existing home page.
const theme = (id, slug, name, description, palette, colors) => ({ id, slug, name, description, palette, colors });
export const previewThemes = [
  theme('01', 'graphite', 'Graphite & Ivory', 'Modern, elegant, high contrast', ['#171A1B', '#F6F6F3', '#E2E2E2', '#868686'], {
    dark: '#171A1B', deep: '#111415', light: '#F6F6F3', muted: '#E2E2E2', secondary: '#596064', inverse: '#FFFFFF', inverseSecondary: '#D2D6D7', border: '#BFC4C5', card: '#1C2021', cardAlt: '#252A2B', primary: '#171A1B', primaryText: '#FFFFFF', accent: '#323839', accentInverse: '#E2E2E2', header: '#171A1B', headerText: '#FFFFFF', heroText: '#FFFFFF',
  }),
  theme('02', 'forest', 'Stone & Forest', 'Calm, premium, natural', ['#263D35', '#F1F0EB', '#172C25', '#6F7F76'], {
    dark: '#263D35', deep: '#172C25', light: '#F1F0EB', muted: '#E5E7DF', secondary: '#506057', inverse: '#FFFFFF', inverseSecondary: '#D7E0D9', border: '#B9C5BC', card: '#172C25', cardAlt: '#21372E', primary: '#263D35', primaryText: '#FFFFFF', accent: '#385748', accentInverse: '#D2E0D5', header: '#172C25', headerText: '#FFFFFF', heroText: '#FFFFFF',
  }),
  theme('03', 'slate', 'Slate & Ice', 'Modern, trusted, professional', ['#203746', '#E9EFF2', '#162936', '#687C8F'], {
    dark: '#203746', deep: '#162936', light: '#E9EFF2', muted: '#DFE7EC', secondary: '#4C606D', inverse: '#FFFFFF', inverseSecondary: '#D5E0E7', border: '#B4C3CC', card: '#162936', cardAlt: '#243D4D', primary: '#203746', primaryText: '#FFFFFF', accent: '#365A70', accentInverse: '#D3E1EB', header: '#162936', headerText: '#FFFFFF', heroText: '#FFFFFF',
  }),
  theme('04', 'espresso', 'Espresso & Porcelain', 'Warm, sophisticated, timeless', ['#292522', '#F7F5F2', '#382F2A', '#7A6F67'], {
    dark: '#292522', deep: '#201D1B', light: '#F7F5F2', muted: '#EBE7E2', secondary: '#665C55', inverse: '#FFFFFF', inverseSecondary: '#DDD5CF', border: '#C9BFB7', card: '#292522', cardAlt: '#382F2A', primary: '#292522', primaryText: '#FFFFFF', accent: '#54463D', accentInverse: '#E5DAD2', header: '#201D1B', headerText: '#FFFFFF', heroText: '#FFFFFF',
  }),
  theme('05', 'sage', 'Sage & Charcoal', 'Natural, modern, refined', ['#202622', '#E6EAE2', '#314735', '#687D6F'], {
    dark: '#202622', deep: '#171E19', light: '#E6EAE2', muted: '#DAE1D5', secondary: '#4E6052', inverse: '#FFFFFF', inverseSecondary: '#CEDACF', border: '#B4C2B5', card: '#202622', cardAlt: '#29352D', primary: '#314735', primaryText: '#FFFFFF', accent: '#314735', accentInverse: '#D2DFCE', header: '#202622', headerText: '#FFFFFF', heroText: '#FFFFFF',
  }),
  theme('06', 'terracotta', 'White & Terracotta', 'Clean, contemporary, distinctive', ['#FAFAF8', '#222222', '#A64F3D', '#7D6D63'], {
    dark: '#222222', deep: '#191919', light: '#FAFAF8', muted: '#F0EEEB', secondary: '#62574F', inverse: '#FFFFFF', inverseSecondary: '#DCD6D1', border: '#C7BBB2', card: '#222222', cardAlt: '#2D2A28', primary: '#A64F3D', primaryText: '#FFFFFF', accent: '#A64F3D', accentInverse: '#F3D9D1', header: '#FAFAF8', headerText: '#222222', heroText: '#222222',
  }),
];

export function themeTokens(theme) {
  const c = theme.colors;
  return {
    '--color-page-bg': c.light, '--color-section-light': c.light, '--color-section-muted': c.muted, '--color-section-dark': c.dark,
    '--color-surface-primary': c.light, '--color-surface-secondary': c.muted, '--color-surface-elevated': c.inverse,
    '--color-text-primary': c.deep, '--color-text-secondary': c.secondary, '--color-text-inverse': c.inverse, '--color-text-inverse-secondary': c.inverseSecondary,
    '--color-border': c.border, '--color-divider': `color-mix(in srgb, ${c.deep} 22%, transparent)`,
    '--color-button-primary-bg': c.primary, '--color-button-primary-text': c.primaryText,
    '--color-button-primary-hover-bg': c.light, '--color-button-primary-hover-text': c.primary,
    '--color-button-inverse-bg': c.light, '--color-button-inverse-text': c.dark,
    '--color-button-inverse-hover-bg': c.deep, '--color-button-inverse-hover-text': c.light,
    '--color-button-secondary-bg': c.deep, '--color-button-secondary-text': c.inverse, '--color-button-secondary-border': c.inverseSecondary,
    '--color-button-secondary-hover-bg': c.light, '--color-button-secondary-hover-text': c.deep,
    '--color-link': c.primary, '--color-link-hover': c.accent, '--color-focus': c.inverse, '--color-focus-halo': c.deep,
    '--color-header-bg': c.header, '--color-header-text': c.headerText,
    '--color-footer-bg': c.deep, '--color-footer-text': c.inverse, '--color-footer-secondary': c.inverseSecondary,
    '--color-card-bg': c.card, '--color-card-alt-bg': c.cardAlt, '--color-card-text': c.inverse, '--color-card-secondary': c.inverseSecondary, '--color-card-border': c.border,
    '--color-accent': c.accent, '--color-accent-inverse': c.accentInverse,
    '--color-hero-text': c.heroText, '--color-hero-secondary': theme.id === '06' ? c.secondary : c.inverseSecondary,
    '--color-photo-text': c.inverse, '--color-photo-badge': '#171A1B', '--color-photo-overlay-rgb': '12 16 18',
    // Existing component variables remain local to the preview wrapper.
    '--ink': c.dark, '--deep': c.deep, '--paper': c.light, '--panel': c.muted, '--stone': c.muted,
    '--text-on-light': c.secondary, '--text-on-dark': c.inverseSecondary, '--accent-on-light': c.accent, '--accent-on-dark': c.accentInverse,
    '--bronze': c.accent, '--overlay-rgb': '12 16 18',
  };
}

export function previewRoute(pathname = window.location.pathname) {
  const match = pathname.match(/^\/design-preview(?:\/(0[1-6]))?\/?$/);
  if (!match) return null;
  return match[1] ? previewThemes.find(theme => theme.id === match[1]) : 'overview';
}

export const previewHref = id => `/design-preview/${id}`;
