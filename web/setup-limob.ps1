# LIMOB — Setup completo
# Execute dentro de: C:\Users\malou\limob-platform\web
# PowerShell: Set-ExecutionPolicy -Scope Process Bypass; .\setup-limob.ps1

$base = $PSScriptRoot

function Write-File($relpath, $content) {
    $full = Join-Path $base $relpath
    $dir = Split-Path $full -Parent
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($full, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  criado: $relpath" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== LIMOB Setup ===" -ForegroundColor Cyan
Write-Host ""

Write-File 'CORRECOES.md' @'
# LIMOB — Correções aplicadas

## Diagnóstico dos problemas encontrados

### 1. Arquivos jogados na raiz (problema principal)
Os arquivos gerados anteriormente (`FilterPanel.tsx`, `Sidebar.tsx`, `PropertyCard.tsx`,
`PropertyGrid.tsx`, `MultiSelect.tsx`, `property.repo.ts`, `domain.ts`) foram colocados
diretamente na raiz do projeto em vez de dentro das pastas corretas.
O projeto nunca teve `app/`, `components/` ou `lib/` com conteúdo real.

### 2. `tailwind.config.ts` — plugins vazio
`plugins: []` — faltava `require("tailwindcss-animate")`.
Isso causava o erro `Cannot apply unknown utility class ''border-border''`
porque o Tailwind não reconhecia as classes de animação/variáveis do shadcn.

### 3. `tsconfig.json` — `jsx: "react-jsx"` errado
Next.js exige `"jsx": "preserve"`. Com `react-jsx` o Turbopack não processa JSX corretamente.

### 4. Componentes UI ausentes
Nenhum arquivo existia em `components/ui/` — `button`, `card`, `badge`, `toaster` etc.
Todos foram criados do zero.

---

## O que fazer agora (passo a passo)

### Passo 1 — instalar dependência que faltava
```powershell
cd C:\Users\malou\limob-platform\web
npm install tailwindcss-animate
```

### Passo 2 — apagar os arquivos soltos na raiz
Esses arquivos estão no lugar errado e devem ser removidos da raiz:
```
FilterPanel.tsx       → mover para components/filters/
MultiSelect.tsx       → mover para components/filters/
Sidebar.tsx           → mover para components/layout/
PropertyCard.tsx      → mover para components/properties/
PropertyGrid.tsx      → mover para components/properties/
property.repo.ts      → mover para lib/supabase/
domain.ts             → mover para types/
```
Ou simplesmente deletar da raiz — as versões corretas estão nos arquivos deste pacote.

### Passo 3 — copiar os arquivos corrigidos
Copie TODOS os arquivos deste pacote para dentro de `C:\Users\malou\limob-platform\web\`,
mantendo a estrutura de pastas exatamente como está.

Estrutura final esperada dentro de `web/`:
```
web/
├── app/
│   ├── globals.css            ← substituir
│   ├── layout.tsx             ← substituir
│   ├── page.tsx               ← substituir
│   └── (internal)/
│       ├── layout.tsx
│       ├── properties/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       └── edit/page.tsx
│       ├── brokers/page.tsx
│       ├── developments/page.tsx
│       └── imports/page.tsx
├── components/
│   ├── ui/                    ← criado do zero (14 arquivos)
│   ├── layout/
│   ├── properties/
│   └── filters/
├── lib/
│   ├── utils.ts
│   ├── supabase/
│   ├── actions/
│   ├── schemas/
│   ├── services/
│   └── constants/
├── types/
│   └── domain.ts
├── supabase/
│   └── migrations/
│       └── 20240101000000_schema.sql
├── tailwind.config.ts         ← substituir (adicionado plugin)
├── tsconfig.json              ← substituir (corrigido jsx)
└── next.config.ts
```

### Passo 4 — criar .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### Passo 5 — limpar cache e rodar
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

## Sobre o aviso de lockfiles duplicados
O warning sobre dois `package-lock.json` (na raiz `limob-platform/` e em `web/`) é apenas
um aviso do Turbopack — não quebra nada. Para silenciar, adicione no `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  turbopack: { root: __dirname }
}
```

'@

Write-File 'app/(internal)/brokers/page.tsx' @'
export default function BrokersPage() {
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Captadores</h1><p className="text-sm text-muted-foreground">Em breve.</p></div>
}

'@

Write-File 'app/(internal)/developments/page.tsx' @'
export default function DevelopmentsPage() {
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Empreendimentos</h1><p className="text-sm text-muted-foreground">Em breve.</p></div>
}

'@

Write-File 'app/(internal)/imports/page.tsx' @'
export default function ImportsPage() {
  return <div className="space-y-4"><h1 className="text-xl font-semibold">Importações</h1><p className="text-sm text-muted-foreground">Em breve.</p></div>
}

'@

Write-File 'app/(internal)/layout.tsx' @'
import { AppShell } from ''@/components/layout/AppShell''

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

'@

Write-File 'app/(internal)/properties/[id]/edit/page.tsx' @'
import { notFound } from ''next/navigation''
import Link from ''next/link''
import { ChevronLeft } from ''lucide-react''
import { Button } from ''@/components/ui/button''
import { PropertyForm } from ''@/components/properties/PropertyForm''
import { getPropertyById, getFilterOptions } from ''@/lib/supabase/property.repo''

interface PageProps { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params
  const [property, { brokers, developments }] = await Promise.all([getPropertyById(id), getFilterOptions()])
  if (!property) notFound()
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/properties/${id}`}><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar imóvel</h1>
      </div>
      <PropertyForm property={property} brokers={brokers} developments={developments} />
    </div>
  )
}

'@

Write-File 'app/(internal)/properties/[id]/page.tsx' @'
import { notFound } from ''next/navigation''
import Link from ''next/link''
import { ChevronLeft, Pencil } from ''lucide-react''
import { Button } from ''@/components/ui/button''
import { PropertyDetail } from ''@/components/properties/PropertyDetail''
import { getPropertyById } from ''@/lib/supabase/property.repo''

interface PageProps { params: Promise<{ id: string }> }

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const property = await getPropertyById(id)
  if (!property) notFound()
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
          </Button>
          <h1 className="text-xl font-semibold">{property.development_name ?? property.city}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/properties/${id}/edit`}><Pencil size={14} className="mr-1.5" />Editar</Link>
        </Button>
      </div>
      <PropertyDetail property={property} />
    </div>
  )
}

'@

Write-File 'app/(internal)/properties/new/page.tsx' @'
import Link from ''next/link''
import { ChevronLeft } from ''lucide-react''
import { Button } from ''@/components/ui/button''
import { PropertyForm } from ''@/components/properties/PropertyForm''
import { getFilterOptions } from ''@/lib/supabase/property.repo''

export default async function NewPropertyPage() {
  const { brokers, developments } = await getFilterOptions()
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Novo imóvel</h1>
      </div>
      <PropertyForm brokers={brokers} developments={developments} />
    </div>
  )
}

'@

Write-File 'app/(internal)/properties/page.tsx' @'
import Link from ''next/link''
import { Plus } from ''lucide-react''
import { Button } from ''@/components/ui/button''
import { PropertyGrid } from ''@/components/properties/PropertyGrid''
import { getProperties, getFilterOptions } from ''@/lib/supabase/property.repo''
import type { PropertyFilters } from ''@/types/domain''

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: PropertyFilters = {
    cities:              toArray(params.cities),
    neighborhoods:       toArray(params.neighborhoods),
    types:               toArray(params.types) as PropertyFilters[''types''],
    commercial_statuses: toArray(params.commercial_statuses) as PropertyFilters[''commercial_statuses''],
    broker_ids:          toArray(params.broker_ids),
    development_ids:     toArray(params.development_ids),
    show_stale:          params.show_stale === ''true'',
    search:              typeof params.search === ''string'' ? params.search : undefined,
  }

  const [{ data: properties, total }, filterOptions] = await Promise.all([
    getProperties(filters, { field: ''created_at'', direction: ''desc'' }, { page: 1, per_page: 60 }),
    getFilterOptions(),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Imóveis</h1>
          <p className="text-sm text-muted-foreground">
            {total} imóvel{total !== 1 ? ''s'' : ''''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/properties/new">
            <Plus size={16} className="mr-1.5" />
            Novo imóvel
          </Link>
        </Button>
      </div>
      <PropertyGrid properties={properties} filterOptions={filterOptions} initialFilters={filters} />
    </div>
  )
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : value.split('','').filter(Boolean)
}

'@

Write-File 'app/globals.css' @'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

'@

Write-File 'app/layout.tsx' @'
import type { Metadata } from ''next''
import { Geist } from ''next/font/google''
import ''./globals.css''
import { Toaster } from ''@/components/ui/toaster''

const geist = Geist({ subsets: [''latin''], variable: ''--font-geist'' })

export const metadata: Metadata = {
  title: ''LIMOB'',
  description: ''Plataforma de organização imobiliária'',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

'@

Write-File 'app/page.tsx' @'
import { redirect } from ''next/navigation''

export default function Home() {
  redirect(''/properties'')
}

'@

Write-File 'components/filters/FilterPanel.tsx' @'
// src/components/filters/FilterPanel.tsx
''use client''

import { useState } from ''react''
import { MultiSelect } from ''./MultiSelect''
import { Button } from ''@/components/ui/button''
import { Separator } from ''@/components/ui/separator''
import { Label } from ''@/components/ui/label''
import { Input } from ''@/components/ui/input''
import { Checkbox } from ''@/components/ui/checkbox''
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATE_LABELS,
  PROPERTY_SITUATION_LABELS,
  COMMERCIAL_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
} from ''@/lib/constants/labels''
import {
  PROPERTY_TYPES,
  PROPERTY_STATES,
  PROPERTY_SITUATIONS,
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
} from ''@/types/domain''
import type { PropertyFilters } from ''@/types/domain''

interface FilterOptions {
  cities: string[]
  neighborhoods: string[]
  brokers: Array<{ id: string; name: string }>
  developments: Array<{ id: string; name: string }>
  delivery_years: number[]
}

interface FilterPanelProps {
  options: FilterOptions
  initialFilters: PropertyFilters
  onChange: (filters: PropertyFilters) => void
}

const BEDROOMS_OPTIONS = [0, 1, 2, 3, 4].map((n) => ({
  value: String(n),
  label: n === 0 ? ''Studio'' : `${n}+`,
}))

export function FilterPanel({ options, initialFilters, onChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters)

  function update(patch: Partial<PropertyFilters>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    onChange(next)
  }

  function reset() {
    const empty: PropertyFilters = {}
    setFilters(empty)
    onChange(empty)
  }

  const hasActive = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  return (
    <div className="border rounded-xl p-4 bg-card space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">Filtros</span>
        {hasActive && (
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={reset}>
            Limpar
          </Button>
        )}
      </div>

      <Separator />

      {/* Localização */}
      <FilterGroup label="Cidade">
        <MultiSelect
          options={options.cities.map((c) => ({ value: c, label: c }))}
          value={filters.cities ?? []}
          onChange={(v) => update({ cities: v })}
          placeholder="Todas as cidades"
        />
      </FilterGroup>

      <FilterGroup label="Bairro">
        <MultiSelect
          options={options.neighborhoods.map((n) => ({ value: n, label: n }))}
          value={filters.neighborhoods ?? []}
          onChange={(v) => update({ neighborhoods: v })}
          placeholder="Todos os bairros"
        />
      </FilterGroup>

      <FilterGroup label="Empreendimento">
        <MultiSelect
          options={options.developments.map((d) => ({ value: d.id, label: d.name }))}
          value={filters.development_ids ?? []}
          onChange={(v) => update({ development_ids: v })}
          placeholder="Todos"
        />
      </FilterGroup>

      <Separator />

      {/* Tipo */}
      <FilterGroup label="Tipo">
        <MultiSelect
          options={PROPERTY_TYPES.map((t) => ({ value: t, label: PROPERTY_TYPE_LABELS[t] }))}
          value={filters.types ?? []}
          onChange={(v) => update({ types: v as PropertyFilters[''types''] })}
          placeholder="Todos os tipos"
        />
      </FilterGroup>

      <FilterGroup label="Quartos">
        <MultiSelect
          options={BEDROOMS_OPTIONS}
          value={(filters.bedrooms ?? []).map(String)}
          onChange={(v) => update({ bedrooms: v.map(Number) })}
          placeholder="Qualquer"
        />
      </FilterGroup>

      <FilterGroup label="Vagas">
        <MultiSelect
          options={[0, 1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
          value={(filters.parking_spots ?? []).map(String)}
          onChange={(v) => update({ parking_spots: v.map(Number) })}
          placeholder="Qualquer"
        />
      </FilterGroup>

      <Separator />

      {/* Preço */}
      <FilterGroup label="Faixa de preço (R$)">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Mín"
            className="h-8 text-xs"
            value={filters.price_min ?? ''''}
            onChange={(e) => update({ price_min: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Máx"
            className="h-8 text-xs"
            value={filters.price_max ?? ''''}
            onChange={(e) => update({ price_max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </FilterGroup>

      <Separator />

      {/* Status */}
      <FilterGroup label="Status comercial">
        <MultiSelect
          options={COMMERCIAL_STATUSES.map((s) => ({ value: s, label: COMMERCIAL_STATUS_LABELS[s] }))}
          value={filters.commercial_statuses ?? []}
          onChange={(v) => update({ commercial_statuses: v as PropertyFilters[''commercial_statuses''] })}
          placeholder="Todos"
        />
      </FilterGroup>

      <FilterGroup label="Estado">
        <MultiSelect
          options={PROPERTY_STATES.map((s) => ({ value: s, label: PROPERTY_STATE_LABELS[s] }))}
          value={filters.states ?? []}
          onChange={(v) => update({ states: v as PropertyFilters[''states''] })}
          placeholder="Todos"
        />
      </FilterGroup>

      <FilterGroup label="Situação">
        <MultiSelect
          options={PROPERTY_SITUATIONS.map((s) => ({ value: s, label: PROPERTY_SITUATION_LABELS[s] }))}
          value={filters.situations ?? []}
          onChange={(v) => update({ situations: v as PropertyFilters[''situations''] })}
          placeholder="Todas"
        />
      </FilterGroup>

      <FilterGroup label="Entrega">
        <MultiSelect
          options={DELIVERY_STATUSES.map((s) => ({ value: s, label: DELIVERY_STATUS_LABELS[s] }))}
          value={filters.delivery_statuses ?? []}
          onChange={(v) => update({ delivery_statuses: v as PropertyFilters[''delivery_statuses''] })}
          placeholder="Todos"
        />
      </FilterGroup>

      <Separator />

      {/* Captador */}
      <FilterGroup label="Captador">
        <MultiSelect
          options={options.brokers.map((b) => ({ value: b.id, label: b.name }))}
          value={filters.broker_ids ?? []}
          onChange={(v) => update({ broker_ids: v })}
          placeholder="Todos"
        />
      </FilterGroup>

      <Separator />

      {/* Extras */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="show_stale"
          checked={filters.show_stale ?? false}
          onCheckedChange={(v) => update({ show_stale: Boolean(v) })}
        />
        <label htmlFor="show_stale" className="text-xs cursor-pointer">
          Mostrar desatualizados
        </label>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  )
}

'@

Write-File 'components/filters/MultiSelect.tsx' @'
// src/components/filters/MultiSelect.tsx
''use client''

import * as React from ''react''
import { Check, ChevronsUpDown, X } from ''lucide-react''
import { Button } from ''@/components/ui/button''
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from ''@/components/ui/command''
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from ''@/components/ui/popover''
import { Badge } from ''@/components/ui/badge''
import { cn } from ''@/lib/utils''

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  maxDisplayed?: number
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = ''Selecionar...'',
  className,
  maxDisplayed = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(''w-full justify-between h-auto min-h-9 px-3'', className)}
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground font-normal text-xs">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedLabels.slice(0, maxDisplayed).map((label) => (
                <Badge key={label} variant="secondary" className="text-[11px] font-normal">
                  {label}
                </Badge>
              ))}
              {selectedLabels.length > maxDisplayed && (
                <Badge variant="secondary" className="text-[11px] font-normal">
                  +{selectedLabels.length - maxDisplayed}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {value.length > 0 && (
              <X
                size={13}
                className="text-muted-foreground hover:text-foreground"
                onClick={clear}
              />
            )}
            <ChevronsUpDown size={13} className="text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs text-center py-4">Nenhuma opção.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggle(option.value)}
                  className="text-xs"
                >
                  <Check
                    size={13}
                    className={cn(
                      ''mr-2 shrink-0'',
                      value.includes(option.value) ? ''opacity-100'' : ''opacity-0''
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

'@

Write-File 'components/layout/AppShell.tsx' @'
// src/components/layout/AppShell.tsx
// Layout base com sidebar lateral fixa.
// Uso: wrapping nas páginas internas via layout.tsx de cada grupo de rotas.

import { Sidebar } from ''./Sidebar''

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

'@

Write-File 'components/layout/Sidebar.tsx' @'
// src/components/layout/Sidebar.tsx
''use client''

import Link from ''next/link''
import { usePathname } from ''next/navigation''
import {
  Building2,
  Upload,
  Users,
  LayoutDashboard,
  Landmark,
} from ''lucide-react''
import { cn } from ''@/lib/utils''

const NAV_ITEMS = [
  {
    href: ''/properties'',
    label: ''Imóveis'',
    icon: Building2,
  },
  {
    href: ''/imports'',
    label: ''Importações'',
    icon: Upload,
  },
  {
    href: ''/brokers'',
    label: ''Captadores'',
    icon: Users,
  },
  {
    href: ''/developments'',
    label: ''Empreendimentos'',
    icon: Landmark,
  },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold text-base tracking-tight">LIMOB</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                ''flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors'',
                isActive
                  ? ''bg-primary text-primary-foreground font-medium''
                  : ''text-muted-foreground hover:bg-muted hover:text-foreground''
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground">MVP v0.1</p>
      </div>
    </aside>
  )
}

'@

Write-File 'components/properties/PropertyCard.tsx' @'
// src/components/properties/PropertyCard.tsx

import Link from ''next/link''
import { MapPin, BedDouble, Car, Ruler, AlertTriangle } from ''lucide-react''
import { Card, CardContent } from ''@/components/ui/card''
import { Badge } from ''@/components/ui/badge''
import {
  PROPERTY_TYPE_LABELS,
  COMMERCIAL_STATUS_LABELS,
  COMMERCIAL_STATUS_COLORS,
  formatCurrency,
  formatArea,
} from ''@/lib/constants/labels''
import { cn } from ''@/lib/utils''
import type { PropertyEnriched } from ''@/types/domain''

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
  const subtitle = [neighborhood, city].filter(Boolean).join('', '')

  return (
    <Link href={`/properties/${id}`} className="block group">
      <Card
        className={cn(
          ''transition-shadow hover:shadow-md h-full'',
          is_stale && ''border-dashed opacity-70''
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
              className={cn(''text-xs shrink-0'', COMMERCIAL_STATUS_COLORS[commercial_status])}
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
              {PROPERTY_TYPE_LABELS[type]}
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
              {price ? formatCurrency(price) : ''—''}
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

'@

Write-File 'components/properties/PropertyDetail.tsx' @'
// src/components/properties/PropertyDetail.tsx

import { ExternalLink, BedDouble, Bath, Car, Ruler, Building2, MapPin, Tag, AlertTriangle } from ''lucide-react''
import { Badge } from ''@/components/ui/badge''
import { Separator } from ''@/components/ui/separator''
import { Button } from ''@/components/ui/button''
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
} from ''@/lib/constants/labels''
import { cn } from ''@/lib/utils''
import type { PropertyWithLinks } from ''@/types/domain''

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
          <DetailRow label="Escaninho" value={property.storage_unit ? ''Sim'' : ''Não''} />
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

'@

Write-File 'components/properties/PropertyForm.tsx' @'
// src/components/properties/PropertyForm.tsx
''use client''

import { useRouter } from ''next/navigation''
import { useForm } from ''react-hook-form''
import { zodResolver } from ''@hookform/resolvers/zod''
import { useTransition } from ''react''
import { toast } from ''@/components/ui/use-toast''
import { Button } from ''@/components/ui/button''
import { Input } from ''@/components/ui/input''
import { Textarea } from ''@/components/ui/textarea''
import { Checkbox } from ''@/components/ui/checkbox''
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from ''@/components/ui/form''
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from ''@/components/ui/select''
import { Separator } from ''@/components/ui/separator''
import { propertySchema, type PropertyFormValues } from ''@/lib/schemas/property.schema''
import { createProperty, updateProperty } from ''@/lib/actions/properties''
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_SUBTYPE_LABELS,
  PROPERTY_STATE_LABELS,
  PROPERTY_SITUATION_LABELS,
  COMMERCIAL_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
} from ''@/lib/constants/labels''
import {
  PROPERTY_TYPES,
  PROPERTY_SUBTYPES,
  PROPERTY_STATES,
  PROPERTY_SITUATIONS,
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
} from ''@/types/domain''
import type { PropertyWithLinks } from ''@/types/domain''

interface PropertyFormProps {
  property?: PropertyWithLinks        // se passado = modo edição
  brokers: Array<{ id: string; name: string }>
  developments: Array<{ id: string; name: string }>
}

export function PropertyForm({ property, brokers, developments }: PropertyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(property)

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          type: property.type,
          subtype: property.subtype ?? undefined,
          city: property.city,
          neighborhood: property.neighborhood ?? '''',
          address: property.address ?? '''',
          development_id: property.development_id ?? undefined,
          broker_id: property.broker_id ?? undefined,
          unit: property.unit ?? '''',
          builder: property.builder ?? '''',
          area_m2: property.area_m2 ?? undefined,
          bedrooms: property.bedrooms ?? undefined,
          suites: property.suites ?? undefined,
          parking_spots: property.parking_spots ?? undefined,
          storage_unit: property.storage_unit,
          price: property.price ?? undefined,
          condo_fee: property.condo_fee ?? undefined,
          state: property.state ?? undefined,
          situation: property.situation ?? undefined,
          commercial_status: property.commercial_status,
          delivery_status: property.delivery_status ?? undefined,
          delivery_year: property.delivery_year ?? undefined,
          description: property.description ?? '''',
          highlights: property.highlights ?? [],
          links: property.links?.map((l) => ({
            type: l.type,
            url: l.url,
            label: l.label ?? undefined,
            sort_order: l.sort_order,
          })) ?? [],
        }
      : {
          commercial_status: ''disponivel'',
          storage_unit: false,
          highlights: [],
          links: [],
        },
  })

  function onSubmit(values: PropertyFormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateProperty(property!.id, values)
        : await createProperty(values)

      if (!result.success) {
        toast({ title: ''Erro'', description: result.error, variant: ''destructive'' })
        return
      }

      toast({ title: isEditing ? ''Imóvel atualizado'' : ''Imóvel cadastrado'' })
      router.push(isEditing ? `/properties/${property!.id}` : ''/properties'')
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Classificação */}
        <Section title="Classificação">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_SUBTYPES.map((t) => (
                        <SelectItem key={t} value={t}>{PROPERTY_SUBTYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Separator />

        {/* Localização */}
        <Section title="Localização">
          <div className="grid grid-cols-2 gap-4">
            <TextField control={form.control} name="city" label="Cidade *" />
            <TextField control={form.control} name="neighborhood" label="Bairro" />
            <TextField control={form.control} name="address" label="Endereço" className="col-span-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="development_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empreendimento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {developments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField control={form.control} name="builder" label="Construtora" />
            <TextField control={form.control} name="unit" label="Unidade" />
          </div>
        </Section>

        <Separator />

        {/* Composição */}
        <Section title="Composição">
          <div className="grid grid-cols-4 gap-4">
            <NumberField control={form.control} name="area_m2" label="Área (m²)" />
            <NumberField control={form.control} name="bedrooms" label="Quartos" />
            <NumberField control={form.control} name="suites" label="Suítes" />
            <NumberField control={form.control} name="parking_spots" label="Vagas" />
          </div>
          <FormField
            control={form.control}
            name="storage_unit"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 mt-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 font-normal cursor-pointer">Escaninho</FormLabel>
              </FormItem>
            )}
          />
        </Section>

        <Separator />

        {/* Valores */}
        <Section title="Valores">
          <div className="grid grid-cols-2 gap-4">
            <NumberField control={form.control} name="price" label="Valor (R$)" />
            <NumberField control={form.control} name="condo_fee" label="Condomínio (R$)" />
          </div>
        </Section>

        <Separator />

        {/* Status */}
        <Section title="Status">
          <div className="grid grid-cols-2 gap-4">
            <SelectField control={form.control} name="commercial_status" label="Status comercial"
              options={COMMERCIAL_STATUSES.map((s) => ({ value: s, label: COMMERCIAL_STATUS_LABELS[s] }))} />
            <SelectField control={form.control} name="state" label="Estado"
              options={PROPERTY_STATES.map((s) => ({ value: s, label: PROPERTY_STATE_LABELS[s] }))} />
            <SelectField control={form.control} name="situation" label="Situação"
              options={PROPERTY_SITUATIONS.map((s) => ({ value: s, label: PROPERTY_SITUATION_LABELS[s] }))} />
            <SelectField control={form.control} name="delivery_status" label="Status de entrega"
              options={DELIVERY_STATUSES.map((s) => ({ value: s, label: DELIVERY_STATUS_LABELS[s] }))} />
            <NumberField control={form.control} name="delivery_year" label="Ano de entrega" />
          </div>
        </Section>

        <Separator />

        {/* Captador */}
        <Section title="Captador">
          <FormField
            control={form.control}
            name="broker_id"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Captador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brokers.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Separator />

        {/* Descrição */}
        <Section title="Descrição">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Descrição do imóvel..."
                    className="min-h-24 resize-y"
                    {...field}
                    value={field.value ?? ''''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? ''Salvando...'' : isEditing ? ''Salvar alterações'' : ''Cadastrar imóvel''}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ============================================================
// Sub-componentes auxiliares (reduzem repetição no form)
// ============================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TextField({ control, name, label, className }: { control: any; name: any; label: string; className?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ''''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NumberField({ control, name, label }: { control: any; name: any; label: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              value={field.value ?? ''''}
              onChange={(e) => field.onChange(e.target.value === '''' ? undefined : Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SelectField({
  control, name, label, options,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; name: any; label: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

'@

Write-File 'components/properties/PropertyGrid.tsx' @'
// src/components/properties/PropertyGrid.tsx
''use client''

import { useState, useTransition } from ''react''
import { useRouter, useSearchParams } from ''next/navigation''
import { PropertyCard } from ''./PropertyCard''
import { FilterPanel } from ''@/components/filters/FilterPanel''
import { Skeleton } from ''@/components/ui/skeleton''
import { Button } from ''@/components/ui/button''
import { SlidersHorizontal } from ''lucide-react''
import type { PropertyEnriched, PropertyFilters } from ''@/types/domain''

interface FilterOptions {
  cities: string[]
  neighborhoods: string[]
  brokers: Array<{ id: string; name: string }>
  developments: Array<{ id: string; name: string }>
  delivery_years: number[]
}

interface PropertyGridProps {
  properties: PropertyEnriched[]
  filterOptions: FilterOptions
  initialFilters: PropertyFilters
}

export function PropertyGrid({ properties, filterOptions, initialFilters }: PropertyGridProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilterChange(filters: PropertyFilters) {
    const params = new URLSearchParams()

    if (filters.cities?.length)              params.set(''cities'', filters.cities.join('',''))
    if (filters.types?.length)               params.set(''types'', filters.types.join('',''))
    if (filters.commercial_statuses?.length) params.set(''commercial_statuses'', filters.commercial_statuses.join('',''))
    if (filters.show_stale)                  params.set(''show_stale'', ''true'')
    if (filters.search)                      params.set(''search'', filters.search)

    startTransition(() => {
      router.push(`/properties?${params.toString()}`)
    })
  }

  const hasActiveFilters = Object.values(initialFilters).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  )

  return (
    <div className="flex gap-5 items-start">
      {/* Filtros (sidebar) */}
      {showFilters && (
        <div className="w-64 flex-shrink-0">
          <FilterPanel
            options={filterOptions}
            initialFilters={initialFilters}
            onChange={handleFilterChange}
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? ''secondary'' : ''outline''}
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={14} className="mr-1.5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                ●
              </span>
            )}
          </Button>
        </div>

        {/* Cards */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-sm">Nenhum imóvel encontrado.</p>
            {hasActiveFilters && (
              <Button
                variant="link"
                size="sm"
                className="mt-2"
                onClick={() => handleFilterChange({})}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'@

Write-File 'components/ui/badge.tsx' @'
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

'@

Write-File 'components/ui/button.tsx' @'
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

'@

Write-File 'components/ui/card.tsx' @'
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

'@

Write-File 'components/ui/checkbox.tsx' @'
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

'@

Write-File 'components/ui/command.tsx' @'
"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className)}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
)
CommandShortcut.displayName = "CommandShortcut"

export {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
}

'@

Write-File 'components/ui/form.tsx' @'
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = { name: TName }

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ ...props }: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)
  if (!fieldContext) throw new Error("useFormField must be used within <FormField>")
  const { id } = itemContext
  return { id, name: fieldContext.name, formItemId: `${id}-form-item`, formDescriptionId: `${id}-form-item-description`, formMessageId: `${id}-form-item-message`, ...fieldState }
}

type FormItemContextValue = { id: string }
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  }
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()
  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()
    return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />
  }
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message) : children
    if (!body) return null
    return <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>{body}</p>
  }
)
FormMessage.displayName = "FormMessage"

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }

'@

Write-File 'components/ui/input.tsx' @'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

'@

Write-File 'components/ui/label.tsx' @'
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

'@

Write-File 'components/ui/popover.tsx' @'
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }

'@

Write-File 'components/ui/select.tsx' @'
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select, SelectGroup, SelectValue, SelectTrigger, SelectContent,
  SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton,
}

'@

Write-File 'components/ui/separator.tsx' @'
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

'@

Write-File 'components/ui/skeleton.tsx' @'
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

'@

Write-File 'components/ui/textarea.tsx' @'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

'@

Write-File 'components/ui/toaster.tsx' @'
"use client"

import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts
        .filter((t) => t.open)
        .map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-lg border p-4 shadow-lg bg-background text-sm transition-all",
              toast.variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground"
            )}
          >
            {toast.title && <p className="font-medium">{toast.title}</p>}
            {toast.description && <p className="text-muted-foreground mt-0.5">{toast.description}</p>}
          </div>
        ))}
    </div>
  )
}

'@

Write-File 'components/ui/use-toast.ts' @'
"use client"

// Minimal toast — suficiente para o MVP
import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastState = ToastProps & { id: number; open: boolean }

let toastId = 0
const listeners: Array<(toasts: ToastState[]) => void> = []
let toasts: ToastState[] = []

function dispatch(toast: ToastProps) {
  const id = ++toastId
  toasts = [...toasts, { ...toast, id, open: true }]
  listeners.forEach((l) => l(toasts))
  setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    listeners.forEach((l) => l(toasts))
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      listeners.forEach((l) => l(toasts))
    }, 300)
  }, 3000)
}

export function toast(props: ToastProps) {
  dispatch(props)
}

export function useToast() {
  const [state, setState] = React.useState<ToastState[]>(toasts)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])
  return { toasts: state, toast }
}

'@

Write-File 'lib/actions/properties.ts' @'
// lib/actions/properties.ts
// Server Actions — ponto de entrada para mutations de imóveis.
// Validam entrada com Zod, chamam os repositórios, revalidam o cache.

''use server'';

import { revalidatePath } from ''next/cache'';
import { propertySchema, propertyUpdateSchema } from ''@/lib/schemas/property.schema'';
import * as repo from ''@/lib/supabase/property.repo'';
import type { PropertyEnriched, PropertyFilters, PropertySort, PaginationParams, PaginatedResult } from ''@/types/domain'';

// ============================================================
// TIPOS DE RETORNO — Result pattern (evita throw em Server Actions)
// ============================================================

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================
// READ
// ============================================================

export async function fetchProperties(
  filters?: PropertyFilters,
  sort?: PropertySort,
  pagination?: PaginationParams,
): Promise<PaginatedResult<PropertyEnriched>> {
  return repo.getProperties(filters, sort, pagination);
}

export async function fetchFilterOptions() {
  return repo.getFilterOptions();
}

// ============================================================
// CREATE
// ============================================================

export async function createProperty(
  formData: unknown,
): Promise<ActionResult<PropertyEnriched>> {
  const parsed = propertySchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('', ''),
    };
  }

  const { links, ...propertyData } = parsed.data;

  try {
    const property = await repo.createProperty(propertyData);

    if (links?.length) {
      await repo.upsertPropertyLinks(property.id, links);
    }

    revalidatePath(''/properties'');
    return { success: true, data: property };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : ''Erro ao criar imóvel'',
    };
  }
}

// ============================================================
// UPDATE
// ============================================================

export async function updateProperty(
  id: string,
  formData: unknown,
): Promise<ActionResult<PropertyEnriched>> {
  const parsed = propertyUpdateSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join('', ''),
    };
  }

  const { links, ...propertyData } = parsed.data;

  try {
    const property = await repo.updateProperty(id, propertyData);

    if (links !== undefined) {
      await repo.upsertPropertyLinks(id, links);
    }

    revalidatePath(''/properties'');
    revalidatePath(`/properties/${id}`);
    return { success: true, data: property };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : ''Erro ao atualizar imóvel'',
    };
  }
}

// ============================================================
// SOFT DELETE
// ============================================================

export async function softDeleteProperty(id: string): Promise<ActionResult<void>> {
  try {
    await repo.deleteProperty(id);
    revalidatePath(''/properties'');
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : ''Erro ao remover imóvel'',
    };
  }
}

'@

Write-File 'lib/constants/labels.ts' @'
// lib/constants/labels.ts
// Labels legíveis para exibição dos enums do domínio.
// Única fonte de verdade para tradução enum → texto PT-BR.

import type {
  PropertyType,
  PropertySubtype,
  PropertyState,
  PropertySituation,
  CommercialStatus,
  DeliveryStatus,
  LinkType,
} from ''@/types/domain'';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartamento: ''Apartamento'',
  casa: ''Casa'',
  terreno: ''Terreno'',
  comercial: ''Comercial'',
  rural: ''Rural'',
  outro: ''Outro'',
};

export const PROPERTY_SUBTYPE_LABELS: Record<PropertySubtype, string> = {
  padrao: ''Padrão'',
  cobertura: ''Cobertura'',
  duplex: ''Duplex'',
  triplex: ''Triplex'',
  studio: ''Studio'',
  kitnet: ''Kitnet'',
  flat: ''Flat'',
  sobrado: ''Sobrado'',
  condominio_fechado: ''Condomínio Fechado'',
  outro: ''Outro'',
};

export const PROPERTY_STATE_LABELS: Record<PropertyState, string> = {
  novo: ''Novo'',
  seminovo: ''Seminovo'',
  usado: ''Usado'',
};

export const PROPERTY_SITUATION_LABELS: Record<PropertySituation, string> = {
  na_planta: ''Na Planta'',
  em_construcao: ''Em Construção'',
  pronto: ''Pronto'',
};

export const COMMERCIAL_STATUS_LABELS: Record<CommercialStatus, string> = {
  disponivel: ''Disponível'',
  reservado: ''Reservado'',
  vendido: ''Vendido'',
  locado: ''Locado'',
  inativo: ''Inativo'',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  futuro: ''Futuro'',
  em_obra: ''Em Obra'',
  entregue: ''Entregue'',
};

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  drive_fotos: ''Fotos (Drive)'',
  drive_documentos: ''Documentos (Drive)'',
  localizacao: ''Localização'',
  tour_virtual: ''Tour Virtual'',
  outro: ''Outro'',
};

// ============================================================
// BADGE COLORS — para uso com Tailwind + ShadCN Badge
// ============================================================

export const COMMERCIAL_STATUS_COLORS: Record<CommercialStatus, string> = {
  disponivel: ''bg-emerald-100 text-emerald-800'',
  reservado: ''bg-amber-100 text-amber-800'',
  vendido: ''bg-slate-100 text-slate-600'',
  locado: ''bg-blue-100 text-blue-800'',
  inativo: ''bg-red-100 text-red-700'',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  futuro: ''bg-purple-100 text-purple-800'',
  em_obra: ''bg-orange-100 text-orange-800'',
  entregue: ''bg-emerald-100 text-emerald-800'',
};

// ============================================================
// FORMATADORES
// ============================================================

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return ''—'';
  return new Intl.NumberFormat(''pt-BR'', {
    style: ''currency'',
    currency: ''BRL'',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value: number | null | undefined): string {
  if (value == null) return ''—'';
  return `${value.toLocaleString(''pt-BR'')} m²`;
}

export function formatPropertyAge(years: number | null | undefined): string {
  if (years == null) return ''—'';
  if (years === 0) return ''Entregue este ano'';
  if (years < 0) return `Entrega em ${Math.abs(years)} ano${Math.abs(years) > 1 ? ''s'' : ''''}`;
  return `${years} ano${years > 1 ? ''s'' : ''''}`;
}

