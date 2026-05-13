import type { SectionType, Theme, Layout, SectionContent } from '../types';

export const SECTION_TYPES: { type: SectionType; label: string; icon: string }[] = [
  { type: 'hero', label: 'Hero', icon: '🖼️' },
  { type: 'photos', label: 'Photos', icon: '📸' },
  { type: 'description', label: 'Description', icon: '📝' },
  { type: 'contact', label: 'Contact', icon: '📧' },
  { type: 'price', label: 'Price', icon: '💰' },
  { type: 'header', label: 'Header', icon: '🏠' },
  { type: 'characteristics', label: 'Characteristics', icon: '📐' },
  { type: 'otherProperties', label: 'Other Properties', icon: '🔗' },
  { type: 'bottom', label: 'Bottom', icon: '⬇️' },
  { type: 'closeTo', label: 'Close To', icon: '📍' },
  { type: 'amenities', label: 'Amenities', icon: '✨' },
  { type: 'map', label: 'Map', icon: '🗺️' },
  { type: 'facilities', label: 'Facilities', icon: '设施' },
  { type: 'floorPlan', label: 'Floor Plan', icon: '📋' },
  { type: 'rules', label: 'Rules', icon: '📋' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬' },
  { type: 'location', label: 'Location', icon: '🌍' },
  { type: 'recap', label: 'Recap', icon: '📌' },
];

export const DEFAULT_SECTION_CONTENT: Record<SectionType, SectionContent> = {
  hero: { title: '', subtitle: '', description: '', backgroundImage: '', ctaText: '', ctaLink: '' },
  photos: { images: [], layout: 'grid', columns: 3 },
  description: { content: '' },
  contact: { email: '', phone: '', address: '' },
  price: { minPrice: 0, currency: '€', period: 'night' },
  header: { logo: '', menuItems: [] },
  characteristics: { sqm: 0, plotSqm: 0, rooms: 0, bathrooms: 0, beds: 0, guests: 0 },
  otherProperties: { properties: [] },
  bottom: { copyright: '', links: [] },
  closeTo: { items: [] },
  amenities: { list: [] },
  map: { address: '', coordinates: null },
  facilities: { list: [] },
  floorPlan: { image: '', rooms: [] },
  rules: { items: [] },
  testimonials: { items: [] },
  location: { description: '', nearby: [] },
  recap: { checkIn: '', checkOut: '', minNights: 0, cancellationPolicy: '', paymentTerms: '' },
  ADAPTIVE: { content: '' },
  FIXED: { content: '' },
};

export const THEMES: Theme[] = [
  {
    id: 'modern-ocean',
    name: 'Modern Ocean',
    colors: {
      primary: '#1a365d',
      primaryLight: '#2b6cb0',
      secondary: '#38b2ac',
      accent: '#ed8936',
      background: '#ffffff',
      surface: '#f7fafc',
      text: '#1a202c',
      textMuted: '#718096',
      border: '#e2e8f0',
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      baseSize: '16px',
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '4rem 2rem',
      gap: '2rem',
    },
    borders: {
      radius: '0.5rem',
      style: 'solid',
      width: '1px',
    },
    buttons: {
      shape: 'rounded',
      variant: 'filled',
      shadow: 'sm',
    },
    animations: {
      hover: 'scale',
      scroll: 'fade-up',
      speed: '300ms',
    },
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    colors: {
      primary: '#b8860b',
      primaryLight: '#d4a84b',
      secondary: '#2c2c2c',
      accent: '#8b4513',
      background: '#fdfbf7',
      surface: '#f5f0e6',
      text: '#2c2c2c',
      textMuted: '#6b6b6b',
      border: '#d4c4a8',
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Lato', sans-serif",
      baseSize: '16px',
      headingWeight: 600,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '3.5rem 2rem',
      gap: '2rem',
    },
    borders: {
      radius: '4px',
      style: 'solid',
      width: '1px',
    },
    buttons: {
      shape: 'rounded',
      variant: 'filled',
      shadow: 'sm',
    },
    animations: {
      hover: 'lift',
      scroll: 'fade-up',
      speed: '400ms',
    },
  },
  {
    id: 'tropical-green',
    name: 'Tropical Green',
    colors: {
      primary: '#1b5e20',
      primaryLight: '#2e7d32',
      secondary: '#ff6f00',
      accent: '#00bcd4',
      background: '#f1f8e9',
      surface: '#e8f5e9',
      text: '#1b5e20',
      textMuted: '#558b2f',
      border: '#a5d6a7',
    },
    typography: {
      headingFont: "'Montserrat', sans-serif",
      bodyFont: "'Open Sans', sans-serif",
      baseSize: '16px',
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '3rem 1.5rem',
      gap: '1.5rem',
    },
    borders: {
      radius: '8px',
      style: 'solid',
      width: '2px',
    },
    buttons: {
      shape: 'pill',
      variant: 'filled',
      shadow: 'md',
    },
    animations: {
      hover: 'scale',
      scroll: 'fade-in',
      speed: '300ms',
    },
  },
  {
    id: 'luxury-black',
    name: 'Luxury Black',
    colors: {
      primary: '#ffffff',
      primaryLight: '#e0e0e0',
      secondary: '#b8860b',
      accent: '#ff5722',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textMuted: '#b0b0b0',
      border: '#333333',
    },
    typography: {
      headingFont: "'Cinzel', serif",
      bodyFont: "'Raleway', sans-serif",
      baseSize: '16px',
      headingWeight: 500,
      bodyWeight: 300,
    },
    spacing: {
      sectionPadding: '4rem 3rem',
      gap: '2rem',
    },
    borders: {
      radius: '2px',
      style: 'solid',
      width: '1px',
    },
    buttons: {
      shape: 'square',
      variant: 'outline',
      shadow: 'none',
    },
    animations: {
      hover: 'glow',
      scroll: 'fade-up',
      speed: '500ms',
    },
  },
  {
    id: 'coastal-blue',
    name: 'Coastal Blue',
    colors: {
      primary: '#0277bd',
      primaryLight: '#0288d1',
      secondary: '#00838f',
      accent: '#ff7043',
      background: '#f5f9fc',
      surface: '#e1f5fe',
      text: '#01579b',
      textMuted: '#546e7a',
      border: '#b3e5fc',
    },
    typography: {
      headingFont: "'Quicksand', sans-serif",
      bodyFont: "'Nunito', sans-serif",
      baseSize: '16px',
      headingWeight: 600,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '3rem 2rem',
      gap: '1.5rem',
    },
    borders: {
      radius: '12px',
      style: 'solid',
      width: '1px',
    },
    buttons: {
      shape: 'rounded',
      variant: 'filled',
      shadow: 'md',
    },
    animations: {
      hover: 'lift',
      scroll: 'fade-in',
      speed: '350ms',
    },
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    colors: {
      primary: '#bf360c',
      primaryLight: '#d84315',
      secondary: '#ffab91',
      accent: '#ffca28',
      background: '#fff3e0',
      surface: '#ffe0b2',
      text: '#3e2723',
      textMuted: '#5d4037',
      border: '#ffcc80',
    },
    typography: {
      headingFont: "'Bitter', serif",
      bodyFont: "'Source Sans Pro', sans-serif",
      baseSize: '16px',
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '3.5rem 2rem',
      gap: '2rem',
    },
    borders: {
      radius: '6px',
      style: 'solid',
      width: '2px',
    },
    buttons: {
      shape: 'rounded',
      variant: 'filled',
      shadow: 'sm',
    },
    animations: {
      hover: 'scale',
      scroll: 'fade-up',
      speed: '300ms',
    },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    colors: {
      primary: '#000000',
      primaryLight: '#333333',
      secondary: '#666666',
      accent: '#0066cc',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#111111',
      textMuted: '#666666',
      border: '#eeeeee',
    },
    typography: {
      headingFont: "'Helvetica Neue', sans-serif",
      bodyFont: "'Helvetica Neue', sans-serif",
      baseSize: '16px',
      headingWeight: 600,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '3rem 1.5rem',
      gap: '1.5rem',
    },
    borders: {
      radius: '0',
      style: 'solid',
      width: '1px',
    },
    buttons: {
      shape: 'square',
      variant: 'filled',
      shadow: 'none',
    },
    animations: {
      hover: 'none',
      scroll: 'fade-in',
      speed: '200ms',
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    colors: {
      primary: '#c05621',
      primaryLight: '#dd6b20',
      secondary: '#d69e2e',
      accent: '#38a169',
      background: '#fffaf0',
      surface: '#fefcbf',
      text: '#744210',
      textMuted: '#975a16',
      border: '#f6e05e',
    },
    typography: {
      headingFont: "'Georgia', serif",
      bodyFont: "'Georgia', serif",
      baseSize: '18px',
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: {
      sectionPadding: '4rem 2rem',
      gap: '2rem',
    },
    borders: {
      radius: '0.75rem',
      style: 'solid',
      width: '2px',
    },
    buttons: {
      shape: 'pill',
      variant: 'filled',
      shadow: 'md',
    },
    animations: {
      hover: 'lift',
      scroll: 'fade-up',
      speed: '400ms',
    },
  },
];

export const LAYOUTS: Layout[] = [
  { id: 'list', name: 'List', thumbnail: '', description: 'Sections stacked one after another' },
  { id: 'two-column', name: 'Two Column', thumbnail: '', description: 'Alternating side-by-side sections' },
  { id: 'magazine', name: 'Magazine', thumbnail: '', description: 'Full-width hero with magazine-style grid' },
  { id: 'hero-first', name: 'Hero First', thumbnail: '', description: 'Large hero at top, then standard list' },
  { id: 'custom', name: 'Custom', thumbnail: '', description: 'Drag-and-drop block layout editor' },
];

export const generateId = () => `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const MAX_CUSTOM_LAYOUTS = 10;
export const CUSTOM_LAYOUT_STORAGE_KEY = 'listing-editor-custom-layouts';
export const DEFAULT_BLOCK_HEIGHT = 187;
export const MIN_BLOCK_SIZE = 50;
export const DEFAULT_INITIAL_SECTIONS = 4;
export const DEFAULT_SECTION_TYPES = ['hero', 'description', 'photos', 'contact'] as const;

export interface SectionLibraryItem {
  type: SectionType;
  label: string;
  icon: string;
  color: string;
}

export const SECTION_LIBRARY: SectionLibraryItem[] = [
  { type: 'hero', label: 'Hero', icon: '🖼️', color: '#3b82f6' },
  { type: 'photos', label: 'Photos', icon: '📸', color: '#10b981' },
  { type: 'description', label: 'Description', icon: '📝', color: '#8b5cf6' },
  { type: 'contact', label: 'Contact', icon: '📧', color: '#f43f5e' },
  { type: 'price', label: 'Price', icon: '💰', color: '#f59e0b' },
  { type: 'header', label: 'Header', icon: '🏠', color: '#06b6d4' },
  { type: 'characteristics', label: 'Characteristics', icon: '📐', color: '#ec4899' },
  { type: 'amenities', label: 'Amenities', icon: '✨', color: '#14b8a6' },
  { type: 'map', label: 'Map', icon: '🗺️', color: '#6366f1' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬', color: '#a855f7' },
  { type: 'location', label: 'Location', icon: '🌍', color: '#0ea5e9' },
  { type: 'recap', label: 'Recap', icon: '📌', color: '#d946ef' },
  { type: 'facilities', label: 'Facilities', icon: '🏗️', color: '#84cc16' },
  { type: 'floorPlan', label: 'Floor Plan', icon: '📋', color: '#f97316' },
  { type: 'rules', label: 'Rules', icon: '📜', color: '#ef4444' },
  { type: 'closeTo', label: 'Close To', icon: '📍', color: '#22d3ee' },
  { type: 'otherProperties', label: 'Other Properties', icon: '🔗', color: '#78716c' },
  { type: 'bottom', label: 'Bottom', icon: '⬇️', color: '#64748b' },
];