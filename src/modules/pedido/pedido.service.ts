import { Injectable } from '@nestjs/common';
import { LjService } from '../loja-integrada/lj/lj-service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ProdutoService } from '../produto/produto.service';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';
import { Pedido, PedidoItem } from './pedido-mongo';
import { UtilService } from 'src/util/util.service';
import { UsersService } from '../users/users.service';
import { NegocioException } from 'src/exceptions/negocio-exception';
import { FormaPagamentoService } from '../forma-pagamento/forma-pagamento.service';
import { ParametroService } from '../parametro/parametro.service';
import { VALOR_TICKETS_POR_PAGAMENTO } from '../retirada/retirada-dto';

@Injectable()
export class PedidoService {
  constructor(
    private ljService: LjService,
    private produtoService: ProdutoService,
    private util: UtilService,
    private userService: UsersService,
    @InjectModel('Pedido') private pedidoModel: PaginateModel<Pedido>,
    @InjectModel('PedidoItem')
    private pedidoItemModel: PaginateModel<PedidoItem>,
    private formaPagamentoService: FormaPagamentoService,
    private parametroService: ParametroService,
  ) {}

  async agendaCarrega() {
    const pedidos = await this.ljService.pedidos24Horas();
    if (_.isEmpty(pedidos)) {
      return 'Nenhum pedido encontrado.';
    }

    let total = 0;
    let adicionado = 0;
    let alterado = 0;
    let erro = 0;

    for (const dto of pedidos) {
      const pedidoDto = await this.criaModeloParaSalvamento(dto);

      total++;

      const resp = await this.util.chainCommand(
        this,
        ['adicionar', 'alterar'],
        pedidoDto,
      );

      if (resp.erro && resp.erro.length) {
        erro += resp.erro.length;
        continue;
      }

      adicionado += _.get(resp, 'adicionar') || 0;
      alterado += _.get(resp, 'alterar') || 0;

      const pedido = _.get(resp, 'resposta');

      await this.atualizaItens(pedidoDto, pedido);
    }

    return (
      'Total: ' +
      total +
      ', adicionado(s): ' +
      adicionado +
      ', alterado(s): ' +
      alterado +
      ', erro(s): ' +
      erro +
      '.'
    );
  }

  async adicionar(dto) {
    if (!dto) {
      return null;
    }

    const numero = _.get(dto, 'numero');
    if (!numero) {
      return null;
    }

    const pedidoExiste = await this.pedidoModel.findOne({
      numero,
    });

    if (pedidoExiste) {
      return null;
    }

    const pedido = new this.pedidoModel(dto);

    return await pedido.save();
  }

  async alterar(dto, numero = null) {
    if (!numero) {
      numero = _.get(dto, 'numero');
    }

    if (!numero) {
      return null;
    }

    const pedido = await this.pedidoModel.findOne({
      numero,
    });

    if (!pedido) {
      return null;
    }

    pedido.set(dto);
    pedido.dataAlteracao.push(new Date());

    return await pedido.save();
  }

  async atualizaItens(dto, pedido) {
    if (
      !(pedido && dto && dto.itens && _.isArray(dto.itens) && dto.itens.length)
    ) {
      throw new NegocioException('Falha ao atualizar ítens.');
    }

    const itens = _.get(dto, 'itens');
    for (const item of itens) {
      try {
        let pedidoItem = await this.pedidoItemModel.findOne({
          pedido: pedido._id,
          produto: _.get(item, 'produto._id'),
        });

        if (!pedidoItem) {
          pedidoItem = new this.pedidoItemModel();
        }

        pedidoItem.set({
          ...item,
          pedido: pedido._id,
        });

        await this.atualizaDataRetirada(pedidoItem, pedido);

        await pedidoItem.save();
      } catch (error) {
        continue;
      }
    }
  }

  async atualizaDataRetirada(pedidoItem, pedido = null) {
    if (!pedidoItem) {
      return;
    }

    const situacao = pedido.situacao;
    if (!situacao) {
      return;
    }

    // if (situacao.cancelado) {
    //   return;
    // }

    // if (!situacao.concluido) {
    //   return;
    // }

    if (pedidoItem.dataRetirada) {
      return;
    }

    const prazoDias = await this.getPrazoDias(pedidoItem, pedido);
    if (!prazoDias) {
      return;
    }

    const ultimaDate = pedido.dataAlteracao
      .sort((a, b) => {
        const momentA = moment(a);
        const momentB = moment(b);

        if (momentB.isAfter(a)) {
          return 1;
        }

        if (momentA.isAfter(b)) {
          return -1;
        }

        return 0;
      })
      .shift();

    pedidoItem.set({
      dataRetirada: moment(ultimaDate)
        .add(prazoDias, 'days')
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .toDate(),
    });
  }

