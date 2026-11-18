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
import { Shop, MenuItem, User, DailySpecialPost } from '../types';
import { stripUndefined } from '../utils/authHelpers';
import { mergeUniqueIds } from '../utils/userDataHelpers';
import {
  computeDailySpecialExpiry,
  partitionDailySpecialPosts,
} from '../utils/dailySpecialHelpers';
import { removeDailySpecialImage } from './supabaseClient';

function normalizeEmail(email?: string | null): string {
  return email ? email.trim().toLowerCase() : '';
}

export const firestoreService = {
  // Helper to dynamically calculate follower counts from follows collection
  async calculateFollowerCounts(shops: Shop[]): Promise<Shop[]> {
    if (!shops.length) return shops;
    try {
      const followsSnap = await getDocs(collection(db, 'follows'));
      const counts = new Map<string, number>();
      followsSnap.forEach((d) => {
        const data = d.data();
        const sId = data?.shopId;
        if (sId) {
          counts.set(sId, (counts.get(sId) || 0) + 1);
        }
      });
      return shops.map((s) => ({
        ...s,
        followerCount: counts.get(s.id) || 0,
      }));
    } catch {
      return shops;
    }
  },

  // 1. Subscribe to all approved shops with realtime updates (dynamically reflecting follower count)
  subscribeShops(onUpdate: (shops: Shop[]) => void): () => void {
    let latestShops: Shop[] = [];
    let latestFollows: Array<{ shopId?: string }> = [];

    const update = () => {
      const counts = new Map<string, number>();
      latestFollows.forEach((f) => {
        if (f.shopId) counts.set(f.shopId, (counts.get(f.shopId) || 0) + 1);
      });
      const mapped = latestShops.map((s) => ({
        ...s,
        followerCount: counts.get(s.id) || 0,
      }));
      onUpdate(mapped);
    };

    const unsubShops = onSnapshot(
      collection(db, 'shops'),
      (snapshot) => {
        const list: Shop[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Shop);
        });
        latestShops = list;
        update();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'shops');
      }
    );

    const unsubFollows = onSnapshot(
      collection(db, 'follows'),
      (snapshot) => {
        const list: Array<{ shopId?: string }> = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data());
        });
        latestFollows = list;
        update();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'follows');
      }
    );

    return () => {
      unsubShops();
      unsubFollows();
    };
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
      ownerEmail: shop.ownerEmail ? normalizeEmail(shop.ownerEmail) : shop.ownerEmail,
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
    const cleanData = stripUndefined({
      ...data,
      ...(data.ownerEmail !== undefined ? { ownerEmail: normalizeEmail(data.ownerEmail) } : {}),
    });
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
    const trimmed = email.trim();
    const lowered = normalizeEmail(email);
    if (!lowered) return null;
    const candidates = Array.from(new Set([lowered, trimmed]));
    try {
      for (const candidate of candidates) {
        const snap = await getDocs(query(collection(db, 'users'), where('email', '==', candidate)));
        if (!snap.empty) {
          const validDoc = snap.docs.find((d) => Boolean((d.data()?.email || '').trim()));
          return ((validDoc || snap.docs[0]).data() as User);
        }
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      return null;
    }
  },

  async saveUserProfile(user: User): Promise<void> {
    const normalizedEmail = user.email ? user.email.trim() : '';
    const cleanUser = stripUndefined({
      ...user,
      email: normalizedEmail,
    }) as User;
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
      if (!snap.exists()) return null;
      const updated = await this.calculateFollowerCounts([snap.data() as Shop]);
      return updated[0] || null;
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
        const updated = await this.calculateFollowerCounts([snap.docs[0].data() as Shop]);
        return updated[0] || null;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'shops');
      return null;
    }
  },

  async getShopByOwnerEmail(ownerEmail: string): Promise<Shop | null> {
    const trimmed = ownerEmail.trim();
    const lowered = normalizeEmail(ownerEmail);
    if (!lowered) return null;
    const candidates = Array.from(new Set([lowered, trimmed]));
    try {
      let foundShop: Shop | null = null;
      for (const candidate of candidates) {
        const snap = await getDocs(query(collection(db, 'shops'), where('ownerEmail', '==', candidate)));
        if (!snap.empty) {
          foundShop = snap.docs[0].data() as Shop;
          break;
        }
      }
      if (!foundShop) {
        // Fallback: scan shops collection in case ownerEmail had mixed casing in legacy docs
        const allSnap = await getDocs(collection(db, 'shops'));
        for (const d of allSnap.docs) {
          const data = d.data() as Shop;
          if (data?.ownerEmail && normalizeEmail(data.ownerEmail) === lowered) {
            foundShop = data;
            break;
          }
        }
      }
      if (!foundShop) return null;
      const updated = await this.calculateFollowerCounts([foundShop]);
      return updated[0] || null;
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
      return await this.calculateFollowerCounts(list);
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

  // 14. Daily Special Facebook-style Posts (48h auto-expiry + Supabase image cleanup)
  subscribeDailySpecialPosts(onUpdate: (posts: DailySpecialPost[]) => void): () => void {
    const colRef = collection(db, 'daily_special_posts');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const raw: DailySpecialPost[] = [];
        snapshot.forEach((docSnap) => {
          raw.push(docSnap.data() as DailySpecialPost);
        });
        const { active, expired } = partitionDailySpecialPosts(raw);
        if (expired.length > 0) {
          void Promise.all(
            expired.map(async (exp) => {
              await removeDailySpecialImage(exp.imageStoragePath || exp.image).catch(() => {});
              await deleteDoc(doc(db, 'daily_special_posts', exp.id)).catch(() => {});
            })
          );
        }
        onUpdate(active);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'daily_special_posts');
      }
    );
  },

  async getDailySpecialPostsByShopId(shopId: string): Promise<DailySpecialPost[]> {
    const q = query(collection(db, 'daily_special_posts'), where('shopId', '==', shopId));
    try {
      const snap = await getDocs(q);
      const raw: DailySpecialPost[] = [];
      snap.forEach((docSnap) => {
        raw.push(docSnap.data() as DailySpecialPost);
      });
      const { active, expired } = partitionDailySpecialPosts(raw);
      if (expired.length > 0) {
        void Promise.all(
          expired.map(async (exp) => {
            await removeDailySpecialImage(exp.imageStoragePath || exp.image).catch(() => {});
            await deleteDoc(doc(db, 'daily_special_posts', exp.id)).catch(() => {});
          })
        );
      }
      return active;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'daily_special_posts');
      return [];
    }
  },

  async createDailySpecialPost(post: DailySpecialPost): Promise<DailySpecialPost> {
    const postId =
      post.id || `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = post.createdAt || new Date().toISOString();
    const expiresAt = post.expiresAt || computeDailySpecialExpiry(createdAt);
    const fullPost = stripUndefined({
      ...post,
      id: postId,
      createdAt,
      expiresAt,
    }) as DailySpecialPost;

    try {
      await setDoc(doc(db, 'daily_special_posts', postId), fullPost);
      return fullPost;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `daily_special_posts/${postId}`);
      throw error;
    }
  },

  async updateDailySpecialPost(
    postId: string,
    updates: Partial<DailySpecialPost> & { title: string; post: string },
    oldImageOrPathToRemove?: string | null
  ): Promise<void> {
    try {
      const payload = stripUndefined({
        ...updates,
        id: postId,
        title: updates.title.trim(),
        post: updates.post.trim(),
        image: updates.image !== undefined ? updates.image : undefined,
        imageStoragePath:
          updates.imageStoragePath !== undefined ? updates.imageStoragePath : undefined,
        expiresAt:
          updates.expiresAt ||
          (updates.createdAt ? computeDailySpecialExpiry(updates.createdAt) : undefined),
      });
      await setDoc(doc(db, 'daily_special_posts', postId), payload, { merge: true });
      if (oldImageOrPathToRemove) {
        await removeDailySpecialImage(oldImageOrPathToRemove).catch(() => {});
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `daily_special_posts/${postId}`);
      throw error;
    }
  },

  async deleteDailySpecialPost(postId: string, imageOrPath?: string | null): Promise<void> {
    try {
      await removeDailySpecialImage(imageOrPath).catch(() => {});
      await deleteDoc(doc(db, 'daily_special_posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `daily_special_posts/${postId}`);
      throw error;
    }
  },
};

