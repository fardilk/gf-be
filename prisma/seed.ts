import { PrismaClient } from '@prisma/client';
import { seedOrganizationLevels } from './seed/organization-levels.seed';
import { seedGenders } from './seed/genders.seed';
import { seedMaritalStatuses } from './seed/marital-statuses.seed';
import { seedEthnicities } from './seed/ethnicities.seed';
import { seedCities } from './seed/cities.seed';
import { seedJobs } from './seed/jobs.seed';
import { seedRelations } from './seed/relations.seed';
import { seedAccess } from './seed/access.seed';
import { seedUsers } from './seed/users.seed';
import { seedMenus } from './seed/menus.seed';
import { seedAccessMenus } from './seed/access-menus.impl';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Step 1: Organization levels
  const { orgOrganization, orgIndividual } = await seedOrganizationLevels(prisma);

  // Step 2: Genders
  await seedGenders(prisma);

  // Step 3: Marital statuses
  await seedMaritalStatuses(prisma);

  // Step 4: Ethnicities
  await seedEthnicities(prisma);

  // Step 5: Cities
  await seedCities(prisma);

  // Step 6: Jobs
  await seedJobs(prisma);

  // Step 7: Relations
  await seedRelations(prisma);

  // Step 8: Access profiles
  await seedAccess(prisma);

  // Step 9: Users
  await seedUsers(prisma, orgOrganization.organizationLevelId, orgIndividual.organizationLevelId);

  // Step 10: Menus
  await seedMenus(prisma);

  // Step 11: Access -> menu assignments
  await seedAccessMenus(prisma);

  console.log('\n✅ Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
