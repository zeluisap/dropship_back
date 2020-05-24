import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { UtilService } from 'src/util/util.service';
import * as _ from 'lodash';
import * as mappers from '../../../util/string.mappers';
import { CurrentUserService } from 'src/modules/auth/current-user/current-user.service';
import { Produto } from '../produto-mongo';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProdutoDto } from '../dto/produto-dto';
import { UsersService } from 'src/modules/users/users.service';
import { LjService } from 'src/modules/loja-integrada/lj/lj-service';

const StatusProduto = {
  ADICIONADO: 1,
  ALTERADO: 2,
};

@Injectable()
export class ProdutoService {
  categorias = null;
  marcas = null;

  usuario = null;

  constructor(
    private utilService: UtilService,
    private currentUserService: CurrentUserService,
    private userService: UsersService,
    private ljService: LjService,
    @InjectModel('Produto') private produtoModel: Model<Produto>,
  ) {}

  async get(id) {
    if (!id) {
      throw new Error('Nenhum ID informado.');
    }

    return this.produtoModel
      .findOne({
        _id: id,
      })
      .populate('parceiro', 'nome');
  }

  async importar(arquivo, parceiroId = null) {
    let usuario = null;
    if (parceiroId) {
      usuario = await this.userService.findOne({
        _id: parceiroId,
      });
      if (!usuario) {
        usuario = await this.currentUserService.getUsuarioLogado();
      }
    }

    const planilhas = this.utilService.dadosPorUploadedArquivo(arquivo);
    const tratados = [];

    for (const p of planilhas) {
      const linhas = _.get(p, 'linhas');

      if (!linhas) {
        return;
      }

      for (const linha of linhas) {
        const linhaTratada = await this.importarLinha(linha, usuario);
        if (!linhaTratada) {
          return;
        }

        tratados.push(linhaTratada);
      }
    }

    return tratados;
  }

  async importarLinha(linha, usuario) {
    if (!linha) {
      return;
    }

    if (!usuario) {
      usuario = await this.currentUserService.getUsuarioLogado();
      if (!usuario) {
        throw 'Falha! Usuário logado não localizado.';
      }
    }

    const { mapeamento } = usuario;
    if (!(mapeamento && mapeamento.length)) {
      throw 'Falha! Nenhum mapeamento informado.';
    }

    const mapeados: any = {};

    mapeamento.forEach(map => {
      const valorOriginal = _.get(linha, map.nomeCampoNoCSV);
      mapeados[map.nomeCampoNaAPI] = this.runMappers(map, valorOriginal);
    });

    let precoCheio = _.get(mapeados, 'preco_cheio');
    if (precoCheio) {
      const percentualLucro = _.get(usuario, 'percentualLucro');
      if (percentualLucro) {
        mapeados.preco_cheio_original = precoCheio;
        mapeados.percentual_lucro = percentualLucro;
        mapeados.preco_cheio =
          precoCheio + (precoCheio * percentualLucro) / 100;
        mapeados.preco_promocional = mapeados.preco_cheio;
      }
    }

    mapeados.id = null;
    const origem_id = _.get(mapeados, 'origem_id');
    if (origem_id) {
      const produto = await this.produtoModel.findOne({
        origemId: origem_id,
      });
      if (produto) {
        mapeados.id = produto.id;
      }
    }

    return mapeados;
  }

  runMappers(map, valorOriginal) {
    if (!(map && map.mappers && map.mappers.length)) {
      return valorOriginal;
    }

    let valor = valorOriginal;
    for (const mapperName of map.mappers) {
      const mapper = _.get(mappers, mapperName);
      if (!mapper) {
        continue;
      }
      valor = mapper(valor);
    }

    return valor;
  }

  async importarConfirma(items, parceiroId = null) {
    let usuario = null;
    if (parceiroId) {
      usuario = await this.userService.findOne({
        _id: parceiroId,
      });
      if (!usuario) {
        usuario = await this.currentUserService.getUsuarioLogado();
      }
    }

    await this.validarProdutos(items);
    /**
     * retirei o controle de sessão .. pois a versão que estou utilizando pra testar .. não disponibiliza esse recurso.
     */
    // const session = await this.produtoModel.db.startSession();
    // session.startTransaction();

    const retorno = {
      adicionados: 0,
      alterados: 0,
    };

    try {
      for (const item of items) {
        // const op = await this.salvarProduto(item, session);
        const op = await this.salvarProduto(item, usuario);
        switch (op) {
          case StatusProduto.ADICIONADO:
            retorno.adicionados++;
            break;
          case StatusProduto.ALTERADO:
            retorno.alterados++;
            break;
        }
      }

      // await session.commitTransaction();

      return retorno;
    } catch (error) {
      // await session.abortTransaction();
      throw error;
    } finally {
      // session.endSession();
    }
  }

  async validarProdutos(items) {
    if (!(items && items.length)) {
      throw 'Falha! nenhum produto recebido.';
    }

    const errors = [];
    for (const item of items) {
      try {
        const obj = plainToClass(ProdutoDto, item);
        await validateOrReject(obj);
      } catch (error) {
        errors.push(error);
      }
    }

    if (_.isEmpty(errors)) {
      return;
    }

    throw new BadRequestException(
      'Falha ao validar dados, verifique a estrutura dos dados e tente novamente.',
    );
  }

