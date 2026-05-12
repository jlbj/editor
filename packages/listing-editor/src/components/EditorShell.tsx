import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { EditorSidebar } from './EditorSidebar';
import { useEditorStore } from '../store/useEditorStore';

export function EditorShell() {
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const isCustom = pageConfig.layout === 'custom';

  return (
    <div className="editor-shell">
      <EditorToolbar />
      <div className="editor-main">
        <EditorCanvas />
        {!isCustom && <EditorSidebar />}
      </div>
    </div>
  );
}