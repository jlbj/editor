import { useState, useRef } from 'react';
import type { Block, Theme } from '../types';
import { useEditorStore } from '../store/useEditorStore';
import { SectionRenderer } from './SectionRenderer';
import { DEFAULT_BLOCK_HEIGHT } from '../lib/constants';

interface BlockRendererProps {
  block: Block;
  theme?: Theme;
  isRoot?: boolean;
  isRootChild?: boolean;
}

export function BlockRenderer({ block, theme, isRoot, isRootChild }: BlockRendererProps) {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock);
  const toggleBlockSelection = useEditorStore((s) => s.toggleBlockSelection);
  const clearBlockSelection = useEditorStore((s) => s.clearBlockSelection);
  const setSelectedSection = useEditorStore((s) => s.setSelectedSection);
  const splitBlock = useEditorStore((s) => s.splitBlock);
  const assignSectionToBlock = useEditorStore((s) => s.assignSectionToBlock);
  
  const isSelected = selectedBlockId === block.id;
  const isMultiSelected = selectedBlockIds.includes(block.id);
  
  const [isResizing, setIsResizing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('text/plain')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOver(true);
    }
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const sectionId = e.dataTransfer.getData('text/plain');
    if (sectionId) {
      if (block.sectionId === sectionId) {
        assignSectionToBlock(block.id, '');
      } else {
        assignSectionToBlock(block.id, sectionId);
        setSelectedSection(sectionId);
      }
    }
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      toggleBlockSelection(block.id);
    } else {
      clearBlockSelection();
      setSelectedBlock(block.id);
    }
  };

  if (block.children && block.direction) {
    const children = block.children;

    if (isRoot) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            alignItems: 'stretch',
          }}
        >
          {children.map((child, childIndex) => (
            <div
              key={child.id}
              style={{
                flex: 'none',
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                height: child.height ? `${child.height}px` : 'auto',
              }}
            >
              <BlockRenderer
                block={child}
                theme={theme}
                isRootChild
              />
              {childIndex < children.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '8px',
                    zIndex: 10,
                    cursor: 'row-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                    const startY = e.clientY;
                    const startHeight = (children[childIndex].height || DEFAULT_BLOCK_HEIGHT) + (children[childIndex + 1].height || DEFAULT_BLOCK_HEIGHT);
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const state = useEditorStore.getState();
                      const totalHeight = startHeight;
                      const firstHeight = Math.max(50, Math.min(totalHeight - 50, (children[childIndex].height || DEFAULT_BLOCK_HEIGHT) + (moveEvent.clientY - startY)));
                      const secondHeight = totalHeight - firstHeight;
                      const updateInTree = (b: Block): Block => {
                        if (b.children) {
                          const newChildren = b.children.map((c, i) => {
                            if (i === childIndex) return { ...c, height: firstHeight };
                            if (i === childIndex + 1) return { ...c, height: secondHeight };
                            return c;
                          });
                          return { ...b, children: newChildren };
                        }
                        return b;
                      };
                      const rootBlock = state.pageConfig.rootBlock ? updateInTree(state.pageConfig.rootBlock) : undefined;
                      useEditorStore.setState({ pageConfig: { ...state.pageConfig, rootBlock } });
                    };
                    const handleMouseUp = () => {
                      setIsResizing(false);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: isResizing ? '#3b82f6' : '#e2e8f0',
                    borderRadius: '2px',
                    transition: 'background 0.2s',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    const isRow = block.direction === 'horizontal';

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: isRow ? 'row' : 'column',
          minHeight: 0,
          minWidth: 0,
          flex: 1,
          gap: isRow ? '0' : '0',
          position: 'relative',
        }}
      >
        {children.map((child, childIndex) => (
          <div
            key={child.id}
            style={{
              flex: 1,
              display: 'flex',
              minWidth: 0,
              minHeight: 0,
              position: 'relative',
            }}
          >
            <BlockRenderer block={child} theme={theme} />
            {childIndex < children.length - 1 && (
              isRow ? (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '8px',
                    zIndex: 10,
                    cursor: 'col-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                    const startX = e.clientX;
                    const startWidths = [
                      children[childIndex].width || 100,
                      children[childIndex + 1].width || 100,
                    ];
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const state = useEditorStore.getState();
                      const totalWidth = startWidths[0] + startWidths[1];
                      const firstWidth = Math.max(50, Math.min(totalWidth - 50, startWidths[0] + (moveEvent.clientX - startX)));
                      const secondWidth = totalWidth - firstWidth;
                      const updateInTree = (b: Block): Block => {
                        if (b.id === block.id && b.children) {
                          const newChildren = b.children.map((c, i) => {
                            if (i === childIndex) return { ...c, width: firstWidth };
                            if (i === childIndex + 1) return { ...c, width: secondWidth };
                            return c;
                          });
                          return { ...b, children: newChildren };
                        }
                        if (b.children) {
                          return { ...b, children: b.children.map(updateInTree) };
                        }
                        return b;
                      };
                      const rootBlock = state.pageConfig.rootBlock ? updateInTree(state.pageConfig.rootBlock) : undefined;
                      useEditorStore.setState({ pageConfig: { ...state.pageConfig, rootBlock } });
                    };
                    const handleMouseUp = () => {
                      setIsResizing(false);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div style={{
                    height: '100%',
                    width: '4px',
                    background: isResizing ? '#3b82f6' : '#e2e8f0',
                    borderRadius: '2px',
                    transition: 'background 0.2s',
                  }} />
                </div>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '8px',
                    zIndex: 10,
                    cursor: 'row-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                    const startY = e.clientY;
                    const startHeights = [
                      children[childIndex].height || DEFAULT_BLOCK_HEIGHT,
                      children[childIndex + 1].height || DEFAULT_BLOCK_HEIGHT,
                    ];
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const state = useEditorStore.getState();
                      const totalHeight = startHeights[0] + startHeights[1];
                      const firstHeight = Math.max(50, Math.min(totalHeight - 50, startHeights[0] + (moveEvent.clientY - startY)));
                      const secondHeight = totalHeight - firstHeight;
                      const updateInTree = (b: Block): Block => {
                        if (b.id === block.id && b.children) {
                          const newChildren = b.children.map((c, i) => {
                            if (i === childIndex) return { ...c, height: firstHeight };
                            if (i === childIndex + 1) return { ...c, height: secondHeight };
                            return c;
                          });
                          return { ...b, children: newChildren };
                        }
                        if (b.children) {
                          return { ...b, children: b.children.map(updateInTree) };
                        }
                        return b;
                      };
                      const rootBlock = state.pageConfig.rootBlock ? updateInTree(state.pageConfig.rootBlock) : undefined;
                      useEditorStore.setState({ pageConfig: { ...state.pageConfig, rootBlock } });
                    };
                    const handleMouseUp = () => {
                      setIsResizing(false);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: isResizing ? '#3b82f6' : '#e2e8f0',
                    borderRadius: '2px',
                    transition: 'background 0.2s',
                  }} />
                </div>
              )
            )}
          </div>
        ))}
      </div>
    );
  }

  const section = block.sectionId
    ? useEditorStore.getState().pageConfig.sections.find((s) => s.id === block.sectionId)
    : undefined;

  const blockStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: block.height ? `${block.height}px` : (section ? 'auto' : '187px'),
    minWidth: 0,
    height: block.height ? `${block.height}px` : (section ? 'auto' : undefined),
    flex: section ? 'none' : 1,
    outline: isSelected ? '2px solid #3b82f6' : isMultiSelected ? '2px dashed #3b82f6' : dragOver ? '2px solid #3b82f6' : undefined,
    outlineOffset: '-1px',
    borderRadius: '4px',
    background: dragOver ? 'rgba(59,130,246,0.05)' : undefined,
  };

  if (isRootChild || !isRoot) {
    if (section) {
      return (
        <div
          ref={blockRef}
          style={blockStyle}
          onClick={handleBlockClick}
          onMouseEnter={() => setDragOver(false)}
          onMouseLeave={() => setDragOver(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '4px 8px',
              background: isSelected ? '#3b82f6' : '#64748b',
              color: '#fff',
              fontSize: '11px',
              display: 'flex',
              gap: '8px',
              zIndex: 20,
              borderRadius: '4px 4px 0 0',
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                splitBlock(block.id, 'vertical');
              }}
              style={{ cursor: 'pointer' }}
            >
              Split V
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                splitBlock(block.id, 'horizontal');
              }}
              style={{ cursor: 'pointer' }}
            >
              Split H
            </span>
          </div>
          <SectionRenderer section={section} theme={theme} blockId={block.id} />
        </div>
      );
    }

    return (
      <div
        ref={blockRef}
        style={blockStyle}
        onClick={handleBlockClick}
        onMouseEnter={() => setDragOver(false)}
        onMouseLeave={() => setDragOver(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '4px 8px',
              background: '#3b82f6',
              color: '#fff',
              fontSize: '11px',
              display: 'flex',
              gap: '8px',
              zIndex: 20,
              borderRadius: '4px 4px 0 0',
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                splitBlock(block.id, 'vertical');
              }}
              style={{ cursor: 'pointer' }}
            >
              Split V
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                splitBlock(block.id, 'horizontal');
              }}
              style={{ cursor: 'pointer' }}
            >
              Split H
            </span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: '#94a3b8',
            fontSize: '14px',
            paddingTop: isSelected ? '24px' : 0,
          }}
        >
          Drop section here
        </div>
      </div>
    );
  }

  return (
    <div
      ref={blockRef}
      style={blockStyle}
      onClick={handleBlockClick}
      onMouseEnter={() => setDragOver(false)}
      onMouseLeave={() => setDragOver(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '4px 8px',
            background: '#3b82f6',
            color: '#fff',
            fontSize: '11px',
            display: 'flex',
            gap: '8px',
            zIndex: 20,
            borderRadius: '4px 4px 0 0',
          }}
        >
          <span
            onClick={(e) => {
              e.stopPropagation();
              splitBlock(block.id, 'vertical');
            }}
            style={{ cursor: 'pointer' }}
          >
            Split V
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              splitBlock(block.id, 'horizontal');
            }}
            style={{ cursor: 'pointer' }}
          >
            Split H
          </span>
        </div>
      )}
      {section ? (
        <SectionRenderer section={section} theme={theme} />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: '60px',
            color: '#94a3b8',
            fontSize: '14px',
            paddingTop: isSelected ? '24px' : 0,
          }}
        >
          Drop section here
        </div>
      )}
    </div>
  );
}