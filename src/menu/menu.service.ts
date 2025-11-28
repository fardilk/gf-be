import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateAccessDto } from './dto/create-access.dto';
import { UpdateAccessDto } from './dto/update-access.dto';

export interface MenuTreeItem {
  id: string;
  key: string;
  url: string;
  icon: string | null;
  title: string;
  order: number;
  children?: MenuTreeItem[];
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ========== MENU CRUD ==========

  async getAllMenus() {
    return this.prisma.menu.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async getMenuById(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async createMenu(dto: CreateMenuDto) {
    // Check key uniqueness
    const existing = await this.prisma.menu.findUnique({
      where: { key: dto.key },
    });

    if (existing) {
      throw new ConflictException(`Menu with key "${dto.key}" already exists`);
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.menu.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent menu with ID ${dto.parentId} not found`);
      }
    }

    return this.prisma.menu.create({
      data: {
        key: dto.key,
        parentId: dto.parentId,
        url: dto.url,
        icon: dto.icon,
        title: dto.title,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async updateMenu(id: string, dto: UpdateMenuDto) {
    await this.getMenuById(id); // Check existence

    // Check key uniqueness if updating key
    if (dto.key) {
      const existing = await this.prisma.menu.findFirst({
        where: {
          key: dto.key,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Menu with key "${dto.key}" already exists`);
      }
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.prisma.menu.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(`Parent menu with ID ${dto.parentId} not found`);
      }

      // Prevent circular reference
      if (dto.parentId === id) {
        throw new ConflictException('Menu cannot be its own parent');
      }
    }

