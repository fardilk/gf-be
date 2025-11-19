import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { LookupsModule } from './lookups/lookups.module';
import { RelationModule } from './relation/relation.module';
import { PicksModule } from './picks/picks.module';

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
  ],
})
export class AppModule {}
// noop change to trigger rebuild
