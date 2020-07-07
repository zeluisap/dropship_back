import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { UtilService } from 'src/util/util.service';
import * as _ from 'lodash';
import * as mappers from '../../util/string.mappers';
import { CurrentUserService } from 'src/modules/auth/current-user/current-user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel } from 'mongoose';
import { validateOrReject, isDecimal } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UsersService } from 'src/modules/users/users.service';
import { LjService } from 'src/modules/loja-integrada/lj/lj-service';
import { NegocioException } from 'src/exceptions/negocio-exception';
import { CreateProdutoDto, EditarProdutoDto } from './produto-dto';
import { Produto } from './produto-mongo';
import { ReposService } from '../repos/repos.service';

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
    @InjectModel('Produto') private produtoModel: PaginateModel<Produto>,
    private util: UtilService,
    private repos: ReposService,
  ) {}

  async get(id) {
    if (!id) {
      throw new Error('Nenhum ID informado.');
    }

    return this.produtoModel
      .findOne({
        _id: id,
      })
      .populate('parceiro', 'nome email');
  }

  async importar(arquivo, parceiroId = null) {
    let usuario = null;
    if (parceiroId) {
      usuario = await this.userService.findOne({
        _id: parceiroId,
      });
    }
    if (!usuario) {
      usuario = await this.userService.getLogado();
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

    for (const map of mapeamento) {
      const valorOriginal = _.get(linha, map.nomeCampoNoCSV);
      mapeados[map.nomeCampoNaAPI] = this.runMappers(map, valorOriginal);
    }

    let precoCheio = _.get(mapeados, 'precoCheio');
    if (!precoCheio) {
      precoCheio = 0;
    }

    // const percentualLucro = _.get(usuario, 'percentualLucro');
    // if (percentualLucro) {
    //   mapeados.lucro = {
    //     tipo: TipoLucro.PERCENTUAL,
    //     valor: percentualLucro,
    //   };
    // }

    // if (precoCheio) {
    //   const percentualLucro = _.get(usuario, 'percentualLucro');
    //   if (percentualLucro) {
    //     mapeados.preco_cheio_original = precoCheio;
    //     mapeados.percentual_lucro = percentualLucro;
    //     mapeados.preco_cheio =
    //       precoCheio + (precoCheio * percentualLucro) / 100;
    //   }
    // }

    mapeados.precoCheio = precoCheio;
    mapeados.precoPromocional = precoCheio;

    mapeados.id = null;
    const origemId = _.get(mapeados, 'origemId');
    if (origemId) {
      const produto = await this.produtoModel.findOne({
        origemId,
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
        const obj = plainToClass(CreateProdutoDto, item);
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
      origemId: item.origemId,
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

    await this.validaImagens(item);

    produto = new this.produtoModel();

    produto.set({
      ...item,
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

    const campos = [
      'quantidade',
      'precoCheio',
      'precoCusto',
      'precoPromocional',
      'categoria',
      'lucro',
      'ativo',
      'imagens',
    ];

    const dto = {
      lojaIntegradaImportado: false,
    };

    for (const campo of campos) {
      if (_.isUndefined(item[campo])) {
        continue;
      }

      dto[campo] = _.get(item, campo);
    }

    produto.set(dto);

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
        // 'parceiro.autorizado': true,
      })
      .populate('parceiro', 'nome prefixoSku autorizado');

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
        await this.atualizaImagens(pendente);

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

  async atualizaImagemPrincipal(produto) {
    if (!(produto && produto.imagemPrincipal)) {
      return;
    }

    const imagem = produto.imagemPrincipal;

    const info = await this.repos.get(imagem);

    await this.ljService.addImagem(produto, info, true);
  }

  async atualizaImagens(produto) {
    const imagens = _.get(produto, 'imagens');
    if (!(imagens && imagens.length)) {
      return;
    }

    // atualizar as imagens no api agenda
    const ljProdutoId = produto.lojaIntegradaId;
    if (!ljProdutoId) {
      return;
    }

    //atualiza imagem principal
    await this.atualizaImagemPrincipal(produto);

    if (!(produto.imagens && produto.imagens.length)) {
      return;
    }

    let ljImagens = await this.ljService.listarImagens(ljProdutoId);

    for (const imagem of produto.imagens) {
      const info = await this.repos.get(imagem);
      if (ljImagens && ljImagens.length) {
        const existe = ljImagens.some(ljImagem => {
          return false;
        });
        if (existe) {
          continue;
        }
      }

      await this.ljService.addImagem(produto, info, false);
    }
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

  async listar(options) {
    const filtros: any = {};
    const nome = _.get(options, 'nome');
    if (nome) {
      filtros['nome'] = { $regex: '.*' + nome + '.*', $options: 'i' };
    }

    if (this.userService.isLogadoAdmin()) {
      const parceiro_id = _.get(options, 'parceiro_id');
      if (parceiro_id) {
        filtros['parceiro._id'] = parceiro_id;
      }
    }

    return await this.util.paginar(this.produtoModel, filtros, options);
  }

  async novo(dto: CreateProdutoDto) {
    const usuario = this.userService.getLogado();

    const origemId = _.get(dto, 'origemId');

    const produto = await this.produtoModel.findOne({
      origemId,
    });
    if (produto) {
      throw new NegocioException(
        'Falha, Existe outro produto com o mesmo origemId.',
      );
    }

    await this.salvarProdutoNovo(null, dto, usuario);

    return await this.produtoModel
      .findOne({
        origemId,
      })
      .populate('parceiro', 'email nome');
  }

  async editar(id, dto: EditarProdutoDto) {
    const usuario = this.userService.getLogado();
    const isAdmin = this.userService.isLogadoAdmin();
    const usuario_id = usuario._id.toJSON();
    if (!usuario_id) {
      throw new NegocioException(
        'Falha, não foi possível identificar o usuário logado.',
      );
    }

    const produto = await this.produtoModel
      .findOne({
        _id: id,
      })
      .populate('parceiro', '_id nome email');
    if (!produto) {
      throw new NegocioException('Falha, produto não localizado.');
    }

    const parceiro_id = produto.get('parceiro._id').toJSON();
    if (!isAdmin && usuario_id !== parceiro_id) {
      throw new NegocioException('Falha, produto não pertence ao parceiro.');
    }

    const lucro = _.get(dto, 'lucro');
    if (lucro && !isAdmin) {
      throw new NegocioException(
        'Falha, campo lucro não permitido para não administrador.',
      );
    }

    await this.validaImagens(dto);

    produto.set({
      ...dto,
      lojaIntegradaImportado: false,
    });

    await produto.save();

    return await produto.populate('parceiro', 'email nome');
  }

  async getPorLojaIntegradaId(id) {
    if (!id) {
      return null;
    }

    const produto = await this.produtoModel.findOne({
      lojaIntegradaId: id,
    });

    if (!produto) {
      return null;
    }

    return produto;
  }

  async validaImagens(item) {
    try {
      const arquivos = await this.carregaImagens(item);
      if (!(arquivos && arquivos.length)) {
        return;
      }

      for (const arquivo of arquivos) {
        if (!arquivo.imagem) {
          throw new NegocioException('Uma dos arquivos enviados não é imagem.');
        }
      }
    } catch (error) {
      throw new NegocioException('Falha ao carregar imagens.');
    }
  }

  async carregaImagens(item) {
    const imagens = _.get(item, 'imagens');
    if (!(imagens && imagens.length)) {
      return;
    }

    const arquivos = [];

    for (const imagem of imagens) {
      const arquivo = await this.repos.get(imagem);
      if (!arquivo) {
        throw new NegocioException('Uma das imagens do produto é inválido!');
      }

      arquivos.push(arquivo);
    }

    return arquivos;
  }
}
