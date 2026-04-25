# Epic 04: Monitoramento & Observabilidade

**Status:** Draft  
**Prioridade:** P2  
**Sprint:** 2  
**Owner:** @dev  

## Objetivo

Adicionar Microsoft Clarity nos templates e formalizar a rotina de monitoramento do stack como documentação acionável para recipients.

## Contexto

O `tracking-playbook-stack.md` descreve uma rotina diária/semanal/mensal detalhada. Microsoft Clarity é gratuito, zero configuração de servidor, e revela onde usuários dropam em landing pages — alto sinal para recipients rodando paid traffic.

## Acceptance Criteria

1. Microsoft Clarity snippet adicionado como bloco HTML comentado (com placeholder `SEU_CLARITY_ID`) em `examples/lead-form-page/index.html` e `examples/sales-page/index.html`
2. `docs/monitoring.md` criado com a rotina completa: diária (< 5 min), semanal (15-20 min), mensal — extraída e formalizada do playbook
3. Checklist de monitoramento diário e semanal criado como arquivo separado em `docs/` para uso operacional
4. Referência a `docs/monitoring.md` adicionada na seção "Referências cruzadas" do `tracking-playbook-stack.md`

## Stories

| Story | Título | Status |
|-------|--------|--------|
| 4.1 | Integrar Microsoft Clarity nos examples | Draft |
| 4.2 | Formalizar rotina de monitoramento como doc | Draft |

## Referências

- `docs/tracking-playbook-stack.md` — seção "Rotina de monitoramento"
- `examples/lead-form-page/index.html`
- `examples/sales-page/index.html`
