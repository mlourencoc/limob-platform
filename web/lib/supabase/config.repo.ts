import { createClient } from './server'
import type {
  ConfigGroup, ConfigGroupInsert, ConfigGroupUpdate,
  ConfigSubgroup, ConfigSubgroupInsert, ConfigSubgroupUpdate,
  ConfigField, ConfigFieldInsert, ConfigFieldUpdate,
} from '@/types/domain'

const db = async () => createClient().then(c => c as any)

// ============================================================
// GROUPS
// ============================================================

export async function getConfigGroups(): Promise<ConfigGroup[]> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_groups')
    .select('*')
    .order('display_order')
  if (error) throw new Error(`getConfigGroups: ${error.message}`)
  return (data ?? []) as ConfigGroup[]
}

export async function createConfigGroup(input: ConfigGroupInsert): Promise<ConfigGroup> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_groups')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(`createConfigGroup: ${error.message}`)
  return data as ConfigGroup
}

export async function updateConfigGroup(id: string, input: ConfigGroupUpdate): Promise<ConfigGroup> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_groups')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`updateConfigGroup: ${error.message}`)
  return data as ConfigGroup
}

export async function deleteConfigGroups(ids: string[]): Promise<void> {
  const supabase = await db()
  const { error } = await supabase
    .from('config_groups')
    .delete()
    .in('id', ids)
  if (error) throw new Error(`deleteConfigGroups: ${error.message}`)
}

export async function reorderConfigGroups(items: { id: string; display_order: number }[]): Promise<void> {
  const supabase = await db()
  for (const item of items) {
    await supabase.from('config_groups').update({ display_order: item.display_order }).eq('id', item.id)
  }
}

// ============================================================
// SUBGROUPS
// ============================================================

export async function getConfigSubgroups(groupId?: string): Promise<ConfigSubgroup[]> {
  const supabase = await db()
  let query = supabase.from('config_subgroups').select('*').order('display_order')
  if (groupId) query = query.eq('group_id', groupId)
  const { data, error } = await query
  if (error) throw new Error(`getConfigSubgroups: ${error.message}`)
  return (data ?? []) as ConfigSubgroup[]
}

export async function createConfigSubgroup(input: ConfigSubgroupInsert): Promise<ConfigSubgroup> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_subgroups')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(`createConfigSubgroup: ${error.message}`)
  return data as ConfigSubgroup
}

export async function updateConfigSubgroup(id: string, input: ConfigSubgroupUpdate): Promise<ConfigSubgroup> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_subgroups')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`updateConfigSubgroup: ${error.message}`)
  return data as ConfigSubgroup
}

export async function deleteConfigSubgroups(ids: string[]): Promise<void> {
  const supabase = await db()
  const { error } = await supabase
    .from('config_subgroups')
    .delete()
    .in('id', ids)
  if (error) throw new Error(`deleteConfigSubgroups: ${error.message}`)
}

// ============================================================
// FIELDS
// ============================================================

export async function getConfigFields(subgroupId?: string): Promise<ConfigField[]> {
  const supabase = await db()
  let query = supabase.from('config_fields').select('*').order('display_order')
  if (subgroupId) query = query.eq('subgroup_id', subgroupId)
  const { data, error } = await query
  if (error) throw new Error(`getConfigFields: ${error.message}`)
  return (data ?? []) as ConfigField[]
}

export async function createConfigField(input: ConfigFieldInsert): Promise<ConfigField> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_fields')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(`createConfigField: ${error.message}`)
  return data as ConfigField
}

export async function updateConfigField(id: string, input: ConfigFieldUpdate): Promise<ConfigField> {
  const supabase = await db()
  const { data, error } = await supabase
    .from('config_fields')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`updateConfigField: ${error.message}`)
  return data as ConfigField
}

export async function deleteConfigFields(ids: string[]): Promise<void> {
  const supabase = await db()
  const { error } = await supabase
    .from('config_fields')
    .delete()
    .in('id', ids)
  if (error) throw new Error(`deleteConfigFields: ${error.message}`)
}

// ============================================================
// ALL (para carregar tudo de uma vez na página de config)
// ============================================================

export async function getAllConfig() {
  const [groups, subgroups, fields] = await Promise.all([
    getConfigGroups(),
    getConfigSubgroups(),
    getConfigFields(),
  ])
  return { groups, subgroups, fields }
}
