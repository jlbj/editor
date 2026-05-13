import { create } from 'zustand';
import type { PropertyData, PropertyPhoto, PageConfig, Section, SectionType, Theme, Layout, GridBlock } from '../types';
import type { SplitDirection, SavedLayout } from '../types/blocks';
import { THEMES, LAYOUTS, DEFAULT_SECTION_CONTENT, generateId, DEFAULT_SECTION_TYPES } from '../lib/constants';
import * as supabase from '../services/supabase';
import type { ListingLayout } from '../services/supabase';
import {
  initializeGridState,
  applyDragToBlocks,
  splitBlockVertically,
  splitBlockHorizontally,
  mergeBlocks,
} from '../lib/grid-utils';

type ViewMode = 'mobile' | 'mobile-horizontal' | 'tablet' | 'desktop';

interface EdgeDragState {
  active: boolean;
  orientation: 'H' | 'V';
  coordinate: number;
  affectedA: string[];
  affectedB: string[];
}

interface BlockHistory {
  past: GridBlock[][];
  future: GridBlock[][];
}

interface EditorState {
  propertyId: string | null;
  propertyData: PropertyData | null;
  photos: PropertyPhoto[];
  pageConfig: PageConfig;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  selectedSeparatorId: string | null;
  gridBlocks: GridBlock[];
  blockHistory: BlockHistory;
  toastMessage: string | null;
  containerWidth: number;
  containerHeight: number;
  sidebarOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  viewMode: ViewMode;
  edgeDragState: EdgeDragState;
  isLayoutEditing: boolean;
  showBlocksInsteadOfSections: boolean;
  selectedCustomLayoutId: string | null;
  availableLayouts: ListingLayout[];

  loadProperty: (propertyId: string) => Promise<void>;
  saveConfig: () => Promise<void>;
  loadLayouts: () => Promise<void>;

  toggleSidebar: () => void;
  setSelectedSection: (sectionId: string | null) => void;
  setSelectedBlock: (blockId: string | null) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;
  setViewMode: (mode: ViewMode) => void;

  setLayout: (layoutId: string) => void;
  setTheme: (themeId: string) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  reorderSections: (sections: Section[]) => void;

  splitBlock: (blockId: string, direction: SplitDirection) => void;
  mergeBlocks: (blockId1: string, blockId2: string) => void;
  deleteBlock: (blockId: string) => void;
  assignSectionToBlock: (blockId: string, sectionId: string) => void;
  setGridBlocks: (blocks: GridBlock[]) => void;
  toggleBlockDisplayMode: (blockId: string) => void;

  toggleSeparatorSelection: (separatorId: string) => void;
  clearSeparatorSelection: () => void;
  startEdgeDrag: (edge: { orientation: 'H' | 'V'; coordinate: number; affectedA: string[]; affectedB: string[] }) => void;
  updateEdgeDrag: (newPos: number) => void;
  endEdgeDrag: () => void;

  setContainerDimensions: (width: number, height: number) => void;

  saveBlockHistory: () => void;
  undoBlocks: () => void;
  redoBlocks: () => void;
  setToastMessage: (msg: string | null) => void;

  saveCustomLayout: (name: string) => Promise<boolean>;
  loadCustomLayout: (id: string) => void;
  deleteCustomLayout: (id: string) => void;
  getCustomLayouts: () => SavedLayout[];

  getTheme: () => Theme | undefined;
  getLayout: () => Layout | undefined;
  getIsLayoutEditing: () => boolean;
}

const DEFAULT_PAGE_CONFIG: PageConfig = {
  layout: 'list',
  theme: 'modern-ocean',
  sections: [],
  globalStyle: {},
};

function createDefaultSections(): Section[] {
  return DEFAULT_SECTION_TYPES.map((type, index) => ({
    id: generateId(),
    type,
    order: index,
    enabled: true,
    content: DEFAULT_SECTION_CONTENT[type as SectionType],
    style: {},
    animations: {},
  }));
}

