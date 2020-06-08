import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ParametroService } from './parametro.service';
import { CreateParametroDto } from './parametro-dto';
import { NegocioException } from 'src/exceptions/negocio-exception';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller('parametro')
export class ParametroController {
  constructor(private parametroService: ParametroService) {}

  @ApiOperation({
    description: 'Listagem de parâmetros.',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('')
  async get(@Query() params) {
    return await this.parametroService.listar(params);
  }

  @ApiOperation({
    description: 'Novo parâmetro.',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post('')
  async adicionar(@Body() dto: CreateParametroDto) {
    return await this.parametroService.adicionar(dto);
  }

  @ApiOperation({
    description: 'Detalhar parâmetro.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'idOuChave',
    description: 'Nesse campo podem ser informados o id ou chave do parâmetro.',
  })
  @UseGuards(AdminAuthGuard)
  @Get(':idOuChave')
  async getPorIdOuChave(@Param('idOuChave') idOuChave) {
    const parametro = await this.parametroService.getPorIdOuChave(idOuChave);
    if (!parametro) {
      throw new NegocioException('Parâmetro não localizado!');
    }
  }

  @ApiOperation({
    description: 'Excluir parâmetro.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'idOuChave',
    description: 'Nesse campo podem ser informados o id ou chave do parâmetro.',
  })
  @UseGuards(AdminAuthGuard)
  @Delete(':idOuChave')
  async delete(@Param('idOuChave') idOuChave) {
    return await this.parametroService.excluir(idOuChave);
  }
}
