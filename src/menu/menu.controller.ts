import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateAccessDto } from './dto/create-access.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AssignMenusToAccessDto } from './dto/assign-menus.dto';
import { MenuKey } from '../common/decorators/menu-key.decorator';

@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // ========== GET EFFECTIVE MENU FOR LOGGED-IN USER ==========

  @Get()
  async getMyMenu(@Req() req: Request & { user: { userId: string } }) {
    return this.menuService.getEffectiveMenusForUser(req.user.userId);
  }

  // ========== MENU MANAGEMENT ENDPOINTS ==========
  @MenuKey('organizations')
  @Get('all')
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }

  @MenuKey('organizations')
  @Get('items/:id')
  async getMenuById(@Param('id') id: string) {
    return this.menuService.getMenuById(id);
  }

  @MenuKey('organizations')
  @Post('items')
  async createMenu(@Body() dto: CreateMenuDto) {
    return this.menuService.createMenu(dto);
  }

  @MenuKey('organizations')
  @Patch('items/:id')
  async updateMenu(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, dto);
  }

  @MenuKey('organizations')
  @Delete('items/:id')
  async deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }

  // ========== ACCESS MANAGEMENT ENDPOINTS ==========
  @MenuKey('organizations')
  @Get('access')
  async getAllAccesses() {
    return this.menuService.getAllAccesses();
  }

  @MenuKey('organizations')
  @Get('access/:id')
  async getAccessById(@Param('id') id: string) {
    return this.menuService.getAccessById(id);
  }

  @MenuKey('organizations')
  @Post('access')
  async createAccess(@Body() dto: CreateAccessDto) {
    return this.menuService.createAccess(dto);
  }

  @MenuKey('organizations')
  @Patch('access/:id')
  async updateAccess(@Param('id') id: string, @Body() dto: UpdateAccessDto) {
    return this.menuService.updateAccess(id, dto);
  }

  @MenuKey('organizations')
  @Delete('access/:id')
  async deleteAccess(@Param('id') id: string) {
    return this.menuService.deleteAccess(id);
  }

  // ========== MENU-ACCESS ASSIGNMENT ==========
  @MenuKey('organizations')
  @Post('access/assign-menus')
  async assignMenusToAccess(@Body() dto: AssignMenusToAccessDto) {
    return this.menuService.assignMenusToAccess(dto.accessId, dto.menuIds);
  }

  @MenuKey('organizations')
  @Get('access/:id/menus')
  async getMenusForAccess(@Param('id') accessId: string) {
    return this.menuService.getMenusForAccess(accessId);
  }
}
