import {
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { Shop, MenuItem, User } from '../types';
import { stripUndefined } from '../utils/authHelpers';
import { mergeUniqueIds } from '../utils/userDataHelpers';

function normalizeEmail(email?: string | null): string {
  return email ? email.trim().toLowerCase() : '';
}

export const firestoreService = {
  // 1. Subscribe to all approved shops with realtime updates
  subscribeShops(onUpdate: (shops: Shop[]) => void): () => void {
    const colRef = collection(db, 'shops');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const shops: Shop[] = [];
        snapshot.forEach((docSnap) => {
          shops.push(docSnap.data() as Shop);
        });
        onUpdate(shops);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'shops');
      }
    );
  },

  // 2. Subscribe to menu items with realtime updates
  subscribeMenuItems(onUpdate: (items: MenuItem[]) => void): () => void {
    const colRef = collection(db, 'menu_items');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: MenuItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as MenuItem);
        });
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'menu_items');
      }
    );
  },

  // 3. Subscribe to customer followed shops (by UID and normalized email for cross-device continuity)
  subscribeFollows(
    customerId: string,
    onUpdate: (shopIds: string[]) => void,
    customerEmail?: string | null
  ): () => void {
    const cleanEmail = normalizeEmail(customerEmail);
    if (!customerId && !cleanEmail) {
      onUpdate([]);
      return () => {};
    }

    let byUidIds: string[] = [];
    let byEmailIds: string[] = [];
    const emit = () => onUpdate(mergeUniqueIds(byUidIds, byEmailIds));

    const unsubs: Array<() => void> = [];

    if (customerId) {
      const qUid = query(collection(db, 'follows'), where('customerId', '==', customerId));
      unsubs.push(
        onSnapshot(
          qUid,
          (snapshot) => {
            const ids: string[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && data.shopId) ids.push(data.shopId);
            });
            byUidIds = ids;
            emit();
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'follows');
          }
        )
      );
    }

    if (cleanEmail) {
      const qEmail = query(collection(db, 'follows'), where('customerEmail', '==', cleanEmail));
      unsubs.push(
        onSnapshot(
          qEmail,
          (snapshot) => {
            const ids: string[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && data.shopId) ids.push(data.shopId);
            });
            byEmailIds = ids;
            emit();
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'follows');
          }
        )
      );
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  },

  async getFollowedShopIds(customerId: string, customerEmail?: string | null): Promise<string[]> {
    const cleanEmail = normalizeEmail(customerEmail);
    if (!customerId && !cleanEmail) return [];
    const lists: string[][] = [];
    try {
      if (customerId) {
        const snap = await getDocs(query(collection(db, 'follows'), where('customerId', '==', customerId)));
        lists.push(snap.docs.map((d) => d.data()?.shopId).filter(Boolean));
      }
      if (cleanEmail) {
        const snap = await getDocs(query(collection(db, 'follows'), where('customerEmail', '==', cleanEmail)));
        lists.push(snap.docs.map((d) => d.data()?.shopId).filter(Boolean));
      }
      return mergeUniqueIds(...lists);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'follows');
      return [];
    }
  },

  // 4. Subscribe to customer saved items (bookmarks) by UID and normalized email
  subscribeSavedItems(
    customerId: string,
    onUpdate: (itemIds: string[]) => void,
    customerEmail?: string | null
  ): () => void {
    const cleanEmail = normalizeEmail(customerEmail);
    if (!customerId && !cleanEmail) {
      onUpdate([]);
      return () => {};
    }

    let byUidIds: string[] = [];
    let byEmailIds: string[] = [];
    const emit = () => onUpdate(mergeUniqueIds(byUidIds, byEmailIds));

    const unsubs: Array<() => void> = [];

    if (customerId) {
      const qUid = query(collection(db, 'saved_items'), where('customerId', '==', customerId));
      unsubs.push(
        onSnapshot(
          qUid,
          (snapshot) => {
            const ids: string[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && data.itemId) ids.push(data.itemId);
            });
            byUidIds = ids;
            emit();
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'saved_items');
          }
        )
      );
    }

    if (cleanEmail) {
      const qEmail = query(collection(db, 'saved_items'), where('customerEmail', '==', cleanEmail));
      unsubs.push(
        onSnapshot(
          qEmail,
          (snapshot) => {
            const ids: string[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data && data.itemId) ids.push(data.itemId);
            });
            byEmailIds = ids;
            emit();
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'saved_items');
          }
        )
      );
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  },

  async getSavedItemIds(customerId: string, customerEmail?: string | null): Promise<string[]> {
    const cleanEmail = normalizeEmail(customerEmail);
    if (!customerId && !cleanEmail) return [];
    const lists: string[][] = [];
    try {
      if (customerId) {
        const snap = await getDocs(query(collection(db, 'saved_items'), where('customerId', '==', customerId)));
        lists.push(snap.docs.map((d) => d.data()?.itemId).filter(Boolean));
      }
      if (cleanEmail) {
        const snap = await getDocs(query(collection(db, 'saved_items'), where('customerEmail', '==', cleanEmail)));
        lists.push(snap.docs.map((d) => d.data()?.itemId).filter(Boolean));
      }
      return mergeUniqueIds(...lists);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'saved_items');
      return [];
    }
  },

  // 5. Toggle Follow shop (stores customerId + customerEmail and cleans up any email/UID duplicates on unfollow)
  async toggleFollow(
    customerId: string,
    shopId: string,
    customerEmail?: string | null,
    desiredState?: boolean
  ): Promise<boolean> {
    const cleanEmail = normalizeEmail(customerEmail);
    const followId = `${customerId}_${shopId}`;
    const ref = doc(db, 'follows', followId);
    try {
      const matchingRefs = new Map<string, ReturnType<typeof doc>>();
      const directSnap = await getDoc(ref);
      if (directSnap.exists()) {
        matchingRefs.set(ref.id, ref);
      }

      if (customerId) {
        const uidSnap = await getDocs(query(collection(db, 'follows'), where('customerId', '==', customerId)));
        uidSnap.forEach((d) => {
          if (d.data()?.shopId === shopId) {
            matchingRefs.set(d.id, d.ref);
          }
        });
      }

      if (cleanEmail) {
        const emailSnap = await getDocs(query(collection(db, 'follows'), where('customerEmail', '==', cleanEmail)));
        emailSnap.forEach((d) => {
          if (d.data()?.shopId === shopId) {
            matchingRefs.set(d.id, d.ref);
          }
        });
      }

      const targetState = typeof desiredState === 'boolean' ? desiredState : matchingRefs.size === 0;

      if (!targetState) {
        await Promise.all(Array.from(matchingRefs.values()).map((r) => deleteDoc(r)));
        return false; // unfollowed
      } else {
        await setDoc(
          ref,
          stripUndefined({
            id: followId,
            customerId,
            customerEmail: cleanEmail || undefined,
            shopId,
            createdAt: new Date().toISOString(),
          })
        );
        return true; // followed
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `follows/${followId}`);
      throw error;
    }
  },

  // 6. Toggle Save menu item (bookmark) with cross-device UID + normalized email continuity
  async toggleSaveItem(
    customerId: string,
    itemId: string,
    customerEmail?: string | null,
    desiredState?: boolean
  ): Promise<boolean> {
    const cleanEmail = normalizeEmail(customerEmail);
    const savedId = `${customerId}_${itemId}`;
    const ref = doc(db, 'saved_items', savedId);
    try {
      const matchingRefs = new Map<string, ReturnType<typeof doc>>();
      const directSnap = await getDoc(ref);
      if (directSnap.exists()) {
        matchingRefs.set(ref.id, ref);
      }

      if (customerId) {
        const uidSnap = await getDocs(query(collection(db, 'saved_items'), where('customerId', '==', customerId)));
        uidSnap.forEach((d) => {
          if (d.data()?.itemId === itemId) {
            matchingRefs.set(d.id, d.ref);
          }
        });
      }

      if (cleanEmail) {
        const emailSnap = await getDocs(query(collection(db, 'saved_items'), where('customerEmail', '==', cleanEmail)));
        emailSnap.forEach((d) => {
          if (d.data()?.itemId === itemId) {
            matchingRefs.set(d.id, d.ref);
          }
        });
      }

      const targetState = typeof desiredState === 'boolean' ? desiredState : matchingRefs.size === 0;

      if (!targetState) {
        await Promise.all(Array.from(matchingRefs.values()).map((r) => deleteDoc(r)));
        return false; // unsaved
      } else {
        await setDoc(
          ref,
          stripUndefined({
            id: savedId,
            customerId,
            customerEmail: cleanEmail || undefined,
            itemId,
            createdAt: new Date().toISOString(),
          })
        );
        return true; // saved
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `saved_items/${savedId}`);
      throw error;
    }
  },

  // 7. Create Menu Item in Firestore (both /menu_items and /items)
  async createMenuItem(item: MenuItem): Promise<MenuItem> {
    const itemId = item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullItem = stripUndefined({
      ...item,
      id: itemId,
      createdAt: item.createdAt || new Date().toISOString(),
    }) as MenuItem;
    try {
      await Promise.all([
        setDoc(doc(db, 'menu_items', itemId), fullItem),
        setDoc(doc(db, 'items', itemId), fullItem),
      ]);
      return fullItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `menu_items/${itemId}`);
      throw error;
    }
  },

  // 8. Update Menu Item in Firestore (both /menu_items and /items)
  async updateMenuItem(itemId: string, data: Partial<MenuItem>): Promise<void> {
    const cleanData = stripUndefined(data);
    try {
      await Promise.all([
        setDoc(doc(db, 'menu_items', itemId), cleanData, { merge: true }),
        setDoc(doc(db, 'items', itemId), cleanData, { merge: true }),
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menu_items/${itemId}`);
      throw error;
    }
  },

  // 9. Delete Menu Item in Firestore (both /menu_items and /items)
  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      await Promise.all([
        deleteDoc(doc(db, 'menu_items', itemId)),
        deleteDoc(doc(db, 'items', itemId)),
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `menu_items/${itemId}`);
      throw error;
    }
  },

  // 10. Create Shop in Firestore
  async createShop(shop: Shop): Promise<Shop> {
    const shopId = shop.id || `shop_${Date.now()}`;
    const fullShop = stripUndefined({
      ...shop,
      id: shopId,
      createdAt: shop.createdAt || new Date().toISOString(),
    }) as Shop;
    const ref = doc(db, 'shops', shopId);
    try {
      await setDoc(ref, fullShop);
      return fullShop;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `shops/${shopId}`);
      throw error;
    }
  },

  // 11. Update Shop profile in Firestore
  async updateShop(shopId: string, data: Partial<Shop>): Promise<void> {
    const ref = doc(db, 'shops', shopId);
    const cleanData = stripUndefined(data);
    try {
      await setDoc(ref, cleanData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shops/${shopId}`);
      throw error;
    }
  },

  // 12. User profile operations in /users/{userId} and /accounts/{userId}
  async getUserProfile(userId: string): Promise<User | null> {
    const ref = doc(db, 'users', userId);
    try {
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as User) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as User;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      return null;
    }
  },

  async saveUserProfile(user: User): Promise<void> {
    const cleanUser = stripUndefined(user) as User;
    try {
      await Promise.all([
        setDoc(doc(db, 'users', user.id), cleanUser, { merge: true }),
        setDoc(doc(db, 'accounts', user.id), cleanUser, { merge: true }),
        setDoc(doc(db, 'user_accounts', user.id), cleanUser, { merge: true }),
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
      throw error;
    }
  },

  // 13. Find Shop by ID, Owner UID, or Owner Email
  async getShopById(shopId: string): Promise<Shop | null> {
    const ref = doc(db, 'shops', shopId);
    try {
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as Shop) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `shops/${shopId}`);
      return null;
    }
  },

  async getShopByOwnerId(ownerId: string): Promise<Shop | null> {
    const q = query(collection(db, 'shops'), where('ownerId', '==', ownerId));
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as Shop;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'shops');
      return null;
    }
  },

  async getShopByOwnerEmail(ownerEmail: string): Promise<Shop | null> {
    const q = query(collection(db, 'shops'), where('ownerEmail', '==', ownerEmail));
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as Shop;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'shops');
      return null;
    }
  },

  async getMenuItemsByShopId(shopId: string): Promise<MenuItem[]> {
    const q = query(collection(db, 'menu_items'), where('shopId', '==', shopId));
    try {
      const snap = await getDocs(q);
      const list: MenuItem[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as MenuItem);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'menu_items');
      return [];
    }
  },

  async getAllShops(): Promise<Shop[]> {
    try {
      const snap = await getDocs(collection(db, 'shops'));
      const list: Shop[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as Shop);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'shops');
      return [];
    }
  },

  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const snap = await getDocs(collection(db, 'menu_items'));
      const list: MenuItem[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as MenuItem);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'menu_items');
      return [];
    }
  },
};
