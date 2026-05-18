// lib/constants/labels.ts
// Labels legíveis para exibição dos enums do domínio.
// �snica fonte de verdade para tradução enum �?' texto PT-BR.

import type {
  PropertyType,
  PropertySubtype,
  PropertyState,
  PropertySituation,
  CommercialStatus,
  DeliveryStatus,
  LinkType,
} from '@/types/domain';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
  rural: 'Rural',
  outro: 'Outro',
};

export const PROPERTY_SUBTYPE_LABELS: Record<PropertySubtype, string> = {
  padrao: 'Padrão',
  cobertura: 'Cobertura',
  duplex: 'Duplex',
  triplex: 'Triplex',
  studio: 'Studio',
  kitnet: 'Kitnet',
  flat: 'Flat',
  sobrado: 'Sobrado',
  condominio_fechado: 'Condomínio Fechado',
  outro: 'Outro',
};

export const PROPERTY_STATE_LABELS: Record<PropertyState, string> = {
  novo: 'Novo',
  seminovo: 'Seminovo',
  usado: 'Usado',
};

export const PROPERTY_SITUATION_LABELS: Record<PropertySituation, string> = {
  na_planta: 'Na Planta',
  em_construcao: 'Em Construção',
  pronto: 'Pronto',
};

export const COMMERCIAL_STATUS_LABELS: Record<CommercialStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  locado: 'Locado',
  inativo: 'Inativo',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  futuro: 'Futuro',
  em_obra: 'Em Obra',
  entregue: 'Entregue',
};

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  drive_fotos: 'Fotos (Drive)',
  drive_documentos: 'Documentos (Drive)',
  localizacao: 'Localização',
  tour_virtual: 'Tour Virtual',
  outro: 'Outro',
};

// ============================================================
// BADGE COLORS �?" para uso com Tailwind + ShadCN Badge
// ============================================================

export const COMMERCIAL_STATUS_COLORS: Record<CommercialStatus, string> = {
  disponivel: 'bg-emerald-100 text-emerald-800',
  reservado: 'bg-amber-100 text-amber-800',
  vendido: 'bg-slate-100 text-slate-600',
  locado: 'bg-blue-100 text-blue-800',
  inativo: 'bg-red-100 text-red-700',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  futuro: 'bg-purple-100 text-purple-800',
  em_obra: 'bg-orange-100 text-orange-800',
  entregue: 'bg-emerald-100 text-emerald-800',
};

// ============================================================
// FORMATADORES
// ============================================================

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '�?"';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value: number | null | undefined): string {
  if (value == null) return '�?"';
  return `${value.toLocaleString('pt-BR')} m²`;
}

export function formatPropertyAge(years: number | null | undefined): string {
  if (years == null) return '�?"';
  if (years === 0) return 'Entregue este ano';
  if (years < 0) return `Entrega em ${Math.abs(years)} ano${Math.abs(years) > 1 ? 's' : ''}`;
  return `${years} ano${years > 1 ? 's' : ''}`;
}

export function formatRooms(bedrooms: number | null, suites: number | null): string {
  if (bedrooms == null) return '�?"';
  const base = `${bedrooms} qto${bedrooms > 1 ? 's' : ''}`;
  if (suites) return `${base} (${suites} suíte${suites > 1 ? 's' : ''})`;
  return base;
}
