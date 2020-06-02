import { Injectable } from '@nestjs/common';
import { LjService } from '../loja-integrada/lj/lj-service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ProdutoService } from '../produto/produto/produto.service';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';
import { Pedido, PedidoItem } from './pedido-mongo';
import { UtilService } from 'src/util/util.service';
import { UsersService } from '../users/users.service';
import { NegocioException } from 'src/exceptions/negocio-exception';

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
          'produto._id': _.get(item, 'produto._id'),
        });

        if (!pedidoItem) {
          pedidoItem = new this.pedidoItemModel();
        }

        pedidoItem.set({
          ...item,
          pedido: pedido._id,
        });

        await pedidoItem.save();
      } catch (error) {
        continue;
      }
    }
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

        return {
          produto: produto._id,
          quantidade: _.get(item, 'quantidade'),
          precoCheio: _.get(item, 'preco_cheio'),
          precoCusto: _.get(item, 'preco_custo'),
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
        notificar_comprador:
          _.get(dto, 'situacao.notificar_comprador') || false,
      },
      dataCriacao,
    };
  }

  async listar(options) {
    const filtros: any = {};

    const cliente_nome = _.get(options, 'cliente_nome');
    if (cliente_nome) {
      filtros['cliente.nome'] = {
        $regex: '.*' + cliente_nome + '.*',
        $options: 'i',
      };
    }

    const parceiro_nome = _.get(options, 'parceiro_nome');
    if (parceiro_nome) {
      filtros['parceiro.nome'] = {
        $regex: '.*' + parceiro_nome + '.*',
        $options: 'i',
      };
    }

    const numero = _.get(options, 'numero');
    if (numero) {
      filtros['numero'] = numero;
    }

    let dataInicio = _.get(options, 'data_inicio');
    if (dataInicio) {
      dataInicio = moment(dataInicio)
        .set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .toDate();
      filtros['dataCriacao'] = { $gt: dataInicio };
    }

    let dataFim = _.get(options, 'data_fim');
    if (dataFim) {
      dataFim = moment(dataInicio)
        .set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .toDate();

      if (filtros.hasOwnProperty('dataCriacao')) {
        filtros['dataCriacao'] = { $lt: dataFim };
      } else {
        filtros['dataCriacao'] = { ...filtros.dataCriacao, $lt: dataFim };
      }
    }

    if (!this.userService.isLogadoAdmin()) {
      const logado = this.userService.getLogado();
      filtros['parceiro'] = logado._id;
    }

    options.populate = {
      path: 'parceiro',
      select: 'nome email',
    };

    return await this.util.paginar(this.pedidoModel, filtros, options);
  }

  async get(id) {
    if (!id) {
      return null;
    }

    const pedido = await this.pedidoModel
      .findOne({
        _id: id,
      })
      .populate('parceiro', 'nome email cpfCnpj');

    // se não for administrador, verificar se o pedido pertence ao usuário
    if (!this.userService.isLogadoAdmin()) {
      const logado = this.userService.getLogado();
      const parceiro_id = pedido.get('parceiro._id');
      if (!logado._id.equals(parceiro_id)) {
        throw new NegocioException('Pedido não pertence ao usuário logado.');
      }
    }

    return pedido;
  }
}
