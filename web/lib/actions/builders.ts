'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import * as repo from '@/lib/supabase/builder.repo'
import type { Builder } from '@/types/domain'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const builderSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(200),
  phone: z.string().max(30).nullish().or(z.literal('')),
  zipcode: z.string().max(10).nullish().or(z.literal('')),
  state: z.string().max(2).nullish().or(z.literal('')),
  city: z.string().max(100).nullish().or(z.literal('')),
  neighborhood: z.string().max(100).nullish().or(z.literal('')),
  address: z.string().max(255).nullish().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export async function createBuilderAction(formData: unknown): Promise<ActionResult<Builder>> {
  const parsed = builderSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }
  const { phone, zipcode, state, city, neighborhood, address, ...rest } = parsed.data
  try {
    const builder = await repo.createBuilder({
      ...rest,
      phone: phone || null,
      zipcode: zipcode || null,
      state: state || null,
      city: city || null,
      neighborhood: neighborhood || null,
      address: address || null,
      metadata: null,
    })
    revalidatePath('/builders')
    return { success: true, data: builder }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar construtora' }
  }
}

export async function updateBuilderAction(id: string, formData: unknown): Promise<ActionResult<Builder>> {
  const parsed = builderSchema.partial().safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }
  const { phone, zipcode, state, city, neighborhood, address, ...rest } = parsed.data
  try {
    const builder = await repo.updateBuilder(id, {
      ...rest,
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(zipcode !== undefined ? { zipcode: zipcode || null } : {}),
      ...(state !== undefined ? { state: state || null } : {}),
      ...(city !== undefined ? { city: city || null } : {}),
      ...(neighborhood !== undefined ? { neighborhood: neighborhood || null } : {}),
      ...(address !== undefined ? { address: address || null } : {}),
    })
    revalidatePath('/builders')
    return { success: true, data: builder }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar construtora' }
  }
}
