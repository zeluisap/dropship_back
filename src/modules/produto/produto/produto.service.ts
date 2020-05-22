import { Injectable } from '@nestjs/common';
import { UtilService } from 'src/util/util.service';
import * as _ from 'lodash';
import * as mappers from '../../../util/string.mappers';
import { CurrentUserService } from 'src/modules/auth/current-user/current-user.service';

@Injectable()
export class ProdutoService {
  constructor(
    private utilService: UtilService,
    private currentUserService: CurrentUserService,
  ) {}

  async importar(arquivo) {
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

    const mapeados = {};

    mapeamento.forEach(map => {
      const valorOriginal = _.get(linha, map.nomeCampoNoCSV);
      mapeados[map.nomeCampoNaAPI] = this.runMappers(map, valorOriginal);
    });

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
}
