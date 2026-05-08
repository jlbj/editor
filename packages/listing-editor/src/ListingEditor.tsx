import { useEffect, useRef } from 'react';
import { useEditorStore } from './store/useEditorStore';
import { initSupabase } from './services/supabase';
import { EditorShell } from './components/EditorShell';

export function ListingEditor({
  propertyId = 'demo-property-1',
  apiUrl = 'demo',
  anonKey = 'demo',
}: {
  propertyId?: string;
  apiUrl?: string;
  anonKey?: string;
}) {
  const loadProperty = useEditorStore((s) => s.loadProperty);
  const isLoading = useEditorStore((s) => s.isLoading);
  const error = useEditorStore((s) => s.error);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSupabase(apiUrl || 'demo', anonKey || 'demo');
  }, [apiUrl, anonKey]);

  useEffect(() => {
    loadProperty(propertyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div>Loading property...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: '100vh' }}>
      <EditorShell />
    </div>
  );
}