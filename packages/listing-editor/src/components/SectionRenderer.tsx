import { useEffect, useRef } from 'react';
import type { Section, SectionType, Theme } from '../types';
import { useEditorStore } from '../store/useEditorStore';
import { SECTION_TYPES } from '../lib/constants';

interface SectionRendererProps {
  section: Section;
  style?: React.CSSProperties;
  theme?: Theme;
}

export function SectionRenderer({ section, style: layoutStyle, theme }: SectionRendererProps) {
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const setSelectedSection = useEditorStore((s) => s.setSelectedSection);

  const isSelected = selectedSectionId === section.id;
  const sectionInfo = SECTION_TYPES.find((s) => s.type === section.type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSection(section.id);
  };

  const bgImage = section.style?.backgroundImage;
  const hasBgImage = !!bgImage;
  const isParallax = section.style?.backgroundAttachment === 'parallax' && bgImage;

  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isParallax) return;

    const el = sectionRef.current;
    const bg = bgRef.current;
    if (!el || !bg) return;

    const rect = el.getBoundingClientRect();

    bg.style.position = 'fixed';
    bg.style.left = `${rect.left}px`;
    bg.style.top = `${rect.top}px`;
    bg.style.width = `${rect.width}px`;
    bg.style.height = `${rect.height}px`;
    bg.style.margin = '0';
    bg.style.right = 'auto';
    bg.style.bottom = 'auto';

    return () => {
      bg.style.position = '';
      bg.style.left = '';
      bg.style.top = '';
      bg.style.width = '';
      bg.style.height = '';
      bg.style.margin = '';
      bg.style.right = '';
      bg.style.bottom = '';
    };
  }, [isParallax]);

  const sectionStyle: React.CSSProperties = {
    ...layoutStyle,
    position: 'relative',
    border: isSelected ? '2px solid #3b82f6' : '2px dashed transparent',
    margin: 0,
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
    backgroundColor: section.style.backgroundColor || (hasBgImage && !isParallax ? 'transparent' : theme?.colors.background || 'transparent'),
    backgroundImage: hasBgImage && !isParallax ? bgImage : undefined,
    backgroundSize: hasBgImage && !isParallax ? 'cover' : undefined,
    backgroundPosition: 'center',
    backgroundRepeat: hasBgImage && !isParallax ? 'no-repeat' : undefined,
    clipPath: isParallax ? 'inset(0)' : undefined,
    padding: section.style.padding || theme?.spacing.sectionPadding || '0',
    textAlign: section.style.textAlign || 'left',
    fontFamily: theme?.typography.bodyFont || 'inherit',
    color: theme?.colors.text || 'inherit',
  };

  const animationClass = (() => {
    switch (section.animations?.scroll) {
      case 'fade-in':
        return 'section-animate-fade-in';
      case 'fade-up':
        return 'section-animate-fade-up';
      case 'slide':
        return 'section-animate-slide';
      default:
        return '';
    }
  })();

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    switch (section.animations?.hover) {
      case 'zoom':
        target.style.transform = 'scale(1.02)';
        break;
      case 'lift':
        target.style.transform = 'translateY(-4px)';
        target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        break;
      case 'glow':
        target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.transform = '';
    target.style.boxShadow = '';
  };

