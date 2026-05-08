# AGENTS.md

## Projects

### listing-editor
A React-based WYSIWYG listing editor packaged as a Web Component for embedding in AngularJS host apps.

**Location:** `packages/listing-editor/`

**Tech stack:**
- React 19 + TypeScript
- Vite (library mode, outputs ESM + UMD)
- Tailwind CSS v4
- Zustand for state management
- Supabase JS client
- TipTap (rich text editing, added but not wired yet)

**Commands:**
```bash
cd packages/listing-editor
npm install
npm run dev      # Start dev server at localhost:5173
npm run build    # Build for production (outputs dist/)
```

**Web Component usage in AngularJS:**
```html
<script src="/path/to/listing-editor.js"></script>
<listing-editor
  property-id="uuid"
  api-url="https://xxx.supabase.co"
  anon-key="sb_publishable_..."
></listing-editor>
```

**Database:** Uses Supabase. Property data comes from `properties` table, photos from `property_photos`. Editor state stored in `properties.page_config` JSONB column.

**Next steps (Phase 2):**
- Wire up dnd-kit for drag-and-drop section reordering
- Add per-section config panels with TipTap
- Connect background picker, animation picker
