# LIMOB â€” CorreÃ§Ãµes aplicadas

## DiagnÃ³stico dos problemas encontrados

### 1. Arquivos jogados na raiz (problema principal)
Os arquivos gerados anteriormente (`FilterPanel.tsx`, `Sidebar.tsx`, `PropertyCard.tsx`,
`PropertyGrid.tsx`, `MultiSelect.tsx`, `property.repo.ts`, `domain.ts`) foram colocados
diretamente na raiz do projeto em vez de dentro das pastas corretas.
O projeto nunca teve `app/`, `components/` ou `lib/` com conteÃºdo real.

### 2. `tailwind.config.ts` â€” plugins vazio
`plugins: []` â€” faltava `require("tailwindcss-animate")`.
Isso causava o erro `Cannot apply unknown utility class ''border-border''`
porque o Tailwind nÃ£o reconhecia as classes de animaÃ§Ã£o/variÃ¡veis do shadcn.

### 3. `tsconfig.json` â€” `jsx: "react-jsx"` errado
Next.js exige `"jsx": "preserve"`. Com `react-jsx` o Turbopack nÃ£o processa JSX corretamente.

### 4. Componentes UI ausentes
Nenhum arquivo existia em `components/ui/` â€” `button`, `card`, `badge`, `toaster` etc.
Todos foram criados do zero.

---

## O que fazer agora (passo a passo)

### Passo 1 â€” instalar dependÃªncia que faltava
```powershell
cd C:\Users\malou\limob-platform\web
npm install tailwindcss-animate
```

### Passo 2 â€” apagar os arquivos soltos na raiz
Esses arquivos estÃ£o no lugar errado e devem ser removidos da raiz:
```
FilterPanel.tsx       â†’ mover para components/filters/
MultiSelect.tsx       â†’ mover para components/filters/
Sidebar.tsx           â†’ mover para components/layout/
PropertyCard.tsx      â†’ mover para components/properties/
PropertyGrid.tsx      â†’ mover para components/properties/
property.repo.ts      â†’ mover para lib/supabase/
domain.ts             â†’ mover para types/
```
Ou simplesmente deletar da raiz â€” as versÃµes corretas estÃ£o nos arquivos deste pacote.

### Passo 3 â€” copiar os arquivos corrigidos
Copie TODOS os arquivos deste pacote para dentro de `C:\Users\malou\limob-platform\web\`,
mantendo a estrutura de pastas exatamente como estÃ¡.

Estrutura final esperada dentro de `web/`:
```
web/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ globals.css            â† substituir
â”‚   â”œâ”€â”€ layout.tsx             â† substituir
â”‚   â”œâ”€â”€ page.tsx               â† substituir
â”‚   â””â”€â”€ (internal)/
â”‚       â”œâ”€â”€ layout.tsx
â”‚       â”œâ”€â”€ properties/
â”‚       â”‚   â”œâ”€â”€ page.tsx
â”‚       â”‚   â”œâ”€â”€ new/page.tsx
â”‚       â”‚   â””â”€â”€ [id]/
â”‚       â”‚       â”œâ”€â”€ page.tsx
â”‚       â”‚       â””â”€â”€ edit/page.tsx
â”‚       â”œâ”€â”€ brokers/page.tsx
â”‚       â”œâ”€â”€ developments/page.tsx
â”‚       â””â”€â”€ imports/page.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ ui/                    â† criado do zero (14 arquivos)
â”‚   â”œâ”€â”€ layout/
â”‚   â”œâ”€â”€ properties/
â”‚   â””â”€â”€ filters/
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ utils.ts
â”‚   â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ actions/
â”‚   â”œâ”€â”€ schemas/
â”‚   â”œâ”€â”€ services/
â”‚   â””â”€â”€ constants/
â”œâ”€â”€ types/
â”‚   â””â”€â”€ domain.ts
â”œâ”€â”€ supabase/
â”‚   â””â”€â”€ migrations/
â”‚       â””â”€â”€ 20240101000000_schema.sql
â”œâ”€â”€ tailwind.config.ts         â† substituir (adicionado plugin)
â”œâ”€â”€ tsconfig.json              â† substituir (corrigido jsx)
â””â”€â”€ next.config.ts
```

### Passo 4 â€” criar .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### Passo 5 â€” limpar cache e rodar
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

## Sobre o aviso de lockfiles duplicados
O warning sobre dois `package-lock.json` (na raiz `limob-platform/` e em `web/`) Ã© apenas
um aviso do Turbopack â€” nÃ£o quebra nada. Para silenciar, adicione no `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  turbopack: { root: __dirname }
}
```
