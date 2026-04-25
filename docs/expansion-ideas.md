# Ideias de Expansão — Tracking Stack

> Backlog de integrações e funcionalidades futuras ainda não implementadas.  
> Cada item aqui pode virar um épico quando priorizado.

---

## Stripe — Plataforma de Vendas

**Prioridade:** Alta (já temos implementação de referência no Kaven)  
**Complexidade:** Média — o padrão de adapter já existe, precisamos portar

### O que fazer

1. Criar `functions/webhook/stripe/[slug].js` seguindo o padrão de `functions/webhook/eduzz/[slug].js`
2. Portar a implementação do Kaven para o formato adapter deste stack
3. Stripe usa assinatura HMAC-SHA256 via `Stripe-Signature` header — **implementar desde o início** (não deferir como fizemos com Hotmart/Kiwify)
4. `STRIPE_WEBHOOK_SECRET` adicionado em `wrangler.toml.example`
5. `STRIPE_WEBHOOK_SLUG` para o slug obscuro (padrão do stack)
6. `docs/platforms/stripe.md` criado com:
   - Como criar o webhook no Stripe Dashboard
   - Quais eventos escutar: `checkout.session.completed`, `payment_intent.succeeded`
   - Como mapear o `trk` — o Stripe permite `metadata` no checkout session
7. `config/products.js` atualizado com suporte a produtos Stripe (diferente de Eduzz/Hotmart/Kiwify que usam `productId` numérico — Stripe usa `price_id` ou `product_id`)

### Referência de implementação

A implementação do Kaven tem o mapeamento de eventos Stripe → shape normalizado do `_core.js` já feito. Antes de implementar do zero, **consultar o Kaven** para reaproveitar:
- Parse de `checkout.session.completed`
- Extração de `customer_details.email`, `customer_details.phone`
- Mapeamento de `metadata.trk` para lookup de atribuição

### Especificidade do `trk` na Stripe

Na Stripe, o `trk` precisa ser passado via `metadata` no momento da criação da checkout session (client-side ou server-side). Diferente de Hotmart/Kiwify que têm campo nativo (`xcod`, `sck`), na Stripe o recipient precisa configurar o botão de checkout para incluir o metadata.

Snippet de referência (client-side, Stripe.js):
```javascript
// Ao criar a checkout session, incluir o trk nos metadata
const session = await stripe.checkout.sessions.create({
  // ...outros campos...
  metadata: {
    trk: getTrk() // lê o cookie _krob_trk ou gera novo
  }
});
```

---

## Outras Ideias de Expansão

### Hotmart + Subscription tracking

Hotmart tem eventos de recorrência (`SUBSCRIPTION_CANCELLATION`, `SUBSCRIPTION_REACTIVATED`). O adapter atual só trata `PURCHASE_COMPLETE`. Expandir para:
- Logar cancelamentos em `purchase_log` com `event_type = 'cancellation'`
- Atualizar LTV no dashboard

### Eduzz → Monetizze

Monetizze tem API semelhante à Eduzz. Criar adapter `functions/webhook/monetizze/[slug].js`.

### Dashboard — filtro por período customizado

O dashboard atual tem filtros de data hardcoded (7d, 30d, 90d). Adicionar seletor de datas customizado com date picker.

### Dashboard — exportação CSV

Botão de exportação nas tabelas de Leads e Purchases para CSV. Cloudflare Workers suporta streaming de response.

### Encharge — múltiplas sequências por UTM

Atualmente `config/products.js` mapeia produto → tag Encharge. Expandir para mapear `utm_source` → sequência de email diferente (ex: leads do Meta vão para sequência A, leads do orgânico para sequência B).

### ManyChat — templates de mensagem por produto

Similar ao Encharge, permitir templates diferentes de ManyChat por produto ou UTM.

### Alertas automáticos — webhook 0 no dia

Se o `purchase_log` não recebe nenhuma entrada em 24h e há tráfego ativo, provavelmente o webhook quebrou. Criar worker cron que checa e envia email/ManyChat ao recipient.

### D1 retention policy worker

Cron semanal que deleta `event_log` entries mais antigas que X dias (configurável). Mantém D1 enxuto sem ação manual.

### Pixel de lead em páginas intermediárias

Atualmente o pixel só é disparado no submit do formulário. Adicionar suporte a `ViewContent` em sales pages longas (scroll depth trigger) para otimização de campanhas de topo.

---

## Priorização sugerida

| # | Ideia | Impacto | Esforço | Recomendação |
|---|-------|---------|---------|-------------|
| 1 | Stripe | Alto (muito pedido) | Médio (tem referência Kaven) | **Próximo épico** |
| 2 | Monetizze | Alto (BR market) | Baixo (copy Eduzz adapter) | Sprint 4 |
| 3 | Dashboard CSV export | Médio | Baixo | Sprint 4 |
| 4 | D1 retention worker | Médio (compliance) | Baixo | Sprint 4 |
| 5 | Alerta webhook 0/dia | Alto (operacional) | Médio | Sprint 4 |
| 6 | Hotmart subscription | Médio | Médio | Sprint 5 |
| 7 | Dashboard date picker | Baixo | Médio | Backlog |
| 8 | Encharge multi-UTM | Baixo | Alto | Backlog |
