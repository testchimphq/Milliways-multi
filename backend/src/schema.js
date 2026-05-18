import { query } from './db.js';

const menuItems = [
  {
    section: 'MAIN DISHES',
    name: 'Ameglian Major Cow',
    description: 'The finest cut from a cow that wants to be eaten',
    priceCents: 3500,
    color: 'brown',
    imageName: 'Steak',
  },
  {
    section: 'MAIN DISHES',
    name: 'Green Salad',
    description: 'Fresh greens from the hydroponic gardens of Alpha Centauri',
    priceCents: 2200,
    color: 'green',
    imageName: 'GreenSalad',
  },
  {
    section: 'MAIN DISHES',
    name: 'Soup of the Day',
    description: "Today's special soup, ingredients vary by solar system",
    priceCents: 2800,
    color: 'orange',
    imageName: 'Soup',
  },
  {
    section: 'MAIN DISHES',
    name: 'Quantum Shrimp Cascade',
    description: 'A bowl of shrimp that exist in multiple flavor states until you take the first bite',
    priceCents: 3800,
    color: 'pink',
    imageName: 'Shrimp',
  },
  {
    section: 'MAIN DISHES',
    name: 'Krikkit Fried Logic',
    description: "An impossible dish that paradoxically tastes like everything you've ever eaten and nothing at all",
    priceCents: 4000,
    color: 'cyan',
    imageName: 'FriedLogic',
  },
  {
    section: 'DRINKS',
    name: 'Pan Galactic Gargle Blaster',
    description: 'Like having your brains smashed out by a slice of lemon wrapped around a large gold brick',
    priceCents: 550,
    color: 'yellow',
    imageName: 'PanGalacticGargleBlaster',
  },
  {
    section: 'DRINKS',
    name: 'Water',
    description: "Pure H2O from Earth's finest springs",
    priceCents: 300,
    color: 'blue',
    imageName: 'Water',
  },
  {
    section: 'DRINKS',
    name: 'Coffee',
    description: 'Hot caffeinated beverage to keep you awake through the apocalypse',
    priceCents: 450,
    color: 'brown',
    imageName: 'Coffee',
  },
  {
    section: 'DRINKS',
    name: 'Infinite Improbability Float',
    description: 'Odds of getting the same flavor twice are approximately 1 in 10^800000',
    priceCents: 600,
    color: 'purple',
    imageName: 'InfiniteImprobabilityFloat',
  },
  {
    section: 'DRINKS',
    name: 'Dark Matter Martini',
    description: 'So dense it distorts the glass around it; one sip and your hangover develops before you finish drinking',
    priceCents: 575,
    color: 'black',
    imageName: 'DarkMatterMartini',
  },
];

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      section TEXT NOT NULL,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      color TEXT NOT NULL,
      image_name TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'received',
      total_cents INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);

  await seedMenuItems();
}

async function seedMenuItems() {
  for (const [index, item] of menuItems.entries()) {
    await query(
      `
        INSERT INTO menu_items (section, name, description, price_cents, color, image_name, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO UPDATE SET
          section = EXCLUDED.section,
          description = EXCLUDED.description,
          price_cents = EXCLUDED.price_cents,
          color = EXCLUDED.color,
          image_name = EXCLUDED.image_name,
          sort_order = EXCLUDED.sort_order
      `,
      [item.section, item.name, item.description, item.priceCents, item.color, item.imageName, index],
    );
  }
}
