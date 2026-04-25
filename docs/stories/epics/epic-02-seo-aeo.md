# Epic 02: SEO / AEO / Visibilidade IA

**Status:** Draft  
**Prioridade:** P1 — Altamente recomendado  
**Sprint:** 1  
**Owner:** @dev  

## Objetivo

Adicionar infraestrutura básica de SEO e AEO (Answer Engine Optimization) nos templates, garantindo visibilidade em buscadores convencionais e em IAs (ChatGPT, Perplexity, Gemini).

## Contexto

O `tracking-playbook-stack.md` lista estes itens como "altamente recomendados". Esforço baixo, retorno alto — nenhum dos itens requer lógica de servidor.

## Acceptance Criteria

1. `public/robots.txt` criado com permissão explícita para: `GPTBot`, `anthropic-ai`, `Google-Extended`, `PerplexityBot`, `Applebot-Extended`
2. `public/llms.txt` criado seguindo o formato emergente com placeholder de Nome do Negócio, descrição e produtos
3. Schema markup JSON-LD `Organization` adicionado antes do `</head>` em `examples/lead-form-page/index.html`
4. Schema markup JSON-LD `Organization` adicionado antes do `</head>` em `examples/sales-page/index.html`
5. Schema markup JSON-LD `FAQPage` documentado como snippet comentado opcional nos examples (para quando houver FAQ)
6. Checklist final em `docs/tracking-playbook-stack.md` atualizado com `[STACK]` nos itens implementados

## Stories

| Story | Título | Status |
|-------|--------|--------|
| 2.1 | Criar robots.txt com AI crawlers liberados | Draft |
| 2.2 | Criar llms.txt na raiz | Draft |
| 2.3 | Adicionar Schema markup JSON-LD nos examples | Draft |

## Referências

- `docs/tracking-playbook-stack.md` — seção "Altamente recomendado"
- `examples/lead-form-page/index.html`
- `examples/sales-page/index.html`
