import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const cookieExtractor = (req: Request | undefined): string | null => {
      if (!req || !req.headers || !('cookie' in req.headers)) return null;
      const cookie = String((req.headers as any).cookie);
      // simple cookie parsing without extra deps
      const pairs = cookie.split(/; */).map((p) => p.split('='));
      const jar: Record<string, string> = {};
      for (const [k, v] of pairs) {
        if (!k) continue;
        jar[decodeURIComponent(k.trim())] = decodeURIComponent(
          (v ?? '').trim(),
        );
      }
      return jar['access_token'] || jar['accessToken'] || null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }
  validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