  async criaModeloParaSalvamento(dto) {
    const numero = _.get(dto, 'numero');
    const origem_pagamentos = _.get(dto, 'pagamentos') || [];
    const pagamentos = origem_pagamentos.map(pag => {
      return {
        formaPagamento: {
          codigo: _.get(pag, 'forma_pagamento.codigo'),
          nome: _.get(pag, 'forma_pagamento.nome'),
        },
        valor: _.get(pag, 'valor'),
        valorPago: _.get(pag, 'valor_pago'),
      };
    });

    const origem_itens = _.get(dto, 'itens') || [];
    const itens = await Promise.all(
      origem_itens.map(async item => {
        const produto = await this.produtoService.getPorLojaIntegradaId(
          _.get(item, 'id'),
        );

        if (!produto) {
          return null;
        }

        const vendaPrecoCusto = parseInt(_.get(item, 'preco_custo'));
        const produtoPrecoCusto = produto.precoCusto;

        return {
          produto: produto._id,
          parceiro: produto.parceiro,
          quantidade: _.get(item, 'quantidade'),
          precoCheio: _.get(item, 'preco_cheio'),
          precoCusto: vendaPrecoCusto || produtoPrecoCusto || 0,
          precoPromocional: _.get(item, 'preco_promocional'),
          precoVenda: _.get(item, 'preco_venda'),
        };
      }),
    );

    let dataCriacao = null;
    const origem_data_criacao = _.get(dto, 'data_criacao') || null;
    if (origem_data_criacao) {
      dataCriacao = moment(origem_data_criacao).toDate();
    }

    return {
      numero,
      cliente: {
        nome: _.get(dto, 'cliente.nome'),
        email: _.get(dto, 'cliente.email'),
        cpfCnpj:
          _.get(dto, 'cliente.cpf') || _.get(dto, 'cliente.cnpj') || null,
      },
      pagamentos,
      itens,
      situacao: {
        id: _.get(dto, 'situacao.id'),
        codigo: _.get(dto, 'situacao.codigo'),
        nome: _.get(dto, 'situacao.nome'),
        aprovado: _.get(dto, 'situacao.aprovado') || false,
        cancelado: _.get(dto, 'situacao.cancelado') || false,
        concluido: _.get(dto, 'situacao.final') || false,
        notificarComprador: _.get(dto, 'situacao.notificar_comprador') || false,
      },
      dataCriacao,
    };
  }

  async listar(options) {
    let filtros: any = {};

    const cliente_nome = _.get(options, 'cliente_nome');
    if (cliente_nome) {
      filtros['cliente.nome'] = {
        $regex: '.*' + cliente_nome + '.*',
        $options: 'i',
      };
    }

    const numero = _.get(options, 'numero');
    if (numero) {
      filtros['numero'] = numero;
    }

    const retirada_id = _.get(options, 'retirada_id');
    if (retirada_id) {
      filtros.retirada = retirada_id;
    }

    filtros = this.util.filtroEntreDatas(filtros, 'dataCriacao');

    return await this.util.paginar(this.pedidoModel, filtros, options);
  }

  async get(id) {
    if (!id) {
      return null;
    }

    const pedido = await this.pedidoModel.findOne({
      _id: id,
    });

    return pedido;
  }

  /**
   * o momento mais crítico da importação dos pedidos, é o cálculo da data de retirada do produto.
   * O cálculo deverá seguir as seguintes regras:
   *  - verificar entre os pagamentos do pedido, quais formas de pagamentos estão ativas para cálculo.
   *  - das formas de pagamento relacionadas no ítem acima, o sistema deverá selecionar a forma de
   *    pagamento que será considerada no cálculo da seguinte forma:
   *    - pegar o cálculo dos dias para cada uma, seguindo a ordem: parceiro.prazoFormaPagamento,
   *      valor do campo prazo no collection formaPagamento, e o parâmetro PRAZO_RETIRADA_PADRAO.
   *    - após pegar o cálculo de cada uma, verificar qual prazo é o maior e considerálo para retirada.
   *  - calcular a data de retirada a partir dessa quantidade de dias.
   */
  async getPrazoDias(pedidoItem, pedido) {
    if (!(pedidoItem && pedido)) {
      return null;
    }

    const prazoPadrao = await this.parametroService.getValor(
      'PRAZO_RETIRADA_PADRAO',
    );

    const pagamentos = pedido.pagamentos;
    const fps = [];
    for (const pgto of pagamentos) {
      const codigo = pgto.codigo;
      if (!codigo) {
        continue;
      }

      const fp = await this.formaPagamentoService.getPorCodigo(codigo);
      if (!fp) {
        continue;
      }

      if (!fp.ativo) {
        continue;
      }

      fps.push(fp);
    }

    if (!fps.length) {
      return prazoPadrao;
    }

    await pedidoItem
      .populate({
        path: 'produto',
        select: 'parceiro',
      })
      .execPopulate();

    await pedidoItem.produto
      .populate({
        path: 'parceiro',
        select: 'prazoFormaPagamento',
      })
      .execPopulate();

    const prazos = [];
    for (const fp of fps) {
      const prazoParceiro = pedidoItem.get(
        'produto.parceiro.prazoFormaPagamento.' + fp.codigo,
      );

      if (prazoParceiro) {
        prazos.push(prazoParceiro);
        continue;
      }

      if (fp.valor) {
        prazos.push(fp.valor);
        continue;
      }
    }

    if (!prazos.length) {
      return prazoPadrao;
    }

    return prazos.sort().shift();
  }

