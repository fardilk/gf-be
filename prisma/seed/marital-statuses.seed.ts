import { PrismaClient } from '@prisma/client';

export async function seedMaritalStatuses(prisma: PrismaClient) {
  await prisma.maritalStatus.deleteMany({});
  await prisma.maritalStatus.createMany({
    data: [
      { maritalStatusId: 'ms1', name: 'Single' },
      { maritalStatusId: 'ms2', name: 'Married' },
      { maritalStatusId: 'ms3', name: 'Divorced' },
      { maritalStatusId: 'ms4', name: 'Undisclosed' },
    ],
  });
  console.log('✅ Seeded marital statuses');
}
