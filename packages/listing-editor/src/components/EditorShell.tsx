import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { EditorSidebar } from './EditorSidebar';
import { useEditorStore } from '../store/useEditorStore';

export function EditorShell() {
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const isLayoutEditing = useEditorStore((s) => s.isLayoutEditing);
  const isCustom = pageConfig.layout === 'custom';

  const showSidebar = !isCustom || (isCustom && !isLayoutEditing);

  return (
    <div className="editor-shell">
      <EditorToolbar />
      <div className="editor-main">
        <EditorCanvas />
        {showSidebar && <EditorSidebar />}
      </div>
    </div>
  );
}