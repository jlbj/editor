import { createClient } from '@supabase/supabase-js';
import type { PropertyData, PropertyPhoto } from '../types';

let supabaseClient: ReturnType<typeof createClient> | null = null;
let useMock = false;

const MOCK_PROPERTY: PropertyData = {
  id: 'demo-property-1',
  owner_id: 'user-1',
  name: 'Beautiful Beach House',
  listing_title: 'Beautiful Beach House',
  listing_description: 'A stunning beachfront property with panoramic ocean views',
  cover_image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  address: '123 Ocean Drive, Malibu, CA 90265',
  ical_url: null,
  cleaning_contact_info: null,
  wifi_code: null,
  arrival_instructions: null,
  house_rules_text: null,
  emergency_contact_info: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  property_type: 'house',
  rooms: 8,
  bedrooms: 4,
  bathrooms: 3,
  surface_area: 2800,
  max_guests: 10,
  bed_count: 5,
  page_config: {
    layout: 'grid',
    theme: 'modern-ocean',
    sections: [
      {
        id: 'section-1',
        type: 'hero',
        order: 0,
        enabled: true,
        content: {
          title: 'Welcome to Your Dream Home',
          subtitle: 'Experience luxury living with breathtaking ocean views',
          ctaText: 'Schedule a Tour',
          ctaLink: '#contact',
        },
        style: {},
        animations: {},
      },
      {
        id: 'section-2',
        type: 'amenities',
        order: 1,
        enabled: true,
        content: {
          title: 'Property Features',
          list: [
            'Ocean View',
            'Private Beach Access',
            'Modern Kitchen',
            'Heated Pool',
            'Smart Home System',
            'Wine Cellar',
          ],
        },
        style: {},
        animations: {},
      },
      {
        id: 'section-3',
        type: 'photos',
        order: 2,
        enabled: true,
        content: {
          title: 'Photo Gallery',
          images: [],
        },
        style: {},
        animations: {},
      },
      {
        id: 'section-4',
        type: 'description',
        order: 3,
        enabled: true,
        content: {
          title: 'About This Property',
          body: 'This magnificent beach house offers the ultimate in luxury coastal living. With floor-to-ceiling windows, an open floor plan, and premium finishes throughout, this home is perfect for those seeking an exceptional lifestyle.',
        },
        style: {},
        animations: {},
      },
    ],
    globalStyle: {},
  },
};

const MOCK_PHOTOS: PropertyPhoto[] = [
  { id: 'photo-1', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', category: 'living', created_at: new Date().toISOString() },
  { id: 'photo-2', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', category: 'kitchen', created_at: new Date().toISOString() },
  { id: 'photo-3', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', category: 'bedroom', created_at: new Date().toISOString() },
  { id: 'photo-4', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', category: 'bathroom', created_at: new Date().toISOString() },
];

export function initSupabase(url: string, anonKey: string) {
  if (!url || !anonKey || url === 'demo') {
    useMock = true;
    return null;
  }
  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
}

export function getSupabase() {
  if (useMock || !supabaseClient) {
    throw new Error('Using mock mode');
  }
  return supabaseClient;
}

export async function fetchProperty(propertyId: string): Promise<PropertyData | null> {
  if (useMock) {
    return MOCK_PROPERTY;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    throw error;
  }

  return data as PropertyData;
}

export async function fetchPropertyPhotos(propertyId: string): Promise<PropertyPhoto[]> {
  if (useMock) {
    return MOCK_PHOTOS;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('property_photos')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }

  return data || [];
}

export async function savePropertyConfig(propertyId: string, pageConfig: unknown): Promise<void> {
  if (useMock) {
    console.log('Mock save:', propertyId, pageConfig);
    return;
  }
  const supabase = getSupabase();
  const builder = supabase
    .from('properties')
    .update({ page_config: pageConfig } as never)
    .eq('id', propertyId);
  const { error } = await builder as { error: unknown };

  if (error) {
    console.error('Error saving property config:', error);
    throw error;
  }
}