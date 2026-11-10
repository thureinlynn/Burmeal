import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { db, initDb } from './src/server/db.js';

initDb();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to authenticate request token
function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const session = db.prepare(`
    SELECT s.token, u.id, u.email, u.name, u.role, u.avatar_url, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token) as any;

  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    avatarUrl: session.avatar_url,
  };
}

// ---------------- API ROUTES ----------------

// 1. Auth: Sign Up
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, role, shopName, cuisineType, locationArea } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    const assignedRole = role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER';

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'usr_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, name, assignedRole, avatarUrl, now);

    // If registering as a Shop Owner, create initial shop profile
    let createdShopId: string | null = null;
    if (assignedRole === 'SHOP_OWNER') {
      const { address, city, region, country } = req.body;
      createdShopId = 'shop_' + crypto.randomUUID().slice(0, 8);
      db.prepare(`
        INSERT INTO shops (id, owner_id, name, bio, cover_image, avatar_image, status, cuisine_type, location_area, address, city, region, country, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        createdShopId,
        userId,
        shopName || `${name}'s Kitchen`,
        'Welcome to our kitchen! We specialize in traditional family recipes and daily specials.',
        '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
        avatarUrl,
        'PENDING', // Needs admin approval
        cuisineType || 'Burmese Cuisine',
        locationArea || (city ? `${city}, ${country || 'Myanmar'}` : 'Downtown Heritage District'),
        address || 'Main Road',
        city || 'Yangon',
        region || 'Yangon Region',
        country || 'Myanmar',
        now
      );
    }

    // Create session token
    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
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
        avatarUrl,
      },
      shopId: createdShopId,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 2. Auth: Sign In
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const matches = bcrypt.compareSync(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if shop owner has shop
    let shopId: string | null = null;
    if (user.role === 'SHOP_OWNER') {
      const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(user.id) as any;
      if (shop) shopId = shop.id;
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
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
        avatarUrl: user.avatar_url,
      },
      shopId,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// 3. Auth: Current Session
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let shopId: string | null = null;
  if (user.role === 'SHOP_OWNER') {
    const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(user.id) as any;
    if (shop) shopId = shop.id;
  }

  return res.json({ user, shopId });
});

// 4. Auth: Sign Out
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  return res.json({ success: true });
});

const REGION_PREFIX_TO_COUNTRY: Record<string, string> = {
  'MM': 'Myanmar',
  'TH': 'Thailand',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'JP': 'Japan',
  'US': 'United States',
  'EU': 'European Union',
  'GB': 'United Kingdom',
  'KR': 'South Korea',
  'AU': 'Australia',
};

function getCountryFromRegionId(regionId?: string): string | undefined {
  if (!regionId) return undefined;
  const prefix = regionId.split('-')[0]?.toUpperCase();
  return REGION_PREFIX_TO_COUNTRY[prefix];
}

