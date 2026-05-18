# LIMOB — Instalação (projeto sem src/)

Execute tudo dentro da pasta `/web`.

---

## 1. Instalar dependências

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  @hookform/resolvers \
  @radix-ui/react-checkbox \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slot \
  class-variance-authority \
  clsx \
  cmdk \
  lucide-react \
  react-hook-form \
  tailwind-merge \
  tailwindcss-animate \
  xlsx \
  zod
```

---

## 2. Variáveis de ambiente

```bash
# Criar .env.local na raiz de /web
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

---

## 3. Rodar o schema no Supabase

No Supabase Dashboard → SQL Editor, executar o conteúdo de:
`supabase/migrations/20240101000000_schema.sql`

---

## 4. Iniciar

```bash
npm run dev
# → http://localhost:3000 redireciona para /properties
```

---

## Mapa de arquivos — onde cada um vai dentro de /web

### Substituir (gerados pelo create-next-app)
```
tailwind.config.ts          → /web/tailwind.config.ts
tsconfig.json               → /web/tsconfig.json
app/globals.css             → /web/app/globals.css
app/layout.tsx              → /web/app/layout.tsx
app/page.tsx                → /web/app/page.tsx
```

### Criar (novos)
```
components.json             → /web/components.json

app/(internal)/layout.tsx
app/(internal)/properties/page.tsx
app/(internal)/properties/new/page.tsx
app/(internal)/properties/[id]/page.tsx
app/(internal)/properties/[id]/edit/page.tsx
app/(internal)/brokers/page.tsx
app/(internal)/developments/page.tsx
app/(internal)/imports/page.tsx

components/ui/badge.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/checkbox.tsx
components/ui/command.tsx
components/ui/form.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/popover.tsx
components/ui/select.tsx
components/ui/separator.tsx
components/ui/skeleton.tsx
components/ui/textarea.tsx
components/ui/toaster.tsx
components/ui/use-toast.ts

components/layout/AppShell.tsx
components/layout/Sidebar.tsx

components/properties/PropertyCard.tsx
components/properties/PropertyDetail.tsx
components/properties/PropertyForm.tsx
components/properties/PropertyGrid.tsx

components/filters/FilterPanel.tsx
components/filters/MultiSelect.tsx

lib/utils.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/database.types.ts
lib/supabase/property.repo.ts
lib/supabase/broker.repo.ts
lib/supabase/development.repo.ts
lib/actions/properties.ts
lib/schemas/property.schema.ts
lib/services/import.service.ts
lib/constants/labels.ts

types/domain.ts

supabase/migrations/20240101000000_schema.sql
```

---

## Diferença key vs projeto com src/

O `tsconfig.json` usa `"@/*": ["./*"]` (raiz) em vez de `"@/*": ["./src/*"]`.
Todos os imports do tipo `@/components/...`, `@/lib/...`, `@/types/...` funcionam igual.