    return this.prisma.menu.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async deleteMenu(id: string) {
    await this.getMenuById(id); // Check existence

    // Check if menu has children
    const children = await this.prisma.menu.findMany({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new ConflictException('Cannot delete menu with children. Delete children first or reassign them.');
    }

    return this.prisma.menu.delete({ where: { id } });
  }

  // ========== ACCESS CRUD ==========

  async getAllAccesses() {
    return this.prisma.access.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            accessMenus: true,
            personAccesses: true,
          },
        },
      },
    });
  }

  async getAccessById(id: string) {
    const access = await this.prisma.access.findUnique({
      where: { id },
      include: {
        accessMenus: {
          include: {
            menu: true,
          },
        },
        _count: {
          select: {
            personAccesses: true,
          },
        },
      },
    });

    if (!access) {
      throw new NotFoundException(`Access with ID ${id} not found`);
    }

    return access;
  }

  async createAccess(dto: CreateAccessDto) {
    const existing = await this.prisma.access.findUnique({
      where: { id: dto.id },
    });

    if (existing) {
      throw new ConflictException(`Access with ID "${dto.id}" already exists`);
    }

    return this.prisma.access.create({
      data: {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateAccess(id: string, dto: UpdateAccessDto) {
    await this.getAccessById(id); // Check existence

    return this.prisma.access.update({
      where: { id },
      data: dto,
    });
  }

  async deleteAccess(id: string) {
    await this.getAccessById(id); // Check existence

    // Check if access is assigned to any person
    const personCount = await this.prisma.personAccess.count({
      where: { accessId: id },
    });

    if (personCount > 0) {
      throw new ConflictException(`Cannot delete access that is assigned to ${personCount} person(s)`);
    }

    return this.prisma.access.delete({ where: { id } });
  }

  // ========== MENU-ACCESS ASSIGNMENT ==========

  async assignMenusToAccess(accessId: string, menuIds: string[]) {
    // Validate access exists
    await this.getAccessById(accessId);

    // Validate all menus exist
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: menuIds } },
    });

    if (menus.length !== menuIds.length) {
      throw new NotFoundException('One or more menu IDs are invalid');
    }

    // Remove existing assignments
    await this.prisma.accessMenu.deleteMany({
      where: { accessId },
    });

    // Create new assignments
    if (menuIds.length > 0) {
      await this.prisma.accessMenu.createMany({
        data: menuIds.map((menuId) => ({
          accessId,
          menuId,
        })),
      });
    }

    return this.getAccessById(accessId);
  }

  async getMenusForAccess(accessId: string) {
    await this.getAccessById(accessId); // Validate access exists

    const accessMenus = await this.prisma.accessMenu.findMany({
      where: {
        accessId,
        isActive: true,
        menu: { isActive: true },
      },
      include: {
        menu: true,
      },
      orderBy: {
        menu: {
          order: 'asc',
        },
      },
    });

    return accessMenus.map((am) => am.menu);
  }

  // ========== EFFECTIVE MENU RESOLUTION FOR PERSON ==========

  async getEffectiveMenusForPerson(personId: string): Promise<MenuTreeItem[]> {
    // 1. Find all active access profiles for the person
    const personAccesses = await this.prisma.personAccess.findMany({
      where: {
        personId,
        isActive: true,
        access: { isActive: true },
      },
      select: {
        accessId: true,
      },
    });

    if (personAccesses.length === 0) {
      return []; // No access assigned
    }

    const accessIds = personAccesses.map((pa) => pa.accessId);

    // 2. Find all active menus linked to these access profiles
    const accessMenus = await this.prisma.accessMenu.findMany({
      where: {
        accessId: { in: accessIds },
        isActive: true,
        menu: { isActive: true },
      },
      include: {
        menu: true,
      },
    });

    // 3. Deduplicate menus (person might have multiple roles with overlapping menus)
    const uniqueMenuMap = new Map<string, MenuTreeItem>();
    accessMenus.forEach((am) => {
      const menu = am.menu;
      if (!uniqueMenuMap.has(menu.id)) {
        uniqueMenuMap.set(menu.id, {
          id: menu.id,
          key: menu.key,
          url: menu.url,
          icon: menu.icon,
          title: menu.title,
          order: menu.order,
        });
      }
    });

    const flatMenus = Array.from(uniqueMenuMap.values());

    // 4. Build tree structure from flat list
    return await this.buildMenuTree(flatMenus);
  }

  async getEffectiveMenusForUser(userId: string): Promise<MenuTreeItem[]> {
    // Find person by user ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        personId: true,
      },
    });

    if (!user || !user.personId) {
      throw new NotFoundException('User does not have an associated person record');
    }

    return this.getEffectiveMenusForPerson(user.personId);
  }

  // ========== HELPER: BUILD TREE FROM FLAT LIST ==========

  private async buildMenuTree(
    flatMenus: MenuTreeItem[],
  ): Promise<MenuTreeItem[]> {
    // Get all menu IDs that the user has access to
    const accessibleMenuIds = new Set(flatMenus.map((m) => m.id));

    // Fetch full menu data including parentId to build hierarchy
    const fullMenus = await this.prisma.menu.findMany({
      where: {
        id: { in: Array.from(accessibleMenuIds) },
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    // Create a map of menu items with empty children arrays
    const menuMap = new Map<
      string,
      MenuTreeItem & { parentId: string | null }
    >();
    
    fullMenus.forEach((menu) => {
      menuMap.set(menu.id, {
        id: menu.id,
        key: menu.key,
        url: menu.url,
        icon: menu.icon,
        title: menu.title,
        order: menu.order,
        parentId: menu.parentId,
        children: [],
      });
    });

    // Build tree structure
    const roots: MenuTreeItem[] = [];

    menuMap.forEach((menu) => {
      if (menu.parentId && menuMap.has(menu.parentId)) {
        // This is a child menu and parent exists in accessible menus
        const parent = menuMap.get(menu.parentId)!;
        parent.children!.push(menu);
      } else if (!menu.parentId) {
        // This is a root menu
        roots.push(menu);
      }
      // If parentId exists but parent is not in accessible menus, treat as root
      else if (menu.parentId && !menuMap.has(menu.parentId)) {
        roots.push(menu);
      }
    });

    // Sort children within each parent
    roots.forEach((root) => {
      if (root.children && root.children.length > 0) {
        root.children.sort((a, b) => a.order - b.order);
      }
    });

    // Sort roots by order
    return roots.sort((a, b) => a.order - b.order);
  }
}
