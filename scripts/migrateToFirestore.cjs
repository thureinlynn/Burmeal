const Database = require('better-sqlite3');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, writeBatch, getDocs, collection, terminate } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDWO3qOyvvUsQ4igX1RFpqYJwblHF5zfD0',
  authDomain: 'burmeal-48966.firebaseapp.com',
  projectId: 'burmeal-48966',
  storageBucket: 'burmeal-48966.firebasestorage.app',
  messagingSenderId: '1034717391066',
  appId: '1:1034717391066:web:e8c51b067880ad41de9de3',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const DB_PATH = path.resolve(process.cwd(), 'data', 'burmeal.db');
const db = new Database(DB_PATH);

async function commitInChunks(items, chunkFn, chunkSize = 250) {
  let count = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const batch = writeBatch(firestore);
    for (const it of chunk) {
      chunkFn(batch, it);
    }
    await batch.commit();
    count += chunk.length;
    console.log(`Committed chunk: ${count}/${items.length}`);
  }
}

async function runMigration() {
  console.log('--- Starting SQLite to Firestore Migration ---');

  // 1. Fetch data from SQLite
  const users = db.prepare('SELECT * FROM users').all();
  const shops = db.prepare('SELECT * FROM shops').all();
  const menuItems = db.prepare('SELECT * FROM menu_items').all();
  const follows = db.prepare('SELECT * FROM follows').all();
  const savedItems = db.prepare('SELECT * FROM saved_items').all();

  console.log(`Found in SQLite: ${users.length} users, ${shops.length} shops, ${menuItems.length} menu items`);

  // Build shop map for quick lookup of shop metadata on menu items
  const shopMap = new Map();
  for (const s of shops) {
    shopMap.set(s.id, s);
  }

  // 2. Migrate Users to /users, /accounts, and /user_accounts
  console.log('Migrating users to /users, /accounts, /user_accounts...');
  await commitInChunks(users, (batch, u) => {
    const userData = {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatar_url || '',
      createdAt: u.created_at || new Date().toISOString(),
    };
    batch.set(doc(firestore, 'users', u.id), userData);
    batch.set(doc(firestore, 'accounts', u.id), userData);
    batch.set(doc(firestore, 'user_accounts', u.id), userData);
  });

  // 3. Migrate Shops
  console.log('Migrating shops to /shops...');
  await commitInChunks(shops, (batch, s) => {
    const ref = doc(firestore, 'shops', s.id);
    batch.set(ref, {
      id: s.id,
      ownerId: s.owner_id,
      name: s.name,
      bio: s.bio || '',
      coverImage: s.cover_image || '',
      avatarImage: s.avatar_image || '',
      status: s.status || 'APPROVED',
      cuisineType: s.cuisine_type || 'Burmese Cuisine',
      locationArea: s.location_area || '',
      address: s.address || '',
      city: s.city || '',
      region: s.region || '',
      country: s.country || '',
      facebookUrl: s.facebook_url || '',
      whatsappPhone: s.whatsapp_phone || '',
      viberPhone: s.viber_phone || '',
      lineId: s.line_id || '',
      phoneNumber: s.phone_number || '',
      createdAt: s.created_at || new Date().toISOString(),
    });
  });

  // 4. Migrate Menu Items to /menu_items and /items
  console.log('Migrating menu items to /menu_items and /items...');
  await commitInChunks(menuItems, (batch, item) => {
    const shop = shopMap.get(item.shop_id);
    let parsedDays = null;
    if (item.available_days) {
      try {
        parsedDays = JSON.parse(item.available_days);
      } catch {}
    }
    const itemData = {
      id: item.id,
      shopId: item.shop_id,
      shopName: shop ? shop.name : '',
      shopCountry: shop ? shop.country : '',
      shopRegion: shop ? shop.region : '',
      shopCity: shop ? shop.city : '',
      country: shop ? shop.country : '',
      title: item.title,
      description: item.description || '',
      image: item.image || '',
      price: Number(item.price) || 0,
      category: item.category || 'Noodles & Broth',
      menuType: item.menu_type || 'PERMANENT',
      isVegetarian: Boolean(item.is_vegetarian),
      isHalal: Boolean(item.is_halal),
      specialDate: item.special_date || null,
      availableDays: parsedDays,
      createdAt: item.created_at || new Date().toISOString(),
    };
    batch.set(doc(firestore, 'menu_items', item.id), itemData);
    batch.set(doc(firestore, 'items', item.id), itemData);
  });

  // 5. Migrate Follows
  if (follows.length > 0) {
    console.log(`Migrating ${follows.length} follows to /follows...`);
    await commitInChunks(follows, (batch, f) => {
      const followId = `${f.customer_id}_${f.shop_id}`;
      const ref = doc(firestore, 'follows', followId);
      batch.set(ref, {
        id: followId,
        customerId: f.customer_id,
        shopId: f.shop_id,
        createdAt: f.created_at || new Date().toISOString(),
      });
    });
  }

  // 6. Migrate Saved Items
  if (savedItems.length > 0) {
    console.log(`Migrating ${savedItems.length} saved items to /saved_items...`);
    await commitInChunks(savedItems, (batch, si) => {
      const savedId = `${si.customer_id}_${si.item_id}`;
      const ref = doc(firestore, 'saved_items', savedId);
      batch.set(ref, {
        id: savedId,
        customerId: si.customer_id,
        itemId: si.item_id,
        createdAt: si.created_at || new Date().toISOString(),
      });
    });
  }

  // Update migration marker in /system/metadata
  const metaRef = doc(firestore, 'system', 'metadata');
  const batch = writeBatch(firestore);
  batch.set(metaRef, {
    version: '1.0.0',
    lastMigratedAt: new Date().toISOString(),
    usersCount: users.length,
    shopsCount: shops.length,
    menuItemsCount: menuItems.length,
    status: 'ACTIVE_PRODUCTION',
  });
  await batch.commit();

  console.log('=== Migration Complete! Verifying Firestore counts... ===');

  const shopsSnap = await getDocs(collection(firestore, 'shops'));
  const menuItemsSnap = await getDocs(collection(firestore, 'menu_items'));
  const itemsSnap = await getDocs(collection(firestore, 'items'));
  const usersSnap = await getDocs(collection(firestore, 'users'));
  const accountsSnap = await getDocs(collection(firestore, 'accounts'));
  const userAccountsSnap = await getDocs(collection(firestore, 'user_accounts'));

  console.log(`Firestore verified count:`);
  console.log(`- /shops: ${shopsSnap.size}`);
  console.log(`- /menu_items: ${menuItemsSnap.size}`);
  console.log(`- /items: ${itemsSnap.size}`);
  console.log(`- /users: ${usersSnap.size}`);
  console.log(`- /accounts: ${accountsSnap.size}`);
  console.log(`- /user_accounts: ${userAccountsSnap.size}`);

  await terminate(firestore);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
