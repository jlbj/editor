import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { EditorSidebar } from './EditorSidebar';

export function EditorShell() {
  return (
    <div className="editor-shell">
      <EditorToolbar />
      <div className="editor-main">
        <EditorCanvas />
        <EditorSidebar />
      </div>
    </div>
  );
}