import { PrismaClient } from '@prisma/client';

export async function seedGenders(prisma: PrismaClient) {
  await prisma.gender.deleteMany({});
  await prisma.gender.createMany({
    data: [
      { genderId: 'a0000000-0000-0000-0000-000000000001', name: 'Male' },
      { genderId: 'a0000000-0000-0000-0000-000000000002', name: 'Female' },
      { genderId: 'a0000000-0000-0000-0000-000000000003', name: 'Undisclosed' },
    ],
  });
  console.log('✅ Seeded genders');
}
