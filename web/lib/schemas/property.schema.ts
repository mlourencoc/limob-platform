// lib/schemas/property.schema.ts
// Validação com Zod �?" usada em Server Actions e formulários.
// Fonte única de verdade para regras de validação.

import { z } from 'zod';
import {
  PROPERTY_TYPES,
  PROPERTY_SUBTYPES,
  PROPERTY_STATES,
  PROPERTY_SITUATIONS,
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
  LINK_TYPES,
} from '@/types/domain';

// ============================================================
// PROPERTY LINK
// ============================================================

export const propertyLinkSchema = z.object({
  type: z.enum(LINK_TYPES),
  url: z.string().url('URL inválida'),
  label: z.string().max(100).nullable().default(null),
  sort_order: z.number().int().min(0).default(0),
});

// ============================================================
// PROPERTY �?" criação e edição
// ============================================================

export const propertySchema = z.object({
  // Classificação
  type: z.enum(PROPERTY_TYPES),
  subtype: z.enum(PROPERTY_SUBTYPES).nullish(),

  // Localização
  city: z.string().min(2, 'Cidade é obrigatória').max(100),
  neighborhood: z.string().max(100).nullish(),
  address: z.string().max(255).nullish(),

  // Relacionamentos (UUIDs opcionais)
  development_id: z.string().uuid().nullish(),
  broker_id: z.string().uuid().nullish(),

  // Unidade
  unit: z.string().max(50).nullish(),
  builder: z.string().max(150).nullish(),

  // Dimensões
  area_m2: z.number().positive('Metragem deve ser positiva').nullish(),
  bedrooms: z.number().int().min(0).max(99).nullish(),
  suites: z.number().int().min(0).max(99).nullish(),
  parking_spots: z.number().int().min(0).max(99).nullish(),
  storage_unit: z.boolean().default(false),

  // Valores
  price: z.number().positive('Valor deve ser positivo').nullish(),
  condo_fee: z.number().min(0).nullish(),

  // Status
  state: z.enum(PROPERTY_STATES).nullish(),
  situation: z.enum(PROPERTY_SITUATIONS).nullish(),
  commercial_status: z.enum(COMMERCIAL_STATUSES).default('disponivel'),
  delivery_status: z.enum(DELIVERY_STATUSES).nullish(),
  delivery_year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 30)
    .nullish(),

  // Conteúdo
  description: z.string().max(5000).nullish(),
  highlights: z.array(z.string().max(200)).default([]),

  // Links externos
  links: z.array(propertyLinkSchema).default([]),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

// Schema para update �?" todos os campos opcionais exceto os validados condicionalmente
export const propertyUpdateSchema = propertySchema.partial().extend({
  // ID obrigatório no update (passado separado, não no body)
});

// ============================================================
// FILTROS
// ============================================================

export const propertyFiltersSchema = z.object({
  cities: z.array(z.string()).default([]),
  neighborhoods: z.array(z.string()).default([]),
  development_ids: z.array(z.string().uuid()).default([]),
  broker_ids: z.array(z.string().uuid()).default([]),
  types: z.array(z.enum(PROPERTY_TYPES)).default([]),
  subtypes: z.array(z.enum(PROPERTY_SUBTYPES)).default([]),
  bedrooms: z.array(z.number().int().min(0)).default([]),
  suites: z.array(z.number().int().min(0)).default([]),
  parking_spots: z.array(z.number().int().min(0)).default([]),
  states: z.array(z.enum(PROPERTY_STATES)).default([]),
  situations: z.array(z.enum(PROPERTY_SITUATIONS)).default([]),
  commercial_statuses: z.array(z.enum(COMMERCIAL_STATUSES)).default([]),
  delivery_statuses: z.array(z.enum(DELIVERY_STATUSES)).default([]),
  delivery_years: z.array(z.number().int()).default([]),

  price_min: z.number().min(0).nullish(),
  price_max: z.number().min(0).nullish(),
  area_min: z.number().min(0).nullish(),
  area_max: z.number().min(0).nullish(),
  age_min: z.number().int().min(0).nullish(),
  age_max: z.number().int().min(0).nullish(),

  has_storage_unit: z.boolean().nullish(),
  show_stale: z.boolean().default(false),

  search: z.string().max(200).nullish(),
});

export type PropertyFiltersFormValues = z.infer<typeof propertyFiltersSchema>;

// ============================================================
// IMPORT �?" mapeamento de colunas
// ============================================================

export const columnMappingSchema = z.object({
  source_column: z.string(),
  target_field: z.string().nullish(),
});

export const importConfigSchema = z.object({
  filename: z.string(),
  column_mappings: z.array(columnMappingSchema),
  mark_missing_as_stale: z.boolean().default(true),
});

export type ImportConfigValues = z.infer<typeof importConfigSchema>;
