'use server'

import {
  createConfigGroup, updateConfigGroup, deleteConfigGroups, reorderConfigGroups,
  createConfigSubgroup, updateConfigSubgroup, deleteConfigSubgroups, reorderConfigSubgroups,
  createConfigField, updateConfigField, deleteConfigFields, reorderConfigFields,
  getAllConfig,
} from '@/lib/supabase/config.repo'
import type { ConfigGroup, ConfigSubgroup, ConfigField } from '@/types/domain'

type Result<T = void> = { success: true; data?: T } | { success: false; error: string }

// ============================================================
// GROUPS
// ============================================================

export async function createGroupAction(name: string, slug: string): Promise<Result> {
  try {
    const groups = await import('@/lib/supabase/config.repo').then(m => m.getConfigGroups())
    const maxOrder = groups.reduce((m, g) => Math.max(m, g.display_order), 0)
    await createConfigGroup({ name, slug, display_order: maxOrder + 1 })
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function updateGroupAction(id: string, name: string, slug: string): Promise<Result> {
  try {
    await updateConfigGroup(id, { name, slug })
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteGroupsAction(ids: string[]): Promise<Result> {
  try {
    await deleteConfigGroups(ids)
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function reorderGroupsAction(items: { id: string; display_order: number }[]): Promise<Result> {
  try {
    await reorderConfigGroups(items)
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function reorderSubgroupsAction(items: { id: string; display_order: number }[]): Promise<Result> {
  try {
    await reorderConfigSubgroups(items)
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function reorderFieldsAction(items: { id: string; display_order: number }[]): Promise<Result> {
  try {
    await reorderConfigFields(items)
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ============================================================
// SUBGROUPS
// ============================================================

export async function createSubgroupAction(groupId: string, name: string): Promise<Result> {
  try {
    const subs = await import('@/lib/supabase/config.repo').then(m => m.getConfigSubgroups(groupId))
    const maxOrder = subs.reduce((m, s) => Math.max(m, s.display_order), 0)
    await createConfigSubgroup({ group_id: groupId, name, display_order: maxOrder + 1 })
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function updateSubgroupAction(id: string, name: string): Promise<Result> {
  try {
    await updateConfigSubgroup(id, { name })
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteSubgroupsAction(ids: string[]): Promise<Result> {
  try {
    await deleteConfigSubgroups(ids)
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ============================================================
// FIELDS
// ============================================================

export async function createFieldAction(subgroupId: string, name: string, fieldKey: string, options: string[]): Promise<Result> {
  try {
    const fields = await import('@/lib/supabase/config.repo').then(m => m.getConfigFields(subgroupId))
    const maxOrder = fields.reduce((m, f) => Math.max(m, f.display_order), 0)
    await createConfigField({ subgroup_id: subgroupId, name, field_key: fieldKey || null, options, display_order: maxOrder + 1 })
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function updateFieldAction(id: string, name: string, fieldKey: string, options: string[]): Promise<Result> {
  try {
    await updateConfigField(id, { name, field_key: fieldKey || null, options })
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteFieldsAction(ids: string[]): Promise<Result> {
  try {
    await deleteConfigFields(ids)
    return { success: true }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ============================================================
// FETCH ALL (usado pelo client para refresh)
// ============================================================

export async function getConfigDataAction(): Promise<{ groups: ConfigGroup[]; subgroups: ConfigSubgroup[]; fields: ConfigField[] }> {
  return getAllConfig()
}
