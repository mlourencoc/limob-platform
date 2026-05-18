// lib/supabase/property.repo.ts
// Repository pattern �?" toda query de imóvel passa por aqui.
// Não contém lógica de negócio, apenas acesso a dados tipado.

import { createClient } from './server';
import type {
  PropertyEnriched,
  PropertyWithLinks,
  PropertyInsert,
  PropertyUpdate,
  PropertyFilters,
  PropertySort,
  PaginationParams,
  PaginatedResult,
  PropertyLink,
  PropertyLinkInsert,
} from '@/types/domain';

// ============================================================
// QUERIES
// ============================================================

export async function getProperties(
  filters: PropertyFilters = {},
  sort: PropertySort = { field: 'created_at', direction: 'desc' },
  pagination: PaginationParams = { page: 1, per_page: 50 },
): Promise<PaginatedResult<PropertyEnriched>> {
  const supabase = await createClient();
  const { page, per_page } = pagination;
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('v_properties_enriched')
    .select('*', { count: 'exact' });

  // --- Filtros multiselect ---
  if (filters.cities?.length)         query = query.in('city', filters.cities);
  if (filters.neighborhoods?.length)  query = query.in('neighborhood', filters.neighborhoods);
  if (filters.development_ids?.length) query = query.in('development_id', filters.development_ids);
  if (filters.broker_ids?.length)     query = query.in('broker_id', filters.broker_ids);
  if (filters.types?.length)          query = query.in('type', filters.types);
  if (filters.subtypes?.length)       query = query.in('subtype', filters.subtypes);
  if (filters.bedrooms?.length)       query = query.in('bedrooms', filters.bedrooms);
  if (filters.suites?.length)         query = query.in('suites', filters.suites);
  if (filters.parking_spots?.length)  query = query.in('parking_spots', filters.parking_spots);
  if (filters.states?.length)         query = query.in('state', filters.states);
  if (filters.situations?.length)     query = query.in('situation', filters.situations);
  if (filters.commercial_statuses?.length) query = query.in('commercial_status', filters.commercial_statuses);
  if (filters.delivery_statuses?.length)   query = query.in('delivery_status', filters.delivery_statuses);
  if (filters.delivery_years?.length)      query = query.in('delivery_year', filters.delivery_years);

  // --- Filtros de range ---
  if (filters.price_min != null) query = query.gte('price', filters.price_min);
  if (filters.price_max != null) query = query.lte('price', filters.price_max);
  if (filters.area_min != null)  query = query.gte('area_m2', filters.area_min);
  if (filters.area_max != null)  query = query.lte('area_m2', filters.area_max);

  // Filtro de idade calculada (property_age_years é campo da view)
  if (filters.age_min != null) query = query.gte('property_age_years', filters.age_min);
  if (filters.age_max != null) query = query.lte('property_age_years', filters.age_max);

  // --- Booleanos ---
  if (filters.has_storage_unit != null) query = query.eq('storage_unit', filters.has_storage_unit);
  if (!filters.show_stale) query = query.eq('is_stale', false);

  // --- Busca textual ---
  if (filters.search?.trim()) {
    query = query.textSearch('city', filters.search, {
      type: 'websearch',
      config: 'portuguese',
    });
  }

  // --- Ordenação e paginação ---
  query = query
    .order(sort.field as string, { ascending: sort.direction === 'asc' })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(`getProperties: ${error.message}`);

  return {
    data: (data ?? []) as PropertyEnriched[],
    total: count ?? 0,
    page,
    per_page,
    total_pages: Math.ceil((count ?? 0) / per_page),
  };
}

export async function getPropertyById(id: string): Promise<PropertyWithLinks | null> {
  const supabase = await createClient();

  const [propertyRes, linksRes] = await Promise.all([
    supabase.from('v_properties_enriched').select('*').eq('id', id).single(),
    supabase
      .from('property_links')
      .select('*')
      .eq('property_id', id)
      .order('sort_order'),
  ]);

  if (propertyRes.error) {
    if (propertyRes.error.code === 'PGRST116') return null; // not found
    throw new Error(`getPropertyById: ${propertyRes.error.message}`);
  }

  return {
    ...(propertyRes.data as PropertyEnriched),
    links: (linksRes.data ?? []) as PropertyLink[],
  };
}

