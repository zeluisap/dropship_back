import {
  Controller,
  UseGuards,
  Request,
  Post,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import {
  AtivarUserDto,
  RedefinirUserDto,
  AutoCadastroDto,
  ParceiroAutorizarDto,
  EditarPerfilDto,
} from './dto/user-dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { AlterarUserDto } from './dto/alterar-user-dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminAuthGuard)
  @Post('')
  async adicionar(@Body() userDto: CreateUserDto) {
    return await this.usersService.novo(userDto);
  }

  @UseGuards(AdminAuthGuard)
  @Post(':id')
  async alterar(@Param('id') id, @Body() userDto: AlterarUserDto) {
    return await this.usersService.alterar(id, userDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  async getPorId(@Param('id') id) {
    return await this.usersService.getPorId(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('parceiro/autorizar/:id')
  async parceiroAutorizar(@Param('id') id, @Body() dto: ParceiroAutorizarDto) {
    return await this.usersService.parceiroAutorizar(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logado')
  async getLogado() {
    return this.usersService.getLogado();
  }

  @UseGuards(AdminAuthGuard)
  @Get('')
  async get(@Query() options) {
    return await this.usersService.listar(options);
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

  @Post('parceiro/auto-cadastro')
  async parceiroAutoCadastro(@Body() autoCadastroDto: AutoCadastroDto) {
    return await this.usersService.parceiroAutoCadastro(autoCadastroDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('perfil')
  async editarPerfil(@Body() dto: EditarPerfilDto) {
    return this.usersService.editarPerfil(dto);
  }
}
