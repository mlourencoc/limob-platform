import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { getProperties, getFilterOptions } from '@/lib/supabase/property.repo'
import type { PropertyFilters } from '@/types/domain'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: PropertyFilters = {
    cities:              toArray(params.cities),
    neighborhoods:       toArray(params.neighborhoods),
    types:               toArray(params.types) as PropertyFilters['types'],
    commercial_statuses: toArray(params.commercial_statuses) as PropertyFilters['commercial_statuses'],
    broker_ids:          toArray(params.broker_ids),
    development_ids:     toArray(params.development_ids),
    show_stale:          params.show_stale === 'true',
    search:              typeof params.search === 'string' ? params.search : undefined,
  }

  const [{ data: properties, total }, filterOptions] = await Promise.all([
    getProperties(filters, { field: 'created_at', direction: 'desc' }, { page: 1, per_page: 60 }),
    getFilterOptions(),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Imóveis</h1>
          <p className="text-sm text-muted-foreground">
            {total} imóvel{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/properties/new">
            <Plus size={16} className="mr-1.5" />
            Novo imóvel
          </Link>
        </Button>
      </div>
      <PropertyGrid properties={properties} filterOptions={filterOptions} initialFilters={filters} />
    </div>
  )
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : value.split(',').filter(Boolean)
}
