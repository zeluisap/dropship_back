import { Injectable } from '@nestjs/common';
import { LjService } from '../loja-integrada/lj/lj-service';
import * as _ from 'lodash';

@Injectable()
export class PedidoService {
  constructor(private ljService: LjService) {}

  async agendaCarrega() {
    const pedidos = await this.ljService.pedidos24Horas();
    if (_.isEmpty(pedidos)) {
      return 'Nenhum pedido encontrado.';
    }

    for (const pedido of pedidos) {
    }
  }
}
