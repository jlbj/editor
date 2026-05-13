import { useState, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import type { ListingLayout } from '../services/supabase';

interface LayoutManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

export function LayoutManager({ isOpen, onClose, mode }: LayoutManagerProps) {
  const [layoutName, setLayoutName] = useState('');
  const [layouts, setLayouts] = useState<ListingLayout[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const saveCustomLayout = useEditorStore((s) => s.saveCustomLayout);
  const loadCustomLayout = useEditorStore((s) => s.loadCustomLayout);
  const deleteCustomLayout = useEditorStore((s) => s.deleteCustomLayout);
  const availableLayouts = useEditorStore((s) => s.availableLayouts);

  useEffect(() => {
    if (isOpen) {
      setLayouts(availableLayouts.filter(l => l.type === 'custom'));
      setLayoutName('');
      setError(null);
      setDeleteConfirm(null);
      setSaving(false);
    }
  }, [isOpen, availableLayouts]);

  const handleSave = async () => {
    if (!layoutName.trim()) {
      setError('Please enter a layout name');
      return;
    }
    
    setSaving(true);
    const success = await saveCustomLayout(layoutName.trim());
    setSaving(false);
    if (success) {
      setLayouts(availableLayouts.filter(l => l.type === 'custom'));
      setLayoutName('');
      setError(null);
      onClose();
    } else {
      setError('Failed to save layout. Check console for details.');
    }
  };

  const handleLoad = (id: string) => {
    loadCustomLayout(id);
    onClose();
  };

  const handleDelete = async (id: string) => {
    await deleteCustomLayout(id);
    setLayouts(availableLayouts.filter(l => l.type === 'custom'));
    setDeleteConfirm(null);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {mode === 'save' ? (
          <>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1a202c' }}>Save Custom Layout</h2>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => { setLayoutName(e.target.value); setError(null); }}
              placeholder="Enter layout name..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: error ? '8px' : '16px',
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
              autoFocus
            />
            {error && (
              <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: saving ? '#93c5fd' : '#3b82f6',
                  color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                }}
              >
                {saving ? 'Saving...' : 'Save Layout'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1a202c' }}>Load Custom Layout</h2>
            {layouts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                No saved layouts yet. Save your current layout to reuse it later.
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {layouts.map((layout) => (
                  <div
                    key={layout.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      background: deleteConfirm === layout.id ? '#fef2f2' : '#f8fafc',
                    }}
                  >
                    {deleteConfirm === layout.id ? (
                      <>
                        <span style={{ fontSize: '14px', color: '#dc2626', flex: 1 }}>
                          Delete "{layout.name}"?
                        </span>
                        <button
                          onClick={() => handleDelete(layout.id)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#dc2626',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginRight: '4px',
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: '#fff',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a202c' }}>
                            {layout.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {layout.created_at ? new Date(layout.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleLoad(layout.id)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #3b82f6',
                            borderRadius: '4px',
                            background: '#eff6ff',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginRight: '4px',
                          }}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(layout.id)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: '#fff',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
