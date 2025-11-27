import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { LookupsModule } from './lookups/lookups.module';
import { RelationModule } from './relation/relation.module';
import { PicksModule } from './picks/picks.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { MenuAccessGuard } from './common/guards/menu-access.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    MenuModule,
    LookupsModule,
    RelationModule,
    PicksModule,
    OrganizationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MenuAccessGuard,
    },
  ],
})
export class AppModule {}
// noop change to trigger rebuild
