import { Injectable } from '@nestjs/common';
import { PedidoService } from '../pedido/pedido.service';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Retirada } from './retirada-mongo';
import { RetiradaSituacao } from './retirada-dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RetiradaService {
  constructor(
    private pedidoService: PedidoService,
    private userService: UsersService,
    @InjectModel('Retirada') private retiradaModel: PaginateModel<Retirada>,
  ) {}

  /**
   * o relatório da retirada, deve infomar as retiradas feitas, o valor disponível para a data e as datas de
   * retirada futura.
   * listar as retiradas por: pagas, solicitadas.
   */
  async relatorio() {
    return {
      valorPago: await this.getTotalPagas(),
      valorAguardandoAprovacao: await this.getTotalPendentes(),
      valorDisponivel: await this.pedidoService.getTotalRetiradaDisponivel(),
      proximas: await this.pedidoService.getProximasRetiradas(),
    };
  }

  async getTotalPagas(filtros = {}) {
    if (!this.userService.isLogadoAdmin()) {
      const logado = this.userService.getLogado();
      filtros = {
        parceiro: logado._id,
      };
    }

    const pagos = await this.retiradaModel.aggregate([
      {
        $match: {
          situacao: RetiradaSituacao.APROVADA,
          ...filtros,
        },
      },
      {
        $group: {
          _id: null,
          valorPago: {
            $sum: '$valor',
          },
        },
      },
    ]);

    if (!(pagos && pagos.length)) {
      return 0;
    }

    return pagos.shift().valorPago;
  }

  async getTotalPendentes(filtros = {}) {
    if (!this.userService.isLogadoAdmin()) {
      const logado = this.userService.getLogado();
      filtros = {
        parceiro: logado._id,
      };
    }

    const pendentes = await this.retiradaModel.aggregate([
      {
        $match: {
          situacao: RetiradaSituacao.PENDENTE,
          ...filtros,
        },
      },
      {
        $group: {
          _id: null,
          valorPendente: {
            $sum: '$valor',
          },
        },
      },
    ]);

    if (!(pendentes && pendentes.length)) {
      return 0;
    }

    return pendentes.shift().valorPendente;
  }
}
