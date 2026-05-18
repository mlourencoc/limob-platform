// src/components/properties/PropertyGrid.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyCard } from './PropertyCard'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'
import type { PropertyEnriched, PropertyFilters } from '@/types/domain'

interface FilterOptions {
  cities: string[]
  neighborhoods: string[]
  brokers: Array<{ id: string; name: string }>
  developments: Array<{ id: string; name: string }>
  delivery_years: number[]
}

interface PropertyGridProps {
  properties: PropertyEnriched[]
  filterOptions: FilterOptions
  initialFilters: PropertyFilters
}

export function PropertyGrid({ properties, filterOptions, initialFilters }: PropertyGridProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilterChange(filters: PropertyFilters) {
    const params = new URLSearchParams()

    if (filters.cities?.length)              params.set('cities', filters.cities.join(','))
    if (filters.types?.length)               params.set('types', filters.types.join(','))
    if (filters.commercial_statuses?.length) params.set('commercial_statuses', filters.commercial_statuses.join(','))
    if (filters.show_stale)                  params.set('show_stale', 'true')
    if (filters.search)                      params.set('search', filters.search)

    startTransition(() => {
      router.push(`/properties?${params.toString()}`)
    })
  }

  const hasActiveFilters = Object.values(initialFilters).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  return (
    <div className="flex gap-5 items-start">
      {/* Filtros (sidebar) */}
      {showFilters && (
        <div className="w-64 flex-shrink-0">
          <FilterPanel
            options={filterOptions}
            initialFilters={initialFilters}
            onChange={handleFilterChange}
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={14} className="mr-1.5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                �-�
              </span>
            )}
          </Button>
        </div>

        {/* Cards */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-sm">Nenhum imóvel encontrado.</p>
            {hasActiveFilters && (
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => handleFilterChange({})}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
