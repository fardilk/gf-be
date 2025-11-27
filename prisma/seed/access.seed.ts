import { PrismaClient } from '@prisma/client';

export async function seedAccess(prisma: PrismaClient) {
  await prisma.access.upsert({
    where: { id: 'ac02' },
    update: {
      name: 'Individual',
      description: 'Individual user access with limited features',
      isActive: true,
    },
    create: {
      id: 'ac02',
      name: 'Individual',
      description: 'Individual user access with limited features',
      isActive: true,
    },
  });

  await prisma.access.upsert({
    where: { id: 'ac01' },
    update: {
      name: 'Organization',
      description: 'Organization access with full gift management features',
      isActive: true,
    },
    create: {
      id: 'ac01',
      name: 'Organization',
      description: 'Organization access with full gift management features',
      isActive: true,
    },
  });

  await prisma.access.upsert({
    where: { id: 'ac03' },
    update: {
      name: 'Administrator',
      description: 'Full system administrator access',
      isActive: true,
    },
    create: {
      id: 'ac03',
      name: 'Administrator',
      description: 'Full system administrator access',
      isActive: true,
    },
  });

  console.log('✅ Seeded access profiles');
}
