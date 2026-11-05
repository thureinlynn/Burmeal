import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMenuItems, buildContactLinks } from './filter';
import { MenuItem } from '../types';

const mockItems: MenuItem[] = [
  {
    id: 'm1',
    shopId: 's1',
    shopName: 'Mandalay Morning Teahouse',
    title: 'Traditional Mohinga',
    description: 'Aromatic lemongrass fish noodle soup',
    image: '/test.jpg',
    price: 8.5,
    category: 'Noodles',
    menuType: 'SPECIAL',
    isVegetarian: false,
    isHalal: true,
    specialDate: '2026-11-05',
    createdAt: '2026-11-05T08:00:00Z',
  },
  {
    id: 'm2',
    shopId: 's1',
    shopName: 'Mandalay Morning Teahouse',
    title: 'Crispy Samosa Thoke',
    description: 'Crushed vegetarian samosa salad',
    image: '/test2.jpg',
    price: 6.0,
    category: 'Salads',
    menuType: 'PERMANENT',
    isVegetarian: true,
    isHalal: true,
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'm3',
    shopId: 's2',
    shopName: 'Golden Rangoon Kitchen',
    title: 'Coconut Chicken Noodle (Ohn No Khao Swè)',
    description: 'Creamy coconut curried broth with egg',
    image: '/test3.jpg',
    price: 11.0,
    category: 'Noodles',
    menuType: 'WEEKLY',
    isVegetarian: false,
    isHalal: false,
    availableDays: ['Tue', 'Thu', 'Sat'],
    createdAt: '2026-11-03T08:00:00Z',
  },
];

test('filterMenuItems filters by search query matching title and shop', () => {
  const result1 = filterMenuItems(mockItems, { query: 'mohinga' });
  assert.equal(result1.length, 1);
  assert.equal(result1[0].id, 'm1');

  const result2 = filterMenuItems(mockItems, { query: 'Rangoon' });
  assert.equal(result2.length, 1);
  assert.equal(result2[0].id, 'm3');
});

test('filterMenuItems filters by menu type', () => {
  const specials = filterMenuItems(mockItems, { menuType: 'SPECIAL' });
  assert.equal(specials.length, 1);
  assert.equal(specials[0].title, 'Traditional Mohinga');

  const permanent = filterMenuItems(mockItems, { menuType: 'PERMANENT' });
  assert.equal(permanent.length, 1);
  assert.equal(permanent[0].title, 'Crispy Samosa Thoke');
});

test('filterMenuItems filters by dietary requirements', () => {
  const vegItems = filterMenuItems(mockItems, { isVegetarian: true });
  assert.equal(vegItems.length, 1);
  assert.equal(vegItems[0].isVegetarian, true);

  const halalItems = filterMenuItems(mockItems, { isHalal: true });
  assert.equal(halalItems.length, 2);
});

test('buildContactLinks formats whatsapp and tel links properly', () => {
  const links = buildContactLinks({
    whatsappPhone: '+95 912-345-678',
    itemTitle: 'Traditional Mohinga',
    phoneNumber: '+95912345678',
  });

  assert.ok(links.whatsappUrl?.includes('https://wa.me/95912345678'));
  assert.ok(links.whatsappUrl?.includes('Traditional%20Mohinga'));
  assert.equal(links.telUrl, 'tel:+95912345678');
});
