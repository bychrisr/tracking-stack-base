# Tracking Stack — Atribuição Server-Side de Alta Precisão

Solução auto-hospedada de tracking server-side para Meta Ads, GA4, Google Ads e TikTok. Projetada para substituir Stape e GTM Server-Side, eliminando custos mensais recorrentes e garantindo **atribuição de 100% das conversões** para infoprodutores e gestores de tráfego.

**Versão**: 4.0.0 (Sprint 4 Concluída)

## 🚀 Valor de Negócio e Diferenciais

- **Atribuição Blindada**: Captura UTMs, `fbp`/`fbc` e `gclid` diretamente no edge (Cloudflare), persistindo os dados mesmo em navegadores com ITP agressivo (Safari/iOS).
- **Prova de Ad-Blockers**: Como o tracking ocorre no servidor, os dados de conversão chegam às plataformas de anúncios sem interferência de bloqueadores de anúncios ou extensões de privacidade.
- **Conformidade Legal (GDPR/LGPD)**: Processamento de dados First-Party em infraestrutura própria, garantindo controle total sobre as informações dos usuários.
- **ROI Real**: Visualize o custo por aquisição (CPA) e o ROAS real no dashboard integrado, sem os atrasos ou perdas do tracking via browser.

## 🛠️ O que há de novo (Sprint 4)

- **Segurança Stripe HMAC**: Integração reforçada com Stripe utilizando validação de assinatura HMAC para prevenir webhooks fraudulentos.
- **Suporte Monetizze**: Nova integração nativa para a plataforma Monetizze, fechando o ecossistema das principais plataformas de vendas brasileiras.
- **Exportação CSV Inteligente**: Gere relatórios avançados com um clique para análise profunda em Excel ou BI.
- **Manutenção Automatizada**: Rotinas de retenção de dados e alertas de saúde de webhook para operação "set and forget".
- **Suíte de Testes Robusta**: 23 testes unitários garantindo que a lógica de atribuição e os adapters de plataforma funcionem perfeitamente.

## 🔌 Plataformas Suportadas

O Tracking Stack integra-se nativamente com as ferramentas essenciais do mercado:

- **Plataformas de Anúncios**: Meta Ads (CAPI), Google Ads API, TikTok Business API.
- **Analytics e UX**: Google Analytics 4 (Measurement Protocol), Microsoft Clarity (Server-Side Identification).
- **Plataformas de Vendas**: Stripe, Monetizze, Hotmart, Kiwify, Eduzz.

## 🏥 Manutenção e Saúde (Maintenance & Health)

O sistema foi desenhado para ser resiliente e de baixa manutenção:

- **Retention Policy (D1)**: Script automático que remove logs antigos (padrão 90 dias) para manter a performance do banco de dados D1 e otimizar custos.
- **Webhook Health Monitoring**: Monitoramento proativo que alerta via e-mail se o fluxo de vendas for interrompido em períodos de tráfego ativo, detectando falhas de integração instantaneamente.

## 🧪 Qualidade Garantida (Testes)

Para garantir a integridade dos seus dados de conversão, implementamos uma suíte completa de testes utilizando **Vitest**.

Para rodar os testes:
```bash
npm test
# ou
npx vitest run
```
A suíte cobre desde a lógica core de atribuição até a validação de payloads específicos para cada plataforma de vendas.

## 📋 Pré-requisitos e Instalação

- **Conta Cloudflare**: O stack roda inteiramente na sua conta (Tier gratuito é suficiente para começar).
- **GitHub**: Para deploy automatizado via Cloudflare Pages.
- **Claude Code / Gemini CLI**: O projeto é gerenciado por IA. Para instalar, basta abrir a pasta no seu agente e dizer: `"configurar meu tracking"`.

## 📂 Estrutura do Projeto

| Diretório | Propósito |
|---|---|
| `functions/` | Lógica Server-Side (Middleware, Endpoints, Webhook Adapters) |
| `migrations/` | Schema do banco de dados D1 |
| `dash/` | Dashboard administrativo (Self-contained HTML) |
| `tests/` | Suíte de 23 testes unitários (Vitest) |
| `docs/` | Documentação detalhada de arquitetura e monitoramento |

## ⚖️ Licença

Consulte o arquivo `LICENSE` para detalhes sobre uso e distribuição.
