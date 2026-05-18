'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { processImportAction } from '@/lib/actions/imports'
import type { ImportPreview, ColumnMapping } from '@/types/domain'

type Step = 'upload' | 'mapping' | 'done'

interface ImportResult {
  created: number
  updated: number
  skipped: number
  stale: number
  errors: Array<{ row: number; message: string }>
}

const IMPORTABLE_FIELD_LABELS: Record<string, string> = {
  type: 'Tipo',
  subtype: 'Subtipo',
  city: 'Cidade',
  neighborhood: 'Bairro',
  address: 'Endereço',
  development_name: 'Empreendimento',
  builder: 'Construtora',
  unit: 'Unidade',
  bedrooms: 'Quartos',
  suites: 'Suítes',
  parking_spots: 'Vagas',
  area_m2: 'Área (m²)',
  price: 'Valor (R$)',
  condo_fee: 'Condomínio (R$)',
  state: 'Estado',
  situation: 'Situação',
  commercial_status: 'Status comercial',
  delivery_year: 'Ano de entrega',
  broker_name: 'Captador',
  description: 'Descrição',
  highlights: 'Diferenciais',
  external_ref: 'Referência externa',
  storage_unit: 'Escaninho',
}

export function ImportUploader() {
  const [step, setStep] = useState<Step>('upload')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mappings, setMappings] = useState<ColumnMapping[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [filename, setFilename] = useState('')
  const [importId, setImportId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file) return
    setFilename(file.name)

    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/imports/preview', { method: 'POST', body: fd })
    if (!res.ok) return

    const { preview: p, importId: id } = await res.json()
    setPreview(p)
    setMappings(p.column_mappings)
    setImportId(id)
    setStep('mapping')
  }

  function setMapping(sourceColumn: string, targetField: string | null) {
    setMappings((prev) =>
      prev.map((m) => m.source_column === sourceColumn ? { ...m, target_field: targetField as ColumnMapping['target_field'] } : m)
    )
  }

  function handleConfirm() {
    startTransition(async () => {
      const columnMapping = Object.fromEntries(
        mappings
          .filter((m) => m.target_field)
          .map((m) => [m.source_column, m.target_field!])
      )
      const res = await processImportAction(importId, columnMapping)
      setResult(res)
      setStep('done')
    })
  }

  function reset() {
    setStep('upload')
    setPreview(null)
    setMappings([])
    setResult(null)
    setFilename('')
    setImportId('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (step === 'done' && result) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle size={18} />
            <span className="font-medium">Importação concluída</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Criados" value={result.created} color="emerald" />
            <Stat label="Atualizados" value={result.updated} color="blue" />
            <Stat label="Ignorados" value={result.skipped} color="slate" />
            <Stat label="Desatualizados" value={result.stale} color="amber" />
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-destructive flex items-center gap-1">
                <AlertCircle size={13} /> {result.errors.length} erro{result.errors.length > 1 ? 's' : ''}
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-auto">
                {result.errors.map((e) => (
                  <li key={e.row}>Linha {e.row}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={reset}>Nova importação</Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'mapping' && preview) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{filename}</p>
              <p className="text-xs text-muted-foreground">{preview.total_rows} linhas detectadas</p>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}><X size={14} /></Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Mapeamento de colunas</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Coluna da planilha</th>
                    <th className="text-left px-3 py-2 font-medium">Amostras</th>
                    <th className="text-left px-3 py-2 font-medium">Campo LIMOB</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mappings.map((m) => (
                    <tr key={m.source_column} className="hover:bg-muted/40">
                      <td className="px-3 py-2 font-mono text-[11px]">{m.source_column}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {m.sample_values.filter(Boolean).slice(0, 2).join(', ')}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          className="text-xs border rounded px-1.5 py-1 bg-background w-full max-w-[180px]"
                          value={m.target_field ?? ''}
                          onChange={(e) => setMapping(m.source_column, e.target.value || null)}
                        >
                          <option value="">— ignorar —</option>
                          {Object.entries(IMPORTABLE_FIELD_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? 'Processando...' : 'Confirmar importação'}
            </Button>
            <Button variant="outline" onClick={reset} disabled={isPending}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`border-dashed cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
      onClick={() => fileRef.current?.click()}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <FileSpreadsheet size={32} className="opacity-50" />
        <div className="text-center">
          <p className="text-sm font-medium">Arraste um arquivo ou clique para selecionar</p>
          <p className="text-xs mt-1">Suporta .xlsx, .xls e .csv</p>
        </div>
        <Button size="sm" variant="outline" type="button">
          <Upload size={14} className="mr-1.5" /> Selecionar arquivo
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50',
    blue: 'text-blue-700 bg-blue-50',
    slate: 'text-slate-600 bg-slate-100',
    amber: 'text-amber-700 bg-amber-50',
  }
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${colorMap[color]}`}>
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
