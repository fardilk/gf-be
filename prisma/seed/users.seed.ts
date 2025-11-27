import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

export async function seedUsers(
  prisma: PrismaClient,
  orgOrganizationId: string,
  orgIndividualId: string,
) {
  const defaultHash = await argon2.hash('default');

  // Helper to create a user with person
  async function seedUser(
    email: string,
    displayName?: string,
    orgLevelId?: string,
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    const person = await prisma.person.create({
      data: {
        personName: displayName ?? email,
        organizationLevelId: orgLevelId,
        isFree: false,
      },
    });

    return prisma.user.create({
      data: {
        email,
        passwordHash: defaultHash,
        personId: person.personId,
        statusCode: 1,
        isAdmin: false,
      },
    });
  }

  await seedUser(
    'fardil.khalidi@gmail.com',
    'Fardil Khalidi',
    orgOrganizationId,
  );
  await seedUser(
    'attarasmawan@gmail.com',
    'Attar Asmawan',
    orgIndividualId,
  );

  // Link persons to access
  async function linkPersonAccess(userEmail: string, accessId: string) {
    const u = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { person: true },
    });
    if (!u) return;
    let personId = u.person?.personId;
    if (!personId) {
      const p = await prisma.person.create({ data: { personName: userEmail } });
      personId = p.personId;
      await prisma.user.update({ where: { id: u.id }, data: { personId } });
    }
    const already = await prisma.personAccess.findFirst({
      where: { personId, accessId },
    });
    if (!already) {
      await prisma.personAccess.create({ data: { personId, accessId } });
    }
  }

  await linkPersonAccess('fardil.khalidi@gmail.com', 'ac01');
  await linkPersonAccess('attarasmawan@gmail.com', 'ac02');

  // Seed administrator user
  async function seedAdminUser(email: string, displayName?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    const person = await prisma.person.create({
      data: { personName: displayName ?? email },
    });

    const passwordHash = await argon2.hash('default');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        personId: person.personId,
        statusCode: 1,
        isAdmin: true,
      },
    });

    const already = await prisma.personAccess.findFirst({
      where: { personId: person.personId, accessId: 'ac03' },
    });
    if (!already) {
      await prisma.personAccess.create({
        data: { personId: person.personId, accessId: 'ac03' },
      });
    }
    return user;
  }

  await seedAdminUser('administrator@sevenrose.com', 'Administrator');
  console.log('✅ Seeded users');
}
