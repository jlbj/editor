import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { THEMES, LAYOUTS } from '../lib/constants';
import { LayoutManager } from './LayoutManager';

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
  const availableLayouts = useEditorStore((s) => s.availableLayouts);
  const loadLayouts = useEditorStore((s) => s.loadLayouts);
  
  const [layoutManagerOpen, setLayoutManagerOpen] = useState(false);
  const [layoutManagerMode, setLayoutManagerMode] = useState<'save' | 'load'>('save');
  const isLayoutEditing = useEditorStore((s) => s.isLayoutEditing);
  const selectedCustomLayoutId = useEditorStore((s) => s.selectedCustomLayoutId);

  // Compute which layout ID to show in dropdown
  const dropdownValue = isLayoutEditing ? 'custom' : (selectedCustomLayoutId || pageConfig.layout);
  console.log('[EditorToolbar] dropdownValue:', dropdownValue, 'isLayoutEditing:', isLayoutEditing, 'selectedCustomLayoutId:', selectedCustomLayoutId);

  // Load layouts on mount
  useEffect(() => {
    loadLayouts();
  }, []);
  
  const handleLayoutChange = (newLayout: string) => {
    setLayout(newLayout);
  };

  const handleSave = async () => {
    if (pageConfig.layout === 'custom') {
      setLayoutManagerMode('save');
      setLayoutManagerOpen(true);
    } else {
      try {
        await saveConfig();
      } catch (e) {
        console.error('Save failed:', e);
      }
    }
  };

  const openLoadManager = () => {
    setLayoutManagerMode('load');
    setLayoutManagerOpen(true);
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
        value={dropdownValue}
        onChange={(e) => handleLayoutChange(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
      >
        {LAYOUTS.filter(l => l.id !== 'custom').map((layout) => (
          <option key={layout.id} value={layout.id}>
            {layout.name}
          </option>
        ))}
        {availableLayouts.filter(l => l.type === 'custom').length > 0 && (
          <optgroup label="My Layouts">
            {availableLayouts.filter(l => l.type === 'custom').map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name}
              </option>
            ))}
          </optgroup>
        )}
        <option value="custom">+ Custom (Paving Editor)</option>
      </select>

      {availableLayouts.filter(l => l.type === 'custom').length > 0 && (
        <button
          onClick={openLoadManager}
          title="Manage saved layouts"
          style={{
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: '#fff',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          ⚙️
        </button>
      )}

      {isLayoutEditing && (
        <>
          <button
            onClick={() => { setLayoutManagerMode('save'); setLayoutManagerOpen(true); }}
            style={{
              padding: '6px 12px',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Save Layout
          </button>
          <button
            onClick={openLoadManager}
            style={{
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              background: '#fff',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Load Layout
          </button>
        </>
      )}

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

      <LayoutManager
        isOpen={layoutManagerOpen}
        onClose={() => setLayoutManagerOpen(false)}
        mode={layoutManagerMode}
      />
    </div>
  );
}