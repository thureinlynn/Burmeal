import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { generateAllMockShops, generateAllMockMenuItems, generateMockOwners } from '../utils/mockDataGenerator';

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
    // Backfill international shops for Thailand and Singapore
    const now = new Date().toISOString();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('burmeal123', salt);

    // Ensure owners exist
    db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, name, role, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'usr_owner_04', 'bangkok@burmeal.com', passwordHash, 'Ma Thida (Bangkok)', 'SHOP_OWNER', 'https://api.dicebear.com/7.x/identicon/svg?seed=bangkok', now
    );
    db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, name, role, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      'usr_owner_05', 'singapore@burmeal.com', passwordHash, 'Ko Myo (Singapore)', 'SHOP_OWNER', 'https://api.dicebear.com/7.x/identicon/svg?seed=singapore', now
    );

    // Insert Thailand Shop
    db.prepare(`INSERT OR IGNORE INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'shop_04', 'usr_owner_04', 'Siam Burmese Home Food (Pratunam)', 'Authentic Burmese curries, crispy Nan Gyi Thoke, and homemade Shan tofu served hot in Bangkok.',
      '/src/assets/images/burmeal_hero_spread_1793906769541.jpg', 'https://api.dicebear.com/7.x/identicon/svg?seed=bangkok', 'APPROVED',
      'Burmese Bangkok Diaspora Favorites', 'Pratunam Market & Phetchaburi 19', 'Phetchaburi Soi 19, Pratunam', 'Bangkok', 'Bangkok Metropolitan', 'Thailand',
      'https://facebook.com/siamburmesefood', '66812345678', '66812345678', '@burmesebkk', '+66 81 234 5678', now
    );

    // Insert Singapore Shop
    db.prepare(`INSERT OR IGNORE INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'shop_05', 'usr_owner_05', 'Peninsula Golden Myanmar Kitchen', 'Iconic Burmese comfort food serving Singapore with fish broth Mohinga, tender braised beef curries, and spicy tea leaf salads.',
      '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg', 'https://api.dicebear.com/7.x/identicon/svg?seed=singapore', 'APPROVED',
      'Peninsula Plaza Heritage Cuisine', 'City Hall & Peninsula Plaza', '111 North Bridge Road, Peninsula Plaza #B1-08', 'Singapore', 'Singapore Central & Islandwide', 'Singapore',
      'https://facebook.com/peninsulagoldenmyanmar', '6591234567', '6591234567', '@peninsulamy', '+65 9123 4567', now
    );

    // Insert dishes for Thailand and Singapore
    db.prepare(`INSERT OR IGNORE INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'item_10', 'shop_04', 'Bangkok Pratunam Shan Khau Swe', 'Silky chicken curry noodle soup with pickled mustard greens and roasted chili oil.',
      '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg', 6.50, 'Noodles & Broth', 'SPECIAL', 0, 1, new Date().toISOString().slice(0, 10), null, now
    );
    db.prepare(`INSERT OR IGNORE INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'item_11', 'shop_04', 'Crispy Golden Shan Tofu Fritters', 'Freshly made yellow chickpea tofu with spicy tamarind dipping sauce.',
      '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg', 4.80, 'Salads & Snacks', 'PERMANENT', 1, 1, null, null, now
    );
    db.prepare(`INSERT OR IGNORE INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'item_12', 'shop_05', 'Peninsula Plaza Signature Mohinga', 'Traditional lemongrass catfish broth with crispy yellow split-pea fritters.',
      '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg', 7.80, 'Noodles & Broth', 'SPECIAL', 0, 1, new Date().toISOString().slice(0, 10), null, now
    );
    db.prepare(`INSERT OR IGNORE INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'item_13', 'shop_05', 'Braised Beef Curry with Steamed Rice', 'Tender slow-cooked spiced beef curry with shallots and fresh cucumber salad.',
      '/src/assets/images/burmeal_hero_spread_1793906769541.jpg', 9.50, 'Rice & Main Dishes', 'PERMANENT', 0, 1, null, null, now
    );
  } catch (migErr) {
    console.error('Migration error:', migErr);
  }

  seedInitialData();
}

function seedInitialData() {
  const shopCount = db.prepare('SELECT COUNT(*) as count FROM shops').get() as { count: number };
  if (shopCount.count === 176) {
    return; // Already seeded with 16 regions * 11 shops = 176 shops (including European Union)
  }

  if (shopCount.count > 0 && shopCount.count !== 176) {
    console.log('Reseeding SQLite database with updated international & EU dataset (176 shops, 1,936 items)...');
    db.prepare('DELETE FROM menu_items').run();
    db.prepare('DELETE FROM shops').run();
  }

  console.log('Seeding SQLite database with balanced prototype data (11 shops per region, 11 items per shop, 16 regions)...');

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('burmeal123', salt);
  const now = new Date().toISOString();

  const shops = generateAllMockShops();
  const menuItems = generateAllMockMenuItems(shops);
  const owners = generateMockOwners(shops);

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertShop = db.prepare(`
    INSERT OR REPLACE INTO shops (
      id, owner_id, name, bio, cover_image, avatar_image, status,
      cuisine_type, location_area, address, city, region, country,
      facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMenuItem = db.prepare(`
    INSERT OR REPLACE INTO menu_items (
      id, shop_id, title, description, image, price, category, menu_type,
      is_vegetarian, is_halal, special_date, available_days, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedTransaction = db.transaction(() => {
    // 1. Admin
    insertUser.run(
      'usr_admin_01',
      'admin@burmeal.com',
      passwordHash,
      'BurMeal Curator',
      'ADMIN',
      'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      now
    );

    // 2. Customer
    insertUser.run(
      'usr_cust_01',
      'customer@burmeal.com',
      passwordHash,
      'Kyaw Swar',
      'CUSTOMER',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyaw',
      now
    );

    // 3. Shop Owners
    for (const owner of owners) {
      insertUser.run(
        owner.id,
        owner.email,
        passwordHash,
        owner.name,
        'SHOP_OWNER',
        owner.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
        now
      );
    }

    // 4. Shops
    for (const s of shops) {
      insertShop.run(
        s.id,
        s.ownerId,
        s.name,
        s.bio,
        s.coverImage,
        s.avatarImage,
        s.status,
        s.cuisineType,
        s.locationArea,
        s.address || '',
        s.city || '',
        s.region || '',
        s.country || '',
        s.facebookUrl || '',
        s.whatsappPhone || '',
        s.viberPhone || '',
        s.lineId || '',
        s.phoneNumber || '',
        s.createdAt || now
      );
    }

    // 5. Menu Items
    for (const m of menuItems) {
      insertMenuItem.run(
        m.id,
        m.shopId,
        m.title,
        m.description,
        m.image,
        m.price,
        m.category,
        m.menuType,
        m.isVegetarian ? 1 : 0,
        m.isHalal ? 1 : 0,
        m.specialDate || null,
        m.availableDays ? JSON.stringify(m.availableDays) : null,
        m.createdAt || now
      );
    }

    // 6. Initial customer follows
    const initialFollowShops = ['shop_01', 'shop_02', 'shop_03', 'shop_04', 'shop_05'];
    for (const fShopId of initialFollowShops) {
      db.prepare(`
        INSERT OR IGNORE INTO follows (customer_id, shop_id, created_at)
        VALUES (?, ?, ?)
      `).run('usr_cust_01', fShopId, now);
    }

    // 7. Initial customer saved items
    const sampleSavedItems = ['item_shop_01_1', 'item_shop_02_1', 'item_shop_04_1'];
    for (const itemId of sampleSavedItems) {
      db.prepare(`
        INSERT OR IGNORE INTO saved_items (customer_id, item_id, created_at)
        VALUES (?, ?, ?)
      `).run('usr_cust_01', itemId, now);
    }
  });

  seedTransaction();
  console.log(`Database seeded successfully: ${shops.length} shops and ${menuItems.length} menu items across all regions.`);
}
