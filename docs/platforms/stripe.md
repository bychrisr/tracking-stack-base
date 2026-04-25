# Integração Stripe

O Tracking Stack suporta integração server-side com a Stripe através de webhooks, utilizando verificação de assinatura HMAC-SHA256 para máxima segurança.

## Configuração no Dashboard da Stripe

1. Acesse **Developers** -> **Webhooks**.
2. Clique em **Add endpoint**.
3. No campo **Endpoint URL**, insira:
   `https://seu-dominio.com/webhook/stripe/SEU_STRIPE_WEBHOOK_SLUG`
   *(Substitua `SEU_STRIPE_WEBHOOK_SLUG` pelo UUID v4 gerado para esta instância)*.
4. Em **Select events to listen to**, selecione:
   - `checkout.session.completed`
5. Clique em **Add endpoint**.
6. Copia o **Signing secret** (começa com `whsec_`) e configure-o na variável de ambiente `STRIPE_WEBHOOK_SECRET` no Cloudflare.

## Captura de Atribuição (trk)

Para que as conversões da Stripe sejam atribuídas corretamente às visitas originais, você deve passar o identificador `trk` no `metadata` da Checkout Session.

### Exemplo via Stripe.js (Client-side)

```javascript
// Exemplo de como incluir o trk ao criar uma sessão
const session = await stripe.checkout.sessions.create({
  // ... outras configurações ...
  metadata: {
    trk: getCookie('_krob_trk') // Função para ler o cookie de rastreamento
  }
});
```

### Exemplo via API (Server-side)

```javascript
const session = await stripe.checkout.sessions.create({
  success_url: 'https://seusite.com/sucesso',
  line_items: [{ price: 'price_H5ggv97eLnHscS', quantity: 1 }],
  mode: 'payment',
  metadata: {
    trk: 'VALOR_DO_TRK_AQUI'
  }
});
```

## Configurações no `config/products.js`

Diferente de outras plataformas que usam IDs numéricos, a Stripe usa strings para IDs de preços e produtos. No `config/products.js`, use o `price_id` (ex: `price_...`) como chave:

```javascript
export default {
  stripe: {
    'price_1QazWSGfT2Qz9x': {
      name: 'Nome do Produto',
      enchargeTag: 'tag-slug',
      manychatTagId: 12345678,
      googleAdsConversionActionId: '9876543210',
    },
  },
};
```
