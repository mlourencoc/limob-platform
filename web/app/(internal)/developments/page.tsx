import Link from 'next/link'
import { Plus, Pencil, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDevelopments } from '@/lib/supabase/development.repo'

export default async function DevelopmentsPage() {
  const developments = await getDevelopments()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Empreendimentos</h1>
          <p className="text-sm text-muted-foreground">
            {developments.length} cadastrado{developments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/developments/new">
            <Plus size={16} className="mr-1.5" />
            Novo empreendimento
          </Link>
        </Button>
      </div>

      {developments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum empreendimento cadastrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {developments.map((d) => (
            <Card key={d.id} className={d.is_active ? '' : 'opacity-60'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-medium leading-snug">{d.name}</CardTitle>
                  <Badge variant={d.is_active ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {d.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {d.builder && <p className="font-medium text-foreground/80">{d.builder}</p>}
                {(d.city || d.neighborhood) && (
                  <p className="flex items-center gap-1">
                    <MapPin size={11} />
                    {[d.neighborhood, d.city].filter(Boolean).join(', ')}
                  </p>
                )}
                {d.address && <p className="text-xs truncate">{d.address}</p>}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <Link href={`/developments/${d.id}/edit`}>
                      <Pencil size={12} className="mr-1" /> Editar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
