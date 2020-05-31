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

@Controller('parametro')
export class ParametroController {
  constructor(private parametroService: ParametroService) {}

  @UseGuards(AdminAuthGuard)
  @Get('')
  async get(@Query() params) {
    return await this.parametroService.listar(params);
  }

  @UseGuards(AdminAuthGuard)
  @Post('')
  async adicionar(@Body() dto: CreateParametroDto) {
    return await this.parametroService.adicionar(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get(':idOuChave')
  async getPorIdOuChave(@Param('idOuChave') idOuChave) {
    const parametro = await this.parametroService.getPorIdOuChave(idOuChave);
    if (!parametro) {
      throw new NegocioException('Parâmetro não localizado!');
    }
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':idOuChave')
  async delete(@Param('idOuChave') idOuChave) {
    return await this.parametroService.excluir(idOuChave);
  }
}
