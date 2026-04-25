# Tracking Playbook — Stack Edition
> Versão 1.0 | Companion do `tracking-playbook.md` para recipients deste stack  
> Este arquivo assume que você já leu `docs/architecture.md`. Não repete o que está lá.

---

## O que este stack já resolve automaticamente

Não configura, não instala, não paga por serviço externo. Já funciona ao fazer deploy.

### Identifiers e cookies first-party
- `_krob_sid` (UUID por visita), `_krob_eid` (UUID por visitante) gerados no edge via `functions/_middleware.js`
- `fbp` gerado no padrão Meta spec (`fb.{subdomainIndex}.{ts}.{rand}`) se ausente
- `fbc` derivado de `fbclid` na URL
- ETLD+1 calculado automaticamente do Host header — `.com.br`, `.co.uk` funcionam sem config
- Todos os cookies setados com `Max-Age=34560000` (~400 dias)

### Captura de UTMs e click IDs
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` capturados no middleware
- `fbclid`, `gclid`, `msclkid` capturados na querystring raw (sem URL-decode — Meta exige isso)
- Persistidos na tabela `sessions` com UPSERT inteligente: visita de retorno sem o parâmetro mantém o valor original

### Server-side conversions
- **Meta CAPI**: Lead + Purchase fanout com `fbp`, `fbc`, `external_id`, PII hasheado — via `functions/tracker.js` e `functions/webhook/_core.js`
- **GA4 Measurement Protocol**: Lead + Purchase fanout com `ga_client_id` extraído do `_ga` cookie no edge
- **Google Ads Click Conversion**: Purchase fanout com `gclid` + timezone configurável via `TIMEZONE_OFFSET`
- **Deduplication**: `event_id` (UUID gerado no cliente) é enviado tanto pelo browser pixel quanto pelo servidor. Meta deduplica. Se o pixel for bloqueado, o servidor já cobriu.

### Hashing de PII
- Email, nome e telefone SHA-256 após normalização: lowercase + trim, phone strip non-digits, country code prefixado (padrão `55`, configurável via `DEFAULT_COUNTRY_CODE`)
- PII bruta persiste em D1 apenas para debugging interno — nunca sai da infra do recipient

### ITP e adblock recovery
- Fallback chain para `fbp`/`fbc`/`external_id`: body do cliente → cookie → row `sessions` no D1
- `pixel_was_blocked` e `itp_cookie_extended` logados em `event_log` — visíveis no dashboard em Tracking Health

### Webhook enrichment (compras)
- Fluxo `trk` → `checkout_sessions` → webhook lookup: qualquer compra chega com atribuição real (UTMs, fbp, fbc, gclid) do momento da visita
- Plataformas: Eduzz (`tracker.code1`), Hotmart (`xcod`), Kiwify (`sck`)
- Encharge + ManyChat por produto via `config/products.js`

### Dashboard
- `/dash` com revenue, produtos, atribuição paga (Meta CPA/ROAS), UTM breakdown, leads com UTMs, tracking health
- Drill-down por Lead/Purchase mostra payload exato enviado para Meta/GA4/Google Ads e resposta recebida
- Auth via `?key=<DASH_KEY>`

---

## O que ainda precisa ser configurado

### Obrigatório antes de ir ao ar

#### LGPD / Consent Mode v2

O stack não implementa consentimento. Sem isso, você pode coletar dados de usuários que não consentiram — violação direta da LGPD. Além disso, sem Consent Mode o Google não consegue modelar conversões de usuários que recusam cookies, degradando performance de campanhas.

**O que fazer:**

1. Contratar um CMP. Recomendação: **CookieYes** (~$10/mês) — integração GTM nativa mais simples.
2. No CMP, configurar os 4 sinais obrigatórios do Google Consent Mode v2:
   - `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`
3. Adicionar o snippet do CMP nos examples **antes** de qualquer pixel:
   - `examples/lead-form-page/index.html` — no `<head>`, antes do gtag.js
   - `examples/sales-page/index.html` — idem
4. Configurar o CMP para bloquear o disparo do `/tracker` POST enquanto o consentimento não for dado (ou usar modo básico: disparar sempre mas com sinais corretos)
5. Considerar adicionar coluna `consent_at INTEGER` em `event_log` para auditoria

O stack atual dispara `/tracker` e seta cookies independente de consentimento. Isso é uma decisão que o recipient precisa tomar conscientemente — não é bloqueio técnico, é risco legal.

Referência: seção 11 do `tracking-playbook.md`.

---

### Altamente recomendado

#### Microsoft Clarity (gratuito)

Heatmaps e session recordings que revelam onde usuários dropam. Zero custo, alto sinal.

Adicionar nos examples:
```html
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script","SEU_CLARITY_ID");
</script>
```

Criar conta em: clarity.microsoft.com — gratuito, sem limite de sessões.

#### `robots.txt` com AI crawlers liberados

Se você quer visibilidade em IAs (ChatGPT, Perplexity, Gemini), precisa liberar explicitamente. Padrão atual de muitos sites bloqueia inadvertidamente por herdar config genérica.

Criar `public/robots.txt` (ou configurar no seu domínio principal — este stack serve páginas estáticas, não tem rota de robots.txt built-in):

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://seusite.com/sitemap.xml
```

