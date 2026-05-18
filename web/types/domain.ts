// ============================================================
// LIMOB �?" Domain Types
// Alinhados 1:1 com o schema PostgreSQL
// ============================================================

// ============================================================
// ENUMS
// ============================================================

export const PROPERTY_TYPES = [
  'apartamento',
  'casa',
  'terreno',
  'comercial',
  'rural',
  'outro',
] as const;

export const PROPERTY_SUBTYPES = [
  'padrao',
  'cobertura',
  'duplex',
  'triplex',
  'studio',
  'kitnet',
  'flat',
  'sobrado',
  'condominio_fechado',
  'outro',
] as const;

export const PROPERTY_STATES = ['novo', 'seminovo', 'usado'] as const;

export const PROPERTY_SITUATIONS = [
  'na_planta',
  'em_construcao',
  'pronto',
] as const;

export const COMMERCIAL_STATUSES = [
  'disponivel',
  'reservado',
  'vendido',
  'locado',
  'inativo',
] as const;

export const DELIVERY_STATUSES = ['futuro', 'em_obra', 'entregue'] as const;

export const IMPORT_STATUSES = [
  'pendente',
  'processando',
  'concluido',
  'erro',
] as const;

export const LINK_TYPES = [
  'drive_fotos',
  'drive_documentos',
  'localizacao',
  'tour_virtual',
  'outro',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PropertySubtype = (typeof PROPERTY_SUBTYPES)[number];
export type PropertyState = (typeof PROPERTY_STATES)[number];
export type PropertySituation = (typeof PROPERTY_SITUATIONS)[number];
export type CommercialStatus = (typeof COMMERCIAL_STATUSES)[number];
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export type ImportStatus = (typeof IMPORT_STATUSES)[number];
export type LinkType = (typeof LINK_TYPES)[number];

// ============================================================
// BASE �?" campos comuns de auditoria
// ============================================================

interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// BROKER
// ============================================================

export interface Broker extends BaseEntity {
  name: string;
  email: string | null;
  phone: string | null;
  creci: string | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
}

export type BrokerInsert = Omit<Broker, 'id' | 'created_at' | 'updated_at'>;
export type BrokerUpdate = Partial<BrokerInsert>;

// ============================================================
// BUILDER (Construtora)
// ============================================================

export interface Builder extends BaseEntity {
  name: string;
  phone: string | null;
  zipcode: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
}

export type BuilderInsert = Omit<Builder, 'id' | 'created_at' | 'updated_at'>;
export type BuilderUpdate = Partial<BuilderInsert>;

// ============================================================
// DEVELOPMENT
// ============================================================

export interface Development extends BaseEntity {
  name: string;
  builder: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
}

export type DevelopmentInsert = Omit<Development, 'id' | 'created_at' | 'updated_at'>;
export type DevelopmentUpdate = Partial<DevelopmentInsert>;

// ============================================================
// PROPERTY LINK
// ============================================================

export interface PropertyLink {
  id: string;
  property_id: string;
  type: LinkType;
  url: string;
  label: string | null;
  sort_order: number;
  created_at: string;
}

export type PropertyLinkInsert = Omit<PropertyLink, 'id' | 'created_at'>;

// ============================================================
// PROPERTY
// ============================================================

export interface Property extends BaseEntity {
  // Classificação
  type: PropertyType;
  subtype: PropertySubtype | null;

  // Localização
  city: string;
  neighborhood: string | null;
  address: string | null;

  // Relacionamentos
  development_id: string | null;
  broker_id: string | null;

  // Unidade
  unit: string | null;
  builder: string | null;

  // Dimensões
  area_m2: number | null;
  bedrooms: number | null;
  suites: number | null;
  parking_spots: number | null;
  storage_unit: boolean;

  // Valores
  price: number | null;
  condo_fee: number | null;

  // Status
  state: PropertyState | null;
  situation: PropertySituation | null;
  commercial_status: CommercialStatus;
  delivery_status: DeliveryStatus | null;
  delivery_year: number | null;

  // Conteúdo
  description: string | null;
  highlights: string[];

  // Importação
  import_id: string | null;
  external_ref: string | null;
  is_stale: boolean;
  stale_since: string | null;

  // Soft delete
  deleted_at: string | null;

  metadata: Record<string, unknown> | null;
}

export type PropertyInsert = Omit<
  Property,
  'id' | 'created_at' | 'updated_at' | 'is_stale' | 'stale_since' | 'deleted_at'
>;

export type PropertyUpdate = Partial<PropertyInsert>;

// ============================================================
// PROPERTY ENRICHED �?" resultado da view v_properties_enriched
// ============================================================

export interface PropertyEnriched extends Property {
  property_age_years: number | null;  // calculado pelo banco
  broker_name: string | null;
  broker_email: string | null;
  broker_creci: string | null;
  development_name: string | null;
  development_builder: string | null;
  links_count: number;
}

// Com links carregados (join no repositório quando necessário)
export interface PropertyWithLinks extends PropertyEnriched {
  links: PropertyLink[];
}

// ============================================================
// IMPORT
// ============================================================

export interface Import {
  id: string;
  filename: string;
  status: ImportStatus;
  total_rows: number | null;
  processed_rows: number | null;
  created_rows: number | null;
  updated_rows: number | null;
  stale_rows: number | null;
  error_message: string | null;
  raw_headers: string[] | null;
  column_mapping: Record<string, string> | null;
  imported_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  finished_at: string | null;
}

export type ImportInsert = Omit<Import, 'id' | 'created_at'>;
export type ImportUpdate = Partial<ImportInsert>;

// ============================================================
// FILTER PARAMS �?" usado pelos hooks e server actions
// ============================================================

export interface PropertyFilters {
  // Multiselect
  cities?: string[];
  neighborhoods?: string[];
  development_ids?: string[];
  broker_ids?: string[];
  types?: PropertyType[];
  subtypes?: PropertySubtype[];
  bedrooms?: number[];
  suites?: number[];
  parking_spots?: number[];
  states?: PropertyState[];
  situations?: PropertySituation[];
  commercial_statuses?: CommercialStatus[];
  delivery_statuses?: DeliveryStatus[];
  delivery_years?: number[];

  // Ranges
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  age_min?: number;   // anos de idade do imóvel (calculado)
  age_max?: number;

  // Booleanos
  has_storage_unit?: boolean;
  show_stale?: boolean;

  // Busca textual
  search?: string;
}

export interface PropertySort {
  field: keyof PropertyEnriched;
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================================
// CONFIG — Grupos, Subgrupos e Campos configuráveis
// ============================================================

export interface ConfigGroup {
  id: string
  name: string
  slug: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface ConfigSubgroup {
  id: string
  group_id: string
  name: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface ConfigField {
  id: string
  subgroup_id: string
  name: string
  field_key: string | null
  options: string[]
  display_order: number
  created_at: string
  updated_at: string
}

export type ConfigGroupInsert = Omit<ConfigGroup, 'id' | 'created_at' | 'updated_at'>
export type ConfigGroupUpdate = Partial<ConfigGroupInsert>
export type ConfigSubgroupInsert = Omit<ConfigSubgroup, 'id' | 'created_at' | 'updated_at'>
export type ConfigSubgroupUpdate = Partial<ConfigSubgroupInsert>
export type ConfigFieldInsert = Omit<ConfigField, 'id' | 'created_at' | 'updated_at'>
export type ConfigFieldUpdate = Partial<ConfigFieldInsert>

// ============================================================
// IMPORT COLUMN MAPPING — wizard de importação
// ============================================================

export type ImportableField = keyof PropertyInsert | 'broker_name' | 'development_name';

export interface ColumnMapping {
  source_column: string;  // cabeçalho original da planilha
  target_field: ImportableField | null;
  sample_values: string[];
}

export interface ImportPreview {
  headers: string[];
  column_mappings: ColumnMapping[];
  sample_rows: Record<string, string>[];
  total_rows: number;
}
