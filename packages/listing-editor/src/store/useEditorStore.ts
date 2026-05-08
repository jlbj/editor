import { create } from 'zustand';
import type { PropertyData, PropertyPhoto, PageConfig, Section, SectionType, Theme, Layout } from '../types';
import { THEMES, LAYOUTS, DEFAULT_SECTION_CONTENT, generateId } from '../lib/constants';
import * as supabase from '../services/supabase';

type ViewMode = 'mobile' | 'mobile-horizontal' | 'tablet' | 'desktop';

interface EditorState {
  propertyId: string | null;
  propertyData: PropertyData | null;
  photos: PropertyPhoto[];
  pageConfig: PageConfig;
  selectedSectionId: string | null;
  sidebarOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  viewMode: ViewMode;

  loadProperty: (propertyId: string) => Promise<void>;
  saveConfig: () => Promise<void>;

  toggleSidebar: () => void;
  setSelectedSection: (sectionId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;

  setLayout: (layoutId: string) => void;
  setTheme: (themeId: string) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  reorderSections: (sections: Section[]) => void;

  getTheme: () => Theme | undefined;
  getLayout: () => Layout | undefined;
}

const DEFAULT_PAGE_CONFIG: PageConfig = {
  layout: 'list',
  theme: 'modern-ocean',
  sections: [],
  globalStyle: {},
};

export const useEditorStore = create<EditorState>((set, get) => ({
  propertyId: null,
  propertyData: null,
  photos: [],
  pageConfig: DEFAULT_PAGE_CONFIG,
  selectedSectionId: null,
  sidebarOpen: true,
  isLoading: false,
  isSaving: false,
  error: null,
  viewMode: 'desktop',

  loadProperty: async (propertyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [propertyData, photos] = await Promise.all([
        supabase.fetchProperty(propertyId),
        supabase.fetchPropertyPhotos(propertyId),
      ]);

      if (!propertyData) {
        throw new Error('Property not found');
      }

      const pageConfig = propertyData.page_config || DEFAULT_PAGE_CONFIG;

      set({
        propertyId,
        propertyData,
        photos,
        pageConfig,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },

  saveConfig: async () => {
    const { propertyId, pageConfig } = get();
    if (!propertyId) return;

    set({ isSaving: true, error: null });
    try {
      await supabase.savePropertyConfig(propertyId, pageConfig);
      set({ isSaving: false });
    } catch (error) {
      set({ isSaving: false, error: (error as Error).message });
      throw error;
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedSection: (sectionId) => set({ selectedSectionId: sectionId }),
  setViewMode: (mode) => set({ viewMode: mode }),

  setLayout: (layoutId) => set((state) => ({
    pageConfig: { ...state.pageConfig, layout: layoutId },
  })),

  setTheme: (themeId) => set((state) => ({
    pageConfig: { ...state.pageConfig, theme: themeId },
  })),

  addSection: (type) => set((state) => {
    const newSection: Section = {
      id: generateId(),
      type,
      order: state.pageConfig.sections.length,
      enabled: true,
      content: DEFAULT_SECTION_CONTENT[type],
      style: {},
      animations: {},
    };
    return {
      pageConfig: {
        ...state.pageConfig,
        sections: [...state.pageConfig.sections, newSection],
      },
    };
  }),

  removeSection: (sectionId) => set((state) => ({
    pageConfig: {
      ...state.pageConfig,
      sections: state.pageConfig.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i })),
    },
    selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
  })),

  updateSection: (sectionId, updates) => set((state) => {
      const newSections = state.pageConfig.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      );
      return {
        pageConfig: {
          ...state.pageConfig,
          sections: newSections,
        },
      };
    }),

  reorderSections: (sections) => set((state) => ({
    pageConfig: {
      ...state.pageConfig,
      sections: sections.map((s, i) => ({ ...s, order: i })),
    },
  })),

  getTheme: () => THEMES.find((t) => t.id === get().pageConfig.theme),
  getLayout: () => LAYOUTS.find((l) => l.id === get().pageConfig.layout),
}));