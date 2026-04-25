// -----------------------------------------------------------------------------
// Script: Webhook Health Monitor
//
// Checks if the system has received any purchases in the last 24h
// if there has been active session traffic. Alerts via email if 0 sales.
// Designed to run via Cloudflare Workers Cron Triggers.
// -----------------------------------------------------------------------------

export default {
  async scheduled(event, env, ctx) {
    if (!env.DB) {
      console.error('Database binding (DB) missing');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const last24h = now - (24 * 60 * 60);

    try {
      // Check if there were any sessions in the last 24h
      const sessions = await env.DB.prepare(
        'SELECT count(*) as count FROM sessions WHERE created_at > ?'
      ).bind(last24h).first();

      const sessionCount = sessions?.count || 0;

      // If no traffic, we don't expect sales.
      if (sessionCount === 0) {
        console.log('Webhook health: No traffic in last 24h, skipping alert.');
        return;
      }

      // Check if there were any purchases in the last 24h
      const purchases = await env.DB.prepare(
        'SELECT count(*) as count FROM purchase_log WHERE created_at > ?'
      ).bind(last24h).first();

      const purchaseCount = purchases?.count || 0;

      if (purchaseCount === 0) {
        console.warn(`CRITICAL: Webhook health check failed! ${sessionCount} sessions but 0 purchases in last 24h.`);
        await sendAlert(env, sessionCount);
      } else {
        console.log(`Webhook health: OK. ${sessionCount} sessions and ${purchaseCount} purchases in last 24h.`);
      }

    } catch (err) {
      console.error('Webhook health check failed:', err.message);
    }
  }
};

async function sendAlert(env, sessionCount) {
  const adminEmail = env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('ADMIN_EMAIL not configured, skipping email alert.');
    return;
  }

  // Using Mailchannels (free on Cloudflare Workers)
  // No API key needed if sending from your domain.
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: adminEmail }] }],
      from: { email: `alerts@${new URL(env.BASE_URL || 'https://example.com').hostname}`, name: 'Tracking Stack Alerts' },
      subject: '⚠️ CRITICAL: No sales detected in last 24h',
      content: [{
        type: 'text/plain',
        value: `Alert: 0 purchases recorded in the last 24 hours despite having ${sessionCount} active sessions. Please check if your sales platform webhooks are correctly configured and firing.`
      }],
    }),
  });

  if (response.ok) {
    console.log(`Alert email sent to ${adminEmail}`);
  } else {
    const body = await response.text();
    console.error(`Failed to send alert email: ${response.status} ${body}`);
  }
}
