import type { Section } from './index';

export interface GridBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export type DisplayMode = 'LOCKED' | 'UNLOCKED';

export interface GridBlock {
  id: string;
  sectionId?: string;
  bounds: GridBounds;
  row: number;
  col: number;
  displayMode?: DisplayMode;
}

export type SplitDirection = 'horizontal' | 'vertical';

export interface Block {
  id: string;
  children?: Block[];
  direction?: SplitDirection;
  sectionId?: string;
  flex: number;
  height?: number;
  width?: number;
}

export function createGridBlock(sectionId?: string): GridBlock {
  return {
    id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sectionId,
    bounds: { top: 0, left: 0, right: 0, bottom: 0 },
    row: 0,
    col: 0,
  };
}

export function createBlock(overrides?: Partial<Block>): Block {
  return {
    id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    flex: 1,
    ...overrides,
  };
}

export function createRootBlock(sectionIds: string[]): Block {
  if (sectionIds.length === 0) {
    return createBlock();
  }
  if (sectionIds.length === 1) {
    return createBlock({ sectionId: sectionIds[0] });
  }
  return createBlock({
    direction: 'vertical',
    children: sectionIds.map((sid) => createBlock({ sectionId: sid })),
  });
}

export interface SavedLayout {
  id: string;
  name: string;
  rootBlock?: Block;
  gridBlocks?: GridBlock[];
  sections?: Section[];
  createdAt: number;
  updatedAt: number;
}
