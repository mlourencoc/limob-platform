import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Phone, MapPin } from 'lucide-react'
import type { Builder } from '@/types/domain'

export default async function BuildersPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('builders')
    .select('*')
    .order('name')

  const builders = (data ?? []) as Builder[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Construtoras</h1>
          <p className="text-sm text-muted-foreground">{builders.length} cadastrada{builders.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild>
          <Link href="/builders/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova construtora
          </Link>
        </Button>
      </div>

      {builders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma construtora cadastrada.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/builders/new">Cadastrar primeira construtora</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {builders.map((b) => (
            <div key={b.id} className="border rounded-lg p-4 bg-card flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{b.name}</p>
                  {!b.is_active && (
                    <span className="text-xs text-muted-foreground">(inativa)</span>
                  )}
                </div>
                <Button asChild size="icon" variant="ghost" className="shrink-0 h-7 w-7">
                  <Link href={`/builders/${b.id}/edit`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              {b.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{b.phone}</span>
                </div>
              )}

              {(b.city || b.state) && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {[b.address, b.neighborhood, b.city, b.state].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
