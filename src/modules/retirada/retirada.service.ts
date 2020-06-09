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
import { UtilService } from 'src/util/util.service';
import { ReposService } from '../repos/repos.service';
import { NotificacaoService } from '../notificacao/notificacao.service';

@Injectable()
export class RetiradaService {
  constructor(
    private pedidoService: PedidoService,
    private userService: UsersService,
    private util: UtilService,
    private repos: ReposService,
    private notifica: NotificacaoService,
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
    filtros = this.userService.filtroParceiro({ ...filtros });

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
    filtros = this.userService.filtroParceiro({ ...filtros });

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

  async solicitar() {
    const logado = this.userService.getLogado();

    const valorDisponivel = await this.pedidoService.getTotalRetiradaDisponivel(
      {
        parceiro_id: logado._id,
      },
    );

    if (!valorDisponivel) {
      throw new NegocioException(
        'Falha ao solicitar retirada, você não possui valores disponíveis.',
      );
    }

    // const valor = _.get(dto, 'valor');
    // if (!valor) {
    //   throw new NegocioException(
    //     'Falha ao solicitar retirada, nenhum valor solicitado.',
    //   );
    // }

    // if (valor > valorDisponivel) {
    //   throw new NegocioException(
    //     'Valor solicitado maior que o valor disponível [' +
    //       valorDisponivel +
    //       '].',
    //   );
    // }

    const itensDisponiveis = await this.pedidoService.getRetiradaItensDisponiveis(
      {
        parceiro_id: logado._id,
      },
    );

    const retirada = new this.retiradaModel();
    retirada.set({
      dataSolicitacao: moment().toDate(),
      valor: valorDisponivel,
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

  async listar(options: any = {}) {
    let filtros: any = this.userService.filtroParceiro({ ...options });

    const situacao = _.get(options, 'situacao');
    if (situacao) {
      if (!(situacao.toUpperCase() in RetiradaSituacao)) {
        throw new NegocioException('Situação desconhecida.');
      }
      filtros.situacao = situacao.toUpperCase();
    }

    filtros = this.util.filtroEntreDatas(filtros, 'dataSolicitacao');

    options.populate = [
      {
        path: 'parceiro',
        select: 'nome email tipo',
      },
    ];

    return await this.util.paginar(this.retiradaModel, filtros, options);
  }

  async aprovar(id, arquivoId) {
    if (!id) {
      throw new NegocioException('Retirada não localizada!');
    }

    const retirada = await this.retiradaModel
      .findOne({ _id: id })
      .populate('parceiro', 'nome email tipo admin');
    if (!retirada) {
      throw new NegocioException('Retirada não localizada!!');
    }

    if (retirada.cancelada) {
      throw new NegocioException('Retirada cancelada!');
    }

    if (retirada.aprovada) {
      throw new NegocioException('Retirada já aprovada!');
    }

    if (!arquivoId) {
      throw new NegocioException('ID do arquivo do comprovante não informado!');
    }

    try {
      const arquivo = await this.repos.get(arquivoId);
      if (!arquivo) {
        throw new NegocioException('ID de arquivo não encontrado!');
      }
    } catch (error) {
      throw new NegocioException(
        'Falha ao validar arquivo de confirmação de pagamento, entre em contato com o administrador!',
      );
    }

    const logado = this.userService.getLogado();

    retirada.set({
      situacao: RetiradaSituacao.APROVADA,
      aprovacao: {
        dataAprovacao: moment().toDate(),
        usuario: logado._id,
        comprovante: arquivoId,
      },
    });

    const obj = await retirada.save();

    await this.notifica.notificaRetiradaAprovar(retirada);

    return obj;
  }
}