export function formatRooms(bedrooms: number | null, suites: number | null): string {
  if (bedrooms == null) return ''—'';
  const base = `${bedrooms} qto${bedrooms > 1 ? ''s'' : ''''}`;
  if (suites) return `${base} (${suites} suíte${suites > 1 ? ''s'' : ''''})`;
  return base;
}

'@

Write-File 'lib/schemas/property.schema.ts' @'
// lib/schemas/property.schema.ts
// Validação com Zod — usada em Server Actions e formulários.
// Fonte única de verdade para regras de validação.

import { z } from ''zod'';
import {
  PROPERTY_TYPES,
  PROPERTY_SUBTYPES,
  PROPERTY_STATES,
  PROPERTY_SITUATIONS,
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
  LINK_TYPES,
} from ''@/types/domain'';

// ============================================================
// PROPERTY LINK
// ============================================================

export const propertyLinkSchema = z.object({
  type: z.enum(LINK_TYPES),
  url: z.string().url(''URL inválida''),
  label: z.string().max(100).nullish(),
  sort_order: z.number().int().min(0).default(0),
});

// ============================================================
// PROPERTY — criação e edição
// ============================================================

export const propertySchema = z.object({
  // Classificação
  type: z.enum(PROPERTY_TYPES, { required_error: ''Tipo é obrigatório'' }),
  subtype: z.enum(PROPERTY_SUBTYPES).nullish(),

  // Localização
  city: z.string().min(2, ''Cidade é obrigatória'').max(100),
  neighborhood: z.string().max(100).nullish(),
  address: z.string().max(255).nullish(),

  // Relacionamentos (UUIDs opcionais)
  development_id: z.string().uuid().nullish(),
  broker_id: z.string().uuid().nullish(),

  // Unidade
  unit: z.string().max(50).nullish(),
  builder: z.string().max(150).nullish(),

  // Dimensões
  area_m2: z.number().positive(''Metragem deve ser positiva'').nullish(),
  bedrooms: z.number().int().min(0).max(99).nullish(),
  suites: z.number().int().min(0).max(99).nullish(),
  parking_spots: z.number().int().min(0).max(99).nullish(),
  storage_unit: z.boolean().default(false),

  // Valores
  price: z.number().positive(''Valor deve ser positivo'').nullish(),
  condo_fee: z.number().min(0).nullish(),

  // Status
  state: z.enum(PROPERTY_STATES).nullish(),
  situation: z.enum(PROPERTY_SITUATIONS).nullish(),
  commercial_status: z.enum(COMMERCIAL_STATUSES).default(''disponivel''),
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

// Schema para update — todos os campos opcionais exceto os validados condicionalmente
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
// IMPORT — mapeamento de colunas
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

'@

Write-File 'lib/services/import.service.ts' @'
// lib/services/import.service.ts
// Lógica de negócio para importação de planilhas.
// Orquestra parsing → validação → upsert → marcação de desatualizados.

import * as XLSX from ''xlsx'';
import { createClient } from ''@/lib/supabase/server'';
import * as propertyRepo from ''@/lib/supabase/property.repo'';
import type {
  ImportPreview,
  ColumnMapping,
  ImportableField,
  PropertyInsert,
} from ''@/types/domain'';

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
  const workbook = XLSX.read(buffer, { type: ''array'' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<RawRow>(sheet, {
    raw: false,
    defval: '''',
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
    sample_values: rows.slice(0, sampleSize).map((r) => String(r[header] ?? '''')),
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
    .normalize(''NFD'')
    .replace(/[\u0300-\u036f]/g, '''')
    .replace(/[^a-z0-9]/g, ''_'');

  const mappings: Record<string, ImportableField> = {
    tipo: ''type'',
    subtipo: ''subtype'',
    cidade: ''city'',
    bairro: ''neighborhood'',
    endereco: ''address'',
    empreendimento: ''development_name'',
    construtora: ''builder'',
    unidade: ''unit'',
    quartos: ''bedrooms'',
    dormitorios: ''bedrooms'',
    suites: ''suites'',
    vagas: ''parking_spots'',
    metragem: ''area_m2'',
    area: ''area_m2'',
    m2: ''area_m2'',
    valor: ''price'',
    preco: ''price'',
    condominio: ''condo_fee'',
    estado: ''state'',
    situacao: ''situation'',
    status: ''commercial_status'',
    entrega: ''delivery_year'',
    ano_entrega: ''delivery_year'',
    captador: ''broker_name'',
    corretor: ''broker_name'',
    descricao: ''description'',
    diferenciais: ''highlights'',
    referencia: ''external_ref'',
    id_externo: ''external_ref'',
    escaninho: ''storage_unit'',
  };

  return mappings[normalized] ?? null;
}

// ============================================================
// IMPORTAÇÃO EFETIVA
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
          .from(''properties'')
          .select(''id'')
          .eq(''external_ref'', externalRef)
          .is(''deleted_at'', null)
          .single();

        if (existing) {
          await propertyRepo.updateProperty(existing.id, {
            ...propertyData,
            is_stale: false,
            stale_since: null,
          });
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
        message: err instanceof Error ? err.message : ''Erro desconhecido'',
      });
    }
  }

  // Marcar como desatualizados os imóveis desta fonte ausentes na importação atual
  if (markMissingAsStale && externalRefsInImport.size > 0) {
    const { data: existingRefs } = await supabase
      .from(''properties'')
      .select(''id, external_ref'')
      .is(''deleted_at'', null)
      .eq(''is_stale'', false)
      .not(''external_ref'', ''is'', null);

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
// MAPEAMENTO DE LINHA → PropertyInsert
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
    const rawValue = row[sourceCol]?.trim() ?? '''';
    if (!rawValue) continue;

    switch (targetField) {
      case ''bedrooms'':
      case ''suites'':
      case ''parking_spots'':
      case ''delivery_year'':
        mapped[targetField] = parseInt(rawValue, 10) || undefined;
        break;
      case ''area_m2'':
      case ''price'':
      case ''condo_fee'':
        mapped[targetField] = parseFloat(rawValue.replace(/[^\d,.-]/g, '''').replace('','', ''.'')) || undefined;
        break;
      case ''storage_unit'':
        mapped[targetField] = [''sim'', ''yes'', ''1'', ''true''].includes(rawValue.toLowerCase());
        break;
      case ''highlights'':
        mapped[targetField] = rawValue.split(/[;|,]/).map((s) => s.trim()).filter(Boolean);
        break;
      default:
        (mapped as Record<string, unknown>)[targetField] = rawValue;
    }
  }

  // broker_name e development_name são resolvidos externamente
  // (lookup ou criação automática — feito em camada superior)
  return mapped as PropertyInsert;
}

'@

Write-File 'lib/supabase/broker.repo.ts' @'
// src/lib/supabase/broker.repo.ts

import { createClient } from ''./server''
import type { Broker, BrokerInsert, BrokerUpdate } from ''@/types/domain''

export async function getBrokers(): Promise<Broker[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(''brokers'')
    .select(''*'')
    .eq(''is_active'', true)
    .order(''name'')
  if (error) throw new Error(`getBrokers: ${error.message}`)
  return (data ?? []) as Broker[]
}

export async function getBrokerById(id: string): Promise<Broker | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(''brokers'').select(''*'').eq(''id'', id).single()
  if (error) {
    if (error.code === ''PGRST116'') return null
    throw new Error(`getBrokerById: ${error.message}`)
  }
  return data as Broker
}

export async function createBroker(input: BrokerInsert): Promise<Broker> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(''brokers'').insert(input).select().single()
  if (error) throw new Error(`createBroker: ${error.message}`)
  return data as Broker
}

export async function updateBroker(id: string, input: BrokerUpdate): Promise<Broker> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(''brokers'').update(input).eq(''id'', id).select().single()
  if (error) throw new Error(`updateBroker: ${error.message}`)
  return data as Broker
}

'@

Write-File 'lib/supabase/client.ts' @'
// lib/supabase/client.ts
// Cliente Supabase para uso em Client Components (browser)

import { createBrowserClient } from ''@supabase/ssr'';
import type { Database } from ''./database.types'';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

'@

Write-File 'lib/supabase/database.types.ts' @'
// lib/supabase/database.types.ts
// Gerado via: npx supabase gen types typescript --local > lib/supabase/database.types.ts
// Regenerar sempre que o schema mudar.
//
// ATENÇÃO: não editar manualmente — manter sincronizado com o banco.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      brokers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          creci: string | null;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          creci?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          creci?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      developments: {
        Row: {
          id: string;
          name: string;
          builder: string | null;
          city: string | null;
          neighborhood: string | null;
          address: string | null;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          builder?: string | null;
          city?: string | null;
          neighborhood?: string | null;
          address?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          builder?: string | null;
          city?: string | null;
          neighborhood?: string | null;
          address?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      imports: {
        Row: {
          id: string;
          filename: string;
          status: Database[''public''][''Enums''][''import_status''];
          total_rows: number | null;
          processed_rows: number | null;
          created_rows: number | null;
          updated_rows: number | null;
          stale_rows: number | null;
          error_message: string | null;
          raw_headers: string[] | null;
          column_mapping: Json | null;
          imported_by: string | null;
          metadata: Json | null;
          created_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          filename: string;
          status?: Database[''public''][''Enums''][''import_status''];
          total_rows?: number | null;
          processed_rows?: number | null;
          created_rows?: number | null;
          updated_rows?: number | null;
          stale_rows?: number | null;
          error_message?: string | null;
          raw_headers?: string[] | null;
          column_mapping?: Json | null;
          imported_by?: string | null;
          metadata?: Json | null;
          created_at?: string;
          finished_at?: string | null;
        };
        Update: Partial<Database[''public''][''Tables''][''imports''][''Insert'']>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          type: Database[''public''][''Enums''][''property_type''];
          subtype: Database[''public''][''Enums''][''property_subtype''] | null;
          city: string;
          neighborhood: string | null;
          address: string | null;
          development_id: string | null;
          broker_id: string | null;
          unit: string | null;
          builder: string | null;
          area_m2: number | null;
          bedrooms: number | null;
          suites: number | null;
          parking_spots: number | null;
          storage_unit: boolean;
          price: number | null;
          condo_fee: number | null;
          state: Database[''public''][''Enums''][''property_state''] | null;
          situation: Database[''public''][''Enums''][''property_situation''] | null;
          commercial_status: Database[''public''][''Enums''][''commercial_status''];
          delivery_status: Database[''public''][''Enums''][''delivery_status''] | null;
          delivery_year: number | null;
          description: string | null;
          highlights: string[];
          import_id: string | null;
          external_ref: string | null;
          is_stale: boolean;
          stale_since: string | null;
          deleted_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: Database[''public''][''Enums''][''property_type''];
          subtype?: Database[''public''][''Enums''][''property_subtype''] | null;
          city: string;
          neighborhood?: string | null;
          address?: string | null;
          development_id?: string | null;
          broker_id?: string | null;
          unit?: string | null;
          builder?: string | null;
          area_m2?: number | null;
          bedrooms?: number | null;
          suites?: number | null;
          parking_spots?: number | null;
          storage_unit?: boolean;
          price?: number | null;
          condo_fee?: number | null;
          state?: Database[''public''][''Enums''][''property_state''] | null;
          situation?: Database[''public''][''Enums''][''property_situation''] | null;
          commercial_status?: Database[''public''][''Enums''][''commercial_status''];
          delivery_status?: Database[''public''][''Enums''][''delivery_status''] | null;
          delivery_year?: number | null;
          description?: string | null;
          highlights?: string[];
          import_id?: string | null;
          external_ref?: string | null;
          is_stale?: boolean;
          stale_since?: string | null;
          deleted_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database[''public''][''Tables''][''properties''][''Insert'']>;
        Relationships: [
          {
            foreignKeyName: ''properties_broker_id_fkey'';
            columns: [''broker_id''];
            referencedRelation: ''brokers'';
            referencedColumns: [''id''];
          },
          {
            foreignKeyName: ''properties_development_id_fkey'';
            columns: [''development_id''];
            referencedRelation: ''developments'';
            referencedColumns: [''id''];
          },
          {
            foreignKeyName: ''properties_import_id_fkey'';
            columns: [''import_id''];
            referencedRelation: ''imports'';
            referencedColumns: [''id''];
          },
        ];
      };
      property_links: {
        Row: {
          id: string;
          property_id: string;
          type: Database[''public''][''Enums''][''link_type''];
          url: string;
          label: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: Database[''public''][''Enums''][''link_type''];
          url: string;
          label?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database[''public''][''Tables''][''property_links''][''Insert'']>;
        Relationships: [
          {
            foreignKeyName: ''property_links_property_id_fkey'';
            columns: [''property_id''];
            referencedRelation: ''properties'';
            referencedColumns: [''id''];
          },
        ];
      };
    };
    Views: {
      v_properties_enriched: {
        Row: Database[''public''][''Tables''][''properties''][''Row''] & {
          property_age_years: number | null;
          broker_name: string | null;
          broker_email: string | null;
          broker_creci: string | null;
          development_name: string | null;
          development_builder: string | null;
          links_count: number;
        };
        Relationships: Database[''public''][''Tables''][''properties''][''Relationships''];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      property_type: ''apartamento'' | ''casa'' | ''terreno'' | ''comercial'' | ''rural'' | ''outro'';
      property_subtype:
        | ''padrao''
        | ''cobertura''
        | ''duplex''
        | ''triplex''
        | ''studio''
        | ''kitnet''
        | ''flat''
        | ''sobrado''
        | ''condominio_fechado''
        | ''outro'';
      property_state: ''novo'' | ''seminovo'' | ''usado'';
      property_situation: ''na_planta'' | ''em_construcao'' | ''pronto'';
      commercial_status: ''disponivel'' | ''reservado'' | ''vendido'' | ''locado'' | ''inativo'';
      delivery_status: ''futuro'' | ''em_obra'' | ''entregue'';
      import_status: ''pendente'' | ''processando'' | ''concluido'' | ''erro'';
      link_type: ''drive_fotos'' | ''drive_documentos'' | ''localizacao'' | ''tour_virtual'' | ''outro'';
    };
    CompositeTypes: Record<string, never>;
  };
};

// Helpers de conveniência
export type Tables<T extends keyof Database[''public''][''Tables'']> =
  Database[''public''][''Tables''][T][''Row''];

export type TablesInsert<T extends keyof Database[''public''][''Tables'']> =
  Database[''public''][''Tables''][T][''Insert''];

export type TablesUpdate<T extends keyof Database[''public''][''Tables'']> =
  Database[''public''][''Tables''][T][''Update''];

export type Views<T extends keyof Database[''public''][''Views'']> =
  Database[''public''][''Views''][T][''Row''];

export type Enums<T extends keyof Database[''public''][''Enums'']> =
  Database[''public''][''Enums''][T];

'@

Write-File 'lib/supabase/development.repo.ts' @'
// src/lib/supabase/development.repo.ts

import { createClient } from ''./server''
import type { Development, DevelopmentInsert, DevelopmentUpdate } from ''@/types/domain''

export async function getDevelopments(): Promise<Development[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(''developments'')
    .select(''*'')
    .eq(''is_active'', true)
    .order(''name'')
  if (error) throw new Error(`getDevelopments: ${error.message}`)
  return (data ?? []) as Development[]
}

export async function getDevelopmentById(id: string): Promise<Development | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(''developments'').select(''*'').eq(''id'', id).single()
  if (error) {
    if (error.code === ''PGRST116'') return null
    throw new Error(`getDevelopmentById: ${error.message}`)
  }
  return data as Development
}

export async function createDevelopment(input: DevelopmentInsert): Promise<Development> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(''developments'').insert(input).select().single()
  if (error) throw new Error(`createDevelopment: ${error.message}`)
  return data as Development
}

export async function updateDevelopment(id: string, input: DevelopmentUpdate): Promise<Development> {
  const supabase = await createClient()
  const { data, error } = await supabase.from(''developments'').update(input).eq(''id'', id).select().single()
  if (error) throw new Error(`updateDevelopment: ${error.message}`)
  return data as Development
}

'@

Write-File 'lib/supabase/property.repo.ts' @'
// lib/supabase/property.repo.ts
// Repository pattern — toda query de imóvel passa por aqui.
// Não contém lógica de negócio, apenas acesso a dados tipado.

import { createClient } from ''./server'';
import type {
  PropertyEnriched,
  PropertyWithLinks,
  PropertyInsert,
  PropertyUpdate,
  PropertyFilters,
  PropertySort,
  PaginationParams,
  PaginatedResult,
  PropertyLink,
  PropertyLinkInsert,
} from ''@/types/domain'';

// ============================================================
// QUERIES
// ============================================================

export async function getProperties(
  filters: PropertyFilters = {},
  sort: PropertySort = { field: ''created_at'', direction: ''desc'' },
  pagination: PaginationParams = { page: 1, per_page: 50 },
): Promise<PaginatedResult<PropertyEnriched>> {
  const supabase = await createClient();
  const { page, per_page } = pagination;
  const offset = (page - 1) * per_page;

  let query = supabase
    .from(''v_properties_enriched'')
    .select(''*'', { count: ''exact'' });

  // --- Filtros multiselect ---
  if (filters.cities?.length)         query = query.in(''city'', filters.cities);
  if (filters.neighborhoods?.length)  query = query.in(''neighborhood'', filters.neighborhoods);
  if (filters.development_ids?.length) query = query.in(''development_id'', filters.development_ids);
  if (filters.broker_ids?.length)     query = query.in(''broker_id'', filters.broker_ids);
  if (filters.types?.length)          query = query.in(''type'', filters.types);
  if (filters.subtypes?.length)       query = query.in(''subtype'', filters.subtypes);
  if (filters.bedrooms?.length)       query = query.in(''bedrooms'', filters.bedrooms);
  if (filters.suites?.length)         query = query.in(''suites'', filters.suites);
  if (filters.parking_spots?.length)  query = query.in(''parking_spots'', filters.parking_spots);
  if (filters.states?.length)         query = query.in(''state'', filters.states);
  if (filters.situations?.length)     query = query.in(''situation'', filters.situations);
  if (filters.commercial_statuses?.length) query = query.in(''commercial_status'', filters.commercial_statuses);
  if (filters.delivery_statuses?.length)   query = query.in(''delivery_status'', filters.delivery_statuses);
  if (filters.delivery_years?.length)      query = query.in(''delivery_year'', filters.delivery_years);

  // --- Filtros de range ---
  if (filters.price_min != null) query = query.gte(''price'', filters.price_min);
  if (filters.price_max != null) query = query.lte(''price'', filters.price_max);
  if (filters.area_min != null)  query = query.gte(''area_m2'', filters.area_min);
  if (filters.area_max != null)  query = query.lte(''area_m2'', filters.area_max);

  // Filtro de idade calculada (property_age_years é campo da view)
  if (filters.age_min != null) query = query.gte(''property_age_years'', filters.age_min);
  if (filters.age_max != null) query = query.lte(''property_age_years'', filters.age_max);

  // --- Booleanos ---
  if (filters.has_storage_unit != null) query = query.eq(''storage_unit'', filters.has_storage_unit);
  if (!filters.show_stale) query = query.eq(''is_stale'', false);

  // --- Busca textual ---
  if (filters.search?.trim()) {
    query = query.textSearch(''city'', filters.search, {
      type: ''websearch'',
      config: ''portuguese'',
    });
  }

  // --- Ordenação e paginação ---
  query = query
    .order(sort.field as string, { ascending: sort.direction === ''asc'' })
    .range(offset, offset + per_page - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(`getProperties: ${error.message}`);

  return {
    data: (data ?? []) as PropertyEnriched[],
    total: count ?? 0,
    page,
    per_page,
    total_pages: Math.ceil((count ?? 0) / per_page),
  };
}

export async function getPropertyById(id: string): Promise<PropertyWithLinks | null> {
  const supabase = await createClient();

  const [propertyRes, linksRes] = await Promise.all([
    supabase.from(''v_properties_enriched'').select(''*'').eq(''id'', id).single(),
    supabase
      .from(''property_links'')
      .select(''*'')
      .eq(''property_id'', id)
      .order(''sort_order''),
  ]);

  if (propertyRes.error) {
    if (propertyRes.error.code === ''PGRST116'') return null; // not found
    throw new Error(`getPropertyById: ${propertyRes.error.message}`);
  }

  return {
    ...(propertyRes.data as PropertyEnriched),
    links: (linksRes.data ?? []) as PropertyLink[],
  };
}

// Valores únicos para popular filtros
export async function getFilterOptions(): Promise<{
  cities: string[];
  neighborhoods: string[];
  brokers: Array<{ id: string; name: string }>;
  developments: Array<{ id: string; name: string }>;
  delivery_years: number[];
}> {
  const supabase = await createClient();

  const [citiesRes, neighborhoodsRes, brokersRes, developmentsRes, yearsRes] =
    await Promise.all([
      supabase
        .from(''properties'')
        .select(''city'')
        .is(''deleted_at'', null)
        .order(''city''),
      supabase
        .from(''properties'')
        .select(''neighborhood'')
        .is(''deleted_at'', null)
        .not(''neighborhood'', ''is'', null)
        .order(''neighborhood''),
      supabase
        .from(''brokers'')
        .select(''id, name'')
        .eq(''is_active'', true)
        .order(''name''),
      supabase
        .from(''developments'')
        .select(''id, name'')
        .eq(''is_active'', true)
        .order(''name''),
      supabase
        .from(''properties'')
        .select(''delivery_year'')
        .is(''deleted_at'', null)
        .not(''delivery_year'', ''is'', null)
        .order(''delivery_year''),
    ]);

  return {
    cities: [...new Set(citiesRes.data?.map((r) => r.city).filter(Boolean) ?? [])],
    neighborhoods: [
      ...new Set(neighborhoodsRes.data?.map((r) => r.neighborhood).filter(Boolean) ?? []),
    ],
    brokers: brokersRes.data ?? [],
    developments: developmentsRes.data ?? [],
    delivery_years: [
      ...new Set(yearsRes.data?.map((r) => r.delivery_year).filter(Boolean) ?? []),
    ],
  };
}

// ============================================================
// MUTATIONS
// ============================================================

export async function createProperty(data: PropertyInsert): Promise<PropertyEnriched> {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from(''properties'')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createProperty: ${error.message}`);

  // Retornar versão enriquecida
  const enriched = await getPropertyById(created.id);
  if (!enriched) throw new Error(''createProperty: falha ao recuperar imóvel criado'');
  return enriched;
}

export async function updateProperty(
  id: string,
  data: PropertyUpdate,
): Promise<PropertyEnriched> {
  const supabase = await createClient();

  const { error } = await supabase.from(''properties'').update(data).eq(''id'', id);
  if (error) throw new Error(`updateProperty: ${error.message}`);

  const updated = await getPropertyById(id);
  if (!updated) throw new Error(''updateProperty: imóvel não encontrado após update'');
  return updated;
}

// Soft delete — nunca apaga fisicamente
export async function deleteProperty(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from(''properties'')
    .update({ deleted_at: new Date().toISOString() })
    .eq(''id'', id);

  if (error) throw new Error(`deleteProperty: ${error.message}`);
}

// Marcar imóveis como desatualizados (usada após importação)
export async function markPropertiesAsStale(
  ids: string[],
): Promise<void> {
  if (!ids.length) return;
  const supabase = await createClient();

  const { error } = await supabase
    .from(''properties'')
    .update({
      is_stale: true,
      stale_since: new Date().toISOString(),
    })
    .in(''id'', ids);

  if (error) throw new Error(`markPropertiesAsStale: ${error.message}`);
}

// ============================================================
// LINKS
// ============================================================

export async function upsertPropertyLinks(
  property_id: string,
  links: Omit<PropertyLinkInsert, ''property_id''>[],
): Promise<PropertyLink[]> {
  const supabase = await createClient();

  // Apaga os existentes e reinserimos com nova ordem
  await supabase.from(''property_links'').delete().eq(''property_id'', property_id);

  if (!links.length) return [];

  const toInsert: PropertyLinkInsert[] = links.map((l, i) => ({
    ...l,
    property_id,
    sort_order: i,
  }));

  const { data, error } = await supabase
    .from(''property_links'')
    .insert(toInsert)
    .select();

  if (error) throw new Error(`upsertPropertyLinks: ${error.message}`);
  return (data ?? []) as PropertyLink[];
}

'@

Write-File 'lib/supabase/server.ts' @'
// lib/supabase/server.ts
// Cliente Supabase para uso em Server Components, Server Actions e Route Handlers

import { createServerClient } from ''@supabase/ssr'';
import { cookies } from ''next/headers'';
import type { Database } from ''./database.types'';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component: cookies são read-only, ignorar silenciosamente
          }
        },
      },
    },
  );
}

'@

Write-File 'lib/utils.ts' @'
// src/lib/utils.ts
// Gerado pelo shadcn init — não remover.

import { type ClassValue, clsx } from ''clsx''
import { twMerge } from ''tailwind-merge''

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

'@

Write-File 'next.config.ts' @'
import type { NextConfig } from ''next''

const nextConfig: NextConfig = {}

export default nextConfig

'@

Write-File 'supabase/migrations/20240101000000_schema.sql' @'
-- ============================================================
-- LIMOB — Schema principal
-- Versão: 001
-- ============================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

create type property_type as enum (
  ''apartamento'',
  ''casa'',
  ''terreno'',
  ''comercial'',
  ''rural'',
  ''outro''
);

create type property_subtype as enum (
  ''padrao'',
  ''cobertura'',
  ''duplex'',
  ''triplex'',
  ''studio'',
  ''kitnet'',
  ''flat'',
  ''sobrado'',
  ''condominio_fechado'',
  ''outro''
);

create type property_state as enum (
  ''novo'',
  ''seminovo'',
  ''usado''
);

create type property_situation as enum (
  ''na_planta'',
  ''em_construcao'',
  ''pronto''
);

create type commercial_status as enum (
  ''disponivel'',
  ''reservado'',
  ''vendido'',
  ''locado'',
  ''inativo''
);

create type delivery_status as enum (
  ''futuro'',
  ''em_obra'',
  ''entregue''
);

create type import_status as enum (
  ''pendente'',
  ''processando'',
  ''concluido'',
  ''erro''
);

create type link_type as enum (
  ''drive_fotos'',
  ''drive_documentos'',
  ''localizacao'',
  ''tour_virtual'',
  ''outro''
);

-- ============================================================
-- BROKERS — Captadores / Corretores
-- ============================================================

create table brokers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text,
  phone       text,
  creci       text,
  is_active   boolean not null default true,
  metadata    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table brokers is ''Corretores e captadores de imóveis.'';

-- ============================================================
-- DEVELOPMENTS — Empreendimentos
-- ============================================================

create table developments (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  builder       text,                     -- construtora
  city          text,
  neighborhood  text,
  address       text,
  is_active     boolean not null default true,
  metadata      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table developments is ''Empreendimentos imobiliários (condomínios, edifícios etc.).'';

-- ============================================================
-- IMPORTS — Histórico de importações de planilhas
-- ============================================================

create table imports (
  id                  uuid primary key default uuid_generate_v4(),
  filename            text not null,
  status              import_status not null default ''pendente'',
  total_rows          integer,
  processed_rows      integer,
  created_rows        integer,
  updated_rows        integer,
  stale_rows          integer,           -- marcados como desatualizados
  error_message       text,
  raw_headers         text[],            -- cabeçalhos originais da planilha
  column_mapping      jsonb,             -- mapeamento coluna→campo
  imported_by         uuid,              -- future: referência ao usuário
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  finished_at         timestamptz
);

comment on table imports is ''Histórico de importações de planilhas XLSX/CSV.'';

-- ============================================================
-- PROPERTIES — Imóveis (entidade central)
-- ============================================================

create table properties (
  id                  uuid primary key default uuid_generate_v4(),

  -- Classificação
  type                property_type not null,
  subtype             property_subtype,

  -- Localização
  city                text not null,
  neighborhood        text,
  address             text,

  -- Relacionamentos
  development_id      uuid references developments(id),
  broker_id           uuid references brokers(id),

  -- Detalhes da unidade
  unit                text,             -- número/identificador da unidade
  builder             text,             -- construtora (independente do empreendimento)

  -- Dimensões e composição
  area_m2             numeric(10, 2),
  bedrooms            smallint,
  suites              smallint,
  parking_spots       smallint,
  storage_unit        boolean default false,   -- escaninho

  -- Valores
  price               numeric(15, 2),
  condo_fee           numeric(10, 2),

  -- Status e situação
  state               property_state,
  situation           property_situation,
  commercial_status   commercial_status not null default ''disponivel'',
  delivery_status     delivery_status,
  delivery_year       smallint,

  -- Conteúdo
  description         text,
  highlights          text[],           -- diferenciais

  -- Controle de importação
  import_id           uuid references imports(id),
  external_ref        text,             -- identificador externo (da planilha de origem)
  is_stale            boolean not null default false,   -- ausente em importação mais recente
  stale_since         timestamptz,

  -- Soft delete
  deleted_at          timestamptz,      -- null = ativo

  -- Metadata e auditoria
  metadata            jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table properties is ''Imóveis. Nunca apagados fisicamente — usar deleted_at para soft delete e is_stale para imóveis desatualizados.'';
comment on column properties.delivery_year is ''Ano de entrega. A idade do imóvel é calculada dinamicamente via view.'';
comment on column properties.is_stale is ''True quando o imóvel estava em uma importação anterior mas ausente na mais recente.'';
comment on column properties.external_ref is ''Referência do imóvel no sistema de origem (planilha, ERP etc.).'';

-- ============================================================
-- PROPERTY_LINKS — Links externos por imóvel
-- ============================================================

create table property_links (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid not null references properties(id) on delete restrict,
  type         link_type not null,
  url          text not null,
  label        text,                    -- descrição amigável opcional
  sort_order   smallint default 0,
  created_at   timestamptz not null default now()
);

comment on table property_links is ''Links externos (Drive, Google Maps, tour virtual etc.) associados a imóveis.'';

-- ============================================================
-- INDEXES
-- ============================================================

-- Properties: filtros mais usados
create index idx_properties_city           on properties(city) where deleted_at is null;
create index idx_properties_neighborhood   on properties(neighborhood) where deleted_at is null;
create index idx_properties_type           on properties(type) where deleted_at is null;
create index idx_properties_commercial     on properties(commercial_status) where deleted_at is null;
create index idx_properties_broker        on properties(broker_id) where deleted_at is null;
create index idx_properties_development   on properties(development_id) where deleted_at is null;
create index idx_properties_price         on properties(price) where deleted_at is null;
create index idx_properties_area          on properties(area_m2) where deleted_at is null;
create index idx_properties_delivery_year on properties(delivery_year) where deleted_at is null;
create index idx_properties_stale         on properties(is_stale) where deleted_at is null;
create index idx_properties_import        on properties(import_id);

-- Busca por texto (trigram)
create index idx_properties_search on properties
  using gin (
    (to_tsvector(''portuguese'', coalesce(city, '''') || '' '' || coalesce(neighborhood, '''') || '' '' || coalesce(description, '''')))
  )
  where deleted_at is null;

-- Links
create index idx_property_links_property on property_links(property_id);

-- Developments
create index idx_developments_city on developments(city) where is_active = true;

-- ============================================================
-- TRIGGERS — updated_at automático
-- ============================================================

create or replace function trigger_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
-- VIEWS — Calculated fields
-- ============================================================

create view v_properties_enriched as
select
  p.*,
  -- Idade calculada dinamicamente
  case
    when p.delivery_year is not null then
      extract(year from now())::int - p.delivery_year
    else null
  end as property_age_years,
  -- Relacionamentos expandidos
  b.name  as broker_name,
  b.email as broker_email,
  b.creci as broker_creci,
  d.name  as development_name,
  d.builder as development_builder,
  -- Contagem de links
  (select count(*) from property_links pl where pl.property_id = p.id) as links_count
from properties p
left join brokers     b on b.id = p.broker_id
left join developments d on d.id = p.development_id
where p.deleted_at is null;

comment on view v_properties_enriched is ''Visão enriquecida de imóveis ativos com dados relacionados e campos calculados.'';

'@

Write-File 'tailwind.config.ts' @'
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // ← CORREÇÃO: plugin necessário para classes de animação do shadcn
  plugins: [require("tailwindcss-animate")],
}

export default config

'@

Write-File 'tsconfig.json' @'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}

'@

Write-File 'types/domain.ts' @'
// ============================================================
// LIMOB — Domain Types
// Alinhados 1:1 com o schema PostgreSQL
// ============================================================

// ============================================================
// ENUMS
// ============================================================

export const PROPERTY_TYPES = [
  ''apartamento'',
  ''casa'',
  ''terreno'',
  ''comercial'',
  ''rural'',
  ''outro'',
] as const;

export const PROPERTY_SUBTYPES = [
  ''padrao'',
  ''cobertura'',
  ''duplex'',
  ''triplex'',
  ''studio'',
  ''kitnet'',
  ''flat'',
  ''sobrado'',
  ''condominio_fechado'',
  ''outro'',
] as const;

export const PROPERTY_STATES = [''novo'', ''seminovo'', ''usado''] as const;

export const PROPERTY_SITUATIONS = [
  ''na_planta'',
  ''em_construcao'',
  ''pronto'',
] as const;

export const COMMERCIAL_STATUSES = [
  ''disponivel'',
  ''reservado'',
  ''vendido'',
  ''locado'',
  ''inativo'',
] as const;

export const DELIVERY_STATUSES = [''futuro'', ''em_obra'', ''entregue''] as const;

export const IMPORT_STATUSES = [
  ''pendente'',
  ''processando'',
  ''concluido'',
  ''erro'',
] as const;

export const LINK_TYPES = [
  ''drive_fotos'',
  ''drive_documentos'',
  ''localizacao'',
  ''tour_virtual'',
  ''outro'',
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
// BASE — campos comuns de auditoria
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

export type BrokerInsert = Omit<Broker, ''id'' | ''created_at'' | ''updated_at''>;
export type BrokerUpdate = Partial<BrokerInsert>;

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

export type DevelopmentInsert = Omit<Development, ''id'' | ''created_at'' | ''updated_at''>;
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

export type PropertyLinkInsert = Omit<PropertyLink, ''id'' | ''created_at''>;

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
  ''id'' | ''created_at'' | ''updated_at'' | ''is_stale'' | ''stale_since'' | ''deleted_at''
>;

export type PropertyUpdate = Partial<PropertyInsert>;

// ============================================================
// PROPERTY ENRICHED — resultado da view v_properties_enriched
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

export type ImportInsert = Omit<Import, ''id'' | ''created_at''>;
export type ImportUpdate = Partial<ImportInsert>;

// ============================================================
// FILTER PARAMS — usado pelos hooks e server actions
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
  direction: ''asc'' | ''desc'';
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
// IMPORT COLUMN MAPPING — wizard de importação
// ============================================================

export type ImportableField = keyof PropertyInsert | ''broker_name'' | ''development_name'';

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

'@


Write-Host ""
Write-Host "=== Instalando tailwindcss-animate ===" -ForegroundColor Cyan
npm install tailwindcss-animate

Write-Host ""
Write-Host "=== Limpando cache ===" -ForegroundColor Cyan
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host ""
Write-Host "=== Pronto! Rode: npm run dev ===" -ForegroundColor Green