return (
    <div
      ref={sectionRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={sectionStyle}
      className={`section-${section.id} ${animationClass}`}
    >
      {isParallax && (
        <div
          ref={bgRef}
          style={{
            backgroundImage: bgImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '12px',
            background: '#3b82f6',
            color: '#fff',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            zIndex: 1,
          }}
        >
          {sectionInfo?.label}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <SectionContent type={section.type} content={section.content} sectionInfo={sectionInfo} theme={theme} textAlign={section.style.textAlign} />
      </div>
    </div>
  );
}

function SectionContent({ type, content, sectionInfo, theme, textAlign }: { type: SectionType; content: Record<string, unknown>; sectionInfo: { label: string; icon: string } | undefined; theme?: Theme; textAlign?: string }) {
  const c = content as Record<string, string | number | undefined>;
  const primary = theme?.colors.primary || '#1a365d';
  const text = theme?.colors.text || '#1a202c';
  const textMuted = theme?.colors.textMuted || '#64748b';
  const headingFont = theme?.typography.headingFont || 'inherit';
  const bodyFont = theme?.typography.bodyFont || 'inherit';

  switch (type) {
    case 'hero':
      return (
        <div
          style={{
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: '32px',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '28px', color: primary, fontFamily: headingFont }}>
            {c.title as string || 'Hero Title'}
          </h1>
          {c.subtitle && (
            <p style={{ margin: '8px 0 0', color: textMuted }}>
              {c.subtitle as string}
            </p>
          )}
          {c.ctaText && (
            <button style={{ marginTop: '16px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {c.ctaText as string}
            </button>
          )}
        </div>
      );

    case 'description':
      return (
        <div style={{ padding: '24px', fontFamily: bodyFont }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontFamily: headingFont, color: primary }}>{c.title as string || 'Description'}</h2>
          <div
            style={{ color: text, fontSize: '14px', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: c.body as string || '<p>Click to edit description...</p>' }}
          />
        </div>
      );

    case 'contact':
      return (
        <div style={{ padding: '24px', fontFamily: bodyFont }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>Contact</h2>
          <div style={{ fontSize: '14px', color: textMuted }}>
            {c.email ? `📧 ${c.email}` : '📧 email@example.com'}
            {c.phone && <div>📞 {c.phone}</div>}
          </div>
        </div>
      );

    case 'price':
      return (
        <div style={{ padding: '24px', fontFamily: bodyFont }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: primary }}>
            {c.minPrice || 0} {c.currency || '€'}
            <span style={{ fontSize: '14px', fontWeight: 400, color: textMuted }}> / {c.period || 'night'}</span>
          </div>
        </div>
      );

    case 'characteristics':
      return (
        <div style={{ padding: '24px', fontFamily: bodyFont }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>Property Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>📐</div>
              <div style={{ fontSize: '14px', color: textMuted }}>{c.sqm || 0} m²</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🚪</div>
              <div style={{ fontSize: '14px', color: textMuted }}>{c.rooms || 0} rooms</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🛏️</div>
              <div style={{ fontSize: '14px', color: textMuted }}>{c.beds || 0} beds</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>🚿</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>{c.bathrooms || 0} baths</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>👥</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>{c.guests || 0} guests</div>
            </div>
          </div>
        </div>
      );

    case 'photos':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Photo Gallery</h2>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>
            {Array.isArray(c.images) && c.images.length > 0
              ? `${c.images.length} photos`
              : 'Click to add photos...'}
          </div>
        </div>
      );

    case 'amenities':
      return (
        <div style={{ padding: '24px', fontFamily: bodyFont }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>{c.title as string || 'Amenities'}</h2>
          {Array.isArray(c.list) && c.list.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {c.list.map((item, i) => (
                <div key={i} style={{ fontSize: '14px', color: text }}>✓ {item as string}</div>
              ))}
            </div>
          ) : (
            <div style={{ color: textMuted, fontSize: '14px' }}>Click to configure amenities...</div>
          )}
        </div>
      );

    case 'map':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Location</h2>
          <div
            style={{
              height: '200px',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              color: '#94a3b8',
            }}
          >
            🗺️ Map placeholder
          </div>
        </div>
      );

    case 'header':
      return (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{c.logo as string || 'Logo'}</div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
              <span>Home</span>
              <span>About</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      );

    case 'bottom':
      return (
        <div style={{ padding: '24px', background: '#1e293b', color: '#94a3b8' }}>
          <div style={{ fontSize: '14px' }}>© {c.copyright as string || new Date().getFullYear()}</div>
        </div>
      );

    case 'closeTo':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>Close To</h2>
          {Array.isArray(c.items) && c.items.length > 0 ? (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {c.items.map((item, i) => (
                <span key={i} style={{ padding: '8px 12px', background: 'rgba(128,128,128,0.1)', borderRadius: '6px', fontSize: '14px', color: text }}>
                  📍 {item as string}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: textMuted, fontSize: '14px' }}>Click to add nearby places...</div>
          )}
        </div>
      );

    case 'facilities':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Facilities</h2>
          {Array.isArray(c.list) && c.list.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {c.list.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  ✓ {item as string}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '14px' }}>Click to configure facilities...</div>
          )}
        </div>
      );

    case 'floorPlan':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Floor Plan</h2>
          {c.image ? (
            <img src={c.image as string} alt="Floor Plan" style={{ width: '100%', borderRadius: '8px' }} />
          ) : (
            <div style={{ height: '200px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#94a3b8' }}>
              📋 Floor Plan placeholder
            </div>
          )}
        </div>
      );

    case 'rules':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>House Rules</h2>
          {Array.isArray(c.items) && c.items.length > 0 ? (
            <ul style={{ paddingLeft: '20px', color: text, fontSize: '14px' }}>
              {c.items.map((item, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{item as string}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: textMuted, fontSize: '14px' }}>Click to add house rules...</div>
          )}
        </div>
      );

    case 'testimonials':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>Testimonials</h2>
          {Array.isArray(c.items) && c.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {c.items.map((item: unknown, i: number) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(128,128,128,0.1)', borderRadius: '8px', border: '1px solid rgba(128,128,128,0.2)' }}>
                  <div style={{ fontSize: '14px', color: text }}>{(item as {text: string}).text || 'Great stay!'}</div>
                  <div style={{ fontSize: '12px', color: textMuted, marginTop: '8px' }}>— {(item as {author: string}).author || 'Guest'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: textMuted, fontSize: '14px' }}>Click to add testimonials...</div>
          )}
        </div>
      );

    case 'location':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>Location</h2>
          <p style={{ color: text, fontSize: '14px' }}>{c.description as string || 'Click to add location description...'}</p>
        </div>
      );

    case 'recap':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontFamily: headingFont, color: primary }}>Booking Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px', color: text }}>
            <div><strong>Check-in:</strong> {c.checkIn as string || '15:00'}</div>
            <div><strong>Check-out:</strong> {c.checkOut as string || '11:00'}</div>
            <div><strong>Min nights:</strong> {c.minNights as number || 1}</div>
            <div><strong>Cancellation:</strong> {c.cancellationPolicy as string || 'Flexible'}</div>
          </div>
        </div>
      );

    case 'otherProperties':
      return (
        <div style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>Other Properties</h2>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Click to configure...</div>
        </div>
      );

    default:
      return (
        <div className="section-placeholder">
          {sectionInfo?.icon} {sectionInfo?.label}
        </div>
      );
  }
}