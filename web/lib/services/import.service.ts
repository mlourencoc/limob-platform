// lib/services/import.service.ts
// Lógica de negócio para importação de planilhas.
// Orquestra parsing �?' validação �?' upsert �?' marcação de desatualizados.

import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';
import * as propertyRepo from '@/lib/supabase/property.repo';
import type {
  ImportPreview,
  ColumnMapping,
  ImportableField,
  PropertyInsert,
} from '@/types/domain';

// ============================================================
// TIPOS INTERNOS
// ============================================================

type RawRow = Record<string, string>;

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  stale: number;
  errors: Array<{ row: number; message: string }>;
}

// ============================================================
// PARSING
// ============================================================

export function parseSpreadsheet(buffer: ArrayBuffer): {
  headers: string[];
  rows: RawRow[];
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<RawRow>(sheet, {
    raw: false,
    defval: '',
  });

  if (!raw.length) return { headers: [], rows: [] };

  const headers = Object.keys(raw[0]);
  return { headers, rows: raw };
}

// ============================================================
// PREVIEW (antes de confirmar importação)
// ============================================================

export function buildImportPreview(
  headers: string[],
  rows: RawRow[],
  sampleSize = 3,
): ImportPreview {
  const column_mappings: ColumnMapping[] = headers.map((header) => ({
    source_column: header,
    target_field: inferFieldMapping(header),
    sample_values: rows.slice(0, sampleSize).map((r) => String(r[header] ?? '')),
  }));

  return {
    headers,
    column_mappings,
    sample_rows: rows.slice(0, sampleSize),
    total_rows: rows.length,
  };
}

// Inferência automática de mapeamento por nome de coluna
function inferFieldMapping(header: string): ImportableField | null {
  const normalized = header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');

  const mappings: Record<string, ImportableField> = {
    tipo: 'type',
    subtipo: 'subtype',
    cidade: 'city',
    bairro: 'neighborhood',
    endereco: 'address',
    empreendimento: 'development_name',
    construtora: 'builder',
    unidade: 'unit',
    quartos: 'bedrooms',
    dormitorios: 'bedrooms',
    suites: 'suites',
    vagas: 'parking_spots',
    metragem: 'area_m2',
    area: 'area_m2',
    m2: 'area_m2',
    valor: 'price',
    preco: 'price',
    condominio: 'condo_fee',
    estado: 'state',
    situacao: 'situation',
    status: 'commercial_status',
    entrega: 'delivery_year',
    ano_entrega: 'delivery_year',
    captador: 'broker_name',
    corretor: 'broker_name',
    descricao: 'description',
    diferenciais: 'highlights',
    referencia: 'external_ref',
    id_externo: 'external_ref',
    escaninho: 'storage_unit',
  };

  return mappings[normalized] ?? null;
}

// ============================================================
// IMPORTA�?�fO EFETIVA
// ============================================================

export async function processImport(
  importId: string,
  rows: RawRow[],
  columnMapping: Record<string, ImportableField>,
  markMissingAsStale: boolean,
): Promise<ImportResult> {
  const supabase = await createClient();
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, stale: 0, errors: [] };

  const externalRefsInImport = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    try {
      const propertyData = mapRowToProperty(row, columnMapping, importId);

      if (!propertyData.city || !propertyData.type) {
        result.skipped++;
        continue;
      }

      const externalRef = propertyData.external_ref;
      if (externalRef) externalRefsInImport.add(externalRef);

      // Upsert por external_ref quando disponível
      if (externalRef) {
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('external_ref', externalRef)
          .is('deleted_at', null)
          .single();

        if (existing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await propertyRepo.updateProperty(existing.id, {
            ...propertyData,
            is_stale: false,
            stale_since: null,
          } as any);
          result.updated++;
        } else {
          await propertyRepo.createProperty(propertyData);
          result.created++;
        }
      } else {
        await propertyRepo.createProperty(propertyData);
        result.created++;
      }
    } catch (err) {
      result.errors.push({
        row: i + 2, // +2 por conta do header e índice 0
        message: err instanceof Error ? err.message : 'Erro desconhecido',
      });
    }
  }

  // Marcar como desatualizados os imóveis desta fonte ausentes na importação atual
  if (markMissingAsStale && externalRefsInImport.size > 0) {
    const { data: existingRefs } = await supabase
      .from('properties')
      .select('id, external_ref')
      .is('deleted_at', null)
      .eq('is_stale', false)
      .not('external_ref', 'is', null);

    const staleIds = (existingRefs ?? [])
      .filter((r) => r.external_ref && !externalRefsInImport.has(r.external_ref))
      .map((r) => r.id);

    if (staleIds.length) {
      await propertyRepo.markPropertiesAsStale(staleIds);
      result.stale = staleIds.length;
    }
  }

  return result;
}

// ============================================================
// MAPEAMENTO DE LINHA �?' PropertyInsert
// ============================================================

function mapRowToProperty(
  row: RawRow,
  columnMapping: Record<string, ImportableField>,
  importId: string,
): PropertyInsert {
  const mapped: Partial<PropertyInsert> & { broker_name?: string; development_name?: string } = {
    import_id: importId,
  };

  for (const [sourceCol, targetField] of Object.entries(columnMapping)) {
    const rawValue = row[sourceCol]?.trim() ?? '';
    if (!rawValue) continue;

    switch (targetField) {
      case 'bedrooms':
      case 'suites':
      case 'parking_spots':
      case 'delivery_year':
        mapped[targetField] = parseInt(rawValue, 10) || undefined;
        break;
      case 'area_m2':
      case 'price':
      case 'condo_fee':
        mapped[targetField] = parseFloat(rawValue.replace(/[^\d,.-]/g, '').replace(',', '.')) || undefined;
        break;
      case 'storage_unit':
        mapped[targetField] = ['sim', 'yes', '1', 'true'].includes(rawValue.toLowerCase());
        break;
      case 'highlights':
        mapped[targetField] = rawValue.split(/[;|,]/).map((s) => s.trim()).filter(Boolean);
        break;
      default:
        (mapped as Record<string, unknown>)[targetField] = rawValue;
    }
  }

  // broker_name e development_name são resolvidos externamente
  // (lookup ou criação automática �?" feito em camada superior)
  return mapped as PropertyInsert;
}
