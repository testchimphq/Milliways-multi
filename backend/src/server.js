import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { query, waitForDatabase, withTransaction } from './db.js';
import { initializeDatabase } from './schema.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

function tokenForUser(userId) {
  return `demo-user-${userId}`;
}

function userIdFromToken(token) {
  const match = /^demo-user-(\d+)$/.exec(token ?? '');
  return match ? Number(match[1]) : null;
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
  };
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

async function requireUser(req, res, next) {
  try {
    const header = req.get('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    const userId = userIdFromToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Missing or invalid demo token' });
    }

    const result = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/qa/users', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Test-only seed path for Mobilewright fixtures. Keep it idempotent so retries can reuse labels safely.
    const result = await query(
      `
        INSERT INTO users (email, password)
        VALUES ($1, $2)
        ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
        RETURNING id, email
      `,
      [email, password],
    );
    const user = publicUser(result.rows[0]);

    return res.status(201).json({ user, password });
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/signup', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, password],
    );
    const user = publicUser(result.rows[0]);

    return res.status(201).json({ user, token: tokenForUser(user.id) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return next(error);
  }
});

app.post('/auth/signin', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = normalizeEmail(body.email);
    const password = String(body.password ?? '');

    const result = await query(
      'SELECT id, email FROM users WHERE email = $1 AND password = $2',
      [email, password],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = publicUser(result.rows[0]);
    return res.json({ user, token: tokenForUser(user.id) });
  } catch (error) {
    return next(error);
  }
});

app.get('/menu', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT id, section, name, description, price_cents, color, image_name
      FROM menu_items
      ORDER BY sort_order ASC, id ASC
    `);

    const sections = [];
    const sectionsByTitle = new Map();

    for (const row of result.rows) {
      if (!sectionsByTitle.has(row.section)) {
        const section = { title: row.section, items: [] };
        sectionsByTitle.set(row.section, section);
        sections.push(section);
      }

      sectionsByTitle.get(row.section).items.push({
        id: row.id,
        name: row.name,
        description: row.description,
        priceCents: row.price_cents,
        color: row.color,
        imageName: row.image_name,
      });
    }

    return res.json({ sections });
  } catch (error) {
    return next(error);
  }
});

app.post('/orders', requireUser, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }

    const order = await withTransaction(async (client) => {
      let totalCents = 0;
      const orderItems = [];

      for (const item of items) {
        const menuItemId = Number(item.menuItemId);
        const quantity = Number(item.quantity);

        if (!Number.isInteger(menuItemId) || !Number.isInteger(quantity) || quantity < 1) {
          const error = new Error('Invalid order item');
          error.statusCode = 400;
          throw error;
        }

        const menuResult = await client.query(
          'SELECT id, name, price_cents FROM menu_items WHERE id = $1',
          [menuItemId],
        );

        if (menuResult.rowCount === 0) {
          const error = new Error(`Menu item ${menuItemId} was not found`);
          error.statusCode = 400;
          throw error;
        }

        const menuItem = menuResult.rows[0];
        totalCents += menuItem.price_cents * quantity;
        orderItems.push({ menuItem, quantity });
      }

      const orderResult = await client.query(
        'INSERT INTO orders (user_id, status, total_cents) VALUES ($1, $2, $3) RETURNING id, status, total_cents, created_at',
        [req.user.id, 'received', totalCents],
      );
      const createdOrder = orderResult.rows[0];

      for (const item of orderItems) {
        await client.query(
          'INSERT INTO order_items (order_id, menu_item_id, name, price_cents, quantity) VALUES ($1, $2, $3, $4, $5)',
          [
            createdOrder.id,
            item.menuItem.id,
            item.menuItem.name,
            item.menuItem.price_cents,
            item.quantity,
          ],
        );
      }

      return createdOrder;
    });

    return res.status(201).json({
      order: {
        id: order.id,
        status: order.status,
        totalCents: order.total_cents,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/orders', requireUser, async (req, res, next) => {
  try {
    const result = await query(
      `
        SELECT id, status, total_cents, created_at, updated_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [req.user.id],
    );

    return res.json({
      orders: result.rows.map((row) => ({
        id: row.id,
        status: row.status,
        totalCents: row.total_cents,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/orders/:id/status', requireUser, async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const result = await query(
      'SELECT id, status, updated_at FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];
    return res.json({
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updated_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
});

await waitForDatabase();
await initializeDatabase();

app.listen(port, '0.0.0.0', () => {
  console.log(`Milliways demo API listening on port ${port}`);
});
