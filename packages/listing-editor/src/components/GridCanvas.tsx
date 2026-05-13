import { useMemo, useCallback, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { computeSeparators } from '../lib/grid-utils';
import { SectionRenderer } from './SectionRenderer';
import type { Theme } from '../types';

const MIN_SIZE = 50;

export function GridCanvas() {
  const containerWidth = useEditorStore((s) => s.containerWidth);
  const gridBlocks = useEditorStore((s) => s.gridBlocks);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const selectedSeparatorId = useEditorStore((s) => s.selectedSeparatorId);
  const getTheme = useEditorStore((s) => s.getTheme);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const toggleBlockSelection = useEditorStore((s) => s.toggleBlockSelection);
  const clearBlockSelection = useEditorStore((s) => s.clearBlockSelection);
  const splitBlock = useEditorStore((s) => s.splitBlock);
  const mergeBlocks = useEditorStore((s) => s.mergeBlocks);
  const setGridBlocks = useEditorStore((s) => s.setGridBlocks);
  const toggleSeparatorSelection = useEditorStore((s) => s.toggleSeparatorSelection);
  const clearSeparatorSelection = useEditorStore((s) => s.clearSeparatorSelection);

  const theme: Theme | undefined = getTheme();

  const separators = useMemo(
    () => computeSeparators(gridBlocks, containerWidth),
    [gridBlocks, containerWidth]
  );

  useEffect(() => {
    if (!selectedSeparatorId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('.editor-canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const blocks = gridBlocks.map(b => ({ ...b, bounds: { ...b.bounds } }));
      const sep = separators.find(s => s.id === selectedSeparatorId);
      if (!sep) return;

      if (sep.orientation === 'horizontal') {
        blocks.forEach(block => {
          if (block.bounds.left < sep.position && block.bounds.right > sep.position) {
            if (block.bounds.top === sep.bounds.top) {
              block.bounds.bottom = y;
            } else if (block.bounds.bottom === sep.bounds.top) {
              block.bounds.top = y;
            }
          }
        });
      } else {
        blocks.forEach(block => {
          if (block.bounds.top < sep.position && block.bounds.bottom > sep.position) {
            if (block.bounds.left === sep.bounds.left) {
              block.bounds.right = x;
            } else if (block.bounds.right === sep.bounds.left) {
              block.bounds.left = x;
            }
          }
        });
      }

      const filtered = blocks.filter(b => 
        (b.bounds.right - b.bounds.left) >= MIN_SIZE && 
        (b.bounds.bottom - b.bounds.top) >= MIN_SIZE
      );

      setGridBlocks(filtered);
    };

    const handleMouseUp = () => {
      clearSeparatorSelection();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedSeparatorId, gridBlocks, separators, setGridBlocks, clearSeparatorSelection]);

  const handleBlockClick = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.shiftKey) {
        toggleBlockSelection(blockId);
      } else {
        clearBlockSelection();
        setSelectedBlock(blockId);
      }
    },
    [setSelectedBlock, toggleBlockSelection, clearBlockSelection]
  );

  const canMerge = selectedBlockIds.length === 2;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#f8fafc',
      }}
    >
      {gridBlocks.map((block) => {
        const sectionData = useEditorStore((s) =>
          block.sectionId
            ? s.pageConfig.sections.find((sec) => sec.id === block.sectionId)
            : undefined
        );
        
        const width = block.bounds.right - block.bounds.left;
        const height = block.bounds.bottom - block.bounds.top;
        
        return (
          <div
            key={block.id}
            onClick={(e) => handleBlockClick(block.id, e)}
            style={{
              position: 'absolute',
              top: block.bounds.top,
              left: block.bounds.left,
              width,
              height,
              outline: block.id === selectedBlockId
                ? '2px solid #3b82f6'
                : selectedBlockIds.includes(block.id)
                ? '2px dashed #3b82f6'
                : undefined,
              outlineOffset: '-1px',
              borderRadius: '4px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'outline 0.15s ease',
            }}
          >
            {sectionData ? (
              <SectionRenderer section={sectionData} theme={theme} blockId={block.id} />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '14px',
                  background: '#f8fafc',
                }}
              >
                Empty block
              </div>
            )}
          </div>
        );
      })}

      {separators.map((separator) => {
        const isHorizontal = separator.orientation === 'horizontal';
        const top = isHorizontal ? separator.position - 4 : separator.bounds.top;
        const left = isHorizontal ? separator.bounds.left : separator.position - 4;
        const width = isHorizontal ? separator.bounds.right - separator.bounds.left : 8;
        const height = isHorizontal ? 8 : separator.bounds.bottom - separator.bounds.top;

        return (
          <div
            key={separator.id}
            onClick={(e) => {
              e.stopPropagation();
              toggleSeparatorSelection(separator.id);
            }}
            style={{
              position: 'absolute',
              top,
              left,
              width,
              height,
              cursor: isHorizontal ? 'ns-resize' : 'ew-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              background: separator.id === selectedSeparatorId ? 'rgba(59, 130, 246, 0.4)' : 'transparent',
              borderRadius: separator.id === selectedSeparatorId ? '4px' : '0',
              borderTop: isHorizontal && separator.id !== selectedSeparatorId ? '2px dashed #3b82f6' : undefined,
              borderBottom: isHorizontal && separator.id !== selectedSeparatorId ? '2px dashed #3b82f6' : undefined,
              borderLeft: !isHorizontal && separator.id !== selectedSeparatorId ? '2px dashed #3b82f6' : undefined,
              borderRight: !isHorizontal && separator.id !== selectedSeparatorId ? '2px dashed #3b82f6' : undefined,
            }}
          >
            {separator.id === selectedSeparatorId && (
              <div
                style={{
                  width: isHorizontal ? '48px' : '6px',
                  height: isHorizontal ? '6px' : '48px',
                  background: '#3b82f6',
                  borderRadius: '3px',
                }}
              />
            )}
          </div>
        );
      })}

      {selectedBlockId && (() => {
        const block = gridBlocks.find((b) => b.id === selectedBlockId);
        if (!block) return null;
        const width = block.bounds.right - block.bounds.left;
        const height = block.bounds.bottom - block.bounds.top;
        return (
          <div
            style={{
              position: 'absolute',
              top: block.bounds.top + height / 2 - 25,
              left: block.bounds.left + width / 2 - 80,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 30,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                splitBlock(selectedBlockId, 'vertical');
              }}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Split V
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                splitBlock(selectedBlockId, 'horizontal');
              }}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Split H
            </button>
          </div>
        );
      })()}

      {canMerge && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'flex',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 30,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              mergeBlocks(selectedBlockIds[0], selectedBlockIds[1]);
            }}
            style={{
              padding: '6px 12px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            MERGE
          </button>
        </div>
      )}
    </div>
  );
}