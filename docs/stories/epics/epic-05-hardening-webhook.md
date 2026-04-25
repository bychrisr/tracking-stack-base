# Epic 05: Hardening de Webhook (Assinatura HMAC)

**Status:** Draft  
**Prioridade:** P3 — Pós-launch  
**Sprint:** 3  
**Owner:** @dev  

## Objetivo

Implementar verificação de assinatura HMAC/nativa nas plataformas de vendas, conforme mencionado na skill `harden-tracking`. Atualmente os webhooks são gateados apenas pelo slug obscuro (UUID v4) — funciona para launch, mas não é defesa em profundidade.

## Contexto

O CLAUDE.md do projeto documenta explicitamente: "Platform-native signature verification (HMAC/hottok) is deliberately deferred to the post-launch `harden-tracking` skill". Este épico implementa essa skill. Cada plataforma tem seu próprio mecanismo:
- **Hotmart**: `X-Hotmart-Hottok` header com token configurável
- **Kiwify**: HMAC-SHA1 no body com chave configurável
- **Eduzz**: validação por IP de origem + token

## Acceptance Criteria

1. `functions/webhook/_utils.js` atualizado com helpers `verifyHotmartHottok`, `verifyKiwifyHmac` usando `timingSafeEqual` (já presente no arquivo)
2. Adapter Hotmart verifica `X-Hotmart-Hottok` header; retorna 401 se inválido
3. Adapter Kiwify verifica HMAC-SHA1 do body; retorna 401 se inválido
4. Adapter Eduzz documenta estratégia (IP allowlist ou token) com comentário claro no adapter
5. Novas env vars documentadas em `wrangler.toml.example`: `HOTMART_HOTTOK`, `KIWIFY_HMAC_SECRET`
6. `docs/platforms/hotmart.md` e `docs/platforms/kiwify.md` atualizados com instruções de configuração da assinatura
7. Testes manuais documentados em `docs/` com exemplo de payload válido e inválido

## Stories

| Story | Título | Status |
|-------|--------|--------|
| 5.1 | Hotmart: verificação X-Hotmart-Hottok | Draft |
| 5.2 | Kiwify: verificação HMAC-SHA1 | Draft |
| 5.3 | Eduzz: estratégia de autenticação documentada | Draft |

## Referências

- `functions/webhook/_utils.js` — `timingSafeEqual` já implementado
- `functions/webhook/hotmart/[slug].js`
- `functions/webhook/kiwify/[slug].js`
- `functions/webhook/eduzz/[slug].js`
- `docs/platforms/hotmart.md`
- `docs/platforms/kiwify.md`
- CLAUDE.md — regra "Webhook endpoints are gated by an obscure URL"
