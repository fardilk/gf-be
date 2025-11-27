import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrgPerm } from './organization-permissions';
import { Action } from '../common/permissions';
import { PrismaService } from '../database/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Create a new organization (first-time setup)
   * POST /organizations
   */
  @Post()
  @Permissions(...OrgPerm(Action.INSERT))
  async create(
    @Body() dto: CreateOrganizationDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const personId = await this.getPersonId(req.user.userId);
    return this.organizationsService.create(dto, personId);
  }

  /**
   * Get all organizations for the current user
   * GET /organizations/my
   */
  @Get('my')
  @Permissions(...OrgPerm(Action.EXECUTE))
  async getMyOrganizations(@Req() req: Request & { user: { userId: string } }) {
    const personId = await this.getPersonId(req.user.userId);
    return this.organizationsService.getMyOrganizations(personId);
  }

  /**
   * Get organization details by ID
   * GET /organizations/:orgId
   */
  @Get(':orgId')
  @Permissions(...OrgPerm(Action.EXECUTE))
  async getOrganization(
    @Param('orgId') orgId: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const personId = await this.getPersonId(req.user.userId);
    return this.organizationsService.getOrganizationById(orgId, personId);
  }

  /**
   * Update organization profile
   * PATCH /organizations/:orgId
   */
  @Patch(':orgId')
  @Permissions(...OrgPerm(Action.EDIT))
  async updateOrganization(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const personId = await this.getPersonId(req.user.userId);
    return this.organizationsService.updateOrganization(orgId, dto, personId);
  }

  /**
   * Helper to get personId from userId
   */
  private async getPersonId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { personId: true },
    });

    if (!user?.personId) {
      throw new ForbiddenException(
        'User does not have an associated person record',
      );
    }

    return user.personId;
  }
}
