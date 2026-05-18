// src/lib/supabase/development.repo.ts

import { createClient } from './server'
import type { Development, DevelopmentInsert, DevelopmentUpdate } from '@/types/domain'

export async function getDevelopments(): Promise<Development[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('developments')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw new Error(`getDevelopments: ${error.message}`)
  return (data ?? []) as Development[]
}

export async function getDevelopmentById(id: string): Promise<Development | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('developments').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getDevelopmentById: ${error.message}`)
  }
  return data as Development
}

export async function createDevelopment(input: DevelopmentInsert): Promise<Development> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from('developments').insert(input as any).select().single()
  if (error) throw new Error(`createDevelopment: ${error.message}`)
  return data as Development
}

export async function updateDevelopment(id: string, input: DevelopmentUpdate): Promise<Development> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from('developments').update(input as any).eq('id', id).select().single()
  if (error) throw new Error(`updateDevelopment: ${error.message}`)
  return data as Development
}