// Valores únicos para popular filtros
export async function getFilterOptions(): Promise<{
  cities: string[];
  neighborhoods: string[];
  brokers: Array<{ id: string; name: string }>;
  developments: Array<{ id: string; name: string }>;
  delivery_years: number[];
}> {
  const supabase = await createClient();

  const [citiesRes, neighborhoodsRes, brokersRes, developmentsRes, yearsRes] =
    await Promise.all([
      supabase
        .from('properties')
        .select('city')
        .is('deleted_at', null)
        .order('city'),
      supabase
        .from('properties')
        .select('neighborhood')
        .is('deleted_at', null)
        .not('neighborhood', 'is', null)
        .order('neighborhood'),
      supabase
        .from('brokers')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('developments')
        .select('id, name')
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('properties')
        .select('delivery_year')
        .is('deleted_at', null)
        .not('delivery_year', 'is', null)
        .order('delivery_year'),
    ]);

  return {
    cities: [...new Set(citiesRes.data?.map((r) => r.city).filter((c): c is string => c != null) ?? [])],
    neighborhoods: [
      ...new Set(neighborhoodsRes.data?.map((r) => r.neighborhood).filter((n): n is string => n != null) ?? []),
    ],
    brokers: brokersRes.data ?? [],
    developments: developmentsRes.data ?? [],
    delivery_years: [
      ...new Set(yearsRes.data?.map((r) => r.delivery_year).filter((y): y is number => y != null) ?? []),
    ],
  };
}

// ============================================================
// MUTATIONS
// ============================================================

export async function createProperty(data: PropertyInsert): Promise<PropertyEnriched> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: created, error } = await supabase
    .from('properties')
    .insert(data as any)
    .select()
    .single();

  if (error) throw new Error(`createProperty: ${error.message}`);

  // Retornar versão enriquecida
  const enriched = await getPropertyById(created.id);
  if (!enriched) throw new Error('createProperty: falha ao recuperar imóvel criado');
  return enriched;
}

export async function updateProperty(
  id: string,
  data: PropertyUpdate,
): Promise<PropertyEnriched> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('properties').update(data as any).eq('id', id);
  if (error) throw new Error(`updateProperty: ${error.message}`);

  const updated = await getPropertyById(id);
  if (!updated) throw new Error('updateProperty: imóvel não encontrado após update');
  return updated;
}

// Soft delete �?" nunca apaga fisicamente
export async function deleteProperty(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`deleteProperty: ${error.message}`);
}

// Marcar imóveis como desatualizados (usada após importação)
export async function markPropertiesAsStale(
  ids: string[],
): Promise<void> {
  if (!ids.length) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({
      is_stale: true,
      stale_since: new Date().toISOString(),
    })
    .in('id', ids);

  if (error) throw new Error(`markPropertiesAsStale: ${error.message}`);
}

// ============================================================
// LINKS
// ============================================================

export async function upsertPropertyLinks(
  property_id: string,
  links: Omit<PropertyLinkInsert, 'property_id'>[],
): Promise<PropertyLink[]> {
  const supabase = await createClient();

  // Apaga os existentes e reinserimos com nova ordem
  await supabase.from('property_links').delete().eq('property_id', property_id);

  if (!links.length) return [];

  const toInsert: PropertyLinkInsert[] = links.map((l, i) => ({
    ...l,
    property_id,
    sort_order: i,
  }));

  const { data, error } = await supabase
    .from('property_links')
    .insert(toInsert)
    .select();

  if (error) throw new Error(`upsertPropertyLinks: ${error.message}`);
  return (data ?? []) as PropertyLink[];
}
