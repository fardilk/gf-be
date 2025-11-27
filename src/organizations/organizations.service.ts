import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

export enum OrganizationRole {
  OWNER = 'OWNER',
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
  MEMBER = 'MEMBER',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  REMOVED = 'REMOVED',
}

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new organization and assign the creator as ORGANIZATION_ADMIN
   */
  async create(dto: CreateOrganizationDto, creatorPersonId: string) {
    // Validate person exists
    const person = await this.prisma.person.findUnique({
      where: { personId: creatorPersonId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Generate code if not provided
    const code =
      dto.code || this.generateSlug(dto.name) + '-' + Date.now().toString(36);

    // Check code uniqueness
    const existing = await this.prisma.organization.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException(
        `Organization with code "${code}" already exists`,
      );
    }

    // Create organization and membership in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name,
          code,
          description: dto.description,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          logoUrl: dto.logoUrl,
          createdByPersonId: creatorPersonId,
        },
      });

      const membership = await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          personId: creatorPersonId,
          role: OrganizationRole.ORGANIZATION_ADMIN,
          status: MembershipStatus.ACTIVE,
        },
      });

      return { organization, membership };
    });

    return {
      ...result.organization,
      currentUserMembership: {
        role: result.membership.role,
        status: result.membership.status,
      },
    };
  }

  /**
   * Get all organizations for a person
   */
  async getMyOrganizations(personId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: {
        personId,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      organizationId: m.organization.id,
      name: m.organization.name,
      code: m.organization.code,
      description: m.organization.description,
      logoUrl: m.organization.logoUrl,
      role: m.role,
      status: m.status,
      isActive: m.organization.isActive,
    }));
  }

  /**
   * Get organization details by ID
   */
  async getOrganizationById(orgId: string, personId: string) {
    // Check membership
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        personId,
        status: MembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new NotFoundException('Organization not found or access denied');
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        createdBy: {
          select: {
            personId: true,
            personName: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return {
      ...organization,
      currentUserRole: membership.role,
      memberCount: organization._count.members,
    };
  }

  /**
   * Update organization profile
   */
  async updateOrganization(
    orgId: string,
    dto: UpdateOrganizationDto,
    personId: string,
  ) {
    // Check if user is OWNER or ORGANIZATION_ADMIN
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        personId,
        status: MembershipStatus.ACTIVE,
        role: {
          in: [
            OrganizationRole.OWNER,
            OrganizationRole.ORGANIZATION_ADMIN,
          ],
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Only organization owner or admin can update organization profile',
      );
    }

    const organization = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        name: dto.name,
        description: dto.description,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        logoUrl: dto.logoUrl,
      },
    });

    return organization;
  }

  /**
   * Check if person has organization access and needs setup
   */
  async checkOrganizationSetup(personId: string) {
    // Check if person has organization access
    const hasOrgAccess = await this.prisma.personAccess.findFirst({
      where: {
        personId,
        accessId: 'ac01', // organization access
        isActive: true,
      },
    });

    if (!hasOrgAccess) {
      return {
        hasOrganizationAccess: false,
        requiresOrganizationSetup: false,
      };
    }

    // Check if person belongs to any active organization
    const activeMemberships = await this.prisma.organizationMember.count({
      where: {
        personId,
        status: MembershipStatus.ACTIVE,
      },
    });

    return {
      hasOrganizationAccess: true,
      requiresOrganizationSetup: activeMemberships === 0,
    };
  }

  /**
   * Check if user is member of organization
   */
  async isMemberOfOrganization(
    orgId: string,
    personId: string,
  ): Promise<boolean> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        personId,
        status: MembershipStatus.ACTIVE,
      },
    });

    return !!membership;
  }

  /**
   * Check if user has specific role in organization
   */
  async hasRoleInOrganization(
    orgId: string,
    personId: string,
    roles: OrganizationRole[],
  ): Promise<boolean> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: orgId,
        personId,
        status: MembershipStatus.ACTIVE,
        role: {
          in: roles,
        },
      },
    });

    return !!membership;
  }

  /**
   * Generate a URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }
}
