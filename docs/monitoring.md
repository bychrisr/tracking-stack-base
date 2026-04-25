# Rotina de Monitoramento — Tracking Stack

Este checklist operacional deve ser seguido periodicamente para garantir a saúde do tracking e a integridade dos dados de conversão.

## Diário (< 5 min)

- [ ] **Tracking Health**: Abrir `/dash?key=<DASH_KEY>` → aba **Tracking Health**
  - [ ] `itp_recovery_rate` > 0%: Indica que o fallback de cookies para Safari/iOS está funcionando. Alerta se for 0% com tráfego presente.
  - [ ] `adblock_detected_rate` > 30%: Alerta ⚠️. Verifique se houve mudanças no script ou se o público mudou drasticamente.
  - [ ] `bot_filtered_count`: Verifique picos anômalos que possam indicar scraping ou ataques ⚠️.
- [ ] **Meta Events Manager**: Confirmar se os eventos `Lead` e `Purchase` estão chegando.
  - [ ] Coluna **"Server"** deve ter volume de eventos proporcional ao pixel do browser.

## Semanal (15-20 min)

- [ ] **Consistência de Atribuição**: Dashboard → aba **Attribution**
  - [ ] CPA e ROAS fazem sentido comparados ao Meta Ads Manager?
- [ ] **Drill-down de Leads**: Dashboard → aba **Leads**
  - [ ] Clique em 2-3 leads recentes. `fbp` está preenchido? `fbc` presente se veio de anúncio?
- [ ] **Status de Compras**: Dashboard → aba **Purchases**
  - [ ] Verifique se `platform_delivery` = `delivered` para compras recentes.
- [ ] **GA4 Realtime**: Verificar se eventos `lead` e `purchase` aparecem em tempo real durante testes ou picos de tráfego.

## Mensal

- [ ] **Reconciliação de Receita**: Comparar total de **Revenue** no dashboard com o relatório da plataforma de vendas (Eduzz/Hotmart/Kiwify).
  - [ ] Divergência > 5%: Indica webhooks falhando ou problemas no adapter ⚠️.
- [ ] **Qualidade de Match (Meta)**: Meta Events Manager → **Event Match Quality Score**.
  - [ ] Meta: **> 7.0**. Queda indica perda de sinais como `fbp`/`fbc`/`external_id`.
- [ ] **Ad Spend Sync**: Se ativo, verificar se a aba **Attribution** mostra dados de investimento dos últimos 30 dias.
- [ ] **Segurança**: Rotacionar `DASH_KEY` se o link foi compartilhado com terceiros ou após saída de membros da equipe.

## Automações de Manutenção

### Retenção de Dados (D1 Retention Policy)
O banco de dados D1 tem limites de armazenamento. O stack inclui um script de limpeza automática (`functions/scripts/retention-policy.js`) que remove logs antigos para manter o sistema performático.

- **Frequência:** Semanal (configurável via Cron Trigger no `wrangler.toml`).
- **Configuração:** Defina `RETENTION_DAYS` (padrão 90) nas variáveis de ambiente.

### Alerta de Saúde de Webhooks (Webhook Health Alert)
Monitoramento proativo que detecta se o fluxo de vendas parou apesar de haver tráfego no site.

- **Frequência:** Diária.
- **Trigger:** Se houver > 0 sessões nas últimas 24h mas 0 compras registradas, o sistema dispara um alerta.
- **Notificação:** Email enviado via Mailchannels para o endereço em `ADMIN_EMAIL`.

---
*Referência: `docs/tracking-playbook-stack.md` seção "Rotina de monitoramento"*
