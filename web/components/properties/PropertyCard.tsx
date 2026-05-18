// src/components/properties/PropertyCard.tsx

import Link from 'next/link'
import { MapPin, BedDouble, Car, Ruler, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getPropertyTypeLabel,
  COMMERCIAL_STATUS_LABELS,
  COMMERCIAL_STATUS_COLORS,
  formatCurrency,
  formatArea,
} from '@/lib/constants/labels'
import { cn } from '@/lib/utils'
import type { PropertyEnriched } from '@/types/domain'

interface PropertyCardProps {
  property: PropertyEnriched
}

export function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    type,
    city,
    neighborhood,
    development_name,
    broker_name,
    price,
    area_m2,
    bedrooms,
    parking_spots,
    commercial_status,
    is_stale,
    unit,
  } = property

  const title = development_name ?? city
  const subtitle = [neighborhood, city].filter(Boolean).join(', ')

  return (
    <Link href={`/properties/${id}`} className="block group">
      <Card
        className={cn(
          'transition-shadow hover:shadow-md h-full',
          is_stale && 'border-dashed opacity-70'
        )}
      >
        <CardContent className="p-4 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {title}
              </p>
              {unit && (
                <p className="text-xs text-muted-foreground">Unidade {unit}</p>
              )}
            </div>
            <Badge
              className={cn('text-xs shrink-0', COMMERCIAL_STATUS_COLORS[commercial_status])}
              variant="secondary"
            >
              {COMMERCIAL_STATUS_LABELS[commercial_status]}
            </Badge>
          </div>

          {/* Localização */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} />
            <span className="truncate">{subtitle || city}</span>
          </div>

          {/* Atributos */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
              {getPropertyTypeLabel(type)}
            </span>
            {area_m2 && (
              <span className="flex items-center gap-0.5">
                <Ruler size={11} />
                {formatArea(area_m2)}
              </span>
            )}
            {bedrooms != null && (
              <span className="flex items-center gap-0.5">
                <BedDouble size={11} />
                {bedrooms}
              </span>
            )}
            {parking_spots != null && (
              <span className="flex items-center gap-0.5">
                <Car size={11} />
                {parking_spots}
              </span>
            )}
          </div>

          {/* Preço */}
          <div className="flex items-end justify-between mt-auto pt-1 border-t">
            <span className="font-semibold text-sm">
              {price ? formatCurrency(price) : '�?"'}
            </span>
            {broker_name && (
              <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                {broker_name}
              </span>
            )}
          </div>

          {/* Indicador de stale */}
          {is_stale && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600">
              <AlertTriangle size={11} />
              Desatualizado
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
