import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'data', 'burmeal.db');

// Ensure data folder exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'SHOP_OWNER', 'ADMIN')),
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      bio TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      avatar_image TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
      cuisine_type TEXT NOT NULL,
      location_area TEXT NOT NULL,
      address TEXT,
      city TEXT,
      region TEXT,
      country TEXT,
      facebook_url TEXT,
      whatsapp_phone TEXT,
      viber_phone TEXT,
      line_id TEXT,
      phone_number TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      menu_type TEXT NOT NULL CHECK(menu_type IN ('SPECIAL', 'WEEKLY', 'PERMANENT')),
      is_vegetarian INTEGER NOT NULL DEFAULT 0,
      is_halal INTEGER NOT NULL DEFAULT 0,
      special_date TEXT,
      available_days TEXT, -- JSON array of strings
      created_at TEXT NOT NULL,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS follows (
      customer_id TEXT NOT NULL,
      shop_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (customer_id, shop_id),
      FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_items (
      customer_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (customer_id, item_id),
      FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(item_id) REFERENCES menu_items(id) ON DELETE CASCADE
    );
  `);

  // Safe migration for newly added columns if table pre-existed
  try {
    const tableInfo = db.prepare('PRAGMA table_info(shops)').all() as any[];
    const columnNames = tableInfo.map((c) => c.name);
    if (!columnNames.includes('address')) {
      db.prepare('ALTER TABLE shops ADD COLUMN address TEXT').run();
    }
    if (!columnNames.includes('city')) {
      db.prepare('ALTER TABLE shops ADD COLUMN city TEXT').run();
    }
    if (!columnNames.includes('region')) {
      db.prepare('ALTER TABLE shops ADD COLUMN region TEXT').run();
    }
    if (!columnNames.includes('country')) {
      db.prepare('ALTER TABLE shops ADD COLUMN country TEXT').run();
    }
    // Backfill any empty seed shops
    db.prepare(`UPDATE shops SET address = '78th Street, Between 26th & 27th', city = 'Mandalay', region = 'Mandalay Region', country = 'Myanmar' WHERE id = 'shop_01' AND (address IS NULL OR address = '')`).run();
    db.prepare(`UPDATE shops SET address = 'No. 12, Bogyoke Aung San Road', city = 'Yangon', region = 'Yangon Region', country = 'Myanmar' WHERE id = 'shop_02' AND (address IS NULL OR address = '')`).run();
    db.prepare(`UPDATE shops SET address = 'Yone Gyi Street, Central Market', city = 'Nyaungshwe', region = 'Shan State', country = 'Myanmar' WHERE id = 'shop_03' AND (address IS NULL OR address = '')`).run();
  } catch (migErr) {
    console.error('Migration error:', migErr);
  }

  seedInitialData();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Already seeded
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('burmeal123', salt);
  const now = new Date().toISOString();

  // 1. Create Admin
  const adminId = 'usr_admin_01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'admin@burmeal.com', passwordHash, 'BurMeal Curator', 'ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', now);

  // 2. Create Shop Owners
  const owner1Id = 'usr_owner_01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(owner1Id, 'mandalay@burmeal.com', passwordHash, 'Daw Khin Sandar', 'SHOP_OWNER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khin', now);

  const owner2Id = 'usr_owner_02';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(owner2Id, 'rangoon@burmeal.com', passwordHash, 'U Than Htike', 'SHOP_OWNER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Than', now);

  const owner3Id = 'usr_owner_03';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(owner3Id, 'shan@burmeal.com', passwordHash, 'Nang Kham Hla', 'SHOP_OWNER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nang', now);

  // 3. Create Sample Customer
  const custId = 'usr_cust_01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(custId, 'customer@burmeal.com', passwordHash, 'Kyaw Swar', 'CUSTOMER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyaw', now);

  // 4. Create Shops
  const shop1Id = 'shop_01';
  db.prepare(`
    INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shop1Id,
    owner1Id,
    'Mandalay Morning Teahouse',
    'Authentic royal Mandalay breakfast, slow-cooked catfish Mohinga, and handcrafted freshly fried crispy split-pea fritters.',
    '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
    'https://api.dicebear.com/7.x/identicon/svg?seed=mandalay',
    'APPROVED',
    'Burmese Breakfast & Street Classics',
    'Downtown Heritage District',
    '78th Street, Between 26th & 27th',
    'Mandalay',
    'Mandalay Region',
    'Myanmar',
    'https://facebook.com/mandalayteahouse',
    '959777123456',
    '959777123456',
    '@mandalay_tea',
    '+95 9 777 123 456',
    now
  );

  const shop2Id = 'shop_02';
  db.prepare(`
    INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shop2Id,
    owner2Id,
    'Golden Rangoon Coconut Kitchen',
    'Specialist in traditional Ohn No Khao Swè, rich braised pork belly stews, and herbal seasonal sour soups.',
    '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
    'https://api.dicebear.com/7.x/identicon/svg?seed=rangoon',
    'APPROVED',
    'Yangon Classic Curries & Soups',
    'Bahan Township',
    'No. 42 Inya Road',
    'Yangon',
    'Yangon Region',
    'Myanmar',
    'https://facebook.com/goldenrangoonkitchen',
    '959888987654',
    '959888987654',
    '@goldenrangoon',
    '+95 9 888 987 654',
    now
  );

  const shop3Id = 'shop_03';
  db.prepare(`
    INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shop3Id,
    owner3Id,
    'Inle Mountain Tealeaf Corner',
    'Highland Shan cuisine featuring fermented tea leaf salad, warm Shan tofu noodle bowls, and savory rice cakes.',
    '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
    'https://api.dicebear.com/7.x/identicon/svg?seed=inle',
    'PENDING', // One shop starts as PENDING for Admin review testing!
    'Shan Highlands & Vegetarian Delights',
    'Inle Lake Market Hub',
    'Main Market Pier',
    'Nyaungshwe',
    'Shan State',
    'Myanmar',
    'https://facebook.com/inlemountain',
    '959666543210',
    '959666543210',
    '@inle_corner',
    '+95 9 666 543 210',
    now
  );

  // 5. Seed Menu Items across all 3 types: SPECIAL, WEEKLY, PERMANENT
  const items = [
    // Shop 1 Items
    {
      id: 'item_01',
      shop_id: shop1Id,
      title: 'Royal Fish Mohinga with Crispy Pe-Kyaw',
      description: 'Slow-simmered aromatic catfish broth with lemongrass, ginger, tender vermicelli, and golden chickpea crackers.',
      image: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
      price: 5.50,
      category: 'Noodles & Broth',
      menu_type: 'SPECIAL',
      is_vegetarian: 0,
      is_halal: 1,
      special_date: new Date().toISOString().slice(0, 10), // Today's Special!
      available_days: null,
    },
    {
      id: 'item_02',
      shop_id: shop1Id,
      title: 'Mandalay Mont-Di Rice Noodle Salad',
      description: 'Thick hand-pulled round rice noodles tossed in roasted chickpea flour, chili garlic oil, and crushed fish cakes.',
      image: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
      price: 6.25,
      category: 'Noodles & Broth',
      menu_type: 'WEEKLY',
      is_vegetarian: 0,
      is_halal: 1,
      special_date: null,
      available_days: JSON.stringify(['Mon', 'Wed', 'Fri', 'Sun']),
    },
    {
      id: 'item_03',
      shop_id: shop1Id,
      title: 'Crispy Samosa Thoke (Vegetarian)',
      description: 'Golden spiced potato samosas crushed into a zesty cabbage broth with fresh mint, shallots, and tamarind drizzle.',
      image: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
      price: 4.50,
      category: 'Salads & Snacks',
      menu_type: 'PERMANENT',
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null,
    },
    {
      id: 'item_04',
      shop_id: shop1Id,
      title: 'Steamed Glutinous Rice with Boiled Vatana Peas',
      description: 'Traditional morning breakfast sticky rice topped with tender salted peas, fried shallot crisps, and sesame oil.',
      image: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
      price: 3.80,
      category: 'Breakfast Specials',
      menu_type: 'PERMANENT',
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null,
    },

    // Shop 2 Items
    {
      id: 'item_05',
      shop_id: shop2Id,
      title: 'Rich Coconut Chicken Noodle (Ohn No Khao Swè)',
      description: 'Fragrant mild curry stewed chicken in velvety spiced coconut milk served over flat egg noodles with crispy wonton crunch and lime.',
      image: '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
      price: 7.50,
      category: 'Noodles & Broth',
      menu_type: 'SPECIAL',
      is_vegetarian: 0,
      is_halal: 0,
      special_date: new Date().toISOString().slice(0, 10),
      available_days: null,
    },
    {
      id: 'item_06',
      shop_id: shop2Id,
      title: 'Golden Spiced Butter Rice with Braised Chicken',
      description: 'Fluffy fragrant rice cooked in pure clarified butter, whole cardamom, cloves, and tender caramelized chicken thigh.',
      image: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
      price: 8.50,
      category: 'Rice & Main Dishes',
      menu_type: 'WEEKLY',
      is_vegetarian: 0,
      is_halal: 1,
      special_date: null,
      available_days: JSON.stringify(['Tue', 'Thu', 'Sat']),
    },
    {
      id: 'item_07',
      shop_id: shop2Id,
      title: 'Danbauk Festive Biryani (Halal)',
      description: 'Long-grain basmati infused with saffron, raisins, roasted cashews, and slow-roasted tender spiced lamb.',
      image: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
      price: 10.50,
      category: 'Rice & Main Dishes',
      menu_type: 'WEEKLY',
      is_vegetarian: 0,
      is_halal: 1,
      special_date: null,
      available_days: JSON.stringify(['Fri', 'Sat', 'Sun']),
    },
    {
      id: 'item_08',
      shop_id: shop2Id,
      title: 'Classic Fermented Green Tea Leaf Salad (Lahpet Thoke)',
      description: 'Finest organic tea leaves tossed with double-fried crunchy beans, roasted peanuts, sesame, crisp cabbage, and fresh lime.',
      image: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
      price: 5.00,
      category: 'Salads & Snacks',
      menu_type: 'PERMANENT',
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null,
    },

    // Shop 3 Items (Pending shop)
    {
      id: 'item_09',
      shop_id: shop3Id,
      title: 'Shan Tofu Noodle Bowl (Tohu Nway)',
      description: 'Silky warm chickpea tofu porridge served over fresh rice noodles with fragrant garlic oil, pickled greens, and cilantro.',
      image: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
      price: 6.00,
      category: 'Noodles & Broth',
      menu_type: 'PERMANENT',
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null,
    }
  ];

  const insertItem = db.prepare(`
    INSERT INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const it of items) {
    insertItem.run(
      it.id,
      it.shop_id,
      it.title,
      it.description,
      it.image,
      it.price,
      it.category,
      it.menu_type,
      it.is_vegetarian,
      it.is_halal,
      it.special_date,
      it.available_days,
      now
    );
  }

  // 6. Customer follows shop 1 initially
  db.prepare(`
    INSERT INTO follows (customer_id, shop_id, created_at)
    VALUES (?, ?, ?)
  `).run(custId, shop1Id, now);

  // 7. Customer saves item_01
  db.prepare(`
    INSERT INTO saved_items (customer_id, item_id, created_at)
    VALUES (?, ?, ?)
  `).run(custId, 'item_01', now);
}
