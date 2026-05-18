/**
 * Idempotent QA user via backend test-only route (see backend POST /qa/users).
 */
export async function seedQaUser(testInfo) {
  const apiBase = process.env.MILLIWAYS_API_BASE_URL || 'http://localhost:3001';
  const safeId = String(testInfo.testId).replace(/[^a-zA-Z0-9-_]/g, '_');
  const email = `e2e-${safeId}@milliways.local`;
  const password = 'password';

  const res = await fetch(`${apiBase}/qa/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`seedQaUser failed: ${res.status} ${await res.text()}`);
  }

  return { email, password };
}
