import { Controller, UseGuards, Get, Body, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetiradaService } from './retirada.service';
import { ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

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
  @UseGuards(JwtAuthGuard)
  @Post('solicitar')
  async solicitar() {
    return await this.retiradaService.solicitar();
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