function createSectionsFromProperty(propertyData: PropertyData, photos: PropertyPhoto[]): Section[] {
  const sections: Section[] = [];

  // Hero section
  sections.push({
    id: generateId(),
    type: 'hero',
    order: 0,
    enabled: true,
    content: {
      title: propertyData.listing_title || propertyData.name || '',
      subtitle: propertyData.property_type || '',
      description: propertyData.listing_description || '',
      backgroundImage: photos.length > 0 ? photos[0].url : (propertyData.cover_image_url || ''),
      ctaText: 'Book Now',
      ctaLink: '',
    },
    style: {
      backgroundImage: photos.length > 0 ? `url(${photos[0].url})` : (propertyData.cover_image_url ? `url(${propertyData.cover_image_url})` : undefined),
    },
    animations: {},
  });

  // Description section
  sections.push({
    id: generateId(),
    type: 'description',
    order: 1,
    enabled: true,
    content: {
      content: propertyData.listing_description || '',
    },
    style: {},
    animations: {},
  });

  // Characteristics section
  sections.push({
    id: generateId(),
    type: 'characteristics',
    order: 2,
    enabled: true,
    content: {
      sqm: propertyData.surface_area || 0,
      plotSqm: 0,
      rooms: propertyData.rooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      beds: propertyData.bed_count || 0,
      guests: propertyData.max_guests || 0,
    },
    style: {},
    animations: {},
  });

  // Photos section
  if (photos.length > 0) {
    sections.push({
      id: generateId(),
      type: 'photos',
      order: sections.length,
      enabled: true,
      content: {
        images: photos.map(p => ({ url: p.url, caption: '' })),
        layout: 'grid',
        columns: 3,
      },
      style: {},
      animations: {},
    });
  }

  // Contact section
  sections.push({
    id: generateId(),
    type: 'contact',
    order: sections.length,
    enabled: true,
    content: {
      email: propertyData.cleaning_contact_info || '',
      phone: propertyData.emergency_contact_info || '',
      address: propertyData.address || '',
    },
    style: {},
    animations: {},
  });

  return sections;
}

const DEFAULT_GRID_BLOCKS: GridBlock[] = [];

