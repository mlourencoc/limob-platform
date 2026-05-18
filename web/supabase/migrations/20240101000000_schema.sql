-- ============================================================
-- LIMOB — Schema principal
-- Versão: 001 (CORRIGIDO)
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

create type property_type as enum (
  'apartamento',
  'casa',
  'terreno',
  'comercial',
  'rural',
  'outro'
);

create type property_subtype as enum (
  'padrao',
  'cobertura',
  'duplex',
  'triplex',
  'studio',
  'kitnet',
  'flat',
  'sobrado',
  'condominio_fechado',
  'outro'
);

create type property_state as enum (
  'novo',
  'seminovo',
  'usado'
);

create type property_situation as enum (
  'na_planta',
  'em_construcao',
  'pronto'
);

create type commercial_status as enum (
  'disponivel',
  'reservado',
  'vendido',
  'locado',
  'inativo'
);

create type delivery_status as enum (
  'futuro',
  'em_obra',
  'entregue'
);

create type import_status as enum (
  'pendente',
  'processando',
  'concluido',
  'erro'
);

create type link_type as enum (
  'drive_fotos',
  'drive_documentos',
  'localizacao',
  'tour_virtual',
  'outro'
);

-- ============================================================
-- BROKERS
-- ============================================================

create table brokers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  creci text,
  is_active boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- DEVELOPMENTS
-- ============================================================

create table developments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  builder text,
  city text,
  neighborhood text,
  address text,
  is_active boolean not null default true,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- IMPORTS
-- ============================================================

create table imports (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  status import_status not null default 'pendente',
  total_rows integer,
  processed_rows integer,
  created_rows integer,
  updated_rows integer,
  stale_rows integer,
  error_message text,
  raw_headers text[],
  column_mapping jsonb,
  imported_by uuid,
  metadata jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- ============================================================
-- PROPERTIES
-- ============================================================

create table properties (
  id uuid primary key default uuid_generate_v4(),

  type property_type not null,
  subtype property_subtype,

  city text not null,
  neighborhood text,
  address text,

  development_id uuid references developments(id),
  broker_id uuid references brokers(id),

  unit text,
  builder text,

  area_m2 numeric(10,2),
  bedrooms smallint,
  suites smallint,
  parking_spots smallint,
  storage_unit boolean default false,

  price numeric(15,2),
  condo_fee numeric(10,2),

  state property_state,
  situation property_situation,
  commercial_status commercial_status not null default 'disponivel',
  delivery_status delivery_status,
  delivery_year smallint,

  description text,
  highlights text[],

  import_id uuid references imports(id),
  external_ref text,
  is_stale boolean not null default false,
  stale_since timestamptz,

  deleted_at timestamptz,

  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROPERTY LINKS
-- ============================================================

create table property_links (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id),
  type link_type not null,
  url text not null,
  label text,
  sort_order smallint default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_properties_city on properties(city);
create index idx_properties_type on properties(type);
create index idx_properties_broker on properties(broker_id);
create index idx_properties_development on properties(development_id);
create index idx_properties_price on properties(price);

create index idx_property_links_property on property_links(property_id);

-- ============================================================
-- TRIGGER updated_at
-- ============================================================

create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_properties
before update on properties
for each row execute function trigger_set_updated_at();

create trigger set_updated_at_brokers
before update on brokers
for each row execute function trigger_set_updated_at();

create trigger set_updated_at_developments
before update on developments
for each row execute function trigger_set_updated_at();

-- ============================================================
-- VIEW
-- ============================================================

create view v_properties_enriched as
select
  p.*,
  case
    when p.delivery_year is not null
    then extract(year from now())::int - p.delivery_year
    else null
  end as property_age_years,

  b.name as broker_name,
  b.email as broker_email,
  b.creci as broker_creci,

  d.name as development_name,
  d.builder as development_builder,

  (select count(*) from property_links pl where pl.property_id = p.id) as links_count

from properties p
left join brokers b on b.id = p.broker_id
left join developments d on d.id = p.development_id
where p.deleted_at is null;