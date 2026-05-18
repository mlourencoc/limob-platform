# LIMOB — Plataforma de Integração Imobiliária

## VISÃO GERAL

A LIMOB é uma plataforma web focada inicialmente em corretores de imóveis que trabalham com imóveis de terceiros, revenda e captação avulsa.

O objetivo do MVP é permitir que corretores:

- cadastrem imóveis manualmente
- importem imóveis automaticamente
- organizem imóveis captados
- filtrem imóveis com precisão
- encontrem imóveis compatíveis para clientes
- centralizem imóveis vindos de múltiplas fontes

A plataforma deve ser simples, rápida, intuitiva e altamente funcional.

Inicialmente o sistema será utilizado apenas por um único usuário para validação do MVP.

No futuro, o sistema deverá suportar múltiplos usuários, autenticação, planos pagos, permissões e novas inteligências de mercado imobiliário.

---

# OBJETIVOS DO MVP

## Funcionalidades principais

### Cadastro de imóveis

Permitir cadastro manual completo de imóveis contendo:

- tipo do imóvel
- localização
- preço
- metragem
- quartos
- suítes
- vagas
- características
- descrição
- imagens
- corretor responsável
- origem do imóvel

---

### Importação automática de imóveis

O sistema deverá permitir importação e padronização de imóveis através de:

- planilhas
- PDFs
- websites
- prints/imagens
- textos copiados
- outras fontes viáveis

Objetivo:
Transformar dados não estruturados em imóveis organizados no banco de dados.

---

### Organização inteligente

Os imóveis deverão ser:

- categorizados
- padronizados
- pesquisáveis
- filtráveis
- organizados por status e origem

---

### Sistema de filtros

Permitir busca avançada por:

- bairro
- cidade
- faixa de preço
- características
- metragem
- quantidade de quartos
- tipo do imóvel
- status
- origem

A busca deve ser rápida e intuitiva.

---

# EXPERIÊNCIA DO USUÁRIO (UX)

A plataforma deve seguir os princípios:

- interface clean
- navegação simples
- baixo atrito operacional
- performance rápida
- responsividade mobile-first
- experiência moderna
- foco em produtividade

O sistema será um WEBAPP responsivo.

---

# VISÃO FUTURA (NÃO IMPLEMENTAR AGORA)

Estruturar arquitetura pensando em expansão futura para:

- múltiplos usuários
- autenticação
- permissões
- sistema SaaS
- planos pagos
- integração com construtoras
- avaliação automática de imóveis
- geração de laudos
- inteligência de precificação
- comparação de imóveis similares
- análise de mercado
- CRM imobiliário
- automações com IA

Essas funcionalidades NÃO devem ser implementadas agora, apenas consideradas na arquitetura.

---

# STACK TECNOLÓGICA

- Next.js 16.2.6
- React
- TypeScript
- Tailwind CSS v4
- ShadCN UI
- Supabase
- PostgreSQL
- Zod
- React Hook Form

---

# DIRETRIZES TÉCNICAS

## Arquitetura

- app/ → rotas e páginas
- components/ → componentes reutilizáveis
- lib/ → regras de negócio
- services/ → integrações e processamento
- schemas/ → validações
- types/ → tipagens globais

---

# PRIORIDADES TÉCNICAS

Priorizar:

1. Escalabilidade
2. Código limpo
3. Componentização
4. Performance
5. Responsividade
6. Reutilização
7. Organização do domínio
8. Facilidade de manutenção

---

# STATUS ATUAL

✅ Projeto iniciado  
✅ Banco Supabase conectado  
✅ Estrutura base funcionando  
✅ Listagem criada  
❌ Sem dados reais ainda  
❌ Sistema de importação ainda não implementado  

---

# ROADMAP IMEDIATO

1. Cadastro manual de imóveis
2. Padronização de dados
3. Sistema de filtros
4. Importação de arquivos
5. UX/UI refinada
6. Melhorias de performance
7. Estruturação para futuras features

---

# INSTRUÇÕES IMPORTANTES PARA DESENVOLVIMENTO

- Sempre priorizar UX e simplicidade
- Evitar complexidade desnecessária
- Criar componentes reutilizáveis
- Manter tipagem forte
- Evitar acoplamento excessivo
- Pensar arquitetura de forma escalável
- Sempre considerar experiência mobile
- Focar primeiro no MVP funcional
- Não implementar features futuras antes da validação do MVP

