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
import {
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    description: 'Cadastro de novo usuário usuário pelo Administrador.',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post('')
  async adicionar(@Body() userDto: CreateUserDto) {
    return await this.usersService.novo(userDto);
  }

  @ApiOperation({
    description: 'Ativação de usuário pelo usuário.',
  })
  @Post('ativar')
  async ativar(@Body() userDto: AtivarUserDto) {
    return await this.usersService.ativar(
      userDto.hash,
      userDto.email,
      userDto.senha,
    );
  }

  @ApiOperation({
    description: 'Solicitação de redefinição de senha pelo usuário.',
  })
  @Post('redefinir')
  async redefinir(@Body() userDto: RedefinirUserDto) {
    return await this.usersService.redefinir(userDto.email);
  }

  @ApiOperation({
    description: 'Alterar usuário pelo administrador.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Id do usuário.',
  })
  @UseGuards(AdminAuthGuard)
  @Post(':id')
  async alterar(@Param('id') id, @Body() userDto: AlterarUserDto) {
    return await this.usersService.alterar(id, userDto);
  }

  @ApiOperation({
    description: 'Retorna usuário logado.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('logado')
  async getLogado() {
    return this.usersService.getLogado();
  }

  @ApiOperation({
    description: 'Detalhe de um usuário.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id do usuário.',
  })
  @UseGuards(AdminAuthGuard)
  @Get(':id')
  async getPorId(@Param('id') id) {
    return await this.usersService.getPorId(id);
  }

  @ApiOperation({
    description: 'Autorização de um usuário no sistema.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id do usuário.',
  })
  @UseGuards(AdminAuthGuard)
  @Post('parceiro/autorizar/:id')
  async parceiroAutorizar(@Param('id') id, @Body() dto: ParceiroAutorizarDto) {
    return await this.usersService.parceiroAutorizar(id, dto);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página atual.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de ítens por página',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'autorizado',
    required: false,
    type: Boolean,
  })
  @ApiOperation({
    description: 'Listagem de usuários do sistema.',
  })
  @UseGuards(AdminAuthGuard)
  @Get('')
  async get(@Query() options) {
    return await this.usersService.listar(options);
  }

  @ApiOperation({
    description: 'Solicitação de auto-cadastro pelo usuário.',
  })
  @Post('parceiro/auto-cadastro')
  async parceiroAutoCadastro(@Body() autoCadastroDto: AutoCadastroDto) {
    return await this.usersService.parceiroAutoCadastro(autoCadastroDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    description: 'Atualização de perfil de usuário.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('perfil')
  async editarPerfil(@Body() dto: EditarPerfilDto) {
    return this.usersService.editarPerfil(dto);
  }
}
