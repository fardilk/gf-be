import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { parse, isValid } from 'date-fns';
import { PrismaService } from '../database/prisma.service';
import type { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { AdminCreateUserDto, PersonUpdateDto } from './dto';

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  accesses: { id: string; name: string }[];
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async resolveCityById(cityId: string) {
    return this.prisma.city.findFirst({ where: { cityId } });
  }

  async create(
    email: string,
    password: string,
    name?: string,
  ): Promise<PublicUser> {
    const exist = await this.prisma.user.findUnique({ where: { email } });
    if (exist) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(password);
    // Always create a Person first with minimal defaults, then link in User
    const person = await this.prisma.person.create({
      data: {
        personName: name ?? email,
      },
    });
    const user = await this.prisma.user.create({
      data: {
        email, // mapped to user_nm; we use email string as username
        passwordHash, // mapped to pass_hash
        statusCode: 1,
        personId: person.personId,
      },
      select: { id: true, email: true, createdAt: true },
    });

    return {
      id: user.id,
      email: user.email,
      name: person.personName ?? null,
      accesses: [],
      createdAt: user.createdAt,
    };
  }
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdPublic(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        person: {
          select: {
            personName: true,
            personAccesses: {
              select: { access: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const name = user.person?.personName ?? null;
    const accesses = (user.person?.personAccesses ?? []).map((pa) => ({
      id: pa.access.id,
      name: pa.access.name,
    }));
    return {
      id: user.id,
      email: user.email,
      name,
      accesses,
      createdAt: user.createdAt,
    };
  }

  async verifyPassword(userId: string, plain: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    return argon2.verify(user.passwordHash, plain);
  }

  // Admin: create user with person and access links
  async createWithPersonAndAccess(
    dto: AdminCreateUserDto,
  ): Promise<PublicUser> {
    const exist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exist) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password);

    const person = await this.prisma.person.create({
      data: {
        personName: dto.personName ?? dto.firstName ?? dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        address: dto.address,
      },
    });

    // Safely read accessIds from DTO (keep runtime flexible)
    const dtoWithAccess = dto as AdminCreateUserDto & { accessIds?: string[] };
    const accessIds: string[] = Array.isArray(dtoWithAccess.accessIds)
      ? dtoWithAccess.accessIds
      : [];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        personId: person.personId,
        statusCode: 1,
        isAdmin: accessIds.includes('ac03'),
      },
    });

    // Link access IDs via pivot
    if (accessIds.length) {
      await this.prisma.personAccess.createMany({
        data: accessIds.map((accessId: string) => ({
          personId: person.personId,
          accessId,
        })),
        skipDuplicates: true,
      });
    }

    // Return public view with accesses
    const accessRows = await this.prisma.personAccess.findMany({
      where: { personId: person.personId },
      include: { access: true },
    });
    const accesses = accessRows.map((pa) => ({
      id: pa.access.id,
      name: pa.access.name,
    }));
    return {
      id: user.id,
      email: user.email,
      name: person.personName ?? null,
      accesses,
      createdAt: user.createdAt,
    };
  }

