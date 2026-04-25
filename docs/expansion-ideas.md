# Ideias de Expansão — Tracking Stack

> Backlog de integrações e funcionalidades futuras ainda não implementadas.  
> Cada item aqui pode virar um épico quando priorizado.

---

## ✅ Implementado na Sprint 4
- **Stripe Integration:** Adapter funcional com verificação HMAC-SHA256.
- **Monetizze Adapter:** Suporte inicial via obscure-URL (slug).
- **Dashboard CSV Export:** Exportação via streaming para leads e compras.
- **D1 Retention Policy:** Worker automatizado para limpeza de logs antigos.
- **Webhook Health Alert:** Monitoramento proativo com alertas por e-mail.

---

## Recomendações de Hardening & QA (Pós-Sprint 4)

### Monetizze — Verificação de Assinatura
**Prioridade:** Média | **Esforço:** Baixo
Atualmente, o adapter da Monetizze utiliza apenas segurança por `slug`. Caso a plataforma disponibilize suporte global a HMAC (similar à Stripe/Eduzz), implementar a verificação no helper `functions/webhook/_utils.js` para elevar o nível de segurança.

### Expansão da Cobertura de Testes
**Prioridade:** Média | **Esforço:** Médio
Embora tenhamos atingido cobertura para o Core e Sprints 1-4, recomenda-se:
- Testes de Integração E2E simulando o fluxo completo: Visita -> Cookie Set -> Webhook -> D1 -> Fan-out.
- Load tests para o endpoint `/tracker` visando garantir estabilidade em picos de tráfego.

---

## Outras Ideias de Expansão

### Hotmart + Subscription tracking
Hotmart tem eventos de recorrência (`SUBSCRIPTION_CANCELLATION`, `SUBSCRIPTION_REACTIVATED`). Expandir para:
- Logar cancelamentos em `purchase_log` com `event_type = 'cancellation'`
- Atualizar LTV no dashboard

### Dashboard — filtro por período customizado
O dashboard atual tem filtros de data hardcoded (7d, 30d, 90d). Adicionar seletor de datas customizado com date picker.

### Encharge — múltiplas sequências por UTM
Atualmente `config/products.js` mapeia produto → tag Encharge. Expandir para mapear `utm_source` → sequência de email diferente.

### ManyChat — templates de mensagem por produto
Similar ao Encharge, permitir templates diferentes de ManyChat por produto ou UTM.

### Pixel de lead em páginas intermediárias
Atualmente o pixel só é disparado no submit do formulário. Adicionar suporte a `ViewContent` em sales pages longas (scroll depth trigger).

---

## Priorização sugerida (Backlog Atualizado)

| # | Ideia | Impacto | Esforço | Recomendação |
|---|-------|---------|---------|-------------|
| 1 | Hotmart subscription | Médio | Médio | Sprint 5 |
| 2 | Monetizze Hardening | Alto (Segurança) | Baixo | Sprint 5 |
| 3 | Dashboard date picker | Baixo | Médio | Backlog |
| 4 | Testes E2E/Load | Médio | Médio | Backlog |
| 5 | Encharge multi-UTM | Baixo | Alto | Backlog |
