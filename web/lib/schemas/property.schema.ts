// lib/schemas/property.schema.ts
// Validação com Zod — usada em Server Actions e formulários.

import { z } from 'zod'
import {
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
  LINK_TYPES,
} from '@/types/domain'
import {
  typeRequiresDevelopment,
  typeRequiresArea,
} from '@/lib/constants/classifications'

// ============================================================
// PROPERTY LINK
// ============================================================

export const propertyLinkSchema = z.object({
  type: z.enum(LINK_TYPES),
  url: z.string().url('URL inválida'),
  label: z.string().max(100).nullable().default(null),
  sort_order: z.number().int().min(0).default(0),
})

// ============================================================
// PROPERTY — criação e edição (v2 com cascata)
// ============================================================

export const propertySchema = z
  .object({
    // Classificação (cascata)
    objetivo: z.string().min(1, 'Objetivo é obrigatório'),
    categoria: z.string().min(1, 'Categoria é obrigatória'),
    type: z.string().min(1, 'Tipo é obrigatório'),       // "tipo" no form, "type" no banco
    subtype: z.string().nullish(),                        // "subtipo" no form

    // Localização (obrigatória se NÃO requer empreendimento)
    city: z.string().max(100).nullish(),
    neighborhood: z.string().max(100).nullish(),
    address: z.string().max(255).nullish(),

    // Empreendimento (obrigatório se tipo requer)
    development_id: z.string().uuid().nullish(),
    broker_id: z.string().uuid().nullish(),

    // Legado / compatibilidade
    unit: z.string().max(50).nullish(),
    builder: z.string().max(150).nullish(),

    // Dados da Unidade (condicionais)
    unit_number: z.string().max(20).nullish(),
    floor_number: z.string().max(10).nullish(),
    unit_final: z.string().max(5).nullish(),
    sun_position: z.enum(['leste', 'oeste', 'norte', 'sul']).nullish(),

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
    state: z.string().nullish(),
    situation: z.string().nullish(),
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
  })
  .superRefine((data, ctx) => {
    // Validação: preço obrigatório
    if (!data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Valor do imóvel é obrigatório',
      })
    }

    // Validação: se tipo requer empreendimento → development_id obrigatório
    if (data.type && typeRequiresDevelopment(data.type) && !data.development_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['development_id'],
        message: 'Empreendimento é obrigatório para este tipo de imóvel',
      })
    }

    // Validação: se tipo NÃO requer empreendimento → localização obrigatória
    if (data.type && !typeRequiresDevelopment(data.type)) {
      if (!data.city?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['city'], message: 'Cidade é obrigatória' })
      }
      if (!data.neighborhood?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['neighborhood'], message: 'Bairro é obrigatório' })
      }
      if (!data.address?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Endereço é obrigatório' })
      }
    }

    // Validação: área obrigatória para certos tipos
    if (data.type && typeRequiresArea(data.type) && !data.area_m2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['area_m2'],
        message: 'Área é obrigatória para este tipo de imóvel',
      })
    }

    // Validação: ano de entrega obrigatório se situação = em construção
    if (data.situation === 'em_construcao' && !data.delivery_year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['delivery_year'],
        message: 'Ano de entrega é obrigatório quando em construção',
      })
    }
  })

export type PropertyFormValues = z.infer<typeof propertySchema>

// Schema para update — todos os campos opcionais
export const propertyUpdateSchema = propertySchema.partial()

// ============================================================
// FILTROS
// ============================================================

export const propertyFiltersSchema = z.object({
  objetivos: z.array(z.string()).default([]),
  categorias: z.array(z.string()).default([]),
  cities: z.array(z.string()).default([]),
  neighborhoods: z.array(z.string()).default([]),
  development_ids: z.array(z.string().uuid()).default([]),
  broker_ids: z.array(z.string().uuid()).default([]),
  types: z.array(z.string()).default([]),
  subtypes: z.array(z.string()).default([]),
  bedrooms: z.array(z.number().int().min(0)).default([]),
  suites: z.array(z.number().int().min(0)).default([]),
  parking_spots: z.array(z.number().int().min(0)).default([]),
  states: z.array(z.string()).default([]),
  situations: z.array(z.string()).default([]),
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
})

export type PropertyFiltersFormValues = z.infer<typeof propertyFiltersSchema>

// ============================================================
// IMPORT — mapeamento de colunas
// ============================================================

export const columnMappingSchema = z.object({
  source_column: z.string(),
  target_field: z.string().nullish(),
})

export const importConfigSchema = z.object({
  filename: z.string(),
  column_mappings: z.array(columnMappingSchema),
  mark_missing_as_stale: z.boolean().default(true),
})

export type ImportConfigValues = z.infer<typeof importConfigSchema>
