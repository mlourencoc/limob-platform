'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import * as repo from '@/lib/supabase/development.repo'
import type { Development } from '@/types/domain'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const developmentSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(200),
  builder: z.string().max(150).nullish().or(z.literal('')),
  city: z.string().max(100).nullish().or(z.literal('')),
  neighborhood: z.string().max(100).nullish().or(z.literal('')),
  address: z.string().max(255).nullish().or(z.literal('')),
  is_active: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).nullish(),
})

export async function createDevelopmentAction(formData: unknown): Promise<ActionResult<Development>> {
  const parsed = developmentSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }
  const { builder, city, neighborhood, address, metadata, ...rest } = parsed.data
  try {
    const dev = await repo.createDevelopment({
      ...rest,
      builder: builder || null,
      city: city || null,
      neighborhood: neighborhood || null,
      address: address || null,
      metadata: metadata ?? null,
    })
    revalidatePath('/developments')
    return { success: true, data: dev }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar empreendimento' }
  }
}

export async function updateDevelopmentAction(id: string, formData: unknown): Promise<ActionResult<Development>> {
  const parsed = developmentSchema.partial().safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }
  const { builder, city, neighborhood, address, metadata, ...rest } = parsed.data
  try {
    const dev = await repo.updateDevelopment(id, {
      ...rest,
      ...(builder !== undefined ? { builder: builder || null } : {}),
      ...(city !== undefined ? { city: city || null } : {}),
      ...(neighborhood !== undefined ? { neighborhood: neighborhood || null } : {}),
      ...(address !== undefined ? { address: address || null } : {}),
      ...(metadata !== undefined ? { metadata: metadata ?? null } : {}),
    })
    revalidatePath('/developments')
    return { success: true, data: dev }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar empreendimento' }
  }
}
