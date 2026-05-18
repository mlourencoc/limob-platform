'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import * as repo from '@/lib/supabase/broker.repo'
import type { Broker } from '@/types/domain'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

const brokerSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(150),
  email: z.string().email('E-mail inválido').nullish().or(z.literal('')),
  phone: z.string().max(30).nullish().or(z.literal('')),
  creci: z.string().max(30).nullish().or(z.literal('')),
  is_active: z.boolean().default(true),
})

export async function createBrokerAction(formData: unknown): Promise<ActionResult<Broker>> {
  const parsed = brokerSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }
  const { email, phone, creci, ...rest } = parsed.data
  try {
    const broker = await repo.createBroker({
      ...rest,
      email: email || null,
      phone: phone || null,
      creci: creci || null,
      metadata: null,
    })
    revalidatePath('/brokers')
    return { success: true, data: broker }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar captador' }
  }
}

export async function updateBrokerAction(id: string, formData: unknown): Promise<ActionResult<Broker>> {
  const parsed = brokerSchema.partial().safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') }
  }
  const { email, phone, creci, ...rest } = parsed.data
  try {
    const broker = await repo.updateBroker(id, {
      ...rest,
      ...(email !== undefined ? { email: email || null } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(creci !== undefined ? { creci: creci || null } : {}),
    })
    revalidatePath('/brokers')
    return { success: true, data: broker }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar captador' }
  }
}
