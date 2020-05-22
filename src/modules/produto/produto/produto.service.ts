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

const StatusProduto = {
  ADICIONADO: 1,
  ALTERADO: 2,
};

@Injectable()
export class ProdutoService {
  usuario = null;

  constructor(
    private utilService: UtilService,
    private currentUserService: CurrentUserService,
    @InjectModel('Produto') private produtoModel: Model<Produto>,
  ) {}

  async importar(arquivo) {
    const usuario = await this.currentUserService.getUsuarioLogado();
    const planilhas = this.utilService.dadosPorUploadedArquivo(arquivo);
    const tratados = [];

    for (const p of planilhas) {
      const linhas = _.get(p, 'linhas');

      if (!linhas) {
        return;
      }

      for (const linha of linhas) {
        const linhaTratada = await this.importarLinha(linha);
        if (!linhaTratada) {
          return;
        }

        tratados.push(linhaTratada);
      }
    }

    return tratados;
  }

  async importarLinha(linha) {
    if (!linha) {
      return;
    }

    const usuario = await this.currentUserService.getUsuarioLogado();
    if (!usuario) {
      throw 'Falha! Usuário logado não localizado.';
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

  async importarConfirma(items) {
    this.validarProdutos(items);
    // const session = await this.produtoModel.db.startSession();
    // session.startTransaction();

    const retorno = {
      adicionados: 0,
      alterados: 0,
    };

    try {
      for (const item of items) {
        // const op = await this.salvarProduto(item, session);
        const op = await this.salvarProduto(item);
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
  async salvarProduto(item) {
    let produto = await this.produtoModel.findOne({
      origemId: item.origem_id,
    });
    // .session(session);

    // const result = this.salvarProdutoSalvo(produto, item, session);
    const result = await this.salvarProdutoSalvo(produto, item);
    if (result) {
      return result;
    }

    // return this.salvarProdutoNovo(produto, item, session);
    return await this.salvarProdutoNovo(produto, item);
  }

  // async salvarProdutoNovo(produto, item, session) {
  async salvarProdutoNovo(produto, item) {
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
    });

    // await produto.save({
    //   session,
    // });
    await produto.save();

    return StatusProduto.ADICIONADO;
  }

  async salvarProdutoSalvo(produto, item) {
    if (!produto) {
      return null;
    }

    produto.set({
      quantidade: item.quantidade,
      precoCheio: item.preco_cheio,
      precoCusto: item.preco_custo,
      precoPromocional: item.preco_promocional,
    });

    // await produto.save({
    //   session,
    // });
    await produto.save();

    return StatusProduto.ALTERADO;
  }
}