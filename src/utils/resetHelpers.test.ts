import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_RESET_EPOCH,
  BURMEAL_STORAGE_KEYS,
  RESET_EPOCH_STORAGE_KEY,
  applyOneTimeClientReset,
  type StorageLike,
} from './resetHelpers';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & { store: Map<string, string> } {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    store,
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

test('applyOneTimeClientReset clears all legacy BurMeal keys on first run and sets epoch', () => {
  const initial: Record<string, string> = {
    unrelated_key: 'keep-me',
  };
  for (const key of BURMEAL_STORAGE_KEYS) {
    initial[key] = `stale-${key}`;
  }

  const storage = createMemoryStorage(initial);
  const result = applyOneTimeClientReset(storage);

  assert.equal(result.didReset, true);
  assert.equal(result.epoch, APP_RESET_EPOCH);
  assert.equal(storage.getItem(RESET_EPOCH_STORAGE_KEY), APP_RESET_EPOCH);
  assert.equal(storage.getItem('unrelated_key'), 'keep-me');

  for (const key of BURMEAL_STORAGE_KEYS) {
    assert.equal(storage.getItem(key), null, `Expected ${key} to be cleared`);
  }
});

test('applyOneTimeClientReset does not clear keys once epoch is already applied', () => {
  const storage = createMemoryStorage({
    [RESET_EPOCH_STORAGE_KEY]: APP_RESET_EPOCH,
    burmeal_token: 'tok_new_user',
    burmeal_country: 'Japan',
    burmeal_region_id: 'JP-TYO',
  });

  const result = applyOneTimeClientReset(storage);

  assert.equal(result.didReset, false);
  assert.equal(storage.getItem('burmeal_token'), 'tok_new_user');
  assert.equal(storage.getItem('burmeal_country'), 'Japan');
  assert.equal(storage.getItem('burmeal_region_id'), 'JP-TYO');
});

test('applyOneTimeClientReset handles null or throwing storage gracefully', () => {
  const nullResult = applyOneTimeClientReset(null);
  assert.equal(nullResult.didReset, false);

  const throwingStorage: StorageLike = {
    getItem() {
      throw new Error('storage blocked');
    },
    setItem() {},
    removeItem() {},
  };
  const errResult = applyOneTimeClientReset(throwingStorage);
  assert.equal(errResult.didReset, false);
});
