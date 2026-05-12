import { create } from 'zustand';
import type { PropertyData, PropertyPhoto, PageConfig, Section, SectionType, Theme, Layout, GridBlock } from '../types';
import type { SplitDirection, SavedLayout } from '../types/blocks';
import { THEMES, LAYOUTS, DEFAULT_SECTION_CONTENT, generateId, MAX_CUSTOM_LAYOUTS, CUSTOM_LAYOUT_STORAGE_KEY, DEFAULT_SECTION_TYPES } from '../lib/constants';
import * as supabase from '../services/supabase';
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

  loadProperty: (propertyId: string) => Promise<void>;
  saveConfig: () => Promise<void>;

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

  saveCustomLayout: (name: string) => boolean;
  loadCustomLayout: (id: string) => void;
  deleteCustomLayout: (id: string) => void;
  getCustomLayouts: () => SavedLayout[];

  getTheme: () => Theme | undefined;
  getLayout: () => Layout | undefined;
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
  setSelectedBlock: (blockId) => set({
    selectedBlockId: blockId,
    selectedBlockIds: blockId ? [blockId] : [],
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
        };
      });
    } else {
      // Check if it's a saved custom layout
      try {
        const stored = localStorage.getItem('custom_layouts');
        const layouts: any[] = stored ? JSON.parse(stored) : [];
        const savedLayout = layouts.find(l => l.id === layoutId);
        
        if (savedLayout) {
          // Load the saved custom layout
          set((state) => ({
            pageConfig: { ...state.pageConfig, layout: 'custom' },
            gridBlocks: savedLayout.gridBlocks || [],
            selectedBlockId: null,
            selectedBlockIds: [],
            selectedSeparatorId: null,
          }));
          return;
        }
      } catch (e) {
        console.error('Failed to load custom layout:', e);
      }
      
      // Standard predefined layout
      set((state) => ({
        pageConfig: { ...state.pageConfig, layout: layoutId },
        gridBlocks: [],
        selectedBlockId: null,
        selectedBlockIds: [],
        selectedSeparatorId: null,
      }));
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

  saveCustomLayout: (name) => {
    const { gridBlocks } = get();
    if (gridBlocks.length === 0) return false;

    try {
      const stored = localStorage.getItem(CUSTOM_LAYOUT_STORAGE_KEY);
      const layouts: SavedLayout[] = stored ? JSON.parse(stored) : [];

      if (layouts.length >= MAX_CUSTOM_LAYOUTS) {
        return false;
      }

      const existingIndex = layouts.findIndex(l => l.name === name);
      const now = Date.now();
      const newLayout: SavedLayout = {
        id: existingIndex >= 0 ? layouts[existingIndex].id : `layout_${now}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        gridBlocks,
        createdAt: existingIndex >= 0 ? layouts[existingIndex].createdAt : now,
        updatedAt: now,
      };

      if (existingIndex >= 0) {
        layouts[existingIndex] = newLayout;
      } else {
        layouts.push(newLayout);
      }

      localStorage.setItem(CUSTOM_LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
      return true;
    } catch (e) {
      console.error('Failed to save custom layout:', e);
      return false;
    }
  },

  loadCustomLayout: (id) => {
    try {
      const stored = localStorage.getItem(CUSTOM_LAYOUT_STORAGE_KEY);
      const layouts: SavedLayout[] = stored ? JSON.parse(stored) : [];
      const layout = layouts.find(l => l.id === id);

      if (!layout) return;

      set((state) => ({
        pageConfig: {
          ...state.pageConfig,
          layout: 'custom',
        },
        gridBlocks: (layout as any).gridBlocks || [],
      }));
    } catch (e) {
      console.error('Failed to load custom layout:', e);
    }
  },

  deleteCustomLayout: (id) => {
    try {
      const stored = localStorage.getItem(CUSTOM_LAYOUT_STORAGE_KEY);
      const layouts: SavedLayout[] = stored ? JSON.parse(stored) : [];
      const newLayouts = layouts.filter(l => l.id !== id);
      localStorage.setItem(CUSTOM_LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));

      const state = get();
      if (state.gridBlocks.length > 0) {
        set((s) => ({
          pageConfig: {
            ...s.pageConfig,
            layout: 'list',
          },
          gridBlocks: [],
          selectedBlockId: null,
          selectedBlockIds: [],
          selectedSeparatorId: null,
        }));
      }
    } catch (e) {
      console.error('Failed to delete custom layout:', e);
    }
  },

  getCustomLayouts: () => {
    try {
      const stored = localStorage.getItem(CUSTOM_LAYOUT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to get custom layouts:', e);
      return [];
    }
  },
}));
