import { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { SectionConfigPanel } from './SectionConfigPanel';
import { SECTION_TYPES } from '../lib/constants';

type SidebarTab = 'sections' | 'config';

export function EditorSidebar() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const addSection = useEditorStore((s) => s.addSection);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const setSelectedSection = useEditorStore((s) => s.setSelectedSection);
  const assignSectionToBlock = useEditorStore((s) => s.assignSectionToBlock);

  const [activeTab, setActiveTab] = useState<SidebarTab>('sections');

  const sortedSections = [...pageConfig.sections].sort((a, b) => a.order - b.order);

  const handleSectionTypeClick = (sectionType: string) => {
    const existingSection = sortedSections.find(s => s.type === sectionType);
    
    if (existingSection) {
      if (selectedBlockId) {
        if (selectedSectionId === existingSection.id) {
          assignSectionToBlock(selectedBlockId, '');
          setSelectedSection(null);
        } else {
          assignSectionToBlock(selectedBlockId, existingSection.id);
          setSelectedSection(existingSection.id);
        }
      } else {
        setSelectedSection(existingSection.id);
      }
    } else {
      addSection(sectionType as any);
    }
  };

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

              {activeTab === 'sections' && pageConfig.layout === 'custom' && selectedBlockId && (
                <div style={{ padding: '6px 8px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534' }}>
                  Block selected — click a section to assign it
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'sections' ? (
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {SECTION_TYPES.map((st) => {
                      const existingSection = sortedSections.find(s => s.type === st.type);
                      const isSelected = existingSection ? selectedSectionId === existingSection.id : false;
                      return (
                        <div
                          key={st.type}
                          onClick={() => handleSectionTypeClick(st.type)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 6px',
                            border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                            borderRadius: '6px',
                            background: isSelected ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#475569',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>{st.icon}</span>
                          <span style={{ fontWeight: isSelected ? 600 : 400 }}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : <SectionConfigPanel />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
