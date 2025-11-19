import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as argon2 from 'argon2';
import {
  CreateMasterRelationDto,
  UpdateMasterRelationDto,
  CreateTrxRelationDto,
  UpdateTrxRelationDto,
} from './relation.dto';

@Injectable()
export class RelationService {
  constructor(private prisma: PrismaService) {}

  // Master Relation (relation types) CRUD
  async findAllMasterRelations() {
    return this.prisma.masterRelation.findMany({
      orderBy: { relationName: 'asc' },
    });
  }

  async findOneMasterRelation(id: string) {
    const relation = await this.prisma.masterRelation.findUnique({
      where: { relationId: id },
    });
    if (!relation) {
      throw new NotFoundException(`Master relation with ID ${id} not found`);
    }
    return relation;
  }

  async createMasterRelation(dto: CreateMasterRelationDto) {
    return this.prisma.masterRelation.create({
      data: {
        relationName: dto.relationName,
        description: dto.description,
      },
    });
  }

  async updateMasterRelation(id: string, dto: UpdateMasterRelationDto) {
    await this.findOneMasterRelation(id);
    return this.prisma.masterRelation.update({
      where: { relationId: id },
      data: dto,
    });
  }

  async deleteMasterRelation(id: string) {
    await this.findOneMasterRelation(id);
    return this.prisma.masterRelation.delete({
      where: { relationId: id },
    });
  }

  // TrxRelation (person-to-person relations) CRUD
  async findAllTrxRelations() {
    return this.prisma.trxRelation.findMany({
      include: {
        relation: true,
        gifter: { select: { personId: true, personName: true } },
        receiver: { select: { personId: true, personName: true } },
      },
    });
  }

  async findOneTrxRelation(id: string) {
    const trxRelation = await this.prisma.trxRelation.findUnique({
      where: { trxRelationId: id },
      include: {
        relation: true,
        gifter: { select: { personId: true, personName: true } },
        receiver: { select: { personId: true, personName: true } },
      },
    });
    if (!trxRelation) {
      throw new NotFoundException(`Transaction relation with ID ${id} not found`);
    }
    return trxRelation;
  }

  async createTrxRelation(dto: CreateTrxRelationDto) {
    // Validate relationId exists
    await this.findOneMasterRelation(dto.relationId);

    let personGifterId = dto.personGifter;
    let personReceiverId = dto.personReceiver;

    // If gifterName provided, create new person with user account
    if (dto.gifterName && !personGifterId) {
      const email = `${dto.gifterName.toLowerCase().replace(/\s+/g, '.')}@relation.user`;
      const existing = await this.prisma.user.findUnique({ where: { email } });
      
      if (existing) {
        throw new ConflictException(`User with email ${email} already exists`);
      }

      const person = await this.prisma.person.create({
        data: { personName: dto.gifterName },
      });

      const passwordHash = await argon2.hash('default');
      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          personId: person.personId,
          statusCode: 1,
          isAdmin: false,
        },
      });

      personGifterId = person.personId;
    }

    // If receiverName provided, create new person with user account
    if (dto.receiverName && !personReceiverId) {
      const email = `${dto.receiverName.toLowerCase().replace(/\s+/g, '.')}@relation.user`;
      const existing = await this.prisma.user.findUnique({ where: { email } });
      
      if (existing) {
        throw new ConflictException(`User with email ${email} already exists`);
      }

      const person = await this.prisma.person.create({
        data: { personName: dto.receiverName },
      });

      const passwordHash = await argon2.hash('default');
      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          personId: person.personId,
          statusCode: 1,
          isAdmin: false,
        },
      });

      personReceiverId = person.personId;
    }

    return this.prisma.trxRelation.create({
      data: {
        relationId: dto.relationId,
        personGifter: personGifterId,
        personReceiver: personReceiverId,
      },
      include: {
        relation: true,
        gifter: { select: { personId: true, personName: true } },
        receiver: { select: { personId: true, personName: true } },
      },
    });
  }

  async updateTrxRelation(id: string, dto: UpdateTrxRelationDto) {
    await this.findOneTrxRelation(id);
    
    if (dto.relationId) {
      await this.findOneMasterRelation(dto.relationId);
    }

    return this.prisma.trxRelation.update({
      where: { trxRelationId: id },
      data: dto,
      include: {
        relation: true,
        gifter: { select: { personId: true, personName: true } },
        receiver: { select: { personId: true, personName: true } },
      },
    });
  }

  async deleteTrxRelation(id: string) {
    await this.findOneTrxRelation(id);
    return this.prisma.trxRelation.delete({
      where: { trxRelationId: id },
    });
  }
}
