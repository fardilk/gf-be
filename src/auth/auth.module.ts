import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthAliasController } from './auth.alias.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './jwt.strategy';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    UsersModule,
    OrganizationsModule,
    JwtModule.register({}), // JWT module configuration moved to AuthService
  ],
  providers: [AuthService, JwtAccessStrategy],
  controllers: [AuthController, AuthAliasController],
})
export class AuthModule {}
