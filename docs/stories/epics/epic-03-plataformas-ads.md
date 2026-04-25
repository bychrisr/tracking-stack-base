# Epic 03: Plataformas Adicionais de Ads

**Status:** Draft  
**Prioridade:** P2  
**Sprint:** 2  
**Owner:** @dev  

## Objetivo

Expandir o stack para suportar plataformas de ads além de Meta e Google, que já vêm built-in. Recipients que rodam TikTok, Bing ou LinkedIn Ads precisam de pixels e, no caso do TikTok, de um adapter server-side.

## Contexto

O `tracking-playbook-stack.md` lista TikTok Events API como extensão estrutural (mesma arquitetura de adapter). Microsoft UET e LinkedIn Insight são client-side apenas — menor esforço.

## Acceptance Criteria

1. TikTok Pixel snippet documentado como bloco HTML comentado em `examples/lead-form-page/index.html` e `examples/sales-page/index.html`
2. `functions/webhook/tiktok/[slug].js` criado seguindo o padrão adapter de `functions/webhook/eduzz/[slug].js`
3. `TIKTOK_WEBHOOK_SLUG` suportado em `wrangler.toml.example` e documentado no deploy-stack
4. Microsoft UET Tag snippet documentado como bloco HTML comentado nos examples, com disparo de evento no mesmo momento que `/tracker`
5. LinkedIn Insight Tag snippet documentado como bloco HTML comentado nos examples (marcado como "B2B only")
6. `docs/platforms/tiktok.md` criado com notas específicas da plataforma (seguindo padrão `docs/platforms/eduzz.md`)

## Stories

| Story | Título | Status |
|-------|--------|--------|
| 3.1 | TikTok Pixel client-side nos examples | Draft |
| 3.2 | TikTok Events API server-side (adapter) | Draft |
| 3.3 | Microsoft UET Tag nos examples | Draft |
| 3.4 | LinkedIn Insight Tag nos examples | Draft |

## Referências

- `functions/webhook/eduzz/[slug].js` — referência estrutural para adapter
- `functions/webhook/_core.js` — brain do webhook
- `docs/platforms/eduzz.md` — modelo de documentação
- `docs/tracking-playbook-stack.md` — seção "Plataformas adicionais de ads"
