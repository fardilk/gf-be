import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

// Menu item shape returned to FE
type MenuItem = any; // structure comes from DB (access_json)

@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private prisma: PrismaService) {}

  // No internal menu JSON; menus are stored in DB (access.access_json)

  @Get()
  async getMenu(
    @Req() req: Request & { user: { userId: string; email: string } },
  ): Promise<MenuItem[]> {
    const userId = req.user.userId;

    // Find user's access via person -> person_access -> access
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        person: {
          select: {
            personAccesses: { select: { accessId: true } },
          },
        },
      },
    });

    // Default to ac02 (limited) if no access configured
    const codes = new Set(
      user?.person?.personAccesses.map((pa) => pa.accessId) ?? [],
    );
    const chosen = codes.has('ac03')
      ? 'ac03'
      : codes.has('ac01')
        ? 'ac01'
        : codes.has('ac02')
          ? 'ac02'
          : 'ac02';
    const access = await this.prisma.access.findUnique({
      where: { id: chosen },
    });
    return (access?.json as unknown as MenuItem[]) ?? [];
  }
}
