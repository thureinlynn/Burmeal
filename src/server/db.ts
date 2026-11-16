import Database from 'better-sqlite3';
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
      profile_image_url TEXT,
      latitude REAL,
      longitude REAL,
      facebook_url TEXT,
      whatsapp_phone TEXT,
      viber_phone TEXT,
      line_id TEXT,
      phone_number TEXT,
      is_open INTEGER NOT NULL DEFAULT 1,
      operating_hours TEXT,
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

    CREATE TABLE IF NOT EXISTS daily_special_posts (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      shop_avatar_image TEXT,
      shop_country TEXT,
      shop_region TEXT,
      shop_city TEXT,
      title TEXT NOT NULL,
      post TEXT NOT NULL,
      image TEXT,
      image_storage_path TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
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
    if (!columnNames.includes('profile_image_url')) {
      db.prepare('ALTER TABLE shops ADD COLUMN profile_image_url TEXT').run();
    }
    if (!columnNames.includes('latitude')) {
      db.prepare('ALTER TABLE shops ADD COLUMN latitude REAL').run();
    }
    if (!columnNames.includes('longitude')) {
      db.prepare('ALTER TABLE shops ADD COLUMN longitude REAL').run();
    }
    if (!columnNames.includes('is_open')) {
      db.prepare('ALTER TABLE shops ADD COLUMN is_open INTEGER NOT NULL DEFAULT 1').run();
    }
    if (!columnNames.includes('operating_hours')) {
      db.prepare('ALTER TABLE shops ADD COLUMN operating_hours TEXT').run();
    }
  } catch (migErr) {
    console.error('Migration error:', migErr);
  }

  purgeMockSeedData();
}

function purgeMockSeedData() {
  try {
    const cleanTx = db.transaction(() => {
      db.prepare(`
        DELETE FROM saved_items
        WHERE customer_id IN ('usr_admin_01', 'usr_cust_01', 'usr_owner_01', 'usr_owner_02', 'usr_owner_03', 'usr_owner_04', 'usr_owner_05')
           OR customer_id LIKE 'usr_owner_r%'
           OR item_id IN ('item_10', 'item_11', 'item_12', 'item_13')
           OR item_id LIKE 'item_shop_%'
      `).run();

      db.prepare(`
        DELETE FROM follows
        WHERE customer_id IN ('usr_admin_01', 'usr_cust_01', 'usr_owner_01', 'usr_owner_02', 'usr_owner_03', 'usr_owner_04', 'usr_owner_05')
           OR customer_id LIKE 'usr_owner_r%'
           OR shop_id IN ('shop_01', 'shop_02', 'shop_03', 'shop_04', 'shop_05')
           OR shop_id LIKE 'shop_r%'
      `).run();

      db.prepare(`
        DELETE FROM menu_items
        WHERE id IN ('item_10', 'item_11', 'item_12', 'item_13')
           OR id LIKE 'item_shop_%'
           OR shop_id IN ('shop_01', 'shop_02', 'shop_03', 'shop_04', 'shop_05')
           OR shop_id LIKE 'shop_r%'
      `).run();

      db.prepare(`
        DELETE FROM shops
        WHERE id IN ('shop_01', 'shop_02', 'shop_03', 'shop_04', 'shop_05')
           OR id LIKE 'shop_r%'
      `).run();

      db.prepare(`
        DELETE FROM users
        WHERE id IN ('usr_admin_01', 'usr_cust_01', 'usr_owner_01', 'usr_owner_02', 'usr_owner_03', 'usr_owner_04', 'usr_owner_05')
           OR id LIKE 'usr_owner_r%'
      `).run();
    });

    cleanTx();
  } catch (err) {
    console.error('Failed to purge legacy mock seed rows:', err);
  }
}

export function getExpiredDailySpecialPostsFromDb(nowIso: string): Array<{
  id: string;
  image: string | null;
  image_storage_path: string | null;
}> {
  try {
    return db
      .prepare(
        `SELECT id, image, image_storage_path FROM daily_special_posts WHERE expires_at <= ?`
      )
      .all(nowIso) as Array<{
      id: string;
      image: string | null;
      image_storage_path: string | null;
    }>;
  } catch {
    return [];
  }
}

export function deleteDailySpecialPostFromDb(id: string): void {
  db.prepare(`DELETE FROM daily_special_posts WHERE id = ?`).run(id);
}

