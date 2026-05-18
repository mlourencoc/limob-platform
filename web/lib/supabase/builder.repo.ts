import { createClient } from './server'
import type { Builder, BuilderInsert, BuilderUpdate } from '@/types/domain'

export async function getBuilders(onlyActive = true): Promise<Builder[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from('builders').select('*').order('name')
  if (onlyActive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw new Error(`getBuilders: ${error.message}`)
  return (data ?? []) as Builder[]
}

export async function getBuilderById(id: string): Promise<Builder | null> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('builders').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getBuilderById: ${error.message}`)
  }
  return data as Builder
}

export async function createBuilder(input: BuilderInsert): Promise<Builder> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('builders').insert(input).select().single()
  if (error) throw new Error(`createBuilder: ${error.message}`)
  return data as Builder
}

export async function updateBuilder(id: string, input: BuilderUpdate): Promise<Builder> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from('builders').update(input).eq('id', id).select().single()
  if (error) throw new Error(`updateBuilder: ${error.message}`)
  return data as Builder
}
