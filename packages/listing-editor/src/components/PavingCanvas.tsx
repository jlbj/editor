import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Scissors, Merge, Info, Undo2, Redo2 } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { SECTION_TYPES, SECTION_LIBRARY } from '../lib/constants';
import type { SectionStyle, SectionType } from '../types/index';


// --- Constants ---
const FRAME_WIDTH = 800;
const TARGET_VIEW_HEIGHT = 600;
const MIN_SIZE = FRAME_WIDTH / 16;
const DELETE_THRESHOLD = 15;
const SNAP_THRESHOLD = 10;
const BORDER_HIT_AREA = 8;
const EPSILON = 1;

// --- Types ---
type DisplayMode = 'LOCKED' | 'UNLOCKED';

const generateBlockId = () => 'blk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

interface BlockSection {
  id: string;
  color: string;
  type: SectionType;
  requestedWidth: number;
  requestedHeight: number;
  displayMode: DisplayMode;
  style?: SectionStyle;
}

interface PavingBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  section: BlockSection;
}

interface ActiveEdge {
  orientation: 'V' | 'H';
  coordinate: number;
  affectedA: string[];
  affectedB: string[];
}

interface History {
  past: PavingBlock[][];
  future: PavingBlock[][];
}

// --- Helper: refresh layout positions (collapse gaps between rows) ---
function refreshLayoutPositions(currentBlocks: PavingBlock[]): PavingBlock[] {
  if (currentBlocks.length === 0) return [];
  const sorted = [...currentBlocks].sort((a, b) => a.y - b.y || a.x - b.x);
  const segments: { y: number; h: number; blockIds: string[] }[] = [];
  sorted.forEach(block => {
    const segment = segments.find(s => Math.abs(s.y - block.y) < EPSILON);
    if (segment) {
      segment.blockIds.push(block.id);
      segment.h = Math.max(segment.h, block.h);
    } else {
      segments.push({ y: block.y, h: block.h, blockIds: [block.id] });
    }
  });

  let currentY = 0;
  const updated = [...currentBlocks];
  segments.forEach(seg => {
    seg.blockIds.forEach(id => {
      const bIdx = updated.findIndex(b => b.id === id);
      updated[bIdx] = { ...updated[bIdx], y: currentY, h: seg.h };
    });
    currentY += seg.h;
  });
  return updated;
}