async updatePerson(userId: string, dto: PersonUpdateDto) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { person: true },
  });
  if (!user) throw new NotFoundException('User not found');

  let personId = user.person?.personId;
  if (!personId) {
    const created = await this.prisma.person.create({
      data: { personName: dto.personName ?? user.email },
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { personId: created.personId },
    });
    personId = created.personId;
  }

  const data: Record<string, any> = {};
  
  // Basic fields
  if (dto.personName !== undefined) data.personName = dto.personName;
  if (dto.firstName !== undefined) data.firstName = dto.firstName;
  if (dto.lastName !== undefined) data.lastName = dto.lastName;
  if (dto.salutation !== undefined) data.salutation = dto.salutation;
  if (dto.address !== undefined) data.address = dto.address;
  if (dto.isFree !== undefined) data.isFree = dto.isFree;

  // Birth date handling
  if (dto.birthDttm !== undefined) {
    if (!dto.birthDttm) {
      data.birthDttm = null;
    } else {
      const iso = new Date(dto.birthDttm);
      if (!isNaN(iso.getTime())) {
        data.birthDttm = iso;
      } else {
        const parsed = parse(dto.birthDttm, 'dd/MM/yyyy', new Date());
        if (isValid(parsed)) {
          data.birthDttm = parsed;
        } else {
          const parsed2 = parse(dto.birthDttm, 'MM/dd/yyyy', new Date());
          if (isValid(parsed2)) {
            data.birthDttm = parsed2;
          } else {
            throw new BadRequestException('birthDttm must be a valid date (ISO or DD/MM/YYYY)');
          }
        }
      }
    }
  }

  // Gender ID validation
  if (dto.genderId !== undefined) {
    if (dto.genderId) {
      const gender = await this.prisma.gender.findUnique({ where: { genderId: dto.genderId } });
      if (!gender) throw new ConflictException(`Invalid genderId: ${dto.genderId}`);
      data.genderId = dto.genderId;
    } else {
      data.genderId = null;
    }
  }

  // City ID validation (birth place)
  if (dto.cityId !== undefined) {
    if (dto.cityId) {
      const city = await this.prisma.city.findUnique({ where: { cityId: dto.cityId } });
      if (!city) throw new ConflictException(`Invalid cityId: ${dto.cityId}`);
      data.cityId = dto.cityId;
    } else {
      data.cityId = null;
    }
  }

  // Job ID validation
  if (dto.jobId !== undefined) {
    if (dto.jobId) {
      const job = await this.prisma.job.findUnique({ where: { jobId: dto.jobId } });
      if (!job) throw new ConflictException(`Invalid jobId: ${dto.jobId}`);
      data.jobId = dto.jobId;
    } else {
      data.jobId = null;
    }
  }

  // Ethnicity ID validation
  if (dto.ethnicityId !== undefined) {
    if (dto.ethnicityId) {
      const ethnicity = await this.prisma.ethnicity.findUnique({ where: { ethnicityId: dto.ethnicityId } });
      if (!ethnicity) throw new ConflictException(`Invalid ethnicityId: ${dto.ethnicityId}`);
      data.ethnicityId = dto.ethnicityId;
    } else {
      data.ethnicityId = null;
    }
  }

  // Marital Status ID validation (ms1-ms4)
  if (dto.maritalStatusId !== undefined) {
    if (dto.maritalStatusId) {
      const maritalStatus = await this.prisma.maritalStatus.findUnique({ 
        where: { maritalStatusId: dto.maritalStatusId } 
      });
      if (!maritalStatus) throw new ConflictException(`Invalid maritalStatusId: ${dto.maritalStatusId}`);
      data.maritalStatusId = dto.maritalStatusId;
    } else {
      data.maritalStatusId = null;
    }
  }

  // Organization Level ID validation
  if (dto.organizationLevelId !== undefined) {
    if (dto.organizationLevelId) {
      const orgLevel = await this.prisma.organizationLevel.findUnique({ 
        where: { organizationLevelId: dto.organizationLevelId } 
      });
      if (!orgLevel) throw new ConflictException(`Invalid organizationLevelId: ${dto.organizationLevelId}`);
      data.organizationLevelId = dto.organizationLevelId;
    } else {
      data.organizationLevelId = null;
    }
  }

  // Update person with all relations included
  const updated = await this.prisma.person.update({
    where: { personId },
    data,
    include: {
      gender: true,
      city: true,
      job: true,
      ethnicity: true,
      maritalStatus: true,
      organizationLevel: true,
    },
  });

  return updated;
}

  async getPersonByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        person: {
          include: {
            gender: true,
            city: true,
            job: true,
            ethnicity: true,
            maritalStatus: true,
            organizationLevel: true,
          }
        } 
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.person;
  }

}