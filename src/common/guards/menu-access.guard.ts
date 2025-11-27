import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { MENU_KEY } from '../decorators/menu-key.decorator';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

@Injectable()
export class MenuAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const menuKey = this.reflector.getAllAndOverride<string>(MENU_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no menu key is specified, allow access (route not menu-protected)
    if (!menuKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // If user is not authenticated but menu key is required, return 404
      throw new NotFoundException();
    }

    // Get user's person ID from the user object
    const userId: string = user.sub || user.id;
    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { personId: true },
    });

    if (!userRecord?.personId) {
      throw new NotFoundException();
    }

    // Get user's access profiles
    const personAccesses = await this.prisma.personAccess.findMany({
      where: { personId: userRecord.personId },
      select: { accessId: true },
    });

    if (personAccesses.length === 0) {
      throw new NotFoundException();
    }

    const accessIds = personAccesses.map((pa) => pa.accessId);

    // Check if any of the user's access profiles have this menu
    const accessMenu = await this.prisma.accessMenu.findFirst({
      where: {
        accessId: { in: accessIds },
        menu: { key: menuKey },
      },
    });

    if (!accessMenu) {
      // User doesn't have access to this menu, return 404 (not 403)
      throw new NotFoundException();
    }

    return true;
  }
}
