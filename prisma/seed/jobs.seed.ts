import { PrismaClient } from '@prisma/client';

export async function seedJobs(prisma: PrismaClient) {
  const jobs = [
    'Software Engineer',
    'Product Manager',
    'Data Analyst',
    'UX Designer',
    'Marketing Manager',
    'Sales Representative',
    'Human Resources Manager',
    'Accountant',
    'Project Manager',
    'Business Analyst',
    'Customer Service Representative',
    'Operations Manager',
    'Financial Analyst',
    'Quality Assurance Engineer',
    'DevOps Engineer',
    'Content Writer',
    'Graphic Designer',
    'Administrative Assistant',
    'Consultant',
    'Teacher',
    'Other',
  ];

  await prisma.job.deleteMany({});
  await prisma.job.createMany({
    data: jobs.map((title) => ({ name: title })),
  });

  console.log(`✅ Seeded ${jobs.length} job titles`);
}
