// lib/actions/properties.ts
// Server Actions �?" ponto de entrada para mutations de imóveis.
// Validam entrada com Zod, chamam os repositórios, revalidam o cache.

'use server';

import { revalidatePath } from 'next/cache';
import { propertySchema, propertyUpdateSchema } from '@/lib/schemas/property.schema';
import * as repo from '@/lib/supabase/property.repo';
import type { PropertyEnriched, PropertyFilters, PropertySort, PaginationParams, PaginatedResult } from '@/types/domain';

// ============================================================
// TIPOS DE RETORNO �?" Result pattern (evita throw em Server Actions)
// ============================================================

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// READ
// ============================================================

export async function fetchProperties(
  filters?: PropertyFilters,
  sort?: PropertySort,
  pagination?: PaginationParams,
): Promise<PaginatedResult<PropertyEnriched>> {
  return repo.getProperties(filters, sort, pagination);
}

export async function fetchFilterOptions() {
  return repo.getFilterOptions();
}

// ============================================================
// CREATE
// ============================================================

export async function createProperty(
  formData: unknown,
): Promise<ActionResult<PropertyEnriched>> {
  const parsed = propertySchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const { links, ...propertyData } = parsed.data;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = await repo.createProperty(propertyData as any);

    if (links?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await repo.upsertPropertyLinks(property.id, links as any);
    }

    revalidatePath('/properties');
    return { success: true, data: property };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao criar imóvel',
    };
  }
}

// ============================================================
// UPDATE
// ============================================================

export async function updateProperty(
  id: string,
  formData: unknown,
): Promise<ActionResult<PropertyEnriched>> {
  const parsed = propertyUpdateSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const { links, ...propertyData } = parsed.data;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = await repo.updateProperty(id, propertyData as any);

    if (links !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await repo.upsertPropertyLinks(id, links as any);
    }

    revalidatePath('/properties');
    revalidatePath(`/properties/${id}`);
    return { success: true, data: property };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao atualizar imóvel',
    };
  }
}

// ============================================================
// DESENVOLVIMENTO — dados para auto-popular localização
// ============================================================

export async function getDevelopmentLocationAction(developmentId: string): Promise<{
  city: string | null
  neighborhood: string | null
  address: string | null
  builder: string | null
} | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('developments')
      .select('city, neighborhood, address, builder')
      .eq('id', developmentId)
      .single()
    if (error || !data) return null
    return {
      city: (data as any).city ?? null,
      neighborhood: (data as any).neighborhood ?? null,
      address: (data as any).address ?? null,
      builder: (data as any).builder ?? null,
    }
  } catch {
    return null
  }
}

// ============================================================
// SOFT DELETE
// ============================================================

export async function softDeleteProperty(id: string): Promise<ActionResult<void>> {
  try {
    await repo.deleteProperty(id);
    revalidatePath('/properties');
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro ao remover imóvel',
    };
  }
}
