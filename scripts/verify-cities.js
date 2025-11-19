const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.city.count();
    const sample = await prisma.city.findMany({ take: 5, orderBy: { code: 'asc' } });
    console.log('city count:', count);
    console.log('sample cities:', sample);
  } catch (e) {
    console.error('verify error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
