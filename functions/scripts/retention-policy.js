// -----------------------------------------------------------------------------
// Script: D1 Retention Policy
//
// Automatically deletes old logs to keep D1 lean.
// Designed to run via Cloudflare Workers Cron Triggers.
// -----------------------------------------------------------------------------

export default {
  async scheduled(event, env, ctx) {
    const days = parseInt(env.RETENTION_DAYS || '90', 10);
    const cutoff = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);

    console.log(`Running retention policy: deleting logs older than ${days} days (cutoff: ${cutoff})`);

    if (!env.DB) {
      console.error('Database binding (DB) missing');
      return;
    }

    try {
      const results = await env.DB.batch([
        env.DB.prepare('DELETE FROM event_log WHERE created_at < ?').bind(cutoff),
        env.DB.prepare('DELETE FROM sync_log WHERE created_at < ?').bind(cutoff),
        // We keep purchase_log longer by default, but you can add it here if desired.
      ]);

      const deletedEvent = results[0].meta.changes;
      const deletedSync = results[1].meta.changes;

      console.log(`Retention policy complete. Deleted ${deletedEvent} event_log rows and ${deletedSync} sync_log rows.`);
    } catch (err) {
      console.error('Retention policy failed:', err.message);
    }
  }
};
