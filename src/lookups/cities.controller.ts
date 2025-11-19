import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('api/cities')
export class CitiesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async search(@Query('q') q?: string) {
    const where = q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : undefined;

    const cities = await this.prisma.city.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 20,
      select: { cityId: true, name: true },
    });

    return cities.map((c) => ({
      id: c.cityId,
      name: c.name,
    }));
  }
}
