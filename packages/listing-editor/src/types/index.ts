export type SectionType =
  | 'hero'
  | 'photos'
  | 'description'
  | 'contact'
  | 'price'
  | 'header'
  | 'characteristics'
  | 'otherProperties'
  | 'bottom'
  | 'closeTo'
  | 'amenities'
  | 'map'
  | 'facilities'
  | 'floorPlan'
  | 'rules'
  | 'testimonials'
  | 'location'
  | 'recap'
  | 'ADAPTIVE'
  | 'FIXED';

export type { Block, SplitDirection, GridBlock, GridBounds, DisplayMode } from './blocks';

export interface SectionContent {
  [key: string]: unknown;
}

export interface SectionStyle {
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundAttachment?: 'scroll' | 'fixed' | 'parallax';
  padding?: string;
}

export interface SectionAnimations {
  hover?: 'none' | 'zoom' | 'lift' | 'glow';
  scroll?: 'none' | 'fade-in' | 'fade-up' | 'slide';
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  content: SectionContent;
  style: SectionStyle;
  animations: SectionAnimations;
}

export interface GlobalStyle {
  fontFamily?: string;
  headingFont?: string;
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: string;
  animationSpeed?: string;
}

export interface PageConfig {
  layout: string;
  theme: string;
  sections: Section[];
  rootBlock?: import('./blocks').Block | null;
  globalStyle: GlobalStyle;
}

export interface PropertyData {
  id: string;
  owner_id: string;
  name: string;
  listing_title: string;
  listing_description: string;
  cover_image_url: string;
  address: string;
  ical_url: string | null;
  cleaning_contact_info: string | null;
  wifi_code: string | null;
  arrival_instructions: string | null;
  house_rules_text: string | null;
  emergency_contact_info: string | null;
  created_at: string;
  updated_at: string;
  property_type: string | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_area: number | null;
  max_guests: number | null;
  bed_count: number | null;
  page_config: PageConfig | null;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  category: string;
  created_at: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: string;
    headingWeight: number;
    bodyWeight: number;
  };
  spacing: {
    sectionPadding: string;
    gap: string;
  };
  borders: {
    radius: string;
    style: string;
    width: string;
  };
  buttons: {
    shape: 'square' | 'rounded' | 'pill';
    variant: 'filled' | 'outline' | 'ghost';
    shadow: string;
  };
  animations: {
    hover: 'none' | 'scale' | 'lift' | 'glow';
    scroll: 'none' | 'fade-up' | 'fade-in' | 'slide';
    speed: string;
  };
}

export interface Layout {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}