import { createClient } from '@/lib/supabase/server'
import { ImportUploader } from '@/components/imports/ImportUploader'
import { Badge } from '@/components/ui/badge'
import type { Import } from '@/types/domain'

const IMPORT_STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  processando: 'Processando',
  concluido: 'Concluído',
  erro: 'Erro',
}

const IMPORT_STATUS_COLORS: Record<string, string> = {
  pendente: 'bg-slate-100 text-slate-600',
  processando: 'bg-blue-100 text-blue-700',
  concluido: 'bg-emerald-100 text-emerald-700',
  erro: 'bg-red-100 text-red-700',
}

export default async function ImportsPage() {
  const supabase = await createClient()
  const { data: imports } = await supabase
    .from('imports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const list = (imports ?? []) as Import[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Importações</h1>
        <p className="text-sm text-muted-foreground">
          Importe imóveis a partir de planilhas .xlsx, .xls ou .csv
        </p>
      </div>

      <div className="max-w-2xl">
        <ImportUploader />
      </div>

      {list.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Histórico recente</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Arquivo</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-right px-4 py-2.5 font-medium">Linhas</th>
                  <th className="text-right px-4 py-2.5 font-medium">Criados</th>
                  <th className="text-right px-4 py-2.5 font-medium">Atualizados</th>
                  <th className="text-left px-4 py-2.5 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((imp) => (
                  <tr key={imp.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <span className="truncate block">{imp.filename}</span>
                      {imp.error_message && (
                        <span className="text-xs text-destructive">{imp.error_message}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${IMPORT_STATUS_COLORS[imp.status]}`}
                      >
                        {IMPORT_STATUS_LABELS[imp.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {imp.total_rows ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">
                      {imp.created_rows ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-blue-700">
                      {imp.updated_rows ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {new Date(imp.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
