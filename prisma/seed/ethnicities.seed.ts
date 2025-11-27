import { PrismaClient } from '@prisma/client';

export async function seedEthnicities(prisma: PrismaClient) {
  const ethnicities = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Jawa' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Sunda' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Batak' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Madura' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'Betawi' },
    { id: '00000000-0000-0000-0000-000000000006', name: 'Minangkabau' },
    { id: '00000000-0000-0000-0000-000000000007', name: 'Bugis' },
    { id: '00000000-0000-0000-0000-000000000008', name: 'Melayu' },
    { id: '00000000-0000-0000-0000-000000000009', name: 'Banjar' },
    { id: '00000000-0000-0000-0000-000000000010', name: 'Bali' },
    { id: '00000000-0000-0000-0000-000000000011', name: 'Aceh' },
    { id: '00000000-0000-0000-0000-000000000012', name: 'Sasak' },
    { id: '00000000-0000-0000-0000-000000000013', name: 'Makassar' },
    { id: '00000000-0000-0000-0000-000000000014', name: 'Dayak' },
    { id: '00000000-0000-0000-0000-000000000015', name: 'Toraja' },
    { id: '00000000-0000-0000-0000-000000000016', name: 'Minahasa' },
    { id: '00000000-0000-0000-0000-000000000017', name: 'Gorontalo' },
    { id: '00000000-0000-0000-0000-000000000018', name: 'Nias' },
    { id: '00000000-0000-0000-0000-000000000019', name: 'Lampung' },
    { id: '00000000-0000-0000-0000-000000000020', name: 'Palembang' },
    { id: '00000000-0000-0000-0000-000000000021', name: 'Tionghoa' },
  ];

  await prisma.ethnicity.deleteMany({});
  await prisma.ethnicity.createMany({
    data: ethnicities.map((e) => ({
      ethnicityId: e.id,
      name: e.name,
    })),
  });

  console.log(`✅ Seeded Indonesian ethnicities (${ethnicities.length} entries with standardized UUIDs)`);
}
