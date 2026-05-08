import { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { SectionList } from './SectionList';
import { SectionConfigPanel } from './SectionConfigPanel';
import { SECTION_TYPES } from '../lib/constants';

type SidebarTab = 'sections' | 'config';

export function EditorSidebar() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const addSection = useEditorStore((s) => s.addSection);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);

  const [activeTab, setActiveTab] = useState<SidebarTab>('sections');

  return (
    <>
      {!sidebarOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰ Sections
        </button>
      )}

      <div className={`editor-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        {sidebarOpen && (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('sections')}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      background: activeTab === 'sections' ? '#3b82f6' : '#f1f5f9',
                      color: activeTab === 'sections' ? '#fff' : '#64748b',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Sections
                  </button>
                  <button
                    onClick={() => setActiveTab('config')}
                    disabled={!selectedSectionId}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      background: activeTab === 'config' ? '#3b82f6' : '#f1f5f9',
                      color: !selectedSectionId ? '#94a3b8' : activeTab === 'config' ? '#fff' : '#64748b',
                      fontSize: '13px',
                      cursor: selectedSectionId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Config
                  </button>
                </div>
                <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  ✕
                </button>
              </div>

              {activeTab === 'sections' && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSection(e.target.value as any);
                      e.target.value = '';
                    }
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                  <option value="">+ Add section...</option>
                  {SECTION_TYPES.map((st) => (
                    <option key={st.type} value={st.type}>
                      {st.icon} {st.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'sections' ? <SectionList /> : <SectionConfigPanel />}
            </div>
          </>
        )}
      </div>
    </>
  );
}