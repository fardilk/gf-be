import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: adding IDs to lookup tables...');

  // 1. Add UUID IDs to existing Gender rows
  await prisma.$executeRaw`
    UPDATE gender 
    SET gender_id = gen_random_uuid(), gender_name = name 
    WHERE gender_id IS NULL
  `;
  const genderCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM gender WHERE gender_id IS NOT NULL
  `;
  console.log(`✅ Migrated ${genderCount[0].count} gender rows`);

  // 2. Add UUID IDs to existing Ethnicity rows
  await prisma.$executeRaw`
    UPDATE ethnicity 
    SET ethnicity_id = gen_random_uuid(), ethnicity_name = name 
    WHERE ethnicity_id IS NULL
  `;
  const ethnicityCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM ethnicity WHERE ethnicity_id IS NOT NULL
  `;
  console.log(`✅ Migrated ${ethnicityCount[0].count} ethnicity rows`);

  // 3. Add UUID IDs to existing Job rows
  await prisma.$executeRaw`
    UPDATE job 
    SET job_id = gen_random_uuid(), job_name = name 
    WHERE job_id IS NULL
  `;
  const jobCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::int as count FROM job WHERE job_id IS NOT NULL
  `;
  console.log(`✅ Migrated ${jobCount[0].count} job rows`);

  console.log('✅ Migration complete: all lookup tables now have IDs');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Migration failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
