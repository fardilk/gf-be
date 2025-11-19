import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('=== Database Structure Verification ===\n');

  // Check Genders
  const genders = await prisma.gender.findMany({ take: 5 });
  console.log('✅ Genders (', genders.length, 'rows):');
  console.log(JSON.stringify(genders, null, 2));

  // Check Ethnicities
  const ethnicities = await prisma.ethnicity.findMany({ take: 5 });
  console.log('\n✅ Ethnicities (sample of', ethnicities.length, '):');
  console.log(JSON.stringify(ethnicities, null, 2));

  // Check Marital Status
  const maritalStatuses = await prisma.maritalStatus.findMany();
  console.log('\n✅ Marital Statuses (', maritalStatuses.length, 'rows):');
  console.log(JSON.stringify(maritalStatuses, null, 2));

  // Check Organization Levels
  const orgLevels = await prisma.organizationLevel.findMany();
  console.log('\n✅ Organization Levels (', orgLevels.length, 'rows):');
  console.log(JSON.stringify(orgLevels, null, 2));

  // Check Master Relations
  const masterRelations = await prisma.masterRelation.findMany({ take: 10 });
  console.log('\n✅ Master Relations (sample of', masterRelations.length, '):');
  console.log(JSON.stringify(masterRelations, null, 2));

  // Check Transaction Relations
  const trxRelations = await prisma.trxRelation.findMany({ take: 5, include: { relation: true } });
  console.log('\n✅ Transaction Relations (sample of', trxRelations.length, '):');
  console.log(JSON.stringify(trxRelations, null, 2));

  // Check Cities
  const cities = await prisma.city.findMany({ take: 5 });
  console.log('\n✅ Cities (sample of', cities.length, '):');
  console.log(JSON.stringify(cities, null, 2));

  // Check Jobs
  const jobs = await prisma.job.findMany({ take: 5 });
  console.log('\n✅ Jobs (sample of', jobs.length, '):');
  console.log(JSON.stringify(jobs, null, 2));

  // Check Person table structure
  const persons = await prisma.person.findMany({
    take: 1,
    include: {
      gender: true,
      city: true,
      job: true,
      ethnicity: true,
      maritalStatus: true,
      organizationLevel: true,
    },
  });
  console.log('\n✅ Person with relations:');
  console.log(JSON.stringify(persons, null, 2));

  await prisma.$disconnect();
}

verify().catch(console.error);
