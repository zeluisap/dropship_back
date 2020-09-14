import {
  Controller,
  UseGuards,
  Get,
  Body,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetiradaService } from './retirada.service';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { SenhaAuthGuard } from '../auth/guards/senha-auth.guard';

@Controller('retirada')
export class RetiradaController {
  constructor(private retiradaService: RetiradaService) {}

  @ApiOperation({
    description: 'Relatório com os valores pagos, disponíveis e próximos.',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'parceiro_id',
    required: false,
    description: 'Identificador do parceiro. (apenas para administrador)',
  })
  @UseGuards(JwtAuthGuard)
  @Get('relatorio')
  async relatorio() {
    return await this.retiradaService.relatorio();
  }

  @ApiOperation({
    description: 'Pedido de retirada de valor.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SenhaAuthGuard)
  @Post('solicitar')
  async solicitar(@Body() params) {
    return await this.retiradaService.solicitar(params);
  }

  @ApiOperation({
    description: 'Confirmar pedido de retirada.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID da retirada.',
  })
  @ApiBody({
    schema: {
      example: {
        arquivo_id: 'ID do arquivo (repositório).',
      },
    },
  })
  @UseGuards(AdminAuthGuard)
  @Post('aprovar/:id')
  async aprovar(@Param('id') id, @Body('arquivo_id') arquivoId) {
    return await this.retiradaService.aprovar(id, arquivoId);
  }

  @ApiOperation({
    description: 'Cancelar pedido de retirada.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID da retirada.',
  })
  @ApiBody({
    schema: {
      example: {
        motivo: 'Motivo do Cancelamento (apenas administrador).',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('cancelar/:id')
  async cancelar(@Param('id') id, @Body('motivo') motivo) {
    return await this.retiradaService.cancelar(id, motivo);
  }

  @ApiOperation({
    description: 'Detalhe da retirada.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID da retirada.',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id) {
    return await this.retiradaService.get(id);
  }

  @ApiOperation({
    description: 'Listagem das retiradas.',
  })
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
    name: 'parceiro_id',
    required: false,
    description: 'Identificador do parceiro. (apenas para administrador)',
  })
  @ApiQuery({
    name: 'situacao',
    required: false,
    description:
      'Situação disponível para o produto: PENDENTE, APROVADA E CANCELADA.',
  })
  @ApiQuery({
    name: 'data_solicitacao_inicio',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'data_solicitacao_fim',
    required: false,
    type: Date,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async listar(@Query() params) {
    return await this.retiradaService.listar(params);
  }
}
