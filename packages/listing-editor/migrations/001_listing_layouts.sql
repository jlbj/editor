-- Create listing_layouts table for storing both predefined and custom layouts
CREATE TABLE IF NOT EXISTS listing_layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('predefined', 'custom')),
  grid_blocks JSONB NOT NULL DEFAULT '[]',
  section_assignments JSONB NOT NULL DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT owner_id_required_for_custom CHECK (
    type = 'predefined' OR owner_id IS NOT NULL
  )
);

-- RLS policies
ALTER TABLE listing_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read predefined layouts" ON listing_layouts;
DROP POLICY IF EXISTS "Read own custom layouts" ON listing_layouts;
DROP POLICY IF EXISTS "Create custom layouts" ON listing_layouts;
DROP POLICY IF EXISTS "Update own custom layouts" ON listing_layouts;
DROP POLICY IF EXISTS "Delete own custom layouts" ON listing_layouts;

CREATE POLICY "Read predefined layouts" ON listing_layouts
  FOR SELECT USING (type = 'predefined');

CREATE POLICY "Read own custom layouts" ON listing_layouts
  FOR SELECT USING (type = 'custom' AND owner_id = auth.uid());

CREATE POLICY "Create custom layouts" ON listing_layouts
  FOR INSERT WITH CHECK (type = 'custom' AND owner_id = auth.uid());

CREATE POLICY "Update own custom layouts" ON listing_layouts
  FOR UPDATE USING (type = 'custom' AND owner_id = auth.uid());

CREATE POLICY "Delete own custom layouts" ON listing_layouts
  FOR DELETE USING (type = 'custom' AND owner_id = auth.uid());

-- Insert predefined layouts
INSERT INTO listing_layouts (id, name, type, grid_blocks, section_assignments)
VALUES
  ('list', 'List', 'predefined', '[]', '{}'),
  ('two-column', 'Two Column', 'predefined', '[]', '{}'),
  ('magazine', 'Magazine', 'predefined', '[]', '{}'),
  ('hero-first', 'Hero First', 'predefined', '[]', '{}')
ON CONFLICT (id) DO NOTHING;
