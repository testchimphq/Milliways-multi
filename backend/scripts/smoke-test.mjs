const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3001';
const email = `demo-${Date.now()}@milliways.local`;
const password = 'password';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body;
}

const signup = await request('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

await request('/auth/signin', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

const seededEmail = `seed-${Date.now()}@milliways.local`;
const seededPassword = 'password';
await request('/qa/users', {
  method: 'POST',
  body: JSON.stringify({ email: seededEmail, password: seededPassword }),
});
await request('/auth/signin', {
  method: 'POST',
  body: JSON.stringify({ email: seededEmail, password: seededPassword }),
});

const menu = await request('/menu');
const coffee = menu.sections.flatMap((section) => section.items).find((item) => item.name === 'Coffee');

if (!coffee) {
  throw new Error('Seeded Coffee menu item was not returned');
}

const createOrder = await request('/orders', {
  method: 'POST',
  headers: {
    authorization: `Bearer ${signup.token}`,
  },
  body: JSON.stringify({
    items: [
      {
        menuItemId: coffee.id,
        quantity: 1,
      },
    ],
  }),
});

const status = await request(`/orders/${createOrder.order.id}/status`, {
  headers: {
    authorization: `Bearer ${signup.token}`,
  },
});

console.log(`Smoke test passed for order ${status.order.id} with status "${status.order.status}"`);