export const useEditorStore = create<EditorState>((set, get) => ({
  propertyId: null,
  propertyData: null,
  photos: [],
  pageConfig: DEFAULT_PAGE_CONFIG,
  selectedSectionId: null,
  selectedBlockId: null,
  selectedBlockIds: [],
  selectedSeparatorId: null,
  gridBlocks: DEFAULT_GRID_BLOCKS,
  blockHistory: { past: [], future: [] },
  toastMessage: null,
  containerWidth: 800,
  containerHeight: 748,
  sidebarOpen: true,
  isLoading: false,
  isSaving: false,
  error: null,
  viewMode: 'desktop',
  edgeDragState: { active: false, orientation: 'H', coordinate: 0, affectedA: [], affectedB: [] },
  isLayoutEditing: false,
  showBlocksInsteadOfSections: false,
  selectedCustomLayoutId: null,
  availableLayouts: [],

  loadProperty: async (propertyId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('[loadProperty] Loading property:', propertyId);
      const [propertyData, photos] = await Promise.all([
        supabase.fetchProperty(propertyId),
        supabase.fetchPropertyPhotos(propertyId),
      ]);

      console.log('[loadProperty] Property data:', propertyData);
      console.log('[loadProperty] Photos:', photos);

      if (!propertyData) {
        throw new Error('Property not found');
      }

      let pageConfig = propertyData.page_config || DEFAULT_PAGE_CONFIG;
      console.log('[loadProperty] Initial pageConfig sections:', pageConfig.sections?.length);

      // If no sections exist, create them from property data
      if (!pageConfig.sections || pageConfig.sections.length === 0) {
        const newSections = createSectionsFromProperty(propertyData, photos);
        console.log('[loadProperty] Created sections from property:', newSections.length);
        pageConfig = {
          ...pageConfig,
          sections: newSections,
        };
      }

      // Create gridBlocks from sections (each section is a block)
      const gridBlocks = pageConfig.sections.map((section, index) => ({
        id: `block_${index}`,
        sectionId: section.id,
        row: 0,
        col: 0,
        bounds: { top: index * 150, left: 0, right: 800, bottom: (index + 1) * 150 },
        displayMode: 'LOCKED' as const,
      }));

      set({
        propertyId,
        propertyData,
        photos,
        pageConfig,
        gridBlocks,
        isLoading: false,
      });
      console.log('[loadProperty] Done, sections in store:', pageConfig.sections?.length);

      // Load available layouts from DB after property is loaded
      get().loadLayouts();
    } catch (error) {
      console.error('[loadProperty] Error:', error);
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

  loadLayouts: async () => {
    const { propertyData } = get();
    const ownerId = propertyData?.owner_id;
    const layouts = await supabase.fetchListingLayouts(ownerId);
    console.log('[loadLayouts] Loaded', layouts.length, 'layouts from DB');
    set({ availableLayouts: layouts });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedSection: (sectionId) => set({ selectedSectionId: sectionId }),
  setSelectedBlock: (blockId) => set((state) => {
    const block = blockId ? state.gridBlocks.find(b => b.id === blockId) : null;
    const assignedSectionId = block?.sectionId || null;
    
    return {
      selectedBlockId: blockId,
      selectedBlockIds: blockId ? [blockId] : [],
      selectedSectionId: assignedSectionId,
    };
  }),
  toggleBlockSelection: (blockId) => set((state) => {
    const ids = state.selectedBlockIds;
    if (ids.includes(blockId)) {
      return {
        selectedBlockIds: ids.filter(id => id !== blockId),
        selectedBlockId: ids.length > 1 ? ids[0] : null,
      };
    }
    return { selectedBlockIds: [...ids, blockId] };
  }),
  clearBlockSelection: () => set({ selectedBlockIds: [], selectedBlockId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),

  setLayout: (layoutId) => {
    console.log('[setLayout] layoutId:', layoutId);
    if (layoutId === 'custom') {
      set((state) => {
        let sections = state.pageConfig.sections;

        if (sections.length === 0) {
          sections = createDefaultSections();
        }

        const gridBlocks = initializeGridState(state.containerWidth, state.containerHeight, 4);

        return {
          pageConfig: { ...state.pageConfig, layout: layoutId, sections },
          gridBlocks,
          isLayoutEditing: true,
          showBlocksInsteadOfSections: false,
        };
      });
    } else {
      // Find layout in DB-loaded availableLayouts
      const dbLayout = get().availableLayouts.find(l => l.id === layoutId);
      
      if (dbLayout) {
        console.log('[setLayout] Found DB layout:', dbLayout.name, 'type:', dbLayout.type);
        console.log('[setLayout] gridBlocks count:', (dbLayout.grid_blocks as any[])?.length);

        set((state) => {
          const gridBlocks = (dbLayout.grid_blocks as GridBlock[]) || [];
          const finalSections = state.pageConfig.sections;
          
          // Apply section assignments from DB layout (predefined layouts have them, custom don't)
          const assignedBlocks = gridBlocks.map(block => {
            const sectionId = (dbLayout.section_assignments as Record<string, string>)?.[block.id] || block.sectionId;
            return sectionId ? { ...block, sectionId } : block;
          });

          return {
            pageConfig: { ...state.pageConfig, layout: 'custom', sections: finalSections },
            gridBlocks: assignedBlocks,
            selectedBlockId: null,
            selectedBlockIds: [],
            selectedSeparatorId: null,
            isLayoutEditing: false,
            showBlocksInsteadOfSections: false,
            selectedCustomLayoutId: dbLayout.id,
          };
        });
        return;
      }
      
      // Fallback: hardcoded predefined layout from LAYOUTS constant
      const hardcodedLayout = LAYOUTS.find(l => l.id === layoutId);
      if (hardcodedLayout) {
        set((state) => {
          const sections = state.pageConfig.sections;
          const gridBlocks = sections.map((section, index) => ({
            id: `block_${index}`,
            sectionId: section.id,
            row: 0,
            col: 0,
            bounds: { top: index * 150, left: 0, right: 800, bottom: (index + 1) * 150 },
            displayMode: 'LOCKED' as const,
          }));
          
          return {
            pageConfig: { ...state.pageConfig, layout: layoutId },
            gridBlocks,
            selectedBlockId: null,
            selectedBlockIds: [],
            selectedSeparatorId: null,
            isLayoutEditing: false,
            showBlocksInsteadOfSections: false,
          };
        });
      }
    }
  },

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

    const newSections = [...state.pageConfig.sections, newSection];

    if (state.pageConfig.layout === 'custom' && state.gridBlocks.length > 0) {
      const lastBlock = state.gridBlocks[state.gridBlocks.length - 1];
      const updatedBlocks = state.gridBlocks.map(b =>
        b.id === lastBlock.id ? { ...b, sectionId: newSection.id } : b
      );

      return {
        pageConfig: { ...state.pageConfig, sections: newSections },
        gridBlocks: updatedBlocks,
      };
    }

    return {
      pageConfig: { ...state.pageConfig, sections: newSections },
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

  splitBlock: (blockId, direction) => {
    const state = get();
    get().saveBlockHistory();
    if (direction === 'vertical') {
      const newBlocks = splitBlockVertically(state.gridBlocks, blockId, state.containerWidth);
      if (newBlocks === state.gridBlocks) {
        get().setToastMessage('Block too narrow to split');
        return;
      }
      set({ gridBlocks: newBlocks, selectedBlockId: blockId });
    } else {
      const newBlocks = splitBlockHorizontally(state.gridBlocks, blockId, state.containerHeight);
      if (newBlocks === state.gridBlocks) {
        get().setToastMessage('Block too short to split');
        return;
      }
      set({ gridBlocks: newBlocks, selectedBlockId: blockId });
    }
  },

  mergeBlocks: (blockId1, blockId2) => {
    const state = get();
    get().saveBlockHistory();
    const merged = mergeBlocks(state.gridBlocks, blockId1, blockId2);
    if (merged !== state.gridBlocks) {
      set({ gridBlocks: merged, selectedBlockId: null, selectedBlockIds: [] });
    } else {
      get().setToastMessage('Merge failed: blocks must form a perfect rectangle');
    }
  },

  deleteBlock: (blockId) => {
    const state = get();
    get().saveBlockHistory();
    const updated = state.gridBlocks.filter(b => b.id !== blockId);
    set({
      gridBlocks: updated,
      selectedBlockId: null,
      selectedBlockIds: [],
    });
  },

  assignSectionToBlock: (blockId, sectionId) => {
    get().saveBlockHistory();
    set((state) => ({
      gridBlocks: state.gridBlocks.map(block =>
        block.id === blockId
          ? { ...block, sectionId: sectionId || undefined, displayMode: sectionId ? 'LOCKED' : 'UNLOCKED' }
          : block
      ),
    }));
  },

  setGridBlocks: (blocks) => set({ gridBlocks: blocks }),

  toggleBlockDisplayMode: (blockId) => set((state) => ({
    gridBlocks: state.gridBlocks.map(block =>
      block.id === blockId
        ? { ...block, displayMode: block.displayMode === 'LOCKED' ? 'UNLOCKED' : 'LOCKED' }
        : block
    ),
  })),

  toggleSeparatorSelection: (separatorId) => {
    set((state) => {
      const newValue = state.selectedSeparatorId === separatorId ? null : separatorId;
      return { selectedSeparatorId: newValue };
    });
  },

  clearSeparatorSelection: () => set({ selectedSeparatorId: null }),

  startEdgeDrag: (edge) => {
    get().saveBlockHistory();
    set({ edgeDragState: { ...edge, active: true } });
  },

  updateEdgeDrag: (newPos: number) => {
    const state = get();
    if (!state.edgeDragState.active) return;

    const { blocks: updated, appliedPos } = applyDragToBlocks(
      state.gridBlocks,
      state.edgeDragState,
      newPos,
      state.containerWidth,
      state.containerHeight
    );

    set({
      gridBlocks: updated,
      edgeDragState: { ...state.edgeDragState, coordinate: appliedPos },
    });
  },

  endEdgeDrag: () => set({
    edgeDragState: { active: false, orientation: 'H', coordinate: 0, affectedA: [], affectedB: [] },
    selectedSeparatorId: null,
  }),

  setContainerDimensions: (width, height) => set({ containerWidth: width, containerHeight: height }),

  saveBlockHistory: () => {
    const { gridBlocks, blockHistory } = get();
    set({
      blockHistory: {
        past: [...blockHistory.past.slice(-29), gridBlocks],
        future: [],
      },
    });
  },

  undoBlocks: () => {
    const { blockHistory, gridBlocks } = get();
    if (blockHistory.past.length === 0) return;
    const previous = blockHistory.past[blockHistory.past.length - 1];
    set({
      blockHistory: {
        past: blockHistory.past.slice(0, -1),
        future: [gridBlocks, ...blockHistory.future],
      },
      gridBlocks: previous,
      selectedBlockId: null,
      selectedBlockIds: [],
    });
  },

  redoBlocks: () => {
    const { blockHistory, gridBlocks } = get();
    if (blockHistory.future.length === 0) return;
    const next = blockHistory.future[0];
    set({
      blockHistory: {
        past: [...blockHistory.past, gridBlocks],
        future: blockHistory.future.slice(1),
      },
      gridBlocks: next,
      selectedBlockId: null,
      selectedBlockIds: [],
    });
  },

  setToastMessage: (msg) => {
    set({ toastMessage: msg });
    if (msg) {
      setTimeout(() => {
        const current = get().toastMessage;
        if (current === msg) set({ toastMessage: null });
      }, 2500);
    }
  },

  saveCustomLayout: async (name) => {
    const { gridBlocks, propertyData } = get();
    console.log('[saveCustomLayout] Saving gridBlocks count:', gridBlocks.length);
    console.log('[saveCustomLayout] gridBlocks sample:', JSON.stringify(gridBlocks.slice(0, 2)));
    if (gridBlocks.length === 0) return false;

    const layoutId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const saved = await supabase.saveListingLayout({
      id: layoutId,
      name,
      type: 'custom',
      grid_blocks: gridBlocks as unknown[],
      section_assignments: {},
      owner_id: propertyData?.owner_id || '',
    });

    if (saved) {
      console.log('[saveCustomLayout] Saved to DB:', saved.id);
      // Refresh layouts list
      await get().loadLayouts();
      return true;
    }
    return false;
  },

  loadCustomLayout: (id) => {
    // Now handled by setLayout which uses availableLayouts from DB
    get().setLayout(id);
  },

  deleteCustomLayout: async (id) => {
    const success = await supabase.deleteListingLayout(id);
    if (success) {
      console.log('[deleteCustomLayout] Deleted from DB:', id);
      // Refresh layouts list
      await get().loadLayouts();

      const state = get();
      if (state.selectedCustomLayoutId === id) {
        set({
          pageConfig: {
            ...state.pageConfig,
            layout: 'list',
          },
          gridBlocks: [],
          selectedBlockId: null,
          selectedBlockIds: [],
          selectedSeparatorId: null,
          selectedCustomLayoutId: null,
        });
      }
    }
  },

  getCustomLayouts: () => {
    return get().availableLayouts as unknown as SavedLayout[];
  },

  getIsLayoutEditing: () => get().isLayoutEditing,
}));