  // async salvarProduto(item, session) {
  async salvarProduto(item, usuario) {
    let produto = await this.produtoModel.findOne({
      origemId: item.origem_id,
    });
    // .session(session);

    // const result = this.salvarProdutoSalvo(produto, item, session);
    const result = await this.salvarProdutoSalvo(produto, item, usuario);
    if (result) {
      return result;
    }

    // return this.salvarProdutoNovo(produto, item, session);
    return await this.salvarProdutoNovo(produto, item, usuario);
  }

  // async salvarProdutoNovo(produto, item, session) {
  async salvarProdutoNovo(produto, item, usuario) {
    if (produto) {
      return null;
    }

    produto = new this.produtoModel();

    produto.set({
      origemId: item.origem_id,
      nome: item.nome,
      descricaoCompleta: item.descricao_completa,
      categoria: item.categoria,
      marca: item.marca,

      quantidade: item.quantidade,
      precoCheio: item.preco_cheio,
      precoCusto: item.preco_custo,
      precoPromocional: item.preco_promocional,
      lojaIntegradaImportado: false,

      parceiro: usuario._id,
    });

    // await produto.save({
    //   session,
    // });
    await produto.save();

    return StatusProduto.ADICIONADO;
  }

  async salvarProdutoSalvo(produto, item, usuario) {
    if (!produto) {
      return null;
    }

    produto.set({
      quantidade: item.quantidade,
      precoCheio: item.preco_cheio,
      precoCusto: item.preco_custo,
      precoPromocional: item.preco_promocional,
      lojaIntegradaImportado: false,
      categoria: item.categoria,
      ativo: true,
    });

    // await produto.save({
    //   session,
    // });
    await produto.save();

    return StatusProduto.ALTERADO;
  }

  async atualizaApiAgenda() {
    const pendentes = await this.produtoModel
      .find({
        lojaIntegradaImportado: false,
      })
      .populate('parceiro', 'nome prefixoSku');

    if (_.isEmpty(pendentes)) {
      return 'Nenhum produto disponível para atualização.';
    }

    this.categorias = await this.ljService.listarCategorias();
    this.marcas = await this.ljService.listarMarcas();

    let adicionado = 0;
    let alterado = 0;
    let erro = 0;

    for (const pendente of pendentes) {
      if (!pendente) {
        continue;
      }

      try {
        const novo = await this.atualizaApiAgendaProduto(pendente);
        await this.atualizaApiAgendaPrecoEstoque(pendente);

        if (novo) {
          adicionado++;
        } else {
          alterado++;
        }
      } catch (error) {
        erro++;
      }
    }

    return (
      'Adicionado(s): ' +
      adicionado +
      ', alterado(s): ' +
      alterado +
      ', erro(s): ' +
      erro +
      '.'
    );
  }

  async atualizaApiAgendaProduto(produto) {
    if (!produto) {
      return null;
    }

    const categoria = await this.atualizaCategoria(produto);
    const marca = await this.atualizaMarca(produto);

    let produtoJson = produto.toJSON();

    produtoJson = { ...produtoJson, categoria, marca };

    let novo = true;
    const ljId = _.get(produto, 'lojaIntegradaId');
    if (!_.isEmpty(ljId)) {
      /**
       * código retirado pois para atualizar ... é necessário enviar o objeto inteiro, da mesma
       * forma q é utilizado quando no novo cadastro
       * só queria atualizar o campo "ativo" .. quando o produto já existisse na api
       */

      // return this.ljService.atualizaProduto(produtoJson);
      // return null;
      novo = false;
    }

    const ljProduto = await this.ljService.novoProduto(produtoJson);
    if (!ljProduto) {
      return null;
    }

    const ljProdutoId = _.get(ljProduto, 'id');
    if (!ljProdutoId) {
      return null;
    }

    produto.set({
      lojaIntegradaId: ljProdutoId,
    });

    await produto.save();

    return novo;
  }

  async atualizaApiAgendaPrecoEstoque(produto) {
    if (!produto) {
      return null;
    }

    await this.ljService.atualizaPreco(produto);
    await this.ljService.atualizaEstoque(produto);

    produto.set({
      lojaIntegradaImportado: true,
    });

    await produto.save();
  }

  async atualizaCategoria(produto) {
    const prodNome = _.get(produto, 'categoria');
    if (!prodNome) {
      return null;
    }

    // primeiro cadastra categoria
    const categoria = this.categorias.find(cat => {
      const catNome = _.get(cat, 'nome');
      return catNome.toLowerCase() === prodNome.toLowerCase();
    });

    if (categoria) {
      return categoria;
    }

    return await this.ljService.novaCategoria(prodNome);
  }

  async atualizaMarca(produto) {
    const prodNome = _.get(produto, 'marca');
    if (!prodNome) {
      return null;
    }

    // primeiro cadastra categoria
    const marca = this.marcas.find(marc => {
      const marcNome = _.get(marc, 'nome');
      return marcNome.toLowerCase() === prodNome.toLowerCase();
    });

    if (marca) {
      return marca;
    }

    return await this.ljService.novaMarca(prodNome);
  }
}
