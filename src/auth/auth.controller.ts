import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto.email, dto.password, dto.name);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { userId: string; email: string } }) {
    return this.auth.me(req.user.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Body() dto: RefreshDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieHeader = req.headers?.cookie ?? '';
    const tokenFromCookie = this.readCookie(cookieHeader, [
      'refresh_token',
      'refreshToken',
    ]);
    const token = dto.refreshToken ?? tokenFromCookie ?? '';
    if (!token) return { error: 'No refresh token provided' };

    const body = Buffer.from(token.split('.')[1], 'base64').toString('utf8');
    const payload = JSON.parse(body) as { sub: string };
    const out = await this.auth.refresh(payload.sub, token);
    this.setAuthCookies(res, out.accessToken, out.refreshToken);
    return out;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request & { user: { userId: string; email: string } },
    @Body() dto: RefreshDto | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieHeader = req.headers?.cookie ?? '';
    const tokenFromCookie = this.readCookie(cookieHeader, [
      'refresh_token',
      'refreshToken',
    ]);
    const token = dto?.refreshToken ?? tokenFromCookie ?? undefined;
    const out = await this.auth.logout(req.user.userId, token);
    this.clearAuthCookies(res);
    return out;
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';
    const common = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProd,
      path: '/',
    };
    res.cookie('access_token', accessToken, common);
    if (refreshToken) res.cookie('refresh_token', refreshToken, common);
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  private readCookie(cookieHeader: string, keys: string[]) {
    if (!cookieHeader) return null;
    const pairs = cookieHeader.split(/; */).map((p) => p.split('='));
    const jar: Record<string, string> = {};
    for (const [k, v] of pairs) {
      if (!k) continue;
      jar[decodeURIComponent(k.trim())] = decodeURIComponent((v ?? '').trim());
    }
    for (const key of keys) if (jar[key]) return jar[key];
    return null;
  }
}
