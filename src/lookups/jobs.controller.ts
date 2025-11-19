import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('api/jobs')
export class JobsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@Query('q') q?: string) {
    const where = q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : undefined;

    const jobs = await this.prisma.job.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
      select: { jobId: true, name: true },
    });

    return jobs.map((j) => ({
      id: j.jobId,
      name: j.name,
    }));
  }
}
