import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { LocalAuthGuard } from './modules/auth/guards/local-auth.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    const auth = await this.authService.login(req.user);
    req.session.token = auth.access_token;
    return auth;
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
