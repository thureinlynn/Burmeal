import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildItemSharePayload,
  buildShareUrl,
  buildShopSharePayload,
  executeShare,
  parseShareTargetFromSearch,
} from './shareHelpers.ts';

test('buildShareUrl constructs clean item and shop links replacing previous share params', () => {
  assert.equal(
    buildShareUrl('https://burmeal.app/?shop=old_shop&foo=1', { type: 'item', id: 'item_42' }),
    'https://burmeal.app/?foo=1&item=item_42'
  );
  assert.equal(
    buildShareUrl('https://burmeal.app/?item=item_42', { type: 'shop', id: 'shop_7' }),
    'https://burmeal.app/?shop=shop_7'
  );
});

test('parseShareTargetFromSearch extracts itemId and shopId cleanly', () => {
  assert.deepEqual(parseShareTargetFromSearch('?item=item_99'), {
    itemId: 'item_99',
    shopId: undefined,
  });
  assert.deepEqual(parseShareTargetFromSearch('shop=shop_12'), {
    itemId: undefined,
    shopId: 'shop_12',
  });
  assert.deepEqual(parseShareTargetFromSearch(''), {});
});

test('buildItemSharePayload and buildShopSharePayload format descriptive share metadata', () => {
  const itemPayload = buildItemSharePayload(
    { id: 'itm_1', title: 'Royal Fish Mohinga', shopName: 'Golden Rangoon' },
    'https://burmeal.app/'
  );
  assert.equal(itemPayload.url, 'https://burmeal.app/?item=itm_1');
  assert.ok(itemPayload.title.includes('Royal Fish Mohinga'));
  assert.ok(itemPayload.text.includes('Golden Rangoon'));

  const shopPayload = buildShopSharePayload(
    { id: 'shp_1', name: 'Siam Burmese Kitchen', city: 'Bangkok', country: 'Thailand' },
    'https://burmeal.app/'
  );
  assert.equal(shopPayload.url, 'https://burmeal.app/?shop=shp_1');
  assert.ok(shopPayload.title.includes('Siam Burmese Kitchen'));
  assert.ok(shopPayload.text.includes('Bangkok, Thailand'));
});

test('executeShare handles native share, AbortError cancellation, and clipboard fallback', async () => {
  const sample = { title: 'Test', text: 'Test dish', url: 'https://burmeal.app/?item=1' };

  let sharedUrl = '';
  const nativeOutcome = await executeShare(sample, {
    share: async (d) => {
      sharedUrl = d.url;
    },
  });
  assert.equal(nativeOutcome, 'shared');
  assert.equal(sharedUrl, sample.url);

  const cancelledOutcome = await executeShare(sample, {
    share: async () => {
      const err = new Error('User cancelled');
      err.name = 'AbortError';
      throw err;
    },
    writeText: async () => {
      throw new Error('Should not copy on user cancellation');
    },
  });
  assert.equal(cancelledOutcome, 'cancelled');

  let copiedText = '';
  const fallbackOutcome = await executeShare(sample, {
    share: async () => {
      throw new Error('NotAllowedError');
    },
    writeText: async (text) => {
      copiedText = text;
    },
  });
  assert.equal(fallbackOutcome, 'copied');
  assert.equal(copiedText, sample.url);
});
