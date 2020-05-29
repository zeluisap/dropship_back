import { Controller, Post } from '@nestjs/common';
import { PedidoService } from './pedido.service';

@Controller('pedido')
export class PedidoController {
  constructor(private pedidoService: PedidoService) {}

  @Post('agenda/carrega')
  async agendaCarrega() {
    return await this.pedidoService.agendaCarrega();
  }
}
