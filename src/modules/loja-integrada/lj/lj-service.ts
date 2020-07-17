import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LjHttpService } from '../lj-http/lj-http.service';
import { UtilService } from 'src/util/util.service';
import { LjHook } from '../lj-mongo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LjService {
  constructor(
    private config: ConfigService,
    private http: LjHttpService,
    private util: UtilService,
    @InjectModel('LjHook') private ljHookModel: Model<LjHook>,
  ) {}

  async listarCategorias() {
    return await this.http.listarTodos('/categoria');
  }

  async novaCategoria(categoria) {
    if (!categoria) {
      return null;
    }

    return await this.http.post('/categoria', {
      id_externo: null,
      nome: categoria,
      descricao: categoria + '.',
      categoria_pai: null,
    });
  }

  async listarMarcas() {
    return await this.http.listarTodos('/marca');
  }

  async listarFormaPagamento() {
    return await this.http.listarTodos('/pagamento');
  }

  async listarImagens(produtoId) {
    return await this.http.listarTodos('/produto_imagem/?produto=' + produtoId);
  }

  async novaMarca(marca) {
    if (!marca) {
      return null;
    }

    return await this.http.post('/marca', {
      ativo: true,
      id_externo: null,
      nome: marca,
      apelido: this.util
        .removeAcentos(marca)
        .replace(' ', '-')
        .toLowerCase(),
      descricao: marca + '.',
    });
  }

  async novoProduto(produto) {
    if (!produto) {
      return null;
    }

    const ativo = _.get(produto, 'ativo');
    const prefixoSku = _.get(produto, 'parceiro.prefixoSku');
    const origemId = _.get(produto, 'origemId');
    if (!(prefixoSku || origemId)) {
      return null;
    }

    const sku = prefixoSku + '-' + origemId;

    const ljProduto = await this.getProdutoPorSku(sku);
    // if (ljProduto) {
    //   return ljProduto;
    // }

    const nome = _.get(produto, 'nome');
    const descricao_completa = _.get(produto, 'descricaoCompleta');

    const params = {
      sku,
      nome,
      descricao_completa,
      ativo,
      destaque: false,
      tipo: 'normal',
      usado: false,
      removido: false,
    };

    const categoria = _.get(produto, 'categoria.resource_uri');
    if (categoria) {
      params['categorias'] = [categoria];
    }

    const marca = _.get(produto, 'marca.resource_uri');
    if (marca) {
      params['marca'] = marca;
    }

    if (ljProduto) {
      const ljProdutoId = _.get(ljProduto, 'id');
      if (ljProdutoId) {
        /**
         * produto já existe
         */
        return await this.http.put('/produto/' + ljProdutoId, params);
      }
    }

    return await this.http.post('/produto', params);
  }

  async getProdutoPorSku(sku) {
    if (_.isEmpty(sku)) {
      return null;
    }

    const result = await this.http.get('/produto', {
      sku,
    });

    if (!result) {
      return null;
    }

    const produtos = _.get(result, 'objects');
    if (!(produtos && produtos.length)) {
      return null;
    }

    return produtos.shift();
  }

  async atualizaProduto(produto) {
    const ljProdutoId = _.get(produto, 'lojaIntegradaId');
    if (!ljProdutoId) {
      return null;
    }

    const params = {
      ativo: _.get(produto, 'ativo'),
    };

    await this.http.put('/produto/' + ljProdutoId, params);
  }

  async atualizaPreco(produto) {
    const ljProdutoId = _.get(produto, 'lojaIntegradaId');
    if (!ljProdutoId) {
      return null;
    }

    const params = {
      cheio: _.get(produto, 'precoCheio'),
      custo: _.get(produto, 'precoCusto'),
      promocional: _.get(produto, 'precoPromocional'),
    };

    await this.http.put('/produto_preco/' + ljProdutoId, params);
  }

  async atualizaEstoque(produto) {
    const ljProdutoId = _.get(produto, 'lojaIntegradaId');
    if (!ljProdutoId) {
      return null;
    }

    const params = {
      gerenciado: true,
      situacao_em_estoque: 5,
      situacao_sem_estoque: 15,
      quantidade: _.get(produto, 'quantidade'),
    };

    await this.http.put('/produto_estoque/' + ljProdutoId, params);
  }

  async hook(json) {
    const hook = new this.ljHookModel();
    hook.set(json);
    return hook.save();
  }

  async pedidos24Horas() {
    const since_atualizado = moment()
      .subtract(10, 'days')
      .format('YYYY-MM-DD');

    const pedidos = await this.http.listarTodos('/pedido/search', {
      since_atualizado,
    });

    if (_.isEmpty(pedidos)) {
      return null;
    }

    const retorno = [];
    for (const pedido of pedidos) {
      const numero = _.get(pedido, 'numero');
      if (!numero) {
        continue;
      }

      const detalhe = await this.http.get('/pedido/' + numero);
      if (!detalhe) {
        continue;
      }

      retorno.push(detalhe);
    }

    return retorno;
  }

  async addImagem(produto, imagem, principal = false) {
    if (!(produto && produto.id)) {
      return;
    }

    return await this.http.post('/produto_imagem/', {
      imagem_url: imagem.link_download,
      produto: '/api/v1/produto/' + produto.lojaIntegradaId,
      principal,
      posicao: 0,
      mime: imagem.contentType,
    });
  }

  listApiFields() {
    return [
      'origem_id',
      'nome',
      'descricao_completa',
      'categoria',
      'marca',
      'quantidade',
      'preco_cheio',
      'preco_custo',
      'preco_promocional',
    ];
  }
}