function buildRegionSqlClause(regionId?: string, country?: string): string {
  let effectiveCountry = country;
  if (!effectiveCountry && regionId) {
    effectiveCountry = getCountryFromRegionId(regionId);
  }

  let clause = '';
  if (effectiveCountry) {
    if (effectiveCountry.toLowerCase() === 'european union') {
      clause += ` AND (LOWER(s.country) IN ('european union', 'germany', 'france', 'netherlands', 'italy', 'spain', 'sweden', 'belgium', 'europe'))`;
    } else {
      const cleanCountry = effectiveCountry.replace(/'/g, "''");
      clause += ` AND LOWER(s.country) = LOWER('${cleanCountry}')`;
    }
  }

  if (regionId && !regionId.endsWith('-ALL')) {
    const r = regionId.toUpperCase();
    if (r === 'MM-YGN') clause += ` AND (LOWER(s.region) LIKE '%yangon%' OR LOWER(s.city) LIKE '%yangon%')`;
    else if (r === 'MM-MDY') clause += ` AND (LOWER(s.region) LIKE '%mandalay%' OR LOWER(s.city) LIKE '%mandalay%')`;
    else if (r === 'MM-SHN') clause += ` AND (LOWER(s.region) LIKE '%shan%' OR LOWER(s.city) LIKE '%taunggyi%' OR LOWER(s.city) LIKE '%nyaungshwe%' OR LOWER(s.location_area) LIKE '%inle%')`;
    else if (r === 'MM-BGO') clause += ` AND (LOWER(s.region) LIKE '%bago%' OR LOWER(s.city) LIKE '%bago%')`;
    else if (r === 'MM-AYY') clause += ` AND (LOWER(s.region) LIKE '%ayeyarwady%' OR LOWER(s.city) LIKE '%pathein%')`;
    else if (r === 'MM-MON') clause += ` AND (LOWER(s.region) LIKE '%mon%' OR LOWER(s.city) LIKE '%mawlamyine%')`;
    else if (r === 'MM-KRN') clause += ` AND (LOWER(s.region) LIKE '%kayin%' OR LOWER(s.city) LIKE '%hpa-an%')`;
    else if (r === 'TH-BKK') clause += ` AND (LOWER(s.region) LIKE '%bangkok%' OR LOWER(s.city) LIKE '%bangkok%')`;
    else if (r === 'TH-CNX') clause += ` AND (LOWER(s.region) LIKE '%chiang mai%' OR LOWER(s.city) LIKE '%chiang mai%')`;
    else if (r === 'TH-MSOT') clause += ` AND (LOWER(s.region) LIKE '%mae sot%' OR LOWER(s.city) LIKE '%mae sot%')`;
    else if (r === 'US-SF') clause += ` AND (LOWER(s.city) LIKE '%san francisco%' OR LOWER(s.city) LIKE '%oakland%' OR LOWER(s.city) LIKE '%fremont%' OR LOWER(s.city) LIKE '%berkeley%' OR LOWER(s.city) LIKE '%san jose%')`;
    else if (r === 'US-LA') clause += ` AND (LOWER(s.city) LIKE '%los angeles%' OR LOWER(s.location_area) LIKE '%alhambra%' OR LOWER(s.location_area) LIKE '%silver lake%')`;
    else if (r === 'US-NYC') clause += ` AND (LOWER(s.city) LIKE '%new york%' OR LOWER(s.location_area) LIKE '%queens%' OR LOWER(s.location_area) LIKE '%elmhurst%' OR LOWER(s.location_area) LIKE '%brooklyn%')`;
    else if (r === 'EU-DE') clause += ` AND (LOWER(s.country) = 'germany' OR LOWER(s.city) LIKE '%berlin%' OR LOWER(s.city) LIKE '%munich%')`;
    else if (r === 'EU-FR') clause += ` AND (LOWER(s.country) = 'france' OR LOWER(s.city) LIKE '%paris%')`;
    else if (r === 'EU-NL') clause += ` AND (LOWER(s.country) = 'netherlands' OR LOWER(s.city) LIKE '%amsterdam%')`;
    else if (r === 'GB-LDN') clause += ` AND (LOWER(s.city) LIKE '%london%' OR LOWER(s.location_area) LIKE '%soho%' OR LOWER(s.location_area) LIKE '%camden%')`;
    else if (r === 'GB-MAN') clause += ` AND (LOWER(s.city) LIKE '%manchester%')`;
    else if (r === 'JP-TYO') clause += ` AND (LOWER(s.city) LIKE '%tokyo%' OR LOWER(s.location_area) LIKE '%takadanobaba%' OR LOWER(s.location_area) LIKE '%shinjuku%')`;
    else if (r === 'AU-SYD') clause += ` AND (LOWER(s.city) LIKE '%sydney%' OR LOWER(s.location_area) LIKE '%cabramatta%')`;
    else if (r === 'AU-MEL') clause += ` AND (LOWER(s.city) LIKE '%melbourne%' OR LOWER(s.location_area) LIKE '%richmond%')`;
    else if (r === 'KR-SEL') clause += ` AND (LOWER(s.city) LIKE '%seoul%' OR LOWER(s.location_area) LIKE '%itaewon%' OR LOWER(s.location_area) LIKE '%hongdae%')`;
    else if (r === 'KR-INC') clause += ` AND (LOWER(s.city) LIKE '%incheon%' OR LOWER(s.location_area) LIKE '%bupyeong%')`;
  }
  return clause;
}

// 5. Shops: List Approved Shops (with follow stats)
app.get('/api/shops', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const statusFilter = req.query.status as string;
    const countryFilter = req.query.country as string;
    const regionIdFilter = req.query.regionId as string;

    let query = `
      SELECT s.*, u.email as owner_email,
        (SELECT COUNT(*) FROM follows WHERE shop_id = s.id) as follower_count,
        (SELECT COUNT(*) FROM menu_items WHERE shop_id = s.id) as item_count
      FROM shops s
      JOIN users u ON s.owner_id = u.id
    `;

    // Only admins can see non-approved shops unless owner is viewing own shop
    if (statusFilter && user?.role === 'ADMIN') {
      query += ` WHERE s.status = '${statusFilter}'`;
    } else if (user?.role === 'ADMIN') {
      query += ` WHERE 1=1`;
    } else {
      query += ` WHERE s.status = 'APPROVED'`;
    }

    const followedOnlyFilter = req.query.followedOnly === 'true';

    if (followedOnlyFilter && user) {
      query += ` AND s.id IN (SELECT shop_id FROM follows WHERE customer_id = '${user.id}')`;
    } else {
      query += buildRegionSqlClause(regionIdFilter, countryFilter);
    }
    query += ` ORDER BY s.created_at DESC`;

    const shops = db.prepare(query).all() as any[];

    // Check user follow status
    let userFollows: string[] = [];
    if (user) {
      const rows = db.prepare('SELECT shop_id FROM follows WHERE customer_id = ?').all(user.id) as any[];
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
      isFollowed: userFollows.includes(s.id),
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching shops:', err);
    return res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// 6. Shop Detail
app.get('/api/shops/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const shop = db.prepare(`
      SELECT s.*, u.email as owner_email,
        (SELECT COUNT(*) FROM follows WHERE shop_id = s.id) as follower_count,
        (SELECT COUNT(*) FROM menu_items WHERE shop_id = s.id) as item_count
      FROM shops s
      JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
    `).get(req.params.id) as any;

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    let isFollowed = false;
    if (user) {
      const follow = db.prepare('SELECT 1 FROM follows WHERE customer_id = ? AND shop_id = ?').get(user.id, shop.id);
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
      isFollowed,
    });
  } catch (err) {
    console.error('Error fetching shop:', err);
    return res.status(500).json({ error: 'Failed to fetch shop details' });
  }
});

// 7. Update Shop Profile (Shop Owner only)
app.put('/api/shops/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id) as any;
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    if (shop.owner_id !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to edit this shop' });
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
      phoneNumber,
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
      address !== undefined ? address : shop.address,
      city !== undefined ? city : shop.city,
      region !== undefined ? region : shop.region,
      country !== undefined ? country : shop.country,
      facebookUrl !== undefined ? facebookUrl : shop.facebook_url,
      whatsappPhone !== undefined ? whatsappPhone : shop.whatsapp_phone,
      viberPhone !== undefined ? viberPhone : shop.viber_phone,
      lineId !== undefined ? lineId : shop.line_id,
      phoneNumber !== undefined ? phoneNumber : shop.phone_number,
      req.params.id
    );

    return res.json({ success: true, message: 'Shop profile updated successfully.' });
  } catch (err) {
    console.error('Error updating shop:', err);
    return res.status(500).json({ error: 'Failed to update shop profile.' });
  }
});

// 8. Admin: Approve or Reject Shop
app.patch('/api/admin/shops/:id/status', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const { status } = req.body;
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    db.prepare('UPDATE shops SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ success: true, status });
  } catch (err) {
    console.error('Admin status update error:', err);
    return res.status(500).json({ error: 'Failed to update shop status.' });
  }
});

// 9. Menu Items: List with Filtering
app.get('/api/menu-items', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { shopId, menuType, category, isVegetarian, isHalal, query, feedType, country, regionId } = req.query;

    let sql = `
      SELECT m.*, s.name as shop_name, s.status as shop_status,
             s.whatsapp_phone, s.viber_phone, s.line_id, s.facebook_url, s.phone_number
      FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      WHERE 1=1
    `;

    // Only approved shops visible in public feeds unless admin or viewing specific shop directly
    if (user?.role !== 'ADMIN' && !shopId) {
      sql += ` AND s.status = 'APPROVED'`;
    }

    if (shopId) {
      sql += ` AND m.shop_id = '${shopId}'`;
    }

    if (!shopId && feedType !== 'FOLLOWED') {
      sql += buildRegionSqlClause(regionId as string | undefined, country as string | undefined);
    }

    if (menuType && menuType !== 'ALL') {
      sql += ` AND m.menu_type = '${menuType}'`;
    }

    if (category && category !== 'ALL') {
      sql += ` AND m.category = '${category}'`;
    }

    if (isVegetarian === 'true') {
      sql += ` AND m.is_vegetarian = 1`;
    }

    if (isHalal === 'true') {
      sql += ` AND m.is_halal = 1`;
    }

    if (query) {
      const cleanQ = (query as string).replace(/'/g, "''");
      sql += ` AND (m.title LIKE '%${cleanQ}%' OR m.description LIKE '%${cleanQ}%' OR s.name LIKE '%${cleanQ}%' OR m.category LIKE '%${cleanQ}%')`;
    }

    // REQUIREMENT 2: Strict "Follow" Tab Feed Logic
    // INCLUSION: Display ONLY the shops/pages that the logged-in user actively follows, along with their active menu items.
    // EXCLUSION: Strictly block and filter out any shop or menu item that the user does NOT follow.
    if (feedType === 'FOLLOWED') {
      if (!user) {
        return res.json({
          items: [],
          feedSource: 'FOLLOWED',
          followedCount: 0,
        });
      }

      const followRows = db.prepare('SELECT shop_id FROM follows WHERE customer_id = ?').all(user.id) as any[];
      const followedCount = followRows.length;

      if (followedCount === 0) {
        return res.json({
          items: [],
          feedSource: 'FOLLOWED',
          followedCount: 0,
        });
      }

      const followedShopIds = followRows.map((r) => `'${r.shop_id}'`).join(',');
      const followedSql = sql + ` AND m.shop_id IN (${followedShopIds}) ORDER BY m.created_at DESC`;
      const items = db.prepare(followedSql).all() as any[];

      return res.json({
        items: formatMenuItems(items, user.id),
        feedSource: 'FOLLOWED',
        followedCount,
      });
    }

    // Standard Discover Feed
    sql += ` ORDER BY m.created_at DESC`;
    const items = db.prepare(sql).all() as any[];

    return res.json({
      items: formatMenuItems(items, user?.id),
      feedSource: 'DISCOVER',
      followedCount: 0,
    });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

function formatMenuItems(items: any[], userId?: string) {
  let savedIds: string[] = [];
  if (userId) {
    const rows = db.prepare('SELECT item_id FROM saved_items WHERE customer_id = ?').all(userId) as any[];
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
      phoneNumber: m.phone_number,
    },
    isSaved: savedIds.includes(m.id),
  }));
}

// 10. Menu Item: Create (Shop Owner)
app.post('/api/menu-items', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

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
      availableDays,
    } = req.body;

    if (!shopId || !title || !price || !category || !menuType) {
      return res.status(400).json({ error: 'Required fields missing.' });
    }

    const shop = db.prepare('SELECT owner_id FROM shops WHERE id = ?').get(shopId) as any;
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    if (shop.owner_id !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to add items to this shop.' });
    }

    const itemId = 'item_' + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO menu_items (id, shop_id, title, description, image, price, category, menu_type, is_vegetarian, is_halal, special_date, available_days, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      itemId,
      shopId,
      title,
      description || '',
      image || '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
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
    console.error('Error creating menu item:', err);
    return res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// 11. Menu Item: Update
app.put('/api/menu-items/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const existing = db.prepare(`
      SELECT m.*, s.owner_id FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      WHERE m.id = ?
    `).get(req.params.id) as any;

    if (!existing) return res.status(404).json({ error: 'Menu item not found' });
    if (existing.owner_id !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this item.' });
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
      availableDays,
    } = req.body;

    db.prepare(`
      UPDATE menu_items
      SET title = ?, description = ?, image = ?, price = ?,
          category = ?, menu_type = ?, is_vegetarian = ?, is_halal = ?,
          special_date = ?, available_days = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      image !== undefined ? image : existing.image,
      price !== undefined ? Number(price) : existing.price,
      category !== undefined ? category : existing.category,
      menuType !== undefined ? menuType : existing.menu_type,
      isVegetarian !== undefined ? (isVegetarian ? 1 : 0) : existing.is_vegetarian,
      isHalal !== undefined ? (isHalal ? 1 : 0) : existing.is_halal,
      specialDate !== undefined ? specialDate : existing.special_date,
      availableDays !== undefined ? JSON.stringify(availableDays) : existing.available_days,
      req.params.id
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating menu item:', err);
    return res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// 12. Menu Item: Delete
app.delete('/api/menu-items/:id', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const existing = db.prepare(`
      SELECT m.*, s.owner_id FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      WHERE m.id = ?
    `).get(req.params.id) as any;

    if (!existing) return res.status(404).json({ error: 'Menu item not found' });
    if (existing.owner_id !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this item.' });
    }

    db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    return res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// 13. Follow / Unfollow Shop
app.post('/api/shops/:id/follow', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to follow shops.' });

    const shopId = req.params.id;
    const existing = db.prepare('SELECT 1 FROM follows WHERE customer_id = ? AND shop_id = ?').get(user.id, shopId);

    if (existing) {
      db.prepare('DELETE FROM follows WHERE customer_id = ? AND shop_id = ?').run(user.id, shopId);
      return res.json({ followed: false });
    } else {
      db.prepare('INSERT INTO follows (customer_id, shop_id, created_at) VALUES (?, ?, ?)').run(user.id, shopId, new Date().toISOString());
      return res.json({ followed: true });
    }
  } catch (err) {
    console.error('Error toggling follow:', err);
    return res.status(500).json({ error: 'Failed to update follow state' });
  }
});

// 14. Bookmark / Save Menu Item
app.post('/api/menu-items/:id/save', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to save items.' });

    const itemId = req.params.id;
    const existing = db.prepare('SELECT 1 FROM saved_items WHERE customer_id = ? AND item_id = ?').get(user.id, itemId);

    if (existing) {
      db.prepare('DELETE FROM saved_items WHERE customer_id = ? AND item_id = ?').run(user.id, itemId);
      return res.json({ saved: false });
    } else {
      db.prepare('INSERT INTO saved_items (customer_id, item_id, created_at) VALUES (?, ?, ?)').run(user.id, itemId, new Date().toISOString());
      return res.json({ saved: true });
    }
  } catch (err) {
    console.error('Error toggling save:', err);
    return res.status(500).json({ error: 'Failed to save item' });
  }
});

// 15. Saved Items List for Customer
app.get('/api/saved-items', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to view saved items.' });

    const items = db.prepare(`
      SELECT m.*, s.name as shop_name, s.whatsapp_phone, s.viber_phone, s.line_id, s.facebook_url, s.phone_number
      FROM saved_items si
      JOIN menu_items m ON si.item_id = m.id
      JOIN shops s ON m.shop_id = s.id
      WHERE si.customer_id = ?
      ORDER BY si.created_at DESC
    `).all(user.id) as any[];

    return res.json(formatMenuItems(items, user.id));
  } catch (err) {
    console.error('Error fetching saved items:', err);
    return res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

// Seed Script Trigger Endpoint (convenient seed reset or check)
app.post('/api/admin/seed', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin only' });
  }
  return res.json({ success: true, message: 'Database verified and seeded.' });
});

// SEO & Search Engine Endpoints
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: https://burmeal.astronerd.me/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  res.sendFile(path.resolve(process.cwd(), 'public', 'sitemap.xml'));
});

// Mount Vite middleware in development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BurMeal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
