import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as argon2 from 'argon2';
import { add } from 'date-fns';

type JwtExpires = `${number}${'s' | 'm' | 'h' | 'd'}`;

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const user = await this.users.create(email, password, name);
    const tokens = await this.issueTokens(user.id, user.email);
    return { user, ...tokens };
  }

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  private async issueTokens(userId: string, email: string) {
    const accessPayload = { sub: userId, email, typ: 'access' };
    const refreshPayload = { sub: userId, email, typ: 'refresh' };

    const accessExp = (process.env.JWT_ACCESS_TTL ?? '15m') as JwtExpires;
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET!,
      expiresIn: accessExp,
    });

    const refreshExpStr = (process.env.JWT_REFRESH_TTL ?? '7d') as JwtExpires;
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: refreshExpStr,
    });

    // store hashed refresh token
    const refreshExp = add(
      new Date(),
      this.parseTTL(process.env.JWT_REFRESH_TTL ?? '7d'),
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: await argon2.hash(refreshToken),
        expiresAt: refreshExp,
      },
    });

    return { accessToken, refreshToken };
  }

  private parseTTL(ttl: string) {
    // minimal parser: "15m", "7d", "12h"
    const m = ttl.match(/^(\d+)([smhd])$/i);
    if (!m) return { days: 7 };
    const n = Number(m[1]);
    const u = m[2].toLowerCase();
    if (u === 's') return { seconds: n };
    if (u === 'm') return { minutes: n };
    if (u === 'h') return { hours: n };
    return { days: n }; // 'd'
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = await this.issueTokens(user.id, user.email);
    const publicUser = await this.users.findByIdPublic(user.id);
    return { user: publicUser, ...tokens };
  }

  async me(userId: string) {
    return this.users.findByIdPublic(userId);
  }

  async refresh(userId: string, presentedToken: string) {
    // check token signature first
    try {
      await this.jwt.verifyAsync(presentedToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    // must match a stored hashed token and not expired/revoked
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const found = await (async () => {
      for (const t of tokens) {
        if (await argon2.verify(t.tokenHash, presentedToken)) return t;
      }
      return null;
    })();

    if (!found) throw new ForbiddenException('Refresh token not recognized');

    // rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: found.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.users.findByIdPublic(userId);
    const { accessToken, refreshToken } = await this.issueTokens(
      user.id,
      user.email,
    );
    return { accessToken, refreshToken };
  }

  async logout(userId: string, presentedToken?: string) {
    if (presentedToken) {
      const all = await this.prisma.refreshToken.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      });
      for (const t of all) {
        if (await argon2.verify(t.tokenHash, presentedToken)) {
          await this.prisma.refreshToken.update({
            where: { id: t.id },
            data: { revokedAt: new Date() },
          });
          return { success: true };
        }
      }
    }
    // fallback: revoke all active tokens for the user
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }
}
