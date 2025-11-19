import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './users.service';
import { AdminCreateUserDto, PersonUpdateDto } from './dto';
import { PrismaService } from '../database/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private users: UsersService,
    private prisma: PrismaService,
  ) {}

  private async ensureAdmin(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        person: {
          select: {
            personAccesses: {
              select: { accessId: true },
            },
          },
        },
      },
    });
    const codes = new Set(
      u?.person?.personAccesses.map((pa) => pa.accessId) ?? [],
    );
    if (!codes.has('ac03'))
      throw new ForbiddenException('Admin access required');
  }

  @Post()
  async create(
    @Req() req: Request & { user: { userId: string; email: string } },
    @Body() dto: AdminCreateUserDto,
  ) {
    await this.ensureAdmin(req.user.userId);
    const user = await this.users.createWithPersonAndAccess(dto);
    return { user };
  }

  // Update own person profile
  @Patch('me/person')
  async updateMyPerson(
    @Req() req: Request & { user: { userId: string; email: string } },
    @Body() dto: PersonUpdateDto,
  ) {
    const person = await this.users.updatePerson(req.user.userId, dto);
    return { person };
  }

  // Get own person profile
  @Get('me/person')
  async getMyPerson(
    @Req() req: Request & { user: { userId: string; email: string } },
  ) {
    const person = await this.users.getPersonByUserId(req.user.userId);
    return { person };
  }

  // Admin-only: update another user's person profile
  @Patch(':userId/person')
  async updateUserPerson(
    @Req() req: Request & { user: { userId: string; email: string } },
    @Param('userId') userId: string,
    @Body() dto: PersonUpdateDto,
  ) {
    // Allow self-update too, else require admin
    if (req.user.userId !== userId) {
      await this.ensureAdmin(req.user.userId);
    }
    const person = await this.users.updatePerson(userId, dto);
    return { person };
  }
}
