import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MENU_ITEM_MAX_PER_TYPE,
  canSaveMenuItemForType,
  countMenuItemsByType,
  getMenuSlotSummary,
  getRemainingSlotsForMenuType,
  validateMenuItemLimit,
} from './menuLimitHelpers';
import { MenuItem } from '../types';

function makeDish(id: string, menuType: 'WEEKLY' | 'PERMANENT'): Pick<MenuItem, 'id' | 'menuType'> {
  return { id, menuType };
}

test('MENU_ITEM_MAX_PER_TYPE is set to 6', () => {
  assert.equal(MENU_ITEM_MAX_PER_TYPE, 6);
});

test('allows creating up to 6 Weekly and 6 Regular Menu items independently (12 total)', () => {
  const items: Array<Pick<MenuItem, 'id' | 'menuType'>> = [];

  for (let i = 1; i <= 6; i++) {
    const weeklyCheck = validateMenuItemLimit(items, 'WEEKLY');
    assert.equal(weeklyCheck.allowed, true);
    assert.equal(weeklyCheck.currentCount, i - 1);
    items.push(makeDish(`w_${i}`, 'WEEKLY'));

    const regularCheck = validateMenuItemLimit(items, 'PERMANENT');
    assert.equal(regularCheck.allowed, true);
    assert.equal(regularCheck.currentCount, i - 1);
    items.push(makeDish(`r_${i}`, 'PERMANENT'));
  }

  assert.equal(countMenuItemsByType(items, 'WEEKLY'), 6);
  assert.equal(countMenuItemsByType(items, 'PERMANENT'), 6);
  assert.equal(getRemainingSlotsForMenuType(items, 'WEEKLY'), 0);
  assert.equal(getRemainingSlotsForMenuType(items, 'PERMANENT'), 0);

  const summary = getMenuSlotSummary(items);
  assert.deepEqual(summary, {
    weeklyCount: 6,
    regularCount: 6,
    maxPerType: 6,
    isWeeklyFull: true,
    isRegularFull: true,
    areBothFull: true,
  });
});

test('blocks 7th Weekly and 7th Regular Menu item with descriptive error', () => {
  const items = [
    makeDish('w1', 'WEEKLY'),
    makeDish('w2', 'WEEKLY'),
    makeDish('w3', 'WEEKLY'),
    makeDish('w4', 'WEEKLY'),
    makeDish('w5', 'WEEKLY'),
    makeDish('w6', 'WEEKLY'),
    makeDish('r1', 'PERMANENT'),
    makeDish('r2', 'PERMANENT'),
    makeDish('r3', 'PERMANENT'),
    makeDish('r4', 'PERMANENT'),
    makeDish('r5', 'PERMANENT'),
    makeDish('r6', 'PERMANENT'),
  ];

  const seventhWeekly = validateMenuItemLimit(items, 'WEEKLY');
  assert.equal(seventhWeekly.allowed, false);
  assert.equal(seventhWeekly.currentCount, 6);
  assert.equal(seventhWeekly.remaining, 0);
  assert.match(seventhWeekly.error || '', /Weekly is limited to 6 items per shop/i);

  const seventhRegular = validateMenuItemLimit(items, 'PERMANENT');
  assert.equal(seventhRegular.allowed, false);
  assert.equal(seventhRegular.currentCount, 6);
  assert.equal(seventhRegular.remaining, 0);
  assert.match(seventhRegular.error || '', /Regular Menu is limited to 6 items per shop/i);
});

test('allows editing an existing item in place even when its menuType is at 6/6', () => {
  const items = [
    makeDish('w1', 'WEEKLY'),
    makeDish('w2', 'WEEKLY'),
    makeDish('w3', 'WEEKLY'),
    makeDish('w4', 'WEEKLY'),
    makeDish('w5', 'WEEKLY'),
    makeDish('w6', 'WEEKLY'),
  ];

  assert.equal(canSaveMenuItemForType(items, 'WEEKLY', 'w3'), true);
  assert.equal(canSaveMenuItemForType(items, 'WEEKLY'), false);
});

test('blocks switching an existing Regular item to Weekly when Weekly already has 6 items, and unlocks after removal', () => {
  const items = [
    makeDish('w1', 'WEEKLY'),
    makeDish('w2', 'WEEKLY'),
    makeDish('w3', 'WEEKLY'),
    makeDish('w4', 'WEEKLY'),
    makeDish('w5', 'WEEKLY'),
    makeDish('w6', 'WEEKLY'),
    makeDish('r1', 'PERMANENT'),
  ];

  // Switching r1 -> WEEKLY should fail while Weekly has 6
  const switchCheck = validateMenuItemLimit(items, 'WEEKLY', 'r1');
  assert.equal(switchCheck.allowed, false);

  // Keeping r1 as PERMANENT succeeds (1/6)
  assert.equal(canSaveMenuItemForType(items, 'PERMANENT', 'r1'), true);

  // Delete one Weekly dish -> now switching r1 -> WEEKLY succeeds
  const afterDelete = items.filter((i) => i.id !== 'w6');
  const retrySwitch = validateMenuItemLimit(afterDelete, 'WEEKLY', 'r1');
  assert.equal(retrySwitch.allowed, true);
  assert.equal(retrySwitch.currentCount, 5);
  assert.equal(retrySwitch.remaining, 1);
});
