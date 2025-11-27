import { PrismaClient } from '@prisma/client';

export async function seedMenus(prisma: PrismaClient) {
  // Clear existing menus
  await prisma.menu.deleteMany({});

  await prisma.menu.create({
    data: {
      key: 'dashboard',
      url: '/dashboard',
      icon: 'dashboard',
      title: 'Dashboard',
      order: 1,
      isActive: true,
    },
  });

  const gift = await prisma.menu.create({
    data: {
      key: 'gift',
      url: '/gift',
      icon: 'gift',
      title: 'Gift',
      order: 2,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'gift-fruit',
      parentId: gift.id,
      url: '/gift/fruit',
      icon: 'apple',
      title: 'Gift Fruit',
      order: 1,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'gift-flower',
      parentId: gift.id,
      url: '/gift/flower',
      icon: 'flower',
      title: 'Gift Flower',
      order: 2,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'relation',
      url: '/relation',
      icon: 'people',
      title: 'Relation',
      order: 3,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'picks',
      url: '/picks',
      icon: 'bookmark',
      title: 'Picks',
      order: 4,
      isActive: true,
    },
  });

  const organizations = await prisma.menu.create({
    data: {
      key: 'organizations',
      url: '/organizations',
      icon: 'business',
      title: 'Organizations',
      order: 5,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-overview',
      parentId: organizations.id,
      url: '/organizations/overview',
      title: 'Overview',
      order: 1,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-profile',
      parentId: organizations.id,
      url: '/organizations/profile',
      title: 'Profile',
      order: 2,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-members',
      parentId: organizations.id,
      url: '/organizations/members',
      title: 'Members',
      order: 3,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-clusters',
      parentId: organizations.id,
      url: '/organizations/clusters',
      title: 'Clusters',
      order: 4,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-occasions',
      parentId: organizations.id,
      url: '/organizations/occasions',
      title: 'Occasions',
      order: 5,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-benefits',
      parentId: organizations.id,
      url: '/organizations/benefits',
      title: 'Benefits',
      order: 6,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-events',
      parentId: organizations.id,
      url: '/organizations/events',
      title: 'Events',
      order: 7,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'organizations-wallet',
      parentId: organizations.id,
      url: '/organizations/wallet',
      title: 'Wallet',
      order: 8,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'admin',
      url: '/admin',
      icon: 'settings',
      title: 'Admin',
      order: 98,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'reports',
      url: '/reports',
      icon: 'bar_chart',
      title: 'Reports',
      order: 99,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'ai-recommendation',
      url: '/ai-recommendation',
      icon: 'psychology',
      title: 'AI Recommendation',
      order: 6,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'groups',
      url: '/groups',
      icon: 'groups',
      title: 'Groups',
      order: 7,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'affiliate-setting',
      url: '/affiliate-setting',
      icon: 'handshake',
      title: 'Affiliate Setting',
      order: 8,
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      key: 'occasion',
      url: '/occasion',
      icon: 'celebration',
      title: 'Occasion',
      order: 9,
      isActive: true,
    },
  });

  console.log('✅ Seeded menus');

  // Access menus are seeded in `prisma/seed/access-menus.seed.ts`
  // This file creates menu records only. Assignments to access profiles
  // are handled by the separate access-menus seeder to keep concerns separated.
}
