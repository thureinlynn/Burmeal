// prisma/seed.ts
// Migration & seed script for direct PostgreSQL seed runs on Vercel/Supabase
import bcrypt from 'bcryptjs';

export async function seedPrisma(prisma: any) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('burmeal123', salt);

  console.log('🌱 Starting BurMeal seed script...');

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@burmeal.com' },
    update: {},
    create: {
      email: 'admin@burmeal.com',
      passwordHash,
      name: 'BurMeal Curator',
      role: 'ADMIN',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    },
  });

  // 2. Shop Owners
  const owner1 = await prisma.user.upsert({
    where: { email: 'mandalay@burmeal.com' },
    update: {},
    create: {
      email: 'mandalay@burmeal.com',
      passwordHash,
      name: 'Daw Khin Sandar',
      role: 'SHOP_OWNER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khin',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'rangoon@burmeal.com' },
    update: {},
    create: {
      email: 'rangoon@burmeal.com',
      passwordHash,
      name: 'U Than Htike',
      role: 'SHOP_OWNER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Than',
    },
  });

  // 3. Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@burmeal.com' },
    update: {},
    create: {
      email: 'customer@burmeal.com',
      passwordHash,
      name: 'Kyaw Swar',
      role: 'CUSTOMER',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kyaw',
    },
  });

  // 4. Shops
  const shop1 = await prisma.shop.create({
    data: {
      ownerId: owner1.id,
      name: 'Mandalay Morning Teahouse',
      bio: 'Authentic royal Mandalay breakfast, slow-cooked catfish Mohinga, and freshly fried crispy split-pea fritters.',
      coverImage: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
      avatarImage: 'https://api.dicebear.com/7.x/identicon/svg?seed=mandalay',
      status: 'APPROVED',
      cuisineType: 'Burmese Breakfast & Street Classics',
      locationArea: 'Downtown Heritage District',
      facebookUrl: 'https://facebook.com/mandalayteahouse',
      whatsappPhone: '959777123456',
      viberPhone: '959777123456',
      lineId: '@mandalay_tea',
      phoneNumber: '+95 9 777 123 456',
    },
  });

  const shop2 = await prisma.shop.create({
    data: {
      ownerId: owner2.id,
      name: 'Golden Rangoon Coconut Kitchen',
      bio: 'Specialist in traditional Ohn No Khao Swè, rich braised pork belly stews, and herbal seasonal sour soups.',
      coverImage: '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
      avatarImage: 'https://api.dicebear.com/7.x/identicon/svg?seed=rangoon',
      status: 'APPROVED',
      cuisineType: 'Yangon Classic Curries & Soups',
      locationArea: 'Bahan Township',
      facebookUrl: 'https://facebook.com/goldenrangoonkitchen',
      whatsappPhone: '959888987654',
      viberPhone: '959888987654',
      lineId: '@goldenrangoon',
      phoneNumber: '+95 9 888 987 654',
    },
  });

  // 5. Seed Menu Items for 3 sections
  await prisma.menuItem.createMany({
    data: [
      {
        shopId: shop1.id,
        title: 'Royal Fish Mohinga with Crispy Pe-Kyaw',
        description: 'Slow-simmered aromatic catfish broth with lemongrass, ginger, tender vermicelli, and golden chickpea crackers.',
        image: '/src/assets/images/burmeal_mohinga_dish_1793906770254.jpg',
        price: 5.50,
        category: 'Noodles & Broth',
        menuType: 'SPECIAL',
        isVegetarian: false,
        isHalal: true,
        specialDate: new Date().toISOString().slice(0, 10),
      },
      {
        shopId: shop1.id,
        title: 'Mandalay Mont-Di Rice Noodle Salad',
        description: 'Thick hand-pulled round rice noodles tossed in roasted chickpea flour, chili garlic oil, and fish cakes.',
        image: '/src/assets/images/burmeal_hero_spread_1793906769541.jpg',
        price: 6.25,
        category: 'Noodles & Broth',
        menuType: 'WEEKLY',
        isVegetarian: false,
        isHalal: true,
        availableDays: ['Mon', 'Wed', 'Fri', 'Sun'],
      },
      {
        shopId: shop1.id,
        title: 'Crispy Samosa Thoke (Vegetarian)',
        description: 'Golden spiced potato samosas crushed into a zesty cabbage broth with fresh mint and tamarind.',
        image: '/src/assets/images/burmeal_tea_leaf_salad_1793906770254.jpg',
        price: 4.50,
        category: 'Salads & Snacks',
        menuType: 'PERMANENT',
        isVegetarian: true,
        isHalal: true,
      },
      {
        shopId: shop2.id,
        title: 'Rich Coconut Chicken Noodle (Ohn No Khao Swè)',
        description: 'Fragrant mild curry stewed chicken in velvety coconut milk served over flat egg noodles with crispy wontons.',
        image: '/src/assets/images/burmeal_ohn_no_khao_swe_1793906770581.jpg',
        price: 7.50,
        category: 'Noodles & Broth',
        menuType: 'SPECIAL',
        isVegetarian: false,
        isHalal: false,
        specialDate: new Date().toISOString().slice(0, 10),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
}
