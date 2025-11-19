/* Simple smoke test: register -> cookies -> PATCH /users/me/person using cookies */
// Run with: node scripts/smoke-person.ts

const base = process.env.API_URL || 'http://localhost:3000';

function parseSetCookie(headers: any): string[] {
  // undici Headers has getSetCookie(); node-fetch has raw()['set-cookie']
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie();
  if (typeof headers.raw === 'function') return headers.raw()['set-cookie'] ?? [];
  const single = headers.get('set-cookie');
  if (!single) return [];
  return String(single).split(/,(?=[^;]+?=)/g);
}

(async () => {
  const email = `smoke_${Date.now()}@local.test`;
  const password = 'secret12';

  // Register
  const r1 = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Smoke' }),
  });
  const setCookies = parseSetCookie(r1.headers);
  const cookieHeader = setCookies.map((c) => c.split(';')[0]).join('; ');
  const j1 = await r1.json();
  if (!r1.ok) throw new Error(`register failed: ${r1.status} ${JSON.stringify(j1)}`);

  // PATCH person
  const r2 = await fetch(`${base}/users/me/person`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ firstName: 'Smoke', lastName: 'Test' }),
  });
  const j2 = await r2.json().catch(() => ({}));
  console.log('PATCH status', r2.status, j2);
  if (!r2.ok) throw new Error('patch failed');

  console.log('Smoke OK');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