// --- Main Component ---
export function PavingCanvas() {
  const [blocks, setBlocks] = useState<PavingBlock[]>([]);
  const [history, setHistory] = useState<History>({ past: [], future: [] });
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [activeEdge, setActiveEdge] = useState<ActiveEdge | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const setStoreSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const setGridBlocks = useEditorStore((s) => s.setGridBlocks);
  const storeGridBlocks = useEditorStore((s) => s.gridBlocks);
  const storeSections = useEditorStore((s) => s.pageConfig.sections);
  const isLayoutEditing = useEditorStore((s) => s.isLayoutEditing);

  const blocksRef = useRef<PavingBlock[]>(blocks);
  blocksRef.current = blocks;
  const localBlockIdsRef = useRef<Set<string>>(new Set());
  localBlockIdsRef.current = new Set(blocks.map(b => b.id));

  // Sync local blocks to store so assignSectionToBlock can match by ID
  const syncToStore = (currentBlocks: PavingBlock[]) => {
    setGridBlocks(currentBlocks.map(b => ({
      id: b.id,
      sectionId: b.section.id !== 'S0' ? b.section.id : undefined,
      row: 0,
      col: 0,
      bounds: { top: b.y, left: b.x, right: b.x + b.w, bottom: b.y + b.h },
      displayMode: b.section.displayMode,
    })));
  };

  // After every blocks change, sync positions to store
  useEffect(() => {
    if (blocks.length > 0) {
      syncToStore(blocks);
    }
  }, [blocks]);

  // Watch for store gridBlocks section changes (from sidebar assignment)
  useEffect(() => {
    setBlocks(prev => {
      let changed = false;
      const next: PavingBlock[] = prev.map(b => {
        const gb = storeGridBlocks.find(g => g.id === b.id);
        if (gb?.sectionId && gb.sectionId !== b.section.id) {
          changed = true;
          const section = storeSections.find(s => s.id === gb.sectionId);
          const libItem = SECTION_LIBRARY.find(item => item.type === section?.type);
          return {
            ...b,
            section: {
              ...b.section,
              id: gb.sectionId,
              color: libItem?.color || '#3b82f6',
              displayMode: 'LOCKED' as DisplayMode,
              requestedWidth: (section?.content as any)?.requestedWidth || 0,
              requestedHeight: (section?.content as any)?.requestedHeight || 0,
              style: section?.style || {},
            },
          };
        }
        if (gb && !gb.sectionId && b.section.id !== 'S0') {
          changed = true;
          return {
            ...b,
            section: { ...b.section, id: 'S0', color: '#1e293b', type: 'ADAPTIVE' as SectionType, displayMode: 'UNLOCKED' as DisplayMode, style: {} },
          };
        }
        return b;
      });
      return changed ? next : prev;
    });
  }, [storeGridBlocks, storeSections]);

  // Re-initialize from store gridBlocks when a custom layout is loaded (IDs don't match local)
  useEffect(() => {
    if (storeGridBlocks.length > 0) {
      const storeIds = new Set(storeGridBlocks.map(gb => gb.id));
      const anyMatch = [...storeIds].some(id => localBlockIdsRef.current.has(id));
      if (!anyMatch && localBlockIdsRef.current.size > 0) {
        setBlocks(storeGridBlocks.map(gb => {
          const section = gb.sectionId ? storeSections.find(s => s.id === gb.sectionId) : null;
          const sectionType: SectionType = section ? section.type : 'ADAPTIVE';
          const libItem = section ? SECTION_LIBRARY.find(item => item.type === sectionType) : null;
          return {
            id: gb.id,
            x: gb.bounds.left,
            y: gb.bounds.top,
            w: gb.bounds.right - gb.bounds.left,
            h: gb.bounds.bottom - gb.bounds.top,
            section: {
              id: gb.sectionId || 'S0',
              color: section ? libItem?.color || '#3b82f6' : '#1e293b',
              type: sectionType,
              requestedWidth: section ? (section.content as any)?.requestedWidth || 0 : 0,
              requestedHeight: section ? (section.content as any)?.requestedHeight || 0 : 0,
              displayMode: (gb.sectionId ? 'LOCKED' : 'UNLOCKED') as DisplayMode,
              style: section?.style || {},
            },
          };
        }));
      }
    }
  }, [storeGridBlocks, storeSections]);

  const getSectionName = (block: PavingBlock): string | null => {
    const gb = storeGridBlocks.find(g => g.id === block.id);
    if (gb?.sectionId) {
      const section = storeSections.find(s => s.id === gb.sectionId);
      if (section) {
        const info = SECTION_TYPES.find(st => st.type === section.type);
        return info ? `${info.icon} ${info.label}` : section.type;
      }
    }
    return null;
  };


  // Initialize 4 equal rows on mount
  useEffect(() => {
    const initialH = TARGET_VIEW_HEIGHT / 4;
    const init: PavingBlock[] = Array.from({ length: 4 }).map((_, i) => ({
      id: generateBlockId(),
      x: 0,
      y: i * initialH,
      w: FRAME_WIDTH,
      h: initialH,
      section: {
        id: 'S0',
        color: '#1e293b',
        type: 'ADAPTIVE',
        requestedWidth: 200,
        requestedHeight: 150,
        displayMode: 'UNLOCKED',
      },
    }));
    setBlocks(init);
  }, []);

  // --- History ---
  const saveHistory = (currentBlocks: PavingBlock[]) => {
    setHistory(prev => ({ past: [...prev.past, currentBlocks], future: [] }));
  };

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory({ past: history.past.slice(0, -1), future: [blocks, ...history.future] });
    setBlocks(previous);
    setSelectedBlockIds([]);
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory({ past: [...history.past, blocks], future: history.future.slice(1) });
    setBlocks(next);
    setSelectedBlockIds([]);
  };

  // --- Split Vertical (left/right) ---
  const handleSplitV = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    const target = blocks[idx];
    if (target.w < MIN_SIZE * 2) {
      setMessage(`Block too narrow to split (min ${MIN_SIZE}px)`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    saveHistory(blocks);
    const halfW = Math.round(target.w / 2);
    const newBlock: PavingBlock = {
      ...target,
      id: generateBlockId(),
      x: target.x + halfW,
      w: target.w - halfW,
      section: { ...target.section, id: 'S0', color: '#1e293b', type: 'ADAPTIVE', displayMode: 'UNLOCKED' },
    };
    const updated = [...blocks];
    updated[idx] = { ...target, w: halfW };
    updated.splice(idx + 1, 0, newBlock);
    setBlocks(updated);
  };

  // --- Split Horizontal (top/bottom) ---
  const handleSplitH = (id: string) => {
    const idx = blocks.findIndex(b => b.id === id);
    const target = blocks[idx];
    if (target.h < MIN_SIZE * 2) {
      setMessage(`Block too short to split (min ${MIN_SIZE}px)`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    saveHistory(blocks);
    const halfH = Math.round(target.h / 2);
    const newBlock: PavingBlock = {
      ...target,
      id: generateBlockId(),
      y: target.y + halfH,
      h: target.h - halfH,
      section: { ...target.section, id: 'S0', color: '#1e293b', type: 'ADAPTIVE', displayMode: 'UNLOCKED' },
    };
    const updated = [...blocks];
    updated[idx] = { ...target, h: halfH };
    updated.splice(idx + 1, 0, newBlock);
    setBlocks(updated);
  };

  // --- Merge two selected blocks ---
  const handleMerge = () => {
    if (selectedBlockIds.length !== 2) return;
    const b1 = blocks.find(b => b.id === selectedBlockIds[0])!;
    const b2 = blocks.find(b => b.id === selectedBlockIds[1])!;
    const touchX = Math.abs(b1.x + b1.w - b2.x) < EPSILON || Math.abs(b2.x + b2.w - b1.x) < EPSILON;
    const touchY = Math.abs(b1.y + b1.h - b2.y) < EPSILON || Math.abs(b2.y + b2.h - b1.y) < EPSILON;
    const overlapY = Math.max(b1.y, b2.y) < Math.min(b1.y + b1.h, b2.y + b2.h);
    const overlapX = Math.max(b1.x, b2.x) < Math.min(b1.x + b1.w, b2.x + b2.w);
    const adjacent = (touchX && overlapY) || (touchY && overlapX);
    const newX = Math.min(b1.x, b2.x), newY = Math.min(b1.y, b2.y);
    const newW = Math.max(b1.x + b1.w, b2.x + b2.w) - newX, newH = Math.max(b1.y + b1.h, b2.y + b2.h) - newY;
    const areaSum = (b1.w * b1.h) + (b2.w * b2.h);
    if (!adjacent || Math.abs(areaSum - (newW * newH)) > 10) {
      setMessage('Merge failed: Blocks must form a perfect rectangle.');
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    saveHistory(blocks);
    const merged: PavingBlock = {
      id: generateBlockId(),
      x: newX,
      y: newY,
      w: newW,
      h: newH,
      section: { ...b1.section },
    };
    setBlocks(refreshLayoutPositions([...blocks.filter(b => !selectedBlockIds.includes(b.id)), merged]));
    setSelectedBlockIds([]);
  };

  // --- Edge drag: mousedown ---
  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (const b of blocks) {
      // Check vertical edges (right side of blocks)
      if (Math.abs(mx - (b.x + b.w)) < BORDER_HIT_AREA && my >= b.y && my <= b.y + b.h && b.x + b.w < FRAME_WIDTH) {
        saveHistory(blocks);
        setActiveEdge({
          orientation: 'V',
          coordinate: b.x + b.w,
          affectedA: blocks.filter(bl => Math.abs(bl.x + bl.w - (b.x + b.w)) < EPSILON).map(bl => bl.id),
          affectedB: blocks.filter(bl => Math.abs(bl.x - (b.x + b.w)) < EPSILON).map(bl => bl.id),
        });
        return;
      }
      // Check horizontal edges (bottom side of blocks)
      if (Math.abs(my - (b.y + b.h)) < BORDER_HIT_AREA && mx >= b.x && mx <= b.x + b.w) {
        saveHistory(blocks);
        setActiveEdge({
          orientation: 'H',
          coordinate: b.y + b.h,
          affectedA: blocks.filter(bl => Math.abs(bl.y + bl.h - (b.y + b.h)) < EPSILON).map(bl => bl.id),
          affectedB: blocks.filter(bl => Math.abs(bl.y - (b.y + b.h)) < EPSILON).map(bl => bl.id),
        });
        return;
      }
    }
  };

  // --- Edge drag: mousemove ---
  const onMouseMove = (e: React.MouseEvent) => {
    if (!activeEdge || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawPos = activeEdge.orientation === 'V' ? e.clientX - rect.left : e.clientY - rect.top;

    let pos = rawPos;

    // Sticky Alignment: snap to existing boundaries
    const snapPoints = new Set<number>();
    if (activeEdge.orientation === 'V') {
      snapPoints.add(0);
      snapPoints.add(FRAME_WIDTH);
      blocks.forEach(b => {
        snapPoints.add(b.x);
        snapPoints.add(b.x + b.w);
      });
    } else {
      snapPoints.add(0);
      blocks.forEach(b => {
        snapPoints.add(b.y);
        snapPoints.add(b.y + b.h);
      });
    }

    for (const point of snapPoints) {
      if (Math.abs(pos - point) < SNAP_THRESHOLD) {
        pos = point;
        break;
      }
    }

    // Constraints & Clamping
    const initialCoord = activeEdge.coordinate;
    const checkClamping = (blockIds: string[], type: 'A' | 'B') => {
      for (const id of blockIds) {
        const b = blocks.find(x => x.id === id);
        if (!b) continue;
        let newDim: number;
        if (type === 'A') {
          newDim = (activeEdge.orientation === 'V' ? b.w : b.h) + (pos - initialCoord);
        } else {
          newDim = (activeEdge.orientation === 'V' ? b.w : b.h) - (pos - initialCoord);
        }

        if (newDim < MIN_SIZE && newDim > DELETE_THRESHOLD) {
          const limit = type === 'A'
            ? (activeEdge.orientation === 'V' ? b.x + MIN_SIZE : b.y + MIN_SIZE)
            : (activeEdge.orientation === 'V' ? (b.x + b.w) - MIN_SIZE : (b.y + b.h) - MIN_SIZE);
          pos = limit;
        } else if (newDim <= DELETE_THRESHOLD) {
          const limit = type === 'A'
            ? (activeEdge.orientation === 'V' ? b.x : b.y)
            : (activeEdge.orientation === 'V' ? b.x + b.w : b.y + b.h);
          pos = limit;
        }
      }
    };

    checkClamping(activeEdge.affectedA, 'A');
    checkClamping(activeEdge.affectedB, 'B');

    const delta = pos - activeEdge.coordinate;
    setBlocks(prev => {
      const next = prev.map(b => {
        if (activeEdge.affectedA.includes(b.id)) {
          return activeEdge.orientation === 'V' ? { ...b, w: b.w + delta } : { ...b, h: b.h + delta };
        }
        if (activeEdge.affectedB.includes(b.id)) {
          return activeEdge.orientation === 'V' ? { ...b, x: b.x + delta, w: b.w - delta } : { ...b, y: b.y + delta, h: b.h - delta };
        }
        return b;
      });
      const kept = next.filter(b => b.w > 2 && b.h > 2);
      return kept.length !== next.length ? refreshLayoutPositions(kept) : next;
    });
    setActiveEdge(prev => prev ? { ...prev, coordinate: pos } : null);
  };

  return (
    <div className="paving-engine">
      {/* Toast */}
      {message && (
        <div className="paving-toast">
          <Info size={18} /> {message}
        </div>
      )}

      <div className="paving-body">
        <div className="paving-canvas-wrapper">
          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => setActiveEdge(null)}
            onMouseLeave={() => setActiveEdge(null)}
            className="paving-canvas"
            style={{
              width: FRAME_WIDTH,
              minWidth: FRAME_WIDTH,
              height: '100%',
              cursor: activeEdge ? (activeEdge.orientation === 'V' ? 'col-resize' : 'row-resize') : 'default',
            }}
          >
            {blocks.map(block => {
              const isLocked = block.section.id !== 'S0' && block.section.displayMode === 'LOCKED';
              return (
                <div
                  key={block.id}
                  onClick={() => {
                    const isSelected = selectedBlockIds.includes(block.id);
                    const newIds = isSelected ? selectedBlockIds.filter(i => i !== block.id) : [...selectedBlockIds, block.id];
                    setSelectedBlockIds(newIds);
                    setStoreSelectedBlock(newIds.length === 1 ? block.id : null);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const libSection = JSON.parse(e.dataTransfer.getData('section'));
                    saveHistory(blocks);
                    setBlocks(prev => prev.map(b => b.id === block.id ? {
                      ...b,
                      section: {
                        id: libSection.id,
                        color: libSection.color,
                        type: libSection.type,
                        requestedWidth: libSection.rW,
                        requestedHeight: libSection.rH,
                        displayMode: libSection.id === 'S0' ? 'UNLOCKED' : 'LOCKED',
                      },
                    } : b));
                  }}
                  className={`paving-block ${selectedBlockIds.includes(block.id) ? 'selected' : ''}`}
                  style={{ left: block.x, top: block.y, width: block.w, height: block.h }}
                >
                  {block.section.id !== 'S0' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveHistory(blocks);
                        setBlocks(prev => prev.map(b => b.id === block.id
                          ? { ...b, section: { ...b.section, displayMode: isLocked ? 'UNLOCKED' : 'LOCKED' } }
                          : b
                        ));
                      }}
                      className="paving-lock-btn"
                    >
                      {isLocked ? <Lock size={12} className="text-lock" /> : <Unlock size={12} className="text-unlock" />}
                    </button>
                  )}

                  <div className="paving-block-inner">
                    <div
                      className="paving-block-fill"
                      data-default={block.section.id === 'S0'}
                      style={
                        block.section.id === 'S0'
                          ? { width: '100%', height: '100%', backgroundColor: '#f1f5f9' }
                          : isLocked
                            ? {
                                width: block.section.requestedWidth,
                                height: block.section.requestedHeight,
                                backgroundColor: block.section.color,
                                backgroundImage: block.section.style?.backgroundImage || undefined,
                                backgroundSize: block.section.style?.backgroundImage ? 'cover' : undefined,
                                backgroundPosition: block.section.style?.backgroundImage ? 'center' : undefined,
                                borderRadius: '4px',
                                flexShrink: 0,
                              }
                            : { width: '100%', height: '100%', backgroundColor: block.section.color }
                      }
                    >
                      <div className="paving-block-label-wrapper">
                        <span className="paving-block-label">
                          {block.section.id === 'S0' ? '' : block.section.id}
                        </span>
                        {getSectionName(block) && (
                          <span className="paving-block-section-name">{getSectionName(block)}</span>
                        )}
                      </div>
                    </div>

                    <div className="paving-block-overlay">
                      <button onClick={(e) => { e.stopPropagation(); handleSplitV(block.id); }} className="paving-split-btn">
                        <Scissors size={14} className="paving-icon-rotated" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleSplitH(block.id); }} className="paving-split-btn">
                        <Scissors size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Small right sidebar with undo/redo/merge - only show when editing layout */}
        {isLayoutEditing && (
        <div className="paving-toolbar-sidebar">
          <div className="paving-toolbar-group">
            <button
              onClick={undo}
              disabled={history.past.length === 0}
              title="Undo"
              className={`paving-toolbar-btn ${history.past.length > 0 ? 'active' : ''}`}
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={history.future.length === 0}
              title="Redo"
              className={`paving-toolbar-btn ${history.future.length > 0 ? 'active' : ''}`}
            >
              <Redo2 size={18} />
            </button>
          </div>
          <button
            onClick={handleMerge}
            disabled={selectedBlockIds.length !== 2}
            title="Merge selected blocks"
            className={`paving-toolbar-btn merge ${selectedBlockIds.length === 2 ? 'ready' : ''}`}
          >
            <Merge size={18} />
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
