# Sprint Plan — Tracking Stack

> Gerado em: 2026-04-25 | Base: `docs/tracking-playbook-stack.md`

---

## Sprint 1 — Conformidade & Fundação (P0/P1)

**Objetivo:** Ir ao ar sem risco legal + SEO/AEO básico  
**Épicos:** E01 (LGPD) + E02 (SEO/AEO)  
**Estimativa:** 1–2 semanas

| Story | Título | Prioridade | Executor |
|-------|--------|-----------|---------|
| 1.1 | Integrar CMP nos templates de exemplo | P0 | @dev |
| 1.2 | Configurar Consent Mode v2 (4 sinais) | P0 | @dev |
| 1.3 | Adicionar coluna consent_at em event_log | P0 | @dev |
| 2.1 | Criar robots.txt com AI crawlers liberados | P1 | @dev |
| 2.2 | Criar llms.txt na raiz | P1 | @dev |
| 2.3 | Adicionar Schema markup JSON-LD nos examples | P1 | @dev |

**Dependências internas:**
- Story 1.2 depende de 1.1 (CMP deve estar antes do consent default)
- Story 2.2 depende de 2.1 (referência ao llms.txt no robots.txt)

**Definition of Done Sprint 1:**
- [ ] Templates têm CMP + Consent Mode v2 na ordem correta
- [ ] `public/robots.txt` e `public/llms.txt` criados
- [ ] Schema JSON-LD nos dois examples
- [ ] Migration `consent_at` aplicável via `wrangler d1 migrations apply`
- [ ] Checklist final do playbook atualizado com `[STACK]` nos itens implementados

---

## Sprint 2 — Extensão de Plataformas & Observabilidade (P2)

**Objetivo:** Suporte a mais plataformas de ads + monitoramento formalizado  
**Épicos:** E03 (Plataformas Ads) + E04 (Monitoramento)  
**Estimativa:** 2 semanas

| Story | Título | Prioridade | Executor |
|-------|--------|-----------|---------|
| 3.1 | TikTok Pixel client-side nos examples | P2 | @dev |
| 3.2 | TikTok Events API server-side (adapter) | P2 | @dev |
| 3.3 | Microsoft UET Tag nos examples | P2 | @dev |
| 3.4 | LinkedIn Insight Tag nos examples | P2 | @dev |
| 4.1 | Integrar Microsoft Clarity nos examples | P2 | @dev |
| 4.2 | Formalizar rotina de monitoramento como doc | P2 | @dev |

**Dependências internas:**
- Story 3.2 (TikTok server-side) é a mais complexa — priorizar após 3.1 estar validado
- Stories 3.3, 3.4, 4.1 são independentes entre si

**Definition of Done Sprint 2:**
- [ ] TikTok Pixel snippet comentado nos dois examples
- [ ] `functions/webhook/tiktok/[slug].js` criado e seguindo padrão adapter
- [ ] `docs/platforms/tiktok.md` criado
- [ ] Microsoft UET e LinkedIn Insight snippets comentados nos examples
- [ ] Microsoft Clarity snippet comentado nos examples
- [ ] `docs/monitoring.md` criado e referenciado no playbook

---

## Sprint 3 — Hardening (P3 — Pós-launch)

**Objetivo:** Verificação de assinatura nos webhooks das plataformas de vendas  
**Épico:** E05 (Hardening)  
**Estimativa:** 1 semana

| Story | Título | Prioridade | Executor |
|-------|--------|-----------|---------|
| 5.1 | Hotmart: verificação X-Hotmart-Hottok | P3 | @dev |
| 5.2 | Kiwify: verificação HMAC-SHA1 | P3 | @dev |
| 5.3 | Eduzz: estratégia de autenticação documentada | P3 | @dev |

**Dependências internas:**
- Stories independentes entre si — podem rodar em paralelo
- 5.3 pode ser apenas documentação se Eduzz não oferece assinatura verificável

**Definition of Done Sprint 3:**
- [ ] Hotmart adapter rejeita requests sem hottok válido (401)
- [ ] Kiwify adapter verifica HMAC-SHA1 (401 se inválido)
- [ ] Eduzz: estratégia documentada e implementada (ou limitação documentada)
- [ ] Novas env vars em `wrangler.toml.example`
- [ ] Docs de plataformas atualizadas

---

## Resumo

| Sprint | Épicos | Stories | Status |
|--------|--------|---------|--------|
| Sprint 1 | E01, E02 | 1.1, 1.2, 1.3, 2.1, 2.2, 2.3 | Done |
| Sprint 2 | E03, E04 | 3.1, 3.2, 3.3, 3.4, 4.1, 4.2 | Ready for Review |
| Sprint 3 | E05 | 5.1, 5.2, 5.3 | Done |
| Sprint 4 | Expansão & Ops | 6.1, 6.2, 6.3, 6.4, 6.5 | To Do |
| **Total** | **6 épicos** | **18 stories** | |

---

## Sprint 4 — Expansão & Maturidade Operacional (P1/P2)

**Objetivo:** Adicionar Stripe, Monetizze e ferramentas de monitoramento/manutenção.  
**Estimativa:** 2 semanas

| Story | Título | Prioridade | Executor |
|-------|--------|-----------|---------|
| 6.1 | Integração Stripe (Épico) | P1 | @dev |
| 6.2 | Adapter Monetizze | P1 | @dev |
| 6.3 | Dashboard CSV Export | P2 | @dev |
| 6.4 | D1 Retention Policy Worker | P2 | @dev |
| 6.5 | Alerta Webhook 0/dia | P1 | @dev |

**Dependências internas:**
- 6.1 e 6.2 são independentes
- 6.4 e 6.5 utilizam o motor de Cron do Cloudflare Workers

**Definition of Done Sprint 4:**
- [ ] Adapters Stripe e Monetizze validados em produção/mock
- [ ] Exportação CSV disponível no dashboard
- [ ] Worker de limpeza automática ativo no D1
- [ ] Sistema de alerta de saúde de webhooks configurado
- [ ] `wrangler.toml.example` atualizado com novas env vars
- [ ] Documentação de plataformas e monitoramento atualizada
