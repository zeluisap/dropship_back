import { Injectable } from '@nestjs/common';
import { PedidoService } from '../pedido/pedido.service';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Retirada } from './retirada-mongo';
import { RetiradaSituacao, SolicitarRetiradaDto } from './retirada-dto';
import { UsersService } from '../users/users.service';
import { NegocioException } from 'src/exceptions/negocio-exception';
import * as moment from 'moment';
import * as _ from 'lodash';

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

  async solicitar(dto: SolicitarRetiradaDto) {
    const valorDisponivel = await this.pedidoService.getTotalRetiradaDisponivel();
    if (!valorDisponivel) {
      throw new NegocioException(
        'Falha ao solicitar retirada, você não possui valores disponíveis.',
      );
    }

    const valor = _.get(dto, 'valor');
    if (!valor) {
      throw new NegocioException(
        'Falha ao solicitar retirada, nenhum valor solicitado.',
      );
    }

    if (valor > valorDisponivel) {
      throw new NegocioException(
        'Valor solicitado maior que o valor disponível [' +
          valorDisponivel +
          '].',
      );
    }

    const itensDisponiveis = await this.pedidoService.getRetiradaItensDisponiveis();

    const logado = this.userService.getLogado();

    const retirada = new this.retiradaModel();
    retirada.set({
      dataSolicitacao: moment().toDate(),
      valor,
      parceiro: logado._id,
    });

    await retirada.save();

    for (const item of itensDisponiveis) {
      item.set({
        retirada: retirada._id,
      });
      await item.save();
    }

    return retirada;
  }
}