  async getMarcasRetiradaDisponivel(filtros = {}) {
    filtros = this.userService.filtroParceiro({ ...filtros });

    const disponivel = await this.pedidoItemModel.find({
      dataRetirada: {
        $lte: moment()
          .endOf('day')
          .toDate(),
      },
      retirada: null,
      ...filtros,
    });

    if (!(disponivel && disponivel.length)) {
      return 0;
    }

    let valorTotal = 0;
    for (const p of disponivel) {
      valorTotal = valorTotal + p.precoCusto;
    }

    if (valorTotal <= VALOR_TICKETS_POR_PAGAMENTO) {
      return [0, valorTotal];
    }

    const marcas = [];
    const d = [];
    // valorTotal = 0;
    let valor = 0;
    for (const p of disponivel) {
      valor = valor + p.precoCusto;
      d.push(p);
      marcas.push({
        valor,
        itens: [...d],
      });
      // valorTotal = valorTotal + p.precoCusto;
      // if (valor > VALOR_TICKETS_POR_PAGAMENTO) {
      //   marcas.push(valorTotal);
      //   valor = 0;
      // }
    }

    // if (valor) {
    //   marcas.push(valorTotal);
    // }

    return marcas;
  }

  async getTotalRetiradaDisponivel(filtros = {}) {
    filtros = this.userService.filtroParceiro({ ...filtros });

    const disponivel = await this.pedidoItemModel.aggregate([
      {
        $match: {
          dataRetirada: {
            $lte: moment()
              .endOf('day')
              .toDate(),
          },
          retirada: null,
          ...filtros,
        },
      },
      {
        $group: {
          _id: null,
          valorTotal: {
            $sum: '$precoCusto',
          },
        },
      },
    ]);

    if (!(disponivel && disponivel.length)) {
      return 0;
    }

    return disponivel.shift().valorTotal || 0;
  }

  async getProximasRetiradas(filtros = {}) {
    filtros = this.userService.filtroParceiro({ ...filtros });

    const proximas = await this.pedidoItemModel.aggregate([
      {
        $match: {
          dataRetirada: {
            $gte: moment()
              .add(1, 'days')
              .hour(0)
              .minute(0)
              .second(0)
              .millisecond(0)
              .toDate(),
          },
          retirada: {
            $eq: null,
          },
          ...filtros,
        },
      },
      {
        $group: {
          _id: '$dataRetirada',
          valorTotal: {
            $sum: '$precoCusto',
          },
        },
      },
    ]);

    if (!(proximas && proximas.length)) {
      return [];
    }

    return proximas.map(item => {
      return {
        dataRetirada: moment(item._id).format('YYYY-MM-DD'),
        valor: item.valorTotal,
      };
    });
  }

  async getRetiradaItensDisponiveis(filtros: any = {}) {
    let filtro: any = this.userService.filtroParceiro({ ...filtros });

    filtro = {
      dataRetirada: {
        $lte: moment()
          .endOf('day')
          .toDate(),
      },
      retirada: null,
    };

    if (filtros.ids && filtros.ids.length) {
      filtro._id = {
        $in: filtros.ids.map(id => Types.ObjectId(id)),
      };
    }

    return await this.pedidoItemModel.find(filtro);
  }

  async listarItens(options) {
    const filtros: any = {};

    const parceiro_id = _.get(options, 'parceiro_id');
    if (parceiro_id) {
      filtros['parceiro'] = parceiro_id;
    }

    if (!this.userService.isLogadoAdmin()) {
      const logado = this.userService.getLogado();
      filtros['parceiro'] = logado._id;
    }

    options.populate = [
      {
        path: 'produto',
        select: 'nome',
      },
      {
        path: 'parceiro',
        select: 'nome email tipo',
      },
      {
        path: 'pedido',
        select: 'numero cliente situacao',
      },
    ];

    return await this.util.paginar(this.pedidoItemModel, filtros, options);
  }

  async getItemPorId(id) {
    if (!id) {
      return null;
    }

    const item = await this.pedidoItemModel.findOne({
      _id: id,
    });

    // se não for administrador, verificar se o pedido pertence ao usuário
    if (!this.userService.isLogadoAdmin()) {
      const logado = this.userService.getLogado();
      const parceiro_id = item.get('parceiro._id');
      if (!logado._id.equals(parceiro_id)) {
        throw new NegocioException(
          'Ítem de pedido não pertence ao usuário logado.',
        );
      }
    }

    return item;
  }

  async cancelarRetirada(retirada) {
    if (!(retirada && retirada._id)) {
      return;
    }

    await this.pedidoItemModel.update(
      {
        retirada: retirada._id,
      },
      {
        retirada: null,
      },
      {
        multi: true,
      },
    );
  }
}
