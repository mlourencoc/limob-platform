// src/components/filters/FilterPanel.tsx
'use client'

import { useState } from 'react'
import { MultiSelect } from './MultiSelect'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATE_LABELS,
  PROPERTY_SITUATION_LABELS,
  COMMERCIAL_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
} from '@/lib/constants/labels'
import {
  PROPERTY_TYPES,
  PROPERTY_STATES,
  PROPERTY_SITUATIONS,
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
} from '@/types/domain'
import type { PropertyFilters } from '@/types/domain'

interface FilterOptions {
  cities: string[]
  neighborhoods: string[]
  brokers: Array<{ id: string; name: string }>
  developments: Array<{ id: string; name: string }>
  delivery_years: number[]
}

interface FilterPanelProps {
  options: FilterOptions
  initialFilters: PropertyFilters
  onChange: (filters: PropertyFilters) => void
}

const BEDROOMS_OPTIONS = [0, 1, 2, 3, 4].map((n) => ({
  value: String(n),
  label: n === 0 ? 'Studio' : `${n}+`,
}))

export function FilterPanel({ options, initialFilters, onChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters)

  function update(patch: Partial<PropertyFilters>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    onChange(next)
  }

  function reset() {
    const empty: PropertyFilters = {}
    setFilters(empty)
    onChange(empty)
  }

  const hasActive = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  return (
    <div className="border rounded-xl p-4 bg-card space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">Filtros</span>
        {hasActive && (
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={reset}>
            Limpar
          </Button>
        )}
      </div>

      <Separator />

      {/* Localização */}
      <FilterGroup label="Cidade">
        <MultiSelect
          options={options.cities.map((c) => ({ value: c, label: c }))}
          value={filters.cities ?? []}
          onChange={(v) => update({ cities: v })}
          placeholder="Todas as cidades"
        />
      </FilterGroup>

      <FilterGroup label="Bairro">
        <MultiSelect
          options={options.neighborhoods.map((n) => ({ value: n, label: n }))}
          value={filters.neighborhoods ?? []}
          onChange={(v) => update({ neighborhoods: v })}
          placeholder="Todos os bairros"
        />
      </FilterGroup>

      <FilterGroup label="Empreendimento">
        <MultiSelect
          options={options.developments.map((d) => ({ value: d.id, label: d.name }))}
          value={filters.development_ids ?? []}
          onChange={(v) => update({ development_ids: v })}
          placeholder="Todos"
        />
      </FilterGroup>

      <Separator />

      {/* Tipo */}
      <FilterGroup label="Tipo">
        <MultiSelect
          options={PROPERTY_TYPES.map((t) => ({ value: t, label: PROPERTY_TYPE_LABELS[t] }))}
          value={filters.types ?? []}
          onChange={(v) => update({ types: v as PropertyFilters['types'] })}
          placeholder="Todos os tipos"
        />
      </FilterGroup>

      <FilterGroup label="Quartos">
        <MultiSelect
          options={BEDROOMS_OPTIONS}
          value={(filters.bedrooms ?? []).map(String)}
          onChange={(v) => update({ bedrooms: v.map(Number) })}
          placeholder="Qualquer"
        />
      </FilterGroup>

      <FilterGroup label="Vagas">
        <MultiSelect
          options={[0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
          value={(filters.parking_spots ?? []).map(String)}
          onChange={(v) => update({ parking_spots: v.map(Number) })}
          placeholder="Qualquer"
        />
      </FilterGroup>

      <Separator />

      {/* Preço */}
      <FilterGroup label="Faixa de preço (R$)">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Mín"
            className="h-8 text-xs"
            value={filters.price_min ?? ''}
            onChange={(e) => update({ price_min: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Máx"
            className="h-8 text-xs"
            value={filters.price_max ?? ''}
            onChange={(e) => update({ price_max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </FilterGroup>

      <Separator />

      {/* Status */}
      <FilterGroup label="Status comercial">
        <MultiSelect
          options={COMMERCIAL_STATUSES.map((s) => ({ value: s, label: COMMERCIAL_STATUS_LABELS[s] }))}
          value={filters.commercial_statuses ?? []}
          onChange={(v) => update({ commercial_statuses: v as PropertyFilters['commercial_statuses'] })}
          placeholder="Todos"
        />
      </FilterGroup>

      <FilterGroup label="Estado">
        <MultiSelect
          options={PROPERTY_STATES.map((s) => ({ value: s, label: PROPERTY_STATE_LABELS[s] }))}
          value={filters.states ?? []}
          onChange={(v) => update({ states: v as PropertyFilters['states'] })}
          placeholder="Todos"
        />
      </FilterGroup>

      <FilterGroup label="Situação">
        <MultiSelect
          options={PROPERTY_SITUATIONS.map((s) => ({ value: s, label: PROPERTY_SITUATION_LABELS[s] }))}
          value={filters.situations ?? []}
          onChange={(v) => update({ situations: v as PropertyFilters['situations'] })}
          placeholder="Todas"
        />
      </FilterGroup>

      <FilterGroup label="Entrega">
        <MultiSelect
          options={DELIVERY_STATUSES.map((s) => ({ value: s, label: DELIVERY_STATUS_LABELS[s] }))}
          value={filters.delivery_statuses ?? []}
          onChange={(v) => update({ delivery_statuses: v as PropertyFilters['delivery_statuses'] })}
          placeholder="Todos"
        />
      </FilterGroup>

      <Separator />

      {/* Captador */}
      <FilterGroup label="Captador">
        <MultiSelect
          options={options.brokers.map((b) => ({ value: b.id, label: b.name }))}
          value={filters.broker_ids ?? []}
          onChange={(v) => update({ broker_ids: v })}
          placeholder="Todos"
        />
      </FilterGroup>

      <Separator />

      {/* Extras */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="show_stale"
          checked={filters.show_stale ?? false}
          onCheckedChange={(v) => update({ show_stale: Boolean(v) })}
        />
        <label htmlFor="show_stale" className="text-xs cursor-pointer">
          Mostrar desatualizados
        </label>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  )
}