#### `llms.txt` na raiz

Formato emergente para dar contexto às IAs sobre seu negócio. Análogo ao `robots.txt` mas voltado para LLMs.

Criar `public/llms.txt`:

```markdown
# [Nome do Negócio]

> [Uma frase descrevendo o que você faz e para quem]

## Sobre
[2-3 parágrafos sobre o negócio, produto, público-alvo]

## Produtos
- [Produto 1]: [descrição + URL]
- [Produto 2]: [descrição + URL]

## Contato
- Email: contato@seusite.com
- Site: https://seusite.com
```

#### Schema markup JSON-LD nos examples

Adicionar antes do `</head>` nas páginas:

**Organization** (todas as páginas):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nome do Negócio",
  "url": "https://seusite.com",
  "logo": "https://seusite.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "contato@seusite.com"
  }
}
</script>
```

**FAQPage** (se a landing page tem seção de FAQ):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Pergunta aqui?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Resposta aqui."
    }
  }]
}
</script>
```

---

### Plataformas adicionais de ads

O stack tem Meta + Google Ads server-side built-in. Para adicionar outras plataformas:

#### TikTok

- **Client-side (pixel)**: adicionar snippet do TikTok Pixel nos examples, antes do `</head>`. Requer conta em business.tiktok.com → Events Manager → Web Pixel.
- **Server-side (Events API)**: usar a skill `add-sales-platform` como base estrutural para criar `functions/webhook/tiktok/` — o padrão de adapter é o mesmo. TikTok Events API usa `https://business-api.tiktok.com/open_api/v1.3/event/track/`.

#### Microsoft Ads / Bing UET

Client-side é suficiente para a maioria dos casos:

```html
<script>
(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"SEU_TAG_ID"};
o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,
n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;
s&&s!=="loaded"&&s!=="complete"||(f(),n.onreadystatechange=null)},
i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,
"script","//bat.bing.com/bat.js","uetq");
</script>
```

Tag ID em: ads.microsoft.com → Conversion Tracking → UET Tag.

Disparar evento de conversão no mesmo momento que dispara `/tracker`:
```javascript
window.uetq = window.uetq || [];
window.uetq.push('event', 'submit_lead_form', {});
```

#### LinkedIn Insight Tag

Relevante apenas se o produto tem foco B2B. Client-side é suficiente.

```html
<script type="text/javascript">
_linkedin_partner_id = "SEU_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
```

Partner ID em: linkedin.com/campaignmanager → Insight Tag.

---

### Configurações manuais no Cloudflare Dashboard

Ao seguir a skill `deploy-stack`, estas vars são geradas localmente mas precisam ser coladas manualmente nas Pages environment variables:

| Variável | De onde vem | Obrigatório? |
|---|---|---|
| `META_PIXEL_ID` | Meta Events Manager | Sim, para Meta CAPI |
| `META_ACCESS_TOKEN` | Meta Business → System User token | Sim, para Meta CAPI |
| `GA4_MEASUREMENT_ID` | GA4 → Data Streams | Sim, para GA4 MP |
| `GA4_API_SECRET` | GA4 → Data Streams → Measurement Protocol | Sim, para GA4 MP |
| `GOOGLE_ADS_CONVERSION_ID` | Google Ads → Tools → Conversions | Para Google Ads |
| `DASH_KEY` | Gerado pelo deploy-stack | Sim, autentica `/dash` |
| `SYNC_SECRET` | Gerado pelo deploy-stack | Sim, autentica `/api/sync/*` |
| `EDUZZ_WEBHOOK_SLUG` | Gerado pelo deploy-stack (UUID v4) | Se usar Eduzz |
| `HOTMART_WEBHOOK_SLUG` | Gerado pelo deploy-stack (UUID v4) | Se usar Hotmart |
| `KIWIFY_WEBHOOK_SLUG` | Gerado pelo deploy-stack (UUID v4) | Se usar Kiwify |
| `DEFAULT_COUNTRY_CODE` | Seu país (padrão: `55`) | Só se não for Brasil |
| `TIMEZONE_OFFSET` | Seu timezone (padrão: `-03:00`) | Só se não for São Paulo |
| `META_ADS_ACCESS_TOKEN` | Meta Business → Marketing API | Só para Ad Spend sync |
| `META_ADS_ACCOUNT_ID` | Meta Business → Ad Account | Só para Ad Spend sync |

D1 binding: o deploy-stack cria o banco e gera o nome. No Pages dashboard, em Settings → Functions → D1 Database Bindings, associar o banco ao binding `DB`.

---

## Rotina de monitoramento

Adaptada para este stack. Não usa GTM/Stape como fonte — o dashboard é a fonte primária.

### Diário (< 5 min)

1. Abrir `/dash?key=<DASH_KEY>` → aba **Tracking Health**
   - `itp_recovery_rate` deve ser > 0% se há tráfego Safari/iOS
   - `adblock_detected_rate` > 30% é alerta (dependendo do público)
   - `bot_filtered_count` anômalo indica scraping ou ataque
