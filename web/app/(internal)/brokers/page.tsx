import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getBrokers } from '@/lib/supabase/broker.repo'

export default async function BrokersPage() {
  const brokers = await getBrokers()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Captadores</h1>
          <p className="text-sm text-muted-foreground">
            {brokers.length} cadastrado{brokers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/brokers/new">
            <Plus size={16} className="mr-1.5" />
            Novo captador
          </Link>
        </Button>
      </div>

      {brokers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum captador cadastrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brokers.map((b) => (
            <Card key={b.id} className={b.is_active ? '' : 'opacity-60'}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-medium leading-snug">{b.name}</CardTitle>
                  <Badge variant={b.is_active ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {b.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {b.email && <p className="truncate">{b.email}</p>}
                {b.phone && <p>{b.phone}</p>}
                {b.creci && <p className="text-xs">CRECI: {b.creci}</p>}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <Link href={`/brokers/${b.id}/edit`}>
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
