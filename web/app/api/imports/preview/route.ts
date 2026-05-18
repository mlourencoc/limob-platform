import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseSpreadsheet, buildImportPreview } from '@/lib/services/import.service'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const { headers, rows } = parseSpreadsheet(buffer)

    if (!headers.length) {
      return NextResponse.json({ error: 'Arquivo vazio ou sem cabeçalho' }, { status: 400 })
    }

    const preview = buildImportPreview(headers, rows)

    const supabase = await createClient()
    const { data: importRecord, error } = await supabase
      .from('imports')
      .insert({
        filename: file.name,
        status: 'pendente',
        total_rows: preview.total_rows,
        raw_headers: headers,
        metadata: { rows },
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ preview, importId: importRecord.id })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
