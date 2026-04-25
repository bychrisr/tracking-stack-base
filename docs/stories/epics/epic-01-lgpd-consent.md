# Epic 01: LGPD / Consent Mode v2

**Status:** Draft  
**Prioridade:** P0 — Bloqueante legal  
**Sprint:** 1  
**Owner:** @dev  

## Objetivo

Implementar conformidade com a LGPD e Google Consent Mode v2. O stack atual dispara `/tracker` e seta cookies independente de consentimento — isso é risco legal direto para qualquer recipient que rode tráfego pago no Brasil.

## Contexto

O `tracking-playbook-stack.md` classifica este item como **obrigatório antes de ir ao ar**. Sem Consent Mode v2, o Google não consegue modelar conversões de usuários que recusam cookies, degradando performance de campanhas.

## Acceptance Criteria

1. CMP (CookieYes ou equivalente) integrado nos dois templates de exemplo (`examples/lead-form-page/index.html` e `examples/sales-page/index.html`)
2. Snippet do CMP posicionado **antes** de qualquer pixel no `<head>`
3. Os 4 sinais do Google Consent Mode v2 configurados: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`
4. Cookie banner visível e funcional bloqueando `/tracker` POST antes do consentimento (ou modo básico com sinais corretos documentado como trade-off)
5. Coluna `consent_at INTEGER` adicionada à tabela `event_log` via migration numerada
6. Documentação em `docs/` atualizada referenciando a configuração de CMP

## Stories

| Story | Título | Status |
|-------|--------|--------|
| 1.1 | Integrar CMP nos templates de exemplo | Draft |
| 1.2 | Configurar Consent Mode v2 (4 sinais) | Draft |
| 1.3 | Adicionar coluna consent_at em event_log | Draft |

## Referências

- `tracking-playbook.md` seção 11
- `examples/lead-form-page/index.html`
- `examples/sales-page/index.html`
- `migrations/` (schema D1)
