import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePickDto, UpdatePickDto } from './picks.dto';

@Injectable()
export class PicksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.pick.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const pick = await this.prisma.pick.findFirst({
      where: { pickId: id, userId },
    });
    if (!pick) {
      throw new NotFoundException(`Pick with ID ${id} not found`);
    }
    return pick;
  }

  async create(dto: CreatePickDto, userId: string) {
    return this.prisma.pick.create({
      data: {
        userId,
        title: dto.title,
        imageUrl: dto.imageUrl,
        description: dto.description,
        cost: dto.cost,
        url: dto.url,
      },
    });
  }

  async update(id: string, dto: UpdatePickDto, userId: string) {
    await this.findOne(id, userId); // Check if exists and belongs to user
    return this.prisma.pick.update({
      where: { pickId: id },
      data: dto,
    });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId); // Check if exists and belongs to user
    return this.prisma.pick.delete({
      where: { pickId: id },
    });
  }
}
