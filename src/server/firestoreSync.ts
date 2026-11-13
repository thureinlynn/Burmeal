import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const serverDb = getFirestore(app);

export async function syncShopToFirestore(shop: any) {
  try {
    const ref = doc(serverDb, 'shops', shop.id);
    await setDoc(
      ref,
      {
        id: shop.id,
        ownerId: shop.ownerId || shop.owner_id,
        name: shop.name,
        bio: shop.bio || '',
        coverImage: shop.coverImage || shop.cover_image || '',
        avatarImage: shop.avatarImage || shop.avatar_image || '',
        status: shop.status || 'APPROVED',
        cuisineType: shop.cuisineType || shop.cuisine_type || 'Burmese Cuisine',
        locationArea: shop.locationArea || shop.location_area || '',
        address: shop.address || '',
        city: shop.city || '',
        region: shop.region || '',
        country: shop.country || '',
        facebookUrl: shop.facebookUrl || shop.facebook_url || '',
        whatsappPhone: shop.whatsappPhone || shop.whatsapp_phone || '',
        viberPhone: shop.viberPhone || shop.viber_phone || '',
        lineId: shop.lineId || shop.line_id || '',
        phoneNumber: shop.phoneNumber || shop.phone_number || '',
        createdAt: shop.createdAt || shop.created_at || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('syncShopToFirestore error:', err);
  }
}

export async function syncMenuItemToFirestore(item: any, shop?: any) {
  try {
    const payload = {
      id: item.id,
      shopId: item.shopId || item.shop_id,
      shopName: item.shopName || shop?.name || '',
      shopCountry: item.shopCountry || shop?.country || '',
      shopRegion: item.shopRegion || shop?.region || '',
      shopCity: item.shopCity || shop?.city || '',
      country: item.country || shop?.country || '',
      title: item.title,
      description: item.description || '',
      image: item.image || '',
      price: Number(item.price) || 0,
      category: item.category || 'Noodles & Broth',
      menuType: item.menuType || item.menu_type || 'PERMANENT',
      isVegetarian: Boolean(item.isVegetarian ?? item.is_vegetarian),
      isHalal: Boolean(item.isHalal ?? item.is_halal),
      specialDate: item.specialDate || item.special_date || null,
      availableDays: item.availableDays || (item.available_days ? JSON.parse(item.available_days) : null),
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    };
    await Promise.all([
      setDoc(doc(serverDb, 'menu_items', item.id), payload, { merge: true }),
      setDoc(doc(serverDb, 'items', item.id), payload, { merge: true }),
    ]);
  } catch (err) {
    console.warn('syncMenuItemToFirestore error:', err);
  }
}

export async function deleteMenuItemFromFirestore(itemId: string) {
  try {
    await Promise.all([
      deleteDoc(doc(serverDb, 'menu_items', itemId)),
      deleteDoc(doc(serverDb, 'items', itemId)),
    ]);
  } catch (err) {
    console.warn('deleteMenuItemFromFirestore error:', err);
  }
}

export async function syncUserToFirestore(user: any) {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl || user.avatar_url || '',
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    };
    await Promise.all([
      setDoc(doc(serverDb, 'users', user.id), payload, { merge: true }),
      setDoc(doc(serverDb, 'accounts', user.id), payload, { merge: true }),
      setDoc(doc(serverDb, 'user_accounts', user.id), payload, { merge: true }),
    ]);
  } catch (err) {
    console.warn('syncUserToFirestore error:', err);
  }
}

export async function syncFollowToFirestore(
  customerId: string,
  shopId: string,
  isFollowed: boolean,
  customerEmail?: string
) {
  try {
    const followId = `${customerId}_${shopId}`;
    const ref = doc(serverDb, 'follows', followId);
    if (isFollowed) {
      await setDoc(ref, {
        id: followId,
        customerId,
        customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : '',
        shopId,
        createdAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn('syncFollowToFirestore error:', err);
  }
}

export async function syncSavedItemToFirestore(
  customerId: string,
  itemId: string,
  isSaved: boolean,
  customerEmail?: string
) {
  try {
    const savedId = `${customerId}_${itemId}`;
    const ref = doc(serverDb, 'saved_items', savedId);
    if (isSaved) {
      await setDoc(ref, {
        id: savedId,
        customerId,
        customerEmail: customerEmail ? customerEmail.trim().toLowerCase() : '',
        itemId,
        createdAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn('syncSavedItemToFirestore error:', err);
  }
}
