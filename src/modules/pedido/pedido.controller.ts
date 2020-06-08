import { Controller, Post, UseGuards, Get, Query, Param } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NegocioException } from 'src/exceptions/negocio-exception';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@Controller('pedido')
export class PedidoController {
  constructor(private pedidoService: PedidoService) {}

  @ApiOperation({
    description: 'Sincronização dos pedidos efetuados. (Agendamento)',
  })
  // @UseGuards(AdminAuthGuard)
  @Post('agenda/carrega')
  async agendaCarrega() {
    return await this.pedidoService.agendaCarrega();
  }

  @ApiOperation({
    description: 'Listagem de ítens de Pedido.',
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
    description: 'Filtra os pedidos por parceiro. (apenas administrador)',
  })
  @UseGuards(JwtAuthGuard)
  @Get('item')
  async listarItens(@Query() options) {
    return await this.pedidoService.listarItens(options);
  }

  @ApiOperation({
    description: 'Detalhe de um pedido.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID do ítem do pedido.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('item/:id')
  async getItemPorId(@Param('id') id) {
    const item = await this.pedidoService.getItemPorId(id);
    if (!item) {
      throw new NegocioException('Falha, ítem de pedido não localizado!');
    }
    return item;
  }

  @ApiOperation({
    description: 'Listagem de pedidos.',
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
    name: 'cliente_nome',
    required: false,
  })
  @ApiQuery({
    name: 'numero',
    required: false,
  })
  @ApiQuery({
    name: 'retirada_id',
    required: false,
    description: 'ID da retirada.',
  })
  @ApiQuery({
    name: 'data_criacao_inicio',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'data_criacao_fim',
    required: false,
    type: Date,
  })
  @UseGuards(AdminAuthGuard)
  @Get()
  async get(@Query() options) {
    return await this.pedidoService.listar(options);
  }

  @ApiOperation({
    description: 'Detalhe do pedido.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID do pedido.',
  })
  @UseGuards(AdminAuthGuard)
  @Get(':id')
  async getPorId(@Param('id') id) {
    const pedido = await this.pedidoService.get(id);
    if (!pedido) {
      throw new NegocioException('Falha, pedido não localizado!');
    }
    return pedido;
  }
}