2. Meta Events Manager → verificar se o evento Lead/Purchase chegou no servidor (coluna "Server" deve ter volume)

### Semanal (15-20 min)

1. Dashboard → **Attribution** — conferir se CPA e ROAS fazem sentido vs. o que o Meta Ads reporta
2. Dashboard → **Leads** — clicar em 2-3 leads recentes → verificar payload drill-down: `fbp` preenchido? `fbc` presente se veio de anúncio?
3. Dashboard → **Purchases** — conferir `platform_delivery` = `delivered` para compras recentes
4. GA4 → Realtime → verificar se eventos Lead/Purchase aparecem

### Mensal

1. Dashboard → **Revenue** → comparar total com relatório da plataforma de vendas (Eduzz/Hotmart/Kiwify). Divergência > 5% indica webhooks falhando.
2. Meta Events Manager → Event Match Quality Score. Alvo: > 7.0. Queda indica problema com `fbp`/`fbc`/`external_id`.
3. Se Ad Spend sync ativo: verificar `ad_spend` tem dados dos últimos 30 dias via dashboard **Attribution** com filtro de data.
4. Rotacionar `DASH_KEY` se houve compartilhamento do link com terceiros.

---

## Checklist final — antes de ir ao ar

Legenda: **[STACK]** = resolvido pelo stack | **[MANUAL]** = você configura

### Foundation

- [STACK] Cookies first-party 400 dias setados no edge
- [STACK] `_krob_sid`, `fbp`, `fbc`, `external_id` gerados automaticamente
- [STACK] UTMs e click IDs capturados e persistidos em D1
- [MANUAL] CMP instalado e Consent Mode v2 configurado (LGPD)
- [MANUAL] Cookie banner visível e funcional

### Analytics

- [STACK] GA4 Measurement Protocol dispara Lead e Purchase com `ga_client_id`
- [MANUAL] GA4 property criada, `GA4_MEASUREMENT_ID` e `GA4_API_SECRET` setados
- [MANUAL] GA4 Data Retention → 14 meses (padrão é 2)
- [MANUAL] GA4 browser tag instalada nos examples (via `gtag.js` ou `/scripts/gtag.js`)

### Meta

- [STACK] Meta CAPI dispara Lead e Purchase com PII hasheado, fbp, fbc, external_id
- [STACK] Deduplication via `event_id` entre browser pixel e servidor
- [MANUAL] Meta Pixel client-side instalado nos examples
- [MANUAL] `META_PIXEL_ID` e `META_ACCESS_TOKEN` setados
- [MANUAL] Test Events verificado no Meta Events Manager

### Google Ads

- [STACK] Click conversion disparada no Purchase com `gclid` e timestamp correto
- [MANUAL] `GOOGLE_ADS_CONVERSION_ID` e conversion label configurados em `config/products.js`
- [MANUAL] Google Ads → Conversions → confirmar que conversões chegam

### Webhook / Compras

- [STACK] `trk` gerado na sales page e persiste atribuição em `checkout_sessions`
- [STACK] Webhook lookup enriquece Purchase com UTMs/fbp/fbc do momento da visita
- [MANUAL] URL de webhook copiada e colada no painel da plataforma (Eduzz/Hotmart/Kiwify)
- [MANUAL] Testar com uma compra real ou evento de teste da plataforma

### SEO/AEO básico

- [MANUAL] `robots.txt` com AI crawlers liberados
- [MANUAL] `llms.txt` na raiz com descrição do negócio
- [MANUAL] Schema markup JSON-LD (Organization) nas landing pages
- [MANUAL] FAQPage schema se houver seção de FAQ

### Plataformas adicionais (se aplicável)

- [MANUAL] Microsoft Clarity snippet instalado
- [MANUAL] TikTok Pixel instalado (se rodar TikTok Ads)
- [MANUAL] Microsoft UET Tag instalado (se rodar Bing Ads)
- [MANUAL] LinkedIn Insight Tag instalado (se produto B2B)

### Infraestrutura

- [STACK] D1 criado, migrations aplicadas, binding `DB` configurado
- [MANUAL] Todas as vars de ambiente setadas no Cloudflare Pages dashboard
- [MANUAL] Dashboard `/dash` abre e carrega dados
- [MANUAL] `SYNC_SECRET` configurado e cron de Ad Spend agendado (se quiser ROAS no dash)

---

## Referências cruzadas

| Para... | Ler |
|---|---|
| Como os identifiers se propagam hop-a-hop | `docs/data-flow.md` |
| Schema completo das tabelas D1 | `docs/schema.md` |
| Arquitetura e decisões de design | `docs/architecture.md` |
| Setup completo de LGPD e Consent Mode | `tracking-playbook.md` seção 11 |
| Padrão UTM e nomenclatura | `tracking-playbook.md` seção 9 |
| Adicionar nova plataforma de vendas | skill `add-sales-platform` |
| Verificar se o tracking está funcionando | skill `verify-tracking` |
| Configurar Ad Spend sync com Meta | `docs/ad-spend-sync.md` |
