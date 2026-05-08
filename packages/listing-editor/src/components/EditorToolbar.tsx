import { useEditorStore } from '../store/useEditorStore';
import { THEMES, LAYOUTS } from '../lib/constants';

type ViewMode = 'mobile' | 'mobile-horizontal' | 'tablet' | 'desktop';

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'mobile', label: 'Mobile', icon: '📱' },
  { id: 'mobile-horizontal', label: 'Mobile H', icon: '📱' },
  { id: 'tablet', label: 'Tablet', icon: '📱' },
  { id: 'desktop', label: 'Desktop', icon: '💻' },
];

export function EditorToolbar() {
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const setLayout = useEditorStore((s) => s.setLayout);
  const setTheme = useEditorStore((s) => s.setTheme);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const viewMode = useEditorStore((s) => s.viewMode);
  const saveConfig = useEditorStore((s) => s.saveConfig);
  const isSaving = useEditorStore((s) => s.isSaving);
  const propertyData = useEditorStore((s) => s.propertyData);

  const handleSave = async () => {
    try {
      await saveConfig();
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  return (
    <div className="editor-toolbar">
      <div style={{ fontWeight: 600, fontSize: '14px' }}>
        {propertyData?.name || 'Property Editor'}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        {VIEW_OPTIONS.map((view) => (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            title={view.label}
            style={{
              padding: '6px 10px',
              border: '1px solid',
              borderColor: viewMode === view.id ? '#3b82f6' : '#e2e8f0',
              borderRadius: '4px',
              background: viewMode === view.id ? '#eff6ff' : '#fff',
              color: viewMode === view.id ? '#3b82f6' : '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {view.icon}
          </button>
        ))}
      </div>

      <select
        value={pageConfig.layout}
        onChange={(e) => setLayout(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
      >
        {LAYOUTS.map((layout) => (
          <option key={layout.id} value={layout.id}>
            {layout.name}
          </option>
        ))}
      </select>

      <select
        value={pageConfig.theme}
        onChange={(e) => setTheme(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
      >
        {THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}