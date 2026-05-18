'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { processImport } from '@/lib/services/import.service'
import type { ImportableField } from '@/types/domain'

interface ImportResult {
  created: number
  updated: number
  skipped: number
  stale: number
  errors: Array<{ row: number; message: string }>
}

export async function processImportAction(
  importId: string,
  columnMapping: Record<string, ImportableField>,
): Promise<ImportResult> {
  const supabase = await createClient()

  await supabase
    .from('imports')
    .update({ status: 'processando', column_mapping: columnMapping })
    .eq('id', importId)

  const { data: importRecord } = await supabase
    .from('imports')
    .select('raw_headers, total_rows')
    .eq('id', importId)
    .single()

  let result: ImportResult = { created: 0, updated: 0, skipped: 0, stale: 0, errors: [] }

  try {
    const { data: rawData } = await supabase
      .from('imports')
      .select('metadata')
      .eq('id', importId)
      .single()

    const rows = (rawData?.metadata as { rows?: Record<string, string>[] } | null)?.rows ?? []

    result = await processImport(importId, rows, columnMapping, true)

    await supabase
      .from('imports')
      .update({
        status: 'concluido',
        processed_rows: (importRecord?.total_rows ?? 0),
        created_rows: result.created,
        updated_rows: result.updated,
        stale_rows: result.stale,
        finished_at: new Date().toISOString(),
        error_message: result.errors.length > 0
          ? `${result.errors.length} linha(s) com erro`
          : null,
      })
      .eq('id', importId)
  } catch (err) {
    await supabase
      .from('imports')
      .update({
        status: 'erro',
        error_message: err instanceof Error ? err.message : 'Erro desconhecido',
        finished_at: new Date().toISOString(),
      })
      .eq('id', importId)
  }

  revalidatePath('/imports')
  revalidatePath('/properties')
  return result
}
