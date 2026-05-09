import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEditorStore } from '../store/useEditorStore';
import { SECTION_TYPES } from '../lib/constants';
import { useEffect, useState } from 'react';

const FAKE_PROPERTY_PHOTOS = [
  { id: 'fake-1', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', label: 'Modern Villa' },
  { id: 'fake-2', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', label: 'Living Room' },
  { id: 'fake-3', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', label: 'Kitchen' },
  { id: 'fake-4', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', label: 'Bedroom' },
  { id: 'fake-5', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', label: 'Pool' },
  { id: 'fake-6', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80', label: 'Garden' },
];

type BackgroundMode = 'color' | 'image';

const ANIMATION_PRESETS = [
  { id: 'none', label: 'None', hover: 'none', scroll: 'none' },
  { id: 'fade-up', label: 'Fade Up', hover: 'none', scroll: 'fade-up' },
  { id: 'fade-in', label: 'Fade In', hover: 'none', scroll: 'fade-in' },
  { id: 'zoom', label: 'Zoom', hover: 'zoom', scroll: 'none' },
  { id: 'lift', label: 'Lift', hover: 'lift', scroll: 'fade-up' },
];

function TipTapEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: 'padding: 8px; min-height: 100px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            background: editor.isActive('bold') ? '#e2e8f0' : '#fff',
            cursor: 'pointer',
          }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            background: editor.isActive('italic') ? '#e2e8f0' : '#fff',
            cursor: 'pointer',
          }}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            background: editor.isActive('bulletList') ? '#e2e8f0' : '#fff',
            cursor: 'pointer',
          }}
        >
          •
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function SectionConfigPanel() {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const updateSection = useEditorStore((s) => s.updateSection);
  const getTheme = useEditorStore((s) => s.getTheme);

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'animations'>('content');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('color');
  const [customColor, setCustomColor] = useState('#000000');
  const [textCustomColor, setTextCustomColor] = useState('#000000');

  const theme = getTheme();
  const section = pageConfig.sections.find((s) => s.id === selectedSectionId);

  const themeColors = theme ? [
    { id: 'theme-primary', color: theme.colors.primary, label: 'Primary' },
    { id: 'theme-primaryLight', color: theme.colors.primaryLight, label: 'Primary Light' },
    { id: 'theme-secondary', color: theme.colors.secondary, label: 'Secondary' },
    { id: 'theme-accent', color: theme.colors.accent, label: 'Accent' },
    { id: 'theme-background', color: theme.colors.background, label: 'Background' },
    { id: 'theme-surface', color: theme.colors.surface, label: 'Surface' },
    { id: 'theme-text', color: theme.colors.text, label: 'Text' },
    { id: 'theme-textMuted', color: theme.colors.textMuted, label: 'Text Muted' },
  ] : [];

  if (!section) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
        Select a section to configure
      </div>
    );
  }

  const sectionInfo = SECTION_TYPES.find((s) => s.type === section.type);

  const handleContentChange = (key: string, value: unknown) => {
    updateSection(section.id, {
      content: { ...section.content, [key]: value },
    });
  };

  const handleAnimationChange = (preset: typeof ANIMATION_PRESETS[0]) => {
    updateSection(section.id, {
      animations: {
        hover: preset.hover as 'none' | 'zoom' | 'lift' | 'glow',
        scroll: preset.scroll as 'none' | 'fade-in' | 'fade-up' | 'slide',
      },
    });
  };

  const handleBackgroundChange = (preset: { id: string; color: string; label?: string }) => {
    if (preset.id === 'none') {
      updateSection(section.id, {
        style: { backgroundImage: '', backgroundColor: '' }
      });
    } else if (preset.color.startsWith('linear-gradient')) {
      updateSection(section.id, {
        style: { backgroundImage: preset.color, backgroundColor: '' }
      });
    } else {
      updateSection(section.id, {
        style: { backgroundColor: preset.color, backgroundImage: '' }
      });
    }
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    updateSection(section.id, {
      style: { backgroundColor: color, backgroundImage: '' }
    });
  };

  const handleBackgroundImageSelect = (photo: typeof FAKE_PROPERTY_PHOTOS[0]) => {
    updateSection(section.id, {
      style: { backgroundImage: `url(${photo.url})`, backgroundColor: '' }
    });
  };

  const handleClearBackground = () => {
    updateSection(section.id, {
      style: { backgroundImage: '', backgroundColor: '' }
    });
  };

  const renderContentFields = () => {
    switch (section.type) {
      case 'hero':
        return (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Title</label>
              <input
                type="text"
                value={(section.content.title as string) || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Subtitle</label>
              <input
                type="text"
                value={(section.content.subtitle as string) || ''}
                onChange={(e) => handleContentChange('subtitle', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CTA Text</label>
              <input
                type="text"
                value={(section.content.ctaText as string) || ''}
                onChange={(e) => handleContentChange('ctaText', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CTA Link</label>
              <input
                type="text"
                value={(section.content.ctaLink as string) || ''}
                onChange={(e) => handleContentChange('ctaLink', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description (Rich Text)</label>
              <TipTapEditor
                content={(section.content.description as string) || ''}
                onChange={(html) => handleContentChange('description', html)}
              />
            </div>
          </>
        );
      case 'description':
        return (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Title</label>
              <input
                type="text"
                value={(section.content.title as string) || ''}
                onChange={(e) => handleContentChange('title', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Content (Rich Text)</label>
              <TipTapEditor
                content={(section.content.body as string) || ''}
                onChange={(html) => handleContentChange('body', html)}
              />
            </div>
          </>
        );
      case 'characteristics':
        return (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>SqM</label>
              <input
                type="number"
                value={(section.content.sqm as number) || 0}
                onChange={(e) => handleContentChange('sqm', Number(e.target.value))}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Rooms</label>
              <input
                type="number"
                value={(section.content.rooms as number) || 0}
                onChange={(e) => handleContentChange('rooms', Number(e.target.value))}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Bedrooms</label>
              <input
                type="number"
                value={(section.content.bedrooms as number) || 0}
                onChange={(e) => handleContentChange('bedrooms', Number(e.target.value))}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Bathrooms</label>
              <input
                type="number"
                value={(section.content.bathrooms as number) || 0}
                onChange={(e) => handleContentChange('bathrooms', Number(e.target.value))}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                value={(section.content.email as string) || ''}
                onChange={(e) => handleContentChange('email', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone</label>
              <input
                type="tel"
                value={(section.content.phone as string) || ''}
                onChange={(e) => handleContentChange('phone', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Address</label>
              <input
                type="text"
                value={(section.content.address as string) || ''}
                onChange={(e) => handleContentChange('address', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
          </>
        );
      case 'price':
        return (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Min Price</label>
              <input
                type="number"
                value={(section.content.minPrice as number) || 0}
                onChange={(e) => handleContentChange('minPrice', Number(e.target.value))}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Currency</label>
              <select
                value={(section.content.currency as string) || '€'}
                onChange={(e) => handleContentChange('currency', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="€">€ EUR</option>
                <option value="$">$ USD</option>
                <option value="£">£ GBP</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Period</label>
              <select
                value={(section.content.period as string) || 'night'}
                onChange={(e) => handleContentChange('period', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="night">Per Night</option>
                <option value="week">Per Week</option>
                <option value="month">Per Month</option>
              </select>
            </div>
          </>
        );
      default:
        return (
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            No content options for {sectionInfo?.label} section
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
          {sectionInfo?.icon} {sectionInfo?.label}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>Configure section</div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
        {(['content', 'style', 'animations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: activeTab === tab ? '#3b82f6' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {activeTab === 'content' && renderContentFields()}

        {activeTab === 'style' && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Background Type</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => setBackgroundMode('color')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid',
                    borderColor: backgroundMode === 'color' ? '#3b82f6' : '#e2e8f0',
                    borderRadius: '6px',
                    background: backgroundMode === 'color' ? '#eff6ff' : '#fff',
                    color: backgroundMode === 'color' ? '#3b82f6' : '#64748b',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Color
                </button>
                <button
                  onClick={() => setBackgroundMode('image')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid',
                    borderColor: backgroundMode === 'image' ? '#3b82f6' : '#e2e8f0',
                    borderRadius: '6px',
                    background: backgroundMode === 'image' ? '#eff6ff' : '#fff',
                    color: backgroundMode === 'image' ? '#3b82f6' : '#64748b',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Image
                </button>
              </div>

              {backgroundMode === 'color' && (
                <>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Theme Colors</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      <button
                        onClick={handleClearBackground}
                        style={{
                          padding: '6px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          background: '#fff',
                          fontSize: '10px',
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                      >
                        None
                      </button>
                      {themeColors.map((tc) => (
                        <button
                          key={tc.id}
                          onClick={() => handleBackgroundChange({ id: tc.id, color: tc.color })}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: section.style.backgroundColor === tc.color ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            borderRadius: '4px',
                            background: tc.color,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title={tc.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Custom Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => handleCustomColorChange(e.target.value)}
                        style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            handleCustomColorChange(val);
                          }
                        }}
                        placeholder="#000000"
                        style={{ flex: 1, padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {backgroundMode === 'image' && (
                <>
                  <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Select Image</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {FAKE_PROPERTY_PHOTOS.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => handleBackgroundImageSelect(photo)}
                        style={{
                          width: '100%',
                          height: '60px',
                          border: section.style.backgroundImage?.includes(photo.url) ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '4px',
                          background: `url(${photo.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        title={photo.label}
                      />
                    ))}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Attachment</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => updateSection(section.id, { style: { ...section.style, backgroundAttachment: 'scroll' } })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid',
                          borderColor: !section.style.backgroundAttachment || section.style.backgroundAttachment === 'scroll' ? '#3b82f6' : '#e2e8f0',
                          borderRadius: '6px',
                          background: !section.style.backgroundAttachment || section.style.backgroundAttachment === 'scroll' ? '#eff6ff' : '#fff',
                          color: !section.style.backgroundAttachment || section.style.backgroundAttachment === 'scroll' ? '#3b82f6' : '#64748b',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Scroll
                      </button>
                      <button
                        onClick={() => updateSection(section.id, { style: { ...section.style, backgroundAttachment: 'parallax' } })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid',
                          borderColor: section.style.backgroundAttachment === 'parallax' ? '#3b82f6' : '#e2e8f0',
                          borderRadius: '6px',
                          background: section.style.backgroundAttachment === 'parallax' ? '#eff6ff' : '#fff',
                          color: section.style.backgroundAttachment === 'parallax' ? '#3b82f6' : '#64748b',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Parallax
                      </button>
                    </div>
                  </div>

                  
                </>
              )}
            </div>

            <div style={{ marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Text Color</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                <button
                  onClick={() => updateSection(section.id, { style: { ...section.style, color: undefined } })}
                  style={{
                    padding: '6px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    background: '#fff',
                    fontSize: '10px',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  Default
                </button>
                {themeColors.map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => {
                      setTextCustomColor(tc.color);
                      updateSection(section.id, { style: { ...section.style, color: tc.color } });
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: section.style.color === tc.color ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '4px',
                      background: tc.color,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title={tc.label}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="color"
                  value={section.style.color || textCustomColor}
                  onChange={(e) => {
                    setTextCustomColor(e.target.value);
                    updateSection(section.id, { style: { ...section.style, color: e.target.value } });
                  }}
                  style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', padding: 0 }}
                />
                <input
                  type="text"
                  value={section.style.color || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setTextCustomColor(val);
                      updateSection(section.id, { style: { ...section.style, color: val } });
                    }
                  }}
                  placeholder="Theme default"
                  style={{ flex: 1, padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Text Align</label>
              <select
                value={section.style.textAlign || 'left'}
                onChange={(e) => updateSection(section.id, { style: { ...section.style, textAlign: e.target.value as 'left' | 'center' | 'right' } })}
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Padding</label>
              <input
                type="text"
                value={section.style.padding || ''}
                onChange={(e) => updateSection(section.id, { style: { ...section.style, padding: e.target.value } })}
                placeholder="e.g., 2rem 1rem"
                style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
          </>
        )}

        {activeTab === 'animations' && (
          <>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Animation Preset</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ANIMATION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAnimationChange(preset)}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: section.animations.hover === preset.hover && section.animations.scroll === preset.scroll ? '#eff6ff' : '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}