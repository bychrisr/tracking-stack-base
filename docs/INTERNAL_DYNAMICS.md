# Internal Dynamics & Orchestration Guide

Este documento descreve como este repositório funciona "sob o capô", focando na orquestração entre os componentes técnicos e as camadas de automação (Claude Code Skills). É o guia definitivo para manter a integridade operacional do stack.

---

## 1. Claude Code Skills (`.claude/skills/`)

As Skills são **workflows procedimentais** que automatizam tarefas críticas do ciclo de vida do projeto. Elas transformam conhecimento técnico em processos executáveis pelo Claude Code.

### Skills Principais:
- **`deploy-stack`**: Gerencia o bootstrap inicial (D1, Migrations, Secrets e conexão com Cloudflare Pages).
- **`add-page`**: Automatiza a criação de novas landing pages, garantindo que o CMP, o Consent Mode v2 e os Schemas JSON-LD sejam injetados corretamente.
- **`verify-tracking`**: Valida a integridade da "Chain" (Checkpoints 1 a 6), auditando desde cookies até o recebimento no Meta/GA4.

**Regra de Ouro:** Sempre que o código-fonte for alterado em sua estrutura base (ex: adição de novos campos no banco ou mudança na ordem dos scripts no head), os arquivos `.claude/skills/*/SKILL.md` **devem** ser atualizados para refletir a nova realidade.

---

## 2. A Cadeia de Identificadores (The Chain)

A orquestração da atribuição de primeira parte depende de uma cadeia de IDs que une a visita anônima à conversão final.

### Identificadores Críticos:
1.  **`_krob_sid` (Visit ID)**: Gerado pelo middleware no primeiro toque. Persiste por 400 dias e une todos os eventos daquela sessão.
2.  **`trk` (Checkout Intent ID)**: O elo mais vital para vendas.
    - Gerado na **página de vendas** (lado do cliente).
    - Enviado via `/checkout-session` para o D1 para capturar o "snapshot" da atribuição no momento da intenção.
    - Anexado à URL de checkout da plataforma (Eduzz/Hotmart/Kiwify).
    - Retornado via **Webhook** para o `_core.js`, que faz o "lookup" no D1 e recupera os dados de origem para disparar o Capi/GA4 com precisão cirúrgica.

---

## 3. Conformidade e Auditoria (LGPD)

Implementado no Sprint 1, o sistema de conformidade não é apenas estético, é funcional:

- **Ordem Crítica**: O CMP (CookieYes) deve ser o primeiro script. O Consent Mode v2 (default denied) deve vir antes do `gtag.js`.
- **Trilha de Auditoria**: O campo `consent_at` na tabela `event_log` registra o exato momento do consentimento.
- **Dinâmica Interna**: O endpoint `/tracker` agora processa e persiste esses sinais, permitindo que a Skill `verify-tracking` confirme se o recipient está operando legalmente.

---

## 4. Visibilidade IA (SEO & AEO)

O repositório é otimizado para ser "descoberto" e entendido por modelos de linguagem (LLMs):

- **`robots.txt`**: Libera explicitamente agentes como `GPTBot` e `Google-Extended`.
- **`llms.txt`**: Fornece um resumo semântico do negócio para IAs que realizam rastreamento profundo.
- **JSON-LD**: Schemas de `Organization` e `FAQ` garantem que o conteúdo seja estruturado para motores de busca e respostas de chat AI.

---

## 5. Guia de Manutenção para Agentes e Devs

Ao adicionar novas funcionalidades, siga este fluxo de preservação da dinâmica:

1.  **Impacto no Schema?** Se sim, crie uma migration numerada e atualize `docs/schema.md`.
2.  **Impacto na Página?** Se mudar o `<head>` ou scripts base, atualize os arquivos em `examples/` **E** a Skill `add-page`.
3.  **Nova Plataforma?** Siga o padrão de "Adapter" em `functions/webhook/` e adicione a documentação em `docs/platforms/`.
4.  **Sinal de Qualidade?** Toda nova feature deve ser incluída em um novo Checkpoint na Skill `verify-tracking` se possível.

---
*Referência Âncora: CLAUDE.md | docs/architecture.md*
