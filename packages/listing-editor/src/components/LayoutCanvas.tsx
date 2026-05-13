import { useEditorStore } from '../store/useEditorStore';
import { BlockRenderer } from './BlockRenderer';

export function LayoutCanvas() {
  const rootBlock = useEditorStore((s) => s.pageConfig.rootBlock);
  const getTheme = useEditorStore((s) => s.getTheme);
  const theme = getTheme();

  if (!rootBlock) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '14px' }}>No custom layout defined</div>
      </div>
    );
  }

  return (
    <BlockRenderer block={rootBlock} theme={theme} isRoot />
  );
}
