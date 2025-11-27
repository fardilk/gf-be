import { PrismaClient } from '@prisma/client';

export async function seedRelations(prisma: PrismaClient) {
  const masterRelations = [
    { relationName: 'SPOUSE', description: 'Spouse' },
    { relationName: 'HUSBAND', description: 'Husband' },
    { relationName: 'WIFE', description: 'Wife' },
    { relationName: 'PARENT', description: 'Parent' },
    { relationName: 'FATHER', description: 'Father' },
    { relationName: 'MOTHER', description: 'Mother' },
    { relationName: 'CHILD', description: 'Child' },
    { relationName: 'SON', description: 'Son' },
    { relationName: 'DAUGHTER', description: 'Daughter' },
    { relationName: 'SIBLING', description: 'Sibling' },
    { relationName: 'BROTHER', description: 'Brother' },
    { relationName: 'SISTER', description: 'Sister' },
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
    data: masterRelations.map((r) => ({
      relationName: r.relationName,
      description: r.description,
    })),
  });

  console.log(`✅ Seeded ${masterRelations.length} master relation types`);
}
