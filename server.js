// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import bcrypt2 from "bcryptjs";
import crypto from "crypto";
import path2 from "path";

// src/server/db.ts
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
var DB_PATH = path.resolve(process.cwd(), "data", "burmeal.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
var db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
function initDb() {
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
  try {
    const tableInfo = db.prepare("PRAGMA table_info(shops)").all();
    const columnNames = tableInfo.map((c) => c.name);
    if (!columnNames.includes("address")) {
      db.prepare("ALTER TABLE shops ADD COLUMN address TEXT").run();
    }
    if (!columnNames.includes("city")) {
      db.prepare("ALTER TABLE shops ADD COLUMN city TEXT").run();
    }
    if (!columnNames.includes("region")) {
      db.prepare("ALTER TABLE shops ADD COLUMN region TEXT").run();
    }
    if (!columnNames.includes("country")) {
      db.prepare("ALTER TABLE shops ADD COLUMN country TEXT").run();
    }
    db.prepare(`UPDATE shops SET address = '78th Street, Between 26th & 27th', city = 'Mandalay', region = 'Mandalay Region', country = 'Myanmar' WHERE id = 'shop_01' AND (address IS NULL OR address = '')`).run();
    db.prepare(`UPDATE shops SET address = 'No. 12, Bogyoke Aung San Road', city = 'Yangon', region = 'Yangon Region', country = 'Myanmar' WHERE id = 'shop_02' AND (address IS NULL OR address = '')`).run();
    db.prepare(`UPDATE shops SET address = 'Yone Gyi Street, Central Market', city = 'Nyaungshwe', region = 'Shan State', country = 'Myanmar' WHERE id = 'shop_03' AND (address IS NULL OR address = '')`).run();
  } catch (migErr) {
    console.error("Migration error:", migErr);
  }
  seedInitialData();
}
function seedInitialData() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  if (userCount.count > 0) {
    return;
  }
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync("burmeal123", salt);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const adminId = "usr_admin_01";
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, "admin@burmeal.com", passwordHash, "BurMeal Curator", "ADMIN", "https://api.dicebear.com/7.x/bottts/svg?seed=admin", now);
  const owner1Id = "usr_owner_01";
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(owner1Id, "mandalay@burmeal.com", passwordHash, "Daw Khin Sandar", "SHOP_OWNER", "https://api.dicebear.com/7.x/avataaars/svg?seed=Khin", now);
  const owner2Id = "usr_owner_02";
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(owner2Id, "rangoon@burmeal.com", passwordHash, "U Than Htike", "SHOP_OWNER", "https://api.dicebear.com/7.x/avataaars/svg?seed=Than", now);
  const owner3Id = "usr_owner_03";
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(owner3Id, "shan@burmeal.com", passwordHash, "Nang Kham Hla", "SHOP_OWNER", "https://api.dicebear.com/7.x/avataaars/svg?seed=Nang", now);
  const custId = "usr_cust_01";
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(custId, "customer@burmeal.com", passwordHash, "Kyaw Swar", "CUSTOMER", "https://api.dicebear.com/7.x/avataaars/svg?seed=Kyaw", now);
  const shop1Id = "shop_01";
  db.prepare(`
    INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shop1Id,
    owner1Id,
    "Mandalay Morning Teahouse",
    "Authentic royal Mandalay breakfast, slow-cooked catfish Mohinga, and handcrafted freshly fried crispy split-pea fritters.",
    "/src/assets/images/burmeal_hero_spread_1793906769541.jpg",
    "https://api.dicebear.com/7.x/identicon/svg?seed=mandalay",
    "APPROVED",
    "Burmese Breakfast & Street Classics",
    "Downtown Heritage District",
    "78th Street, Between 26th & 27th",
    "Mandalay",
    "Mandalay Region",
    "Myanmar",
    "https://facebook.com/mandalayteahouse",
    "959777123456",
    "959777123456",
    "@mandalay_tea",
    "+95 9 777 123 456",
    now
  );
  const shop2Id = "shop_02";
  db.prepare(`
    INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shop2Id,
    owner2Id,
    "Golden Rangoon Coconut Kitchen",
    "Specialist in traditional Ohn No Khao Sw\xE8, rich braised pork belly stews, and herbal seasonal sour soups.",
    "/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg",
    "https://api.dicebear.com/7.x/identicon/svg?seed=rangoon",
    "APPROVED",
    "Yangon Classic Curries & Soups",
    "Bahan Township",
    "No. 42 Inya Road",
    "Yangon",
    "Yangon Region",
    "Myanmar",
    "https://facebook.com/goldenrangoonkitchen",
    "959888987654",
    "959888987654",
    "@goldenrangoon",
    "+95 9 888 987 654",
    now
  );
  const shop3Id = "shop_03";
  db.prepare(`
    INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, facebook_url, whatsapp_phone, viber_phone, line_id, phone_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    shop3Id,
    owner3Id,
    "Inle Mountain Tealeaf Corner",
    "Highland Shan cuisine featuring fermented tea leaf salad, warm Shan tofu noodle bowls, and savory rice cakes.",
    "/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg",
    "https://api.dicebear.com/7.x/identicon/svg?seed=inle",
    "PENDING",
    // One shop starts as PENDING for Admin review testing!
    "Shan Highlands & Vegetarian Delights",
    "Inle Lake Market Hub",
    "Main Market Pier",
    "Nyaungshwe",
    "Shan State",
    "Myanmar",
    "https://facebook.com/inlemountain",
    "959666543210",
    "959666543210",
    "@inle_corner",
    "+95 9 666 543 210",
    now
  );
  const items = [
    // Shop 1 Items
    {
      id: "item_01",
      shop_id: shop1Id,
      title: "Royal Fish Mohinga with Crispy Pe-Kyaw",
      description: "Slow-simmered aromatic catfish broth with lemongrass, ginger, tender vermicelli, and golden chickpea crackers.",
      image: "/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg",
      price: 5.5,
      category: "Noodles & Broth",
      menu_type: "SPECIAL",
      is_vegetarian: 0,
      is_halal: 1,
      special_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      // Today's Special!
      available_days: null
    },
    {
      id: "item_02",
      shop_id: shop1Id,
      title: "Mandalay Mont-Di Rice Noodle Salad",
      description: "Thick hand-pulled round rice noodles tossed in roasted chickpea flour, chili garlic oil, and crushed fish cakes.",
      image: "/src/assets/images/burmeal_hero_spread_1793906769541.jpg",
      price: 6.25,
      category: "Noodles & Broth",
      menu_type: "WEEKLY",
      is_vegetarian: 0,
      is_halal: 1,
      special_date: null,
      available_days: JSON.stringify(["Mon", "Wed", "Fri", "Sun"])
    },
    {
      id: "item_03",
      shop_id: shop1Id,
      title: "Crispy Samosa Thoke (Vegetarian)",
      description: "Golden spiced potato samosas crushed into a zesty cabbage broth with fresh mint, shallots, and tamarind drizzle.",
      image: "/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg",
      price: 4.5,
      category: "Salads & Snacks",
      menu_type: "PERMANENT",
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null
    },
    {
      id: "item_04",
      shop_id: shop1Id,
      title: "Steamed Glutinous Rice with Boiled Vatana Peas",
      description: "Traditional morning breakfast sticky rice topped with tender salted peas, fried shallot crisps, and sesame oil.",
      image: "/src/assets/images/burmeal_hero_spread_1793906769541.jpg",
      price: 3.8,
      category: "Breakfast Specials",
      menu_type: "PERMANENT",
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null
    },
    // Shop 2 Items
    {
      id: "item_05",
      shop_id: shop2Id,
      title: "Rich Coconut Chicken Noodle (Ohn No Khao Sw\xE8)",
      description: "Fragrant mild curry stewed chicken in velvety spiced coconut milk served over flat egg noodles with crispy wonton crunch and lime.",
      image: "/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg",
      price: 7.5,
      category: "Noodles & Broth",
      menu_type: "SPECIAL",
      is_vegetarian: 0,
      is_halal: 0,
      special_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      available_days: null
    },
    {
      id: "item_06",
      shop_id: shop2Id,
      title: "Golden Spiced Butter Rice with Braised Chicken",
      description: "Fluffy fragrant rice cooked in pure clarified butter, whole cardamom, cloves, and tender caramelized chicken thigh.",
      image: "/src/assets/images/burmeal_hero_spread_1793906769541.jpg",
      price: 8.5,
      category: "Rice & Main Dishes",
      menu_type: "WEEKLY",
      is_vegetarian: 0,
      is_halal: 1,
      special_date: null,
      available_days: JSON.stringify(["Tue", "Thu", "Sat"])
    },
    {
      id: "item_07",
      shop_id: shop2Id,
      title: "Danbauk Festive Biryani (Halal)",
      description: "Long-grain basmati infused with saffron, raisins, roasted cashews, and slow-roasted tender spiced lamb.",
      image: "/src/assets/images/burmeal_hero_spread_1793906769541.jpg",
      price: 10.5,
      category: "Rice & Main Dishes",
      menu_type: "WEEKLY",
      is_vegetarian: 0,
      is_halal: 1,
      special_date: null,
      available_days: JSON.stringify(["Fri", "Sat", "Sun"])
    },
    {
      id: "item_08",
      shop_id: shop2Id,
      title: "Classic Fermented Green Tea Leaf Salad (Lahpet Thoke)",
      description: "Finest organic tea leaves tossed with double-fried crunchy beans, roasted peanuts, sesame, crisp cabbage, and fresh lime.",
      image: "/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg",
      price: 5,
      category: "Salads & Snacks",
      menu_type: "PERMANENT",
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null
    },
    // Shop 3 Items (Pending shop)
    {
      id: "item_09",
      shop_id: shop3Id,
      title: "Shan Tofu Noodle Bowl (Tohu Nway)",
      description: "Silky warm chickpea tofu porridge served over fresh rice noodles with fragrant garlic oil, pickled greens, and cilantro.",
      image: "/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg",
      price: 6,
      category: "Noodles & Broth",
      menu_type: "PERMANENT",
      is_vegetarian: 1,
      is_halal: 1,
      special_date: null,
      available_days: null
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
  db.prepare(`
    INSERT INTO follows (customer_id, shop_id, created_at)
    VALUES (?, ?, ?)
  `).run(custId, shop1Id, now);
  db.prepare(`
    INSERT INTO saved_items (customer_id, item_id, created_at)
    VALUES (?, ?, ?)
  `).run(custId, "item_01", now);
}

// server.ts
initDb();
var app = express();
var PORT = 3e3;
app.use(express.json());
function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const session = db.prepare(`
    SELECT s.token, u.id, u.email, u.name, u.role, u.avatar_url, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token);
  if (!session) return null;
  if (new Date(session.expires_at) < /* @__PURE__ */ new Date()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    avatarUrl: session.avatar_url
  };
}
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, name, role, shopName, cuisineType, locationArea } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required." });
    }
    const assignedRole = role === "SHOP_OWNER" ? "SHOP_OWNER" : "CUSTOMER";
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    const salt = bcrypt2.genSaltSync(10);
    const passwordHash = bcrypt2.hashSync(password, salt);
    const userId = "usr_" + crypto.randomUUID().slice(0, 8);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, name, assignedRole, avatarUrl, now);
    let createdShopId = null;
    if (assignedRole === "SHOP_OWNER") {
      const { address, city, region, country } = req.body;
      createdShopId = "shop_" + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        createdShopId,
        userId,
        shopName || `${name}'s Kitchen`,
        "Welcome to our kitchen! We specialize in traditional family recipes and daily specials.",
        "/src/assets/images/burmeal_hero_spread_1793906769541.jpg",
        avatarUrl,
        "PENDING",
        // Needs admin approval
        cuisineType || "Burmese Cuisine",
        locationArea || (city ? `${city}, ${country || "Myanmar"}` : "Downtown Heritage District"),
        address || "Main Road",
        city || "Yangon",
        region || "Yangon Region",
        country || "Myanmar",
        now
      );
    }
    const token = "tok_" + crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, userId, expiresAt);
    return res.json({
      user: {
        id: userId,
        email,
        name,
        role: assignedRole,
        avatarUrl
      },
      shopId: createdShopId,
      token
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Server error during registration." });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const matches = bcrypt2.compareSync(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    let shopId = null;
    if (user.role === "SHOP_OWNER") {
      const shop = db.prepare("SELECT id FROM shops WHERE owner_id = ?").get(user.id);
      if (shop) shopId = shop.id;
    }
    const token = "tok_" + crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
    db.prepare(`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, user.id, expiresAt);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      shopId,
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
});
app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  let shopId = null;
  if (user.role === "SHOP_OWNER") {
    const shop = db.prepare("SELECT id FROM shops WHERE owner_id = ?").get(user.id);
    if (shop) shopId = shop.id;
  }
  return res.json({ user, shopId });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  return res.json({ success: true });
});
app.get("/api/shops", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const statusFilter = req.query.status;
    let query = `
      SELECT s.*, u.email as owner_email,
        (SELECT COUNT(*) FROM follows WHERE shop_id = s.id) as follower_count,
        (SELECT COUNT(*) FROM menu_items WHERE shop_id = s.id) as item_count
      FROM shops s
      JOIN users u ON s.owner_id = u.id
    `;
    if (statusFilter && user?.role === "ADMIN") {
      query += ` WHERE s.status = '${statusFilter}'`;
    } else if (user?.role === "ADMIN") {
    } else {
      query += ` WHERE s.status = 'APPROVED'`;
    }
    query += ` ORDER BY s.created_at DESC`;
    const shops = db.prepare(query).all();
    let userFollows = [];
    if (user) {
      const rows = db.prepare("SELECT shop_id FROM follows WHERE customer_id = ?").all(user.id);
      userFollows = rows.map((r) => r.shop_id);
    }
    const formatted = shops.map((s) => ({
      id: s.id,
      ownerId: s.owner_id,
      ownerEmail: s.owner_email,
      name: s.name,
      bio: s.bio,
      coverImage: s.cover_image,
      avatarImage: s.avatar_image,
      status: s.status,
      cuisineType: s.cuisine_type,
      locationArea: s.location_area,
      address: s.address,
      city: s.city,
      region: s.region,
      country: s.country,
      facebookUrl: s.facebook_url,
      whatsappPhone: s.whatsapp_phone,
      viberPhone: s.viber_phone,
      lineId: s.line_id,
      phoneNumber: s.phone_number,
      createdAt: s.created_at,
      followerCount: s.follower_count,
      itemCount: s.item_count,
      isFollowed: userFollows.includes(s.id)
    }));
    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching shops:", err);
    return res.status(500).json({ error: "Failed to fetch shops" });
  }
});
app.get("/api/shops/:id", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const shop = db.prepare(`
      SELECT s.*, u.email as owner_email,
        (SELECT COUNT(*) FROM follows WHERE shop_id = s.id) as follower_count,
        (SELECT COUNT(*) FROM menu_items WHERE shop_id = s.id) as item_count
      FROM shops s
      JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
    `).get(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    let isFollowed = false;
    if (user) {
      const follow = db.prepare("SELECT 1 FROM follows WHERE customer_id = ? AND shop_id = ?").get(user.id, shop.id);
      isFollowed = !!follow;
    }
    return res.json({
      id: shop.id,
      ownerId: shop.owner_id,
      ownerEmail: shop.owner_email,
      name: shop.name,
      bio: shop.bio,
      coverImage: shop.cover_image,
      avatarImage: shop.avatar_image,
      status: shop.status,
      cuisineType: shop.cuisine_type,
      locationArea: shop.location_area,
      address: shop.address,
      city: shop.city,
      region: shop.region,
      country: shop.country,
      facebookUrl: shop.facebook_url,
      whatsappPhone: shop.whatsapp_phone,
      viberPhone: shop.viber_phone,
      lineId: shop.line_id,
      phoneNumber: shop.phone_number,
      createdAt: shop.created_at,
      followerCount: shop.follower_count,
      itemCount: shop.item_count,
      isFollowed
    });
  } catch (err) {
    console.error("Error fetching shop:", err);
    return res.status(500).json({ error: "Failed to fetch shop details" });
  }
});
app.put("/api/shops/:id", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const shop = db.prepare("SELECT * FROM shops WHERE id = ?").get(req.params.id);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    if (shop.owner_id !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to edit this shop" });
    }
    const {
      name,
      bio,
      coverImage,
      avatarImage,
      cuisineType,
      locationArea,
      address,
      city,
      region,
      country,
      facebookUrl,
      whatsappPhone,
      viberPhone,
      lineId,
      phoneNumber
    } = req.body;
    db.prepare(`
      UPDATE shops
      SET name = ?, bio = ?, cover_image = ?, avatar_image = ?,
          cuisine_type = ?, location_area = ?, address = ?, city = ?, region = ?, country = ?,
          facebook_url = ?, whatsapp_phone = ?, viber_phone = ?, line_id = ?, phone_number = ?
      WHERE id = ?
    `).run(
      name || shop.name,
      bio || shop.bio,
      coverImage || shop.cover_image,
      avatarImage || shop.avatar_image,
      cuisineType || shop.cuisine_type,
      locationArea || shop.location_area,
      address !== void 0 ? address : shop.address,
      city !== void 0 ? city : shop.city,
      region !== void 0 ? region : shop.region,
      country !== void 0 ? country : shop.country,
      facebookUrl !== void 0 ? facebookUrl : shop.facebook_url,
      whatsappPhone !== void 0 ? whatsappPhone : shop.whatsapp_phone,
      viberPhone !== void 0 ? viberPhone : shop.viber_phone,
      lineId !== void 0 ? lineId : shop.line_id,
      phoneNumber !== void 0 ? phoneNumber : shop.phone_number,
      req.params.id
    );
    return res.json({ success: true, message: "Shop profile updated successfully." });
  } catch (err) {
    console.error("Error updating shop:", err);
    return res.status(500).json({ error: "Failed to update shop profile." });
  }
});
app.patch("/api/admin/shops/:id/status", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    db.prepare("UPDATE shops SET status = ? WHERE id = ?").run(status, req.params.id);
    return res.json({ success: true, status });
  } catch (err) {
    console.error("Admin status update error:", err);
    return res.status(500).json({ error: "Failed to update shop status." });
  }
});
app.get("/api/menu-items", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { shopId, menuType, category, isVegetarian, isHalal, query, feedType } = req.query;
    let sql = `
      SELECT m.*, s.name as shop_name, s.status as shop_status,
             s.whatsapp_phone, s.viber_phone, s.line_id, s.facebook_url, s.phone_number
      FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      WHERE 1=1
    `;
    if (user?.role !== "ADMIN") {
      sql += ` AND s.status = 'APPROVED'`;
    }
    if (shopId) {
      sql += ` AND m.shop_id = '${shopId}'`;
    }
    if (menuType && menuType !== "ALL") {
      sql += ` AND m.menu_type = '${menuType}'`;
    }
    if (category && category !== "ALL") {
      sql += ` AND m.category = '${category}'`;
    }
    if (isVegetarian === "true") {
      sql += ` AND m.is_vegetarian = 1`;
    }
    if (isHalal === "true") {
      sql += ` AND m.is_halal = 1`;
    }
    if (query) {
      const cleanQ = query.replace(/'/g, "''");
      sql += ` AND (m.title LIKE '%${cleanQ}%' OR m.description LIKE '%${cleanQ}%' OR s.name LIKE '%${cleanQ}%' OR m.category LIKE '%${cleanQ}%')`;
    }
    let isFollowedFeed = false;
    let followedCount = 0;
    if (feedType === "FOLLOWED" && user) {
      const followRows = db.prepare("SELECT shop_id FROM follows WHERE customer_id = ?").all(user.id);
      followedCount = followRows.length;
      if (followRows.length > 0) {
        const followedShopIds = followRows.map((r) => `'${r.shop_id}'`).join(",");
        const followedSql = sql + ` AND m.shop_id IN (${followedShopIds}) ORDER BY m.created_at DESC`;
        const items2 = db.prepare(followedSql).all();
        if (items2.length > 0) {
          isFollowedFeed = true;
          return res.json({
            items: formatMenuItems(items2, user?.id),
            feedSource: "FOLLOWED",
            followedCount
          });
        }
      }
    }
    sql += ` ORDER BY m.created_at DESC`;
    const items = db.prepare(sql).all();
    return res.json({
      items: formatMenuItems(items, user?.id),
      feedSource: feedType === "FOLLOWED" ? "FALLBACK_TRENDING" : "DISCOVER",
      followedCount
    });
  } catch (err) {
    console.error("Error fetching menu items:", err);
    return res.status(500).json({ error: "Failed to fetch menu items" });
  }
});
function formatMenuItems(items, userId) {
  let savedIds = [];
  if (userId) {
    const rows = db.prepare("SELECT item_id FROM saved_items WHERE customer_id = ?").all(userId);
    savedIds = rows.map((r) => r.item_id);
  }
  return items.map((m) => ({
    id: m.id,
    shopId: m.shop_id,
    shopName: m.shop_name,
    title: m.title,
    description: m.description,
    image: m.image,
    price: m.price,
    category: m.category,
    menuType: m.menu_type,
    isVegetarian: Boolean(m.is_vegetarian),
    isHalal: Boolean(m.is_halal),
    specialDate: m.special_date,
    availableDays: m.available_days ? JSON.parse(m.available_days) : null,
    createdAt: m.created_at,
    contactLinks: {
      whatsappPhone: m.whatsapp_phone,
      viberPhone: m.viber_phone,
      lineId: m.line_id,
      facebookUrl: m.facebook_url,
      phoneNumber: m.phone_number
    },
    isSaved: savedIds.includes(m.id)
  }));
}
app.post("/api/menu-items", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const {
      shopId,
      title,
      description,
      image,
      price,
      category,
      menuType,
      isVegetarian,
      isHalal,
      specialDate,
      availableDays
    } = req.body;
    if (!shopId || !title || !price || !category || !menuType) {
      return res.status(400).json({ error: "Required fields missing." });
    }
    const shop = db.prepare("SELECT owner_id FROM shops WHERE id = ?").get(shopId);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    if (shop.owner_id !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to add items to this shop." });
    }
    const itemId = "item_" + crypto.randomUUID().slice(0, 8);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    db.prepare(`
      INSERT INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      itemId,
      shopId,
      title,
      description || "",
      image || "/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg",
      Number(price),
      category,
      menuType,
      isVegetarian ? 1 : 0,
      isHalal ? 1 : 0,
      specialDate || null,
      availableDays ? JSON.stringify(availableDays) : null,
      now
    );
    return res.json({ success: true, itemId });
  } catch (err) {
    console.error("Error creating menu item:", err);
    return res.status(500).json({ error: "Failed to create menu item" });
  }
});
app.put("/api/menu-items/:id", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const existing = db.prepare(`
      SELECT m.*, s.owner_id FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      WHERE m.id = ?
    `).get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Menu item not found" });
    if (existing.owner_id !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to edit this item." });
    }
    const {
      title,
      description,
      image,
      price,
      category,
      menuType,
      isVegetarian,
      isHalal,
      specialDate,
      availableDays
    } = req.body;
    db.prepare(`
      UPDATE menu_items
      SET title = ?, description = ?, image = ?, price = ?,
          category = ?, menu_type = ?, is_vegetarian = ?, is_halal = ?,
          special_date = ?, available_days = ?
      WHERE id = ?
    `).run(
      title !== void 0 ? title : existing.title,
      description !== void 0 ? description : existing.description,
      image !== void 0 ? image : existing.image,
      price !== void 0 ? Number(price) : existing.price,
      category !== void 0 ? category : existing.category,
      menuType !== void 0 ? menuType : existing.menu_type,
      isVegetarian !== void 0 ? isVegetarian ? 1 : 0 : existing.is_vegetarian,
      isHalal !== void 0 ? isHalal ? 1 : 0 : existing.is_halal,
      specialDate !== void 0 ? specialDate : existing.special_date,
      availableDays !== void 0 ? JSON.stringify(availableDays) : existing.available_days,
      req.params.id
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("Error updating menu item:", err);
    return res.status(500).json({ error: "Failed to update menu item" });
  }
});
app.delete("/api/menu-items/:id", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const existing = db.prepare(`
      SELECT m.*, s.owner_id FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      WHERE m.id = ?
    `).get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Menu item not found" });
    if (existing.owner_id !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized to delete this item." });
    }
    db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    return res.status(500).json({ error: "Failed to delete menu item" });
  }
});
app.post("/api/shops/:id/follow", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Please log in to follow shops." });
    const shopId = req.params.id;
    const existing = db.prepare("SELECT 1 FROM follows WHERE customer_id = ? AND shop_id = ?").get(user.id, shopId);
    if (existing) {
      db.prepare("DELETE FROM follows WHERE customer_id = ? AND shop_id = ?").run(user.id, shopId);
      return res.json({ followed: false });
    } else {
      db.prepare("INSERT INTO follows (customer_id, shop_id, created_at) VALUES (?, ?, ?)").run(user.id, shopId, (/* @__PURE__ */ new Date()).toISOString());
      return res.json({ followed: true });
    }
  } catch (err) {
    console.error("Error toggling follow:", err);
    return res.status(500).json({ error: "Failed to update follow state" });
  }
});
app.post("/api/menu-items/:id/save", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Please log in to save items." });
    const itemId = req.params.id;
    const existing = db.prepare("SELECT 1 FROM saved_items WHERE customer_id = ? AND item_id = ?").get(user.id, itemId);
    if (existing) {
      db.prepare("DELETE FROM saved_items WHERE customer_id = ? AND item_id = ?").run(user.id, itemId);
      return res.json({ saved: false });
    } else {
      db.prepare("INSERT INTO saved_items (customer_id, item_id, created_at) VALUES (?, ?, ?)").run(user.id, itemId, (/* @__PURE__ */ new Date()).toISOString());
      return res.json({ saved: true });
    }
  } catch (err) {
    console.error("Error toggling save:", err);
    return res.status(500).json({ error: "Failed to save item" });
  }
});
app.get("/api/saved-items", (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Please log in to view saved items." });
    const items = db.prepare(`
      SELECT m.*, s.name as shop_name, s.whatsapp_phone, s.viber_phone, s.line_id, s.facebook_url, s.phone_number
      FROM saved_items si
      JOIN menu_items m ON si.item_id = m.id
      JOIN shops s ON m.shop_id = s.id
      WHERE si.customer_id = ?
      ORDER BY si.created_at DESC
    `).all(user.id);
    return res.json(formatMenuItems(items, user.id));
  } catch (err) {
    console.error("Error fetching saved items:", err);
    return res.status(500).json({ error: "Failed to fetch saved items" });
  }
});
app.post("/api/admin/seed", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin only" });
  }
  return res.json({ success: true, message: "Database verified and seeded." });
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.resolve(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path2.resolve(process.cwd(), "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BurMeal server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
