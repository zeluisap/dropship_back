import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { LocalAuthGuard } from './modules/auth/guards/local-auth.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { UsersService } from './modules/users/users.service';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @ApiOperation({
    description: 'Login do sistema.',
  })
  @ApiBody({
    schema: {
      example: {
        username: 'username',
        password: 'password',
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    const auth = await this.authService.login(req.user);
    req.session.token = auth.access_token;
    return auth;
  }

  @ApiOperation({
    description: 'Perfil do usuário.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    description: 'Logout do sistema.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    req.session.token = null;
    this.userService.setLogado(null);
    return true;
  }
}
