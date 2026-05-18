// src/components/properties/PropertyDetail.tsx

import { ExternalLink, BedDouble, Bath, Car, Ruler, Building2, MapPin, Tag, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_SUBTYPE_LABELS,
  PROPERTY_STATE_LABELS,
  PROPERTY_SITUATION_LABELS,
  COMMERCIAL_STATUS_LABELS,
  COMMERCIAL_STATUS_COLORS,
  DELIVERY_STATUS_LABELS,
  LINK_TYPE_LABELS,
  formatCurrency,
  formatArea,
  formatPropertyAge,
} from '@/lib/constants/labels'
import { cn } from '@/lib/utils'
import type { PropertyWithLinks } from '@/types/domain'

interface PropertyDetailProps {
  property: PropertyWithLinks
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  return (
    <div className="space-y-6">
      {/* Stale warning */}
      {property.is_stale && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <AlertTriangle size={15} />
          Este imóvel não apareceu na última importação e pode estar desatualizado.
        </div>
      )}

      {/* Badges principais */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
        {property.subtype && (
          <Badge variant="outline">{PROPERTY_SUBTYPE_LABELS[property.subtype]}</Badge>
        )}
        <Badge className={cn(COMMERCIAL_STATUS_COLORS[property.commercial_status])}>
          {COMMERCIAL_STATUS_LABELS[property.commercial_status]}
        </Badge>
        {property.delivery_status && (
          <Badge variant="secondary">{DELIVERY_STATUS_LABELS[property.delivery_status]}</Badge>
        )}
      </div>

      {/* Preço */}
      {property.price && (
        <div>
          <p className="text-2xl font-semibold">{formatCurrency(property.price)}</p>
          {property.condo_fee && (
            <p className="text-sm text-muted-foreground">
              + {formatCurrency(property.condo_fee)}/mês condomínio
            </p>
          )}
        </div>
      )}

      <Separator />

      {/* Localização */}
      <DetailSection icon={MapPin} title="Localização">
        <DetailRow label="Cidade" value={property.city} />
        <DetailRow label="Bairro" value={property.neighborhood} />
        <DetailRow label="Endereço" value={property.address} />
        {property.development_name && (
          <DetailRow label="Empreendimento" value={property.development_name} />
        )}
        {property.builder && <DetailRow label="Construtora" value={property.builder} />}
        {property.unit && <DetailRow label="Unidade" value={property.unit} />}
      </DetailSection>

      <Separator />

      {/* Composição */}
      <DetailSection icon={Ruler} title="Composição">
        <div className="grid grid-cols-2 gap-y-2">
          <DetailRow label="Área" value={formatArea(property.area_m2)} />
          <DetailRow label="Quartos" value={property.bedrooms != null ? String(property.bedrooms) : null} />
          <DetailRow label="Suítes" value={property.suites != null ? String(property.suites) : null} />
          <DetailRow label="Vagas" value={property.parking_spots != null ? String(property.parking_spots) : null} />
          <DetailRow label="Escaninho" value={property.storage_unit ? 'Sim' : 'Não'} />
        </div>
      </DetailSection>

      <Separator />

      {/* Status */}
      <DetailSection icon={Tag} title="Status">
        <div className="grid grid-cols-2 gap-y-2">
          {property.state && <DetailRow label="Estado" value={PROPERTY_STATE_LABELS[property.state]} />}
          {property.situation && <DetailRow label="Situação" value={PROPERTY_SITUATION_LABELS[property.situation]} />}
          {property.delivery_year && (
            <DetailRow
              label="Entrega"
              value={`${property.delivery_year} (${formatPropertyAge(property.property_age_years)})`}
            />
          )}
        </div>
      </DetailSection>

      {/* Captador */}
      {property.broker_name && (
        <>
          <Separator />
          <DetailSection icon={Building2} title="Captador">
            <DetailRow label="Nome" value={property.broker_name} />
            <DetailRow label="E-mail" value={property.broker_email} />
            <DetailRow label="CRECI" value={property.broker_creci} />
          </DetailSection>
        </>
      )}

      {/* Descrição */}
      {property.description && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>
        </>
      )}

      {/* Diferenciais */}
      {property.highlights?.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Diferenciais</h3>
            <div className="flex flex-wrap gap-1.5">
              {property.highlights.map((h) => (
                <Badge key={h} variant="secondary" className="text-xs font-normal">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Links externos */}
      {property.links?.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Links externos</h3>
            <div className="flex flex-col gap-1.5">
              {property.links.map((link) => (
                <Button key={link.id} variant="outline" size="sm" asChild className="justify-start h-auto py-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={13} className="mr-2 shrink-0" />
                    <span className="truncate">{link.label ?? LINK_TYPE_LABELS[link.type]}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon size={14} />
        {title}
      </h3>
      {children}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-4 text-sm">
      <span className="text-muted-foreground min-w-24">{label}</span>
      <span>{value}</span>
    </div>
  )
}
