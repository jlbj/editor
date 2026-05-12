import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { SectionRenderer } from './SectionRenderer';
import { PavingCanvas } from './PavingCanvas';

export function EditorCanvas() {
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const getTheme = useEditorStore((s) => s.getTheme);
  const viewMode = useEditorStore((s) => s.viewMode);
  const setContainerDimensions = useEditorStore((s) => s.setContainerDimensions);

  const canvasRef = useRef<HTMLDivElement>(null);
  const theme = getTheme();

  const sortedSections = [...pageConfig.sections].sort((a, b) => a.order - b.order);
  const isCustom = pageConfig.layout === 'custom';

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setContainerDimensions(rect.width, rect.height);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [setContainerDimensions]);

  const cssVars = theme
    ? {
        '--color-primary': theme.colors.primary,
        '--color-primary-light': theme.colors.primaryLight,
        '--color-secondary': theme.colors.secondary,
        '--color-accent': theme.colors.accent,
        '--color-background': theme.colors.background,
        '--color-surface': theme.colors.surface,
        '--color-text': theme.colors.text,
        '--color-text-muted': theme.colors.textMuted,
        '--color-border': theme.colors.border,
        '--font-heading': theme.typography.headingFont,
        '--font-body': theme.typography.bodyFont,
        '--border-radius': theme.borders.radius,
      }
    : {};

  const getLayoutStyles = () => {
    switch (pageConfig.layout) {
      case 'two-column':
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        };
      case 'magazine':
        return {
          display: 'flex',
          flexDirection: 'column',
        };
      case 'hero-first':
        return {
          display: 'flex',
          flexDirection: 'column',
        };
      case 'list':
      default:
        return {
          display: 'flex',
          flexDirection: 'column',
        };
    }
  };

  const getSectionStyle = (_section: typeof sortedSections[0], index: number): React.CSSProperties => {
    const layout = pageConfig.layout;
    if (layout === 'two-column') {
      if (index % 4 === 0 || index % 4 === 3) {
        return { gridColumn: 'span 2', maxWidth: '100%' };
      }
      return { maxWidth: '100%' };
    } else if (layout === 'hero-first' && index === 0) {
      return { width: '100%' };
    }
    return {};
  };

  if (isCustom) {
    return (
      <div ref={canvasRef} className={`editor-canvas view-${viewMode}`} style={cssVars as React.CSSProperties}>
        <PavingCanvas />
      </div>
    );
  }

  return (
    <div ref={canvasRef} className={`editor-canvas view-${viewMode}`} style={cssVars as React.CSSProperties}>
      <div className="editor-canvas-inner" style={getLayoutStyles() as React.CSSProperties}>
        {sortedSections.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No sections yet</div>
            <div style={{ fontSize: '14px' }}>Add sections from the sidebar to get started</div>
          </div>
        ) : (
          <>
            {sortedSections.map((section, index) => 
              <div key={section.id} style={{ flex: 'none', minHeight: '100px' }}>
                <SectionRenderer key={section.id} section={section} style={getSectionStyle(section, index)} theme={theme} />
              </div>
            )}
            <div style={{ height: '48px', flexShrink: 0 }} />
          </>
        )}
      </div>
    </div>
  );
}