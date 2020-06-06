import { Controller, Post, UseGuards, Get, Query, Param } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NegocioException } from 'src/exceptions/negocio-exception';

@Controller('pedido')
export class PedidoController {
  constructor(private pedidoService: PedidoService) {}

  // @UseGuards(AdminAuthGuard)
  @Post('agenda/carrega')
  async agendaCarrega() {
    return await this.pedidoService.agendaCarrega();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@Query() options) {
    return await this.pedidoService.listar(options);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPorId(@Param('id') id) {
    const pedido = await this.pedidoService.get(id);
    if (!pedido) {
      throw new NegocioException('Falha, pedido não localizado!');
    }
    return pedido;
  }
}
