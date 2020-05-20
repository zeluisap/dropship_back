import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AtivarUserDto, RedefinirUserDto } from './dto/user-dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { AlterarUserDto } from './dto/alterar-user-dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@Controller('user')
export class UserController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminAuthGuard)
  @Post('adicionar')
  async salvar(@Body() userDto: CreateUserDto) {
    return await this.usersService.novo(userDto);
  }

  @UseGuards(AdminAuthGuard)
  @Post('alterar/:id')
  async alterar(@Param('id') id, @Body() userDto: AlterarUserDto) {
    return await this.usersService.alterar(id, userDto);
  }

  @Post('ativar')
  async ativar(@Body() userDto: AtivarUserDto) {
    return await this.usersService.ativar(
      userDto.hash,
      userDto.email,
      userDto.senha,
    );
  }

  @Post('redefinir')
  async redefinir(@Body() userDto: RedefinirUserDto) {
    return await this.usersService.redefinir(userDto.email);
  }
}
