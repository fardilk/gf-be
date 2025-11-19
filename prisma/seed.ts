import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Step 1: Organization Level seeds
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

  // Step 2: Gender seeds (simplified - only genderId and name)
  await prisma.gender.deleteMany({});
  await prisma.gender.createMany({
    data: [
      { genderId: 'a0000000-0000-0000-0000-000000000001', name: 'Male' },
      { genderId: 'a0000000-0000-0000-0000-000000000002', name: 'Female' },
      { genderId: 'a0000000-0000-0000-0000-000000000003', name: 'Undisclosed' },
    ],
  });
  console.log('✅ Seeded genders');

  // Step 3: Marital Status seeds (with unclear IDs: ms1, ms2, ms3, ms4)
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

  // Step 4: Indonesian Ethnicity seeds (with standardized UUIDs, no Group A/B/C)
  await prisma.ethnicity.deleteMany({});
  await prisma.ethnicity.createMany({
    data: [
      { ethnicityId: '11111111-1111-1111-1111-111111111111', name: 'Jawa' },
      { ethnicityId: '22222222-2222-2222-2222-222222222222', name: 'Sunda' },
      { ethnicityId: '33333333-3333-3333-3333-333333333333', name: 'Betawi' },
      { ethnicityId: '44444444-4444-4444-4444-444444444444', name: 'Batak' },
      { ethnicityId: '55555555-5555-5555-5555-555555555555', name: 'Minangkabau' },
      { ethnicityId: '66666666-6666-6666-6666-666666666666', name: 'Bugis' },
      { ethnicityId: '77777777-7777-7777-7777-777777777777', name: 'Madura' },
      { ethnicityId: '88888888-8888-8888-8888-888888888888', name: 'Banjar' },
      { ethnicityId: '99999999-9999-9999-9999-999999999999', name: 'Bali' },
      { ethnicityId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Aceh' },
      { ethnicityId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Dayak' },
      { ethnicityId: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Makassar' },
      { ethnicityId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Lampung' },
      { ethnicityId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'Palembang' },
      { ethnicityId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', name: 'Gorontalo' },
      { ethnicityId: '10101010-1010-1010-1010-101010101010', name: 'Toraja' },
      { ethnicityId: '20202020-2020-2020-2020-202020202020', name: 'Minahasa' },
      { ethnicityId: '30303030-3030-3030-3030-303030303030', name: 'Nias' },
      { ethnicityId: '40404040-4040-4040-4040-404040404040', name: 'Sasak' },
      { ethnicityId: '50505050-5050-5050-5050-505050505050', name: 'Lainnya' },
      { ethnicityId: '60606060-6060-6060-6060-606060606060', name: 'Tidak Disebutkan' },
    ],
  });
  console.log('✅ Seeded Indonesian ethnicities (21 entries with standardized UUIDs)');

  // Step 5: Cities seed (only cityId and name, no code)
  const cityNames = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Pekanbaru', 'Balikpapan', 'Samarinda', 'Banjarmasin', 'Pontianak', 'Yogyakarta',
    'Denpasar', 'Batam', 'Bogor', 'Bekasi', 'Tangerang', 'Tangerang Selatan', 'Depok',
    'Malang', 'Padang', 'Bandar Lampung', 'Pasuruan', 'Probolinggo', 'Jember',
    'Banyuwangi', 'Kediri', 'Mojokerto', 'Sidoarjo', 'Gresik', 'Surakarta', 'Magelang',
    'Salatiga', 'Tegal', 'Pekalongan', 'Cirebon', 'Tasikmalaya', 'Sukabumi', 'Garut',
    'Cianjur', 'Karawang', 'Purwakarta', 'Subang', 'Indramayu', 'Serang', 'Cilegon',
    'Jambi', 'Bengkulu', 'Pangkalpinang', 'Tanjungpinang', 'Banda Aceh', 'Lhokseumawe',
    'Langsa', 'Binjai', 'Pematangsiantar', 'Sibolga', 'Padang Sidempuan', 'Dumai',
    'Bukittinggi', 'Payakumbuh', 'Pariaman', 'Solok', 'Sawahlunto', 'Lubuklinggau',
    'Prabumulih', 'Pagar Alam', 'Tanjung', 'Tarakan', 'Palangkaraya', 'Palopo',
    'Parepare', 'Kendari', 'Gorontalo', 'Palu', 'Manado', 'Ambon', 'Jayapura', 'Sorong',
    'Ternate', 'Tidore', 'Mataram', 'Kupang', 'Bau-Bau', 'Klaten', 'Kudus', 'Bojonegoro',
    'Tuban', 'Lamongan', 'Bangkalan', 'Pamekasan', 'Sumenep', 'Situbondo', 'Lumajang',
    'Tulungagung', 'Blitar', 'Madiun', 'Ngawi', 'Other',
  ];

  // Use deleteMany and createMany for efficiency
  await prisma.city.deleteMany({});
  await prisma.city.createMany({
    data: cityNames.map((name) => ({ name })),
  });
  console.log(`✅ Seeded ${cityNames.length} Indonesian cities`);

  // Step 6: Jobs seed (including 'Other')
  const jobNames = [
    'Teacher', 'Doctor', 'Nurse', 'Engineer', 'Software Developer', 'Designer',
    'Architect', 'Accountant', 'Sales Representative', 'Marketing Specialist',
    'Consultant', 'Writer', 'Photographer', 'Chef', 'Driver', 'Security Guard',
    'Mechanic', 'Student', 'Researcher', 'Entrepreneur', 'Other',
  ];

  await prisma.job.deleteMany({});
  await prisma.job.createMany({
    data: jobNames.map((name) => ({ name })),
  });
  console.log(`✅ Seeded ${jobNames.length} job titles`);

  // Step 7: Master Relation seeds
  const masterRelations = [
    { relationName: 'PARENT', description: 'Parent' },
    { relationName: 'CHILD', description: 'Child' },
    { relationName: 'FATHER', description: 'Father' },
    { relationName: 'MOTHER', description: 'Mother' },
    { relationName: 'SON', description: 'Son' },
    { relationName: 'DAUGHTER', description: 'Daughter' },
    { relationName: 'SPOUSE', description: 'Spouse' },
    { relationName: 'SIBLING', description: 'Sibling' },
    { relationName: 'OLDER_SIBLING', description: 'Older sibling' },
    { relationName: 'YOUNGER_SIBLING', description: 'Younger sibling' },
    { relationName: 'BROTHER', description: 'Brother' },
    { relationName: 'SISTER', description: 'Sister' },
    { relationName: 'OLDER_BROTHER', description: 'Older brother' },
    { relationName: 'OLDER_SISTER', description: 'Older sister' },
    { relationName: 'YOUNGER_BROTHER', description: 'Younger brother' },
    { relationName: 'YOUNGER_SISTER', description: 'Younger sister' },
    { relationName: 'GRANDPARENT', description: 'Grandparent' },
    { relationName: 'GRANDFATHER', description: 'Grandfather' },
    { relationName: 'GRANDMOTHER', description: 'Grandmother' },
    { relationName: 'GRANDCHILD', description: 'Grandchild' },
    { relationName: 'GRANDSON', description: 'Grandson' },
    { relationName: 'GRANDDAUGHTER', description: 'Granddaughter' },
    { relationName: 'GREAT_GRANDPARENT', description: 'Great-grandparent' },
    { relationName: 'GREAT_GRANDCHILD', description: 'Great-grandchild' },
    { relationName: 'PARENT_IN_LAW', description: 'Parent-in-law' },
    { relationName: 'FATHER_IN_LAW', description: 'Father-in-law' },
    { relationName: 'MOTHER_IN_LAW', description: 'Mother-in-law' },
    { relationName: 'CHILD_IN_LAW', description: 'Child-in-law' },
    { relationName: 'SON_IN_LAW', description: 'Son-in-law' },
    { relationName: 'DAUGHTER_IN_LAW', description: 'Daughter-in-law' },
    { relationName: 'SIBLING_IN_LAW', description: 'Sibling-in-law' },
    { relationName: 'STEP_PARENT', description: 'Stepparent' },
    { relationName: 'STEP_FATHER', description: 'Stepfather' },
    { relationName: 'STEP_MOTHER', description: 'Stepmother' },
    { relationName: 'STEP_CHILD', description: 'Stepchild' },
    { relationName: 'STEP_SIBLING', description: 'Stepsibling' },
    { relationName: 'ADOPTIVE_PARENT', description: 'Adoptive parent' },
    { relationName: 'ADOPTIVE_CHILD', description: 'Adoptive child' },
    { relationName: 'GUARDIAN', description: 'Guardian' },
    { relationName: 'WARD', description: 'Ward' },
    { relationName: 'FRIEND', description: 'Friend' },
    { relationName: 'COLLEAGUE', description: 'Colleague' },
    { relationName: 'MANAGER', description: 'Manager' },
    { relationName: 'SUBORDINATE', description: 'Subordinate' },
    { relationName: 'MENTOR', description: 'Mentor' },
    { relationName: 'MENTEE', description: 'Mentee' },
  ];

  await prisma.masterRelation.deleteMany({});
  await prisma.masterRelation.createMany({
    data: masterRelations,
  });
  console.log(`✅ Seeded ${masterRelations.length} master relation types`);

  // Step 8: Access control menus (unchanged)
  const dashboard = { key: 'dashboard', title: 'Dashboard', url: '/dashboard', icon: 'fa:fa-gauge' };
  const aiRec = { key: 'ai-recommendation', title: 'AI Recommendation', url: '/ai-recommendation', icon: 'fa:fa-wand-magic-sparkles' };
  const receiver = { key: 'receiver', title: 'Receiver', url: '/receiver', icon: 'fa:fa-address-book' };
  const settings = { key: 'settings', title: 'Settings', url: '/settings', icon: 'fa:fa-gear' };
  const groups = { key: 'groups', title: 'Groups', url: '/groups', icon: 'fa:fa-users' };
  const occasion = {
    key: 'occasion',
    title: 'Occasions',
    url: '/occasion',
    icon: 'fa:fa-calendar-days',
    children: [
      { key: 'occasion-list', title: 'List', url: '/occasion' },
      { key: 'occasion-create', title: 'Create', url: '/occasion/create' },
    ],
  };
  const gift = {
    key: 'gift',
    title: 'Gift',
    url: '/gift',
    icon: 'fa:fa-gift',
    children: [
      { key: 'gift-hampers', title: 'Hampers', url: '/gift/hampers', icon: 'fa:fa-box' },
      { key: 'gift-fruit', title: 'Fruit', url: '/gift/fruit', icon: 'fa:fa-apple-whole' },
      { key: 'gift-surprise', title: 'Surprise', url: '/gift/surprise', icon: 'fa:fa-wand-magic-sparkles' },
      { key: 'gift-utensils', title: 'Utensils', url: '/gift/utensils', icon: 'fa:fa-utensils' },
    ],
  };
  const affiliate = {
    key: 'affiliate',
    title: 'Affiliate',
    url: '/affiliate-setting',
    icon: 'fa:fa-link',
    children: [
      { key: 'affiliate-settings', title: 'Settings', url: '/affiliate-setting', icon: 'fa:fa-gear' },
      { key: 'affiliate-master', title: 'Master', url: '/affiliate-setting/master', icon: 'fa:fa-database' },
    ],
  };

  const individualMenu = [dashboard, aiRec, receiver, settings, groups, occasion];
  const organizationMenu = [dashboard, aiRec, receiver, settings, groups, occasion, gift];
  const adminMenu = [settings, affiliate];

  await prisma.access.upsert({
    where: { id: 'ac02' },
    update: { name: 'individual', json: individualMenu },
    create: { id: 'ac02', name: 'individual', json: individualMenu },
  });
  await prisma.access.upsert({
    where: { id: 'ac01' },
    update: { name: 'organization', json: organizationMenu },
    create: { id: 'ac01', name: 'organization', json: organizationMenu },
  });
  await prisma.access.upsert({
    where: { id: 'ac03' },
    update: { name: 'administrator', json: adminMenu },
    create: { id: 'ac03', name: 'administrator', json: adminMenu },
  });
  console.log('✅ Seeded access menus');

  // Step 9: Create sample users
  const defaultHash = await argon2.hash('default');

  // Helper to create a user with person
  async function seedUser(email: string, displayName?: string, orgLevelId?: string) {
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

  await seedUser('fardil.khalidi@gmail.com', 'Fardil Khalidi', orgOrganization.organizationLevelId);
  await seedUser('attarasmawan@gmail.com', 'Attar Asmawan', orgIndividual.organizationLevelId);

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

    const person = await prisma.person.create({ data: { personName: displayName ?? email } });

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

    const already = await prisma.personAccess.findFirst({ where: { personId: person.personId, accessId: 'ac03' } });
    if (!already) {
      await prisma.personAccess.create({ data: { personId: person.personId, accessId: 'ac03' } });
    }
    return user;
  }

  await seedAdminUser('administrator@sevenrose.com', 'Administrator');
  console.log('✅ Seeded users');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
