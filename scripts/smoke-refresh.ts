/* Smoke test for cookie-only refresh */
const base = process.env.API_URL || 'http://localhost:3000';

function parseSetCookie(headers: any): string[] {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  if (typeof headers.raw === 'function') return headers.raw()['set-cookie'] ?? [];
  const single = headers.get('set-cookie');
  if (!single) return [];
  return String(single).split(/,(?=[^;]+?=)/g);
}

(async () => {
  const email = `refresh_${Date.now()}@local.test`;
  const password = 'secret12';

  const r1 = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Ref Smoke' }),
  });
  const cookies = parseSetCookie(r1.headers).map((c) => c.split(';')[0]).join('; ');
  const j1 = await r1.json();
  if (!r1.ok) throw new Error(`register failed: ${r1.status} ${JSON.stringify(j1)}`);

  // Call refresh with no body, cookie only
  const r2 = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
  });
  const j2 = await r2.json().catch(() => ({}));
  console.log('refresh status', r2.status, j2);
  if (!r2.ok) throw new Error('refresh failed');

  console.log('Refresh OK');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
