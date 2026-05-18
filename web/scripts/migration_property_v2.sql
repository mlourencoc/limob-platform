-- Migração: Novos campos para o sistema de cadastro v2
-- Executar no Supabase SQL Editor

-- ============================================================
-- Novos campos na tabela properties
-- ============================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS objetivo    TEXT,        -- 'Venda' | 'Aluguel'
  ADD COLUMN IF NOT EXISTS categoria   TEXT,        -- 'Residencial' | 'Comercial' | 'Rural' | 'Outros'
  ADD COLUMN IF NOT EXISTS unit_number TEXT,        -- Número da unidade (ex: 501)
  ADD COLUMN IF NOT EXISTS floor_number TEXT,       -- Andar (ex: 5)
  ADD COLUMN IF NOT EXISTS unit_final  TEXT,        -- Final da unidade (A, B, C...)
  ADD COLUMN IF NOT EXISTS sun_position TEXT;       -- 'leste' | 'oeste' | 'norte' | 'sul'

-- ============================================================
-- Atualiza a view v_properties_enriched para incluir novos campos
-- (Se ela existir como VIEW, precisará ser recriada)
-- ============================================================

-- Primeiro verificar se a view existe:
-- SELECT * FROM pg_views WHERE viewname = 'v_properties_enriched';

-- Se existir, recriar adicionando os novos campos:
-- CREATE OR REPLACE VIEW v_properties_enriched AS
-- SELECT
--   p.*,
--   b.name as broker_name,
--   b.email as broker_email,
--   b.creci as broker_creci,
--   d.name as development_name,
--   d.builder as development_builder,
--   EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.created_at))::int as property_age_years,
--   (SELECT COUNT(*) FROM property_links pl WHERE pl.property_id = p.id) as links_count
-- FROM properties p
-- LEFT JOIN brokers b ON p.broker_id = b.id
-- LEFT JOIN developments d ON p.development_id = d.id
-- WHERE p.deleted_at IS NULL;

-- ============================================================
-- Verificação (rodar após migração)
-- ============================================================

-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'properties'
-- ORDER BY ordinal_position;
