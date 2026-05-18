// lib/constants/classifications.ts
// Mapeamento completo: Objetivo → Categoria → Tipo → Subtipo
// Fonte única de verdade para a cascata do formulário de imóvel

// ============================================================
// OBJETIVOS
// ============================================================

export const OBJETIVOS = ['Venda', 'Aluguel'] as const
export type Objetivo = (typeof OBJETIVOS)[number]

// ============================================================
// CATEGORIAS
// ============================================================

export const CATEGORIAS = ['Residencial', 'Comercial', 'Rural', 'Outros'] as const
export type Categoria = (typeof CATEGORIAS)[number]

// ============================================================
// MAPEAMENTO CATEGORIA → TIPO → SUBTIPO
// ============================================================

export const CLASSIFICATION_MAP: Record<string, Record<string, string[]>> = {
  Residencial: {
    Apartamento: ['Cobertura', 'Duplex', 'Flat', 'Kitnet', 'Loft', 'Penthouse', 'Studio'],
    'Área Residencial': ['Esquina', 'Meio de Quadra'],
    'Casa de Rua': ['Sobrado', 'Térrea', 'Triplex'],
    'Condomínio Fechado Horizontal': ['Casa', 'Lote', 'Sobrado', 'Triplex'],
    'Lote de Rua': ['Esquina', 'Meio de Quadra'],
  },
  Comercial: {
    'Área Comercial': ['Esquina', 'Meio de Quadra'],
    Galpão: [],
    'Loja de Rua': [],
    'Lote Comercial': ['Esquina', 'Meio de Quadra'],
    'Prédio Comercial': ['Lage', 'Loja', 'Sala'],
  },
  Rural: {
    'Chácara Aberta': ['Terreno', 'Terreno com Casa', 'Terreno com Estrutura'],
    'Chácara em Condomínio Fechado': ['Terreno', 'Terreno com Casa', 'Terreno com Estrutura'],
    Fazenda: [],
    Sítio: [],
  },
  Outros: {
    Escaninho: [],
    'Vaga de Garagem': [],
  },
}

// ============================================================
// TIPOS QUE REQUEREM EMPREENDIMENTO
// ============================================================

export const REQUIRES_DEVELOPMENT: Record<string, boolean> = {
  Apartamento: true,
  'Condomínio Fechado Horizontal': true,
  'Prédio Comercial': true,
  'Chácara em Condomínio Fechado': true,
}

export function typeRequiresDevelopment(tipo: string): boolean {
  return REQUIRES_DEVELOPMENT[tipo] === true
}

// ============================================================
// TIPOS QUE MOSTRAM DADOS DA UNIDADE
// ============================================================

export const UNIT_DATA_TYPES = [
  'Apartamento',
  'Prédio Comercial',
  'Condomínio Fechado Horizontal',
]

export function typeHasUnitData(tipo: string): boolean {
  return UNIT_DATA_TYPES.includes(tipo)
}

// ============================================================
// TIPOS QUE MOSTRAM COMPOSIÇÃO
// ============================================================

export const COMPOSITION_TYPES = [
  'Apartamento',
  'Casa de Rua',
  'Condomínio Fechado Horizontal',
  'Fazenda',
  'Sítio',
  'Galpão',
]

export function typeHasComposition(tipo: string): boolean {
  return COMPOSITION_TYPES.includes(tipo)
}

// ============================================================
// TIPOS QUE MOSTRAM CONDOMÍNIO
// ============================================================

export const CONDO_FEE_TYPES = [
  'Apartamento',
  'Prédio Comercial',
  'Chácara em Condomínio Fechado',
]

export function typeHasCondoFee(tipo: string): boolean {
  return CONDO_FEE_TYPES.includes(tipo)
}

// ============================================================
// TIPOS QUE REQUEREM ÁREA
// ============================================================

export const AREA_REQUIRED_TYPES = [
  'Apartamento',
  'Casa de Rua',
  'Condomínio Fechado Horizontal',
  'Fazenda',
  'Sítio',
  'Galpão',
]

export function typeRequiresArea(tipo: string): boolean {
  return AREA_REQUIRED_TYPES.includes(tipo)
}

// ============================================================
// POSIÇÃO DO SOL
// ============================================================

export const SUN_POSITIONS = [
  { value: 'leste', label: 'Leste (Nascente)' },
  { value: 'oeste', label: 'Oeste (Poente)' },
  { value: 'norte', label: 'Norte (Passagem)' },
  { value: 'sul', label: 'Sul (Sem sol)' },
]

// ============================================================
// HELPERS
// ============================================================

export function getTypesByCategoria(categoria: string): string[] {
  return Object.keys(CLASSIFICATION_MAP[categoria] ?? {})
}

export function getSubtiposByTipo(categoria: string, tipo: string): string[] {
  return CLASSIFICATION_MAP[categoria]?.[tipo] ?? []
}

export function hasSubtipos(categoria: string, tipo: string): boolean {
  return getSubtiposByTipo(categoria, tipo).length > 0
}
