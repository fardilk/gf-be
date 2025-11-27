import { PrismaClient } from '@prisma/client';

export async function seedOrganizationLevels(prisma: PrismaClient) {
  const orgOrganization = await prisma.organizationLevel.upsert({
    where: { organizationLevelId: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      organizationLevelId: '00000000-0000-0000-0000-000000000001',
      organizationLevelName: 'organization',
    },
  });

  const orgIndividual = await prisma.organizationLevel.upsert({
    where: { organizationLevelId: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      organizationLevelId: '00000000-0000-0000-0000-000000000002',
      organizationLevelName: 'individual',
    },
  });

  console.log('✅ Seeded organization levels');
  return { orgOrganization, orgIndividual };
}
