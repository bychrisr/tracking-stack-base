# Sales Platforms Support

Esta pasta contém a documentação técnica de integração para cada plataforma de vendas suportada.

## Resumo de Integrações

| Plataforma | Segurança | Tracking Field (Checkout) | Tracking Field (Webhook) | Nota |
| :--- | :--- | :--- | :--- | :--- |
| **Stripe** | HMAC (Stripe-Signature) | `trk` (URL) | `metadata.trk` | Suporta múltiplos itens e moedas. |
| **Monetizze** | Slug (Obscure URL) | `src` ou `sck` | `venda.src` ou `venda.sck` | Status: Finalizada/Completa. |
| **Hotmart** | Hottok (Static Token) | `xcod` ou `src` | `hottok` + `xcod` | Padrão da indústria. |
| **Eduzz** | Slug (Obscure URL) | `trk` | `trk` | Simples e direto. |
| **Kiwify** | HMAC (SHA1) | `trk` | `trk` | Verificação de assinatura nativa. |

## Padrões Técnicos

Todas as integrações seguem o padrão de **Normalized Purchase Object** exigido pelo `_core.js`. Isso garante que novos destinos (Meta, Google Ads, GA4) funcionem automaticamente ao adicionar uma nova plataforma.

### Segurança
1. **Slug (Obscure URL)**: Todas as plataformas usam um UUID na URL (`/webhook/platform/UUID`) para impedir acessos não autorizados.
2. **Signature (HMAC)**: Recomendado para plataformas que suportam (Stripe, Kiwify). O segredo deve ser configurado como Variável de Ambiente.

### Atribuição
A chave de ouro para a atribuição é o campo `trk`. Ele deve ser passado da Sales Page para o Checkout e devolvido pelo Webhook. Sem este campo, o sistema não consegue ligar a venda ao clique original.

---
*Para adicionar uma nova plataforma, utilize a skill `add-sales-platform`.*
