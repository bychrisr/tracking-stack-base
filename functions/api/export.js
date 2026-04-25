// -----------------------------------------------------------------------------
// API: CSV Export
//
// Endpoint: /api/export?table=<leads|purchases>&key=<DASH_KEY>
// -----------------------------------------------------------------------------

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const table = url.searchParams.get('table');
  const key = url.searchParams.get('key');

  if (!key || key !== env.DASH_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!['leads', 'purchases'].includes(table)) {
    return new Response('Invalid table', { status: 400 });
  }

  const query = table === 'leads' 
    ? 'SELECT * FROM event_log WHERE event_name = "Lead" ORDER BY created_at DESC'
    : 'SELECT * FROM purchase_log ORDER BY created_at DESC';

  const results = await env.DB.prepare(query).all();
  const rows = results.results || [];

  if (rows.length === 0) {
    return new Response('No data to export', { status: 200 });
  }

  // Define headers based on table
  const headers = Object.keys(rows[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '';
      // Escape commas and quotes
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    }).join(','))
  ].join('\n');

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${table}_export_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
