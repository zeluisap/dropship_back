import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import * as removeAcents from 'remove-accents';
import { NegocioException } from 'src/exceptions/negocio-exception';

@Injectable()
export class UtilService {
  dadosPorUploadedArquivo(arquivo) {
    if (!arquivo) {
      return null;
    }

    const workbook = XLSX.read(arquivo.buffer);

    const planilhas = [];

    workbook.SheetNames.forEach(nomePlanilha => {
      // console.log({
      //   nomePlanilha,
      //   dados: XLSX.utils.sheet_to_json(workbook.Sheets[nomePlanilha]),
      // });

      // dados.push({
      //   nomePlanilha,
      //   dados: XLSX.utils.sheet_to_json(workbook.Sheets[nomePlanilha]),
      // });
      const dados = [];

      const sheet = workbook.Sheets[nomePlanilha];
      var range = XLSX.utils.decode_range(sheet['!ref']);

      const titulos = [];

      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: colNum })];
        titulos.push(cell.v);
      }

      for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const linha = {};

        for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
          const titulo = titulos[colNum];

          const cell = sheet[XLSX.utils.encode_cell({ r: rowNum, c: colNum })];

          const valor_w = _.get(cell, 'w');
          const valor_v = _.get(cell, 'v');

          if (valor_w) {
            linha[titulo] = valor_w;
            continue;
          }

          linha[titulo] = valor_v;
        }

        dados.push(linha);
      }

      planilhas.push({
        planilha: nomePlanilha,
        linhas: dados,
      });
    });

    return planilhas;
  }

  removeAcentos(texto) {
    return removeAcents(texto);
  }

  async paginar(model: any, filtro, options) {
    const page = _.get(options, 'page') || 1;
    const limit = _.get(options, 'limit') || 20;

    if (limit < 1 || limit > 50) {
      throw new NegocioException('O valor do limit deve estar entre 1 e 50.');
    }

    const populate = _.get(options, 'populate');
    const sort = _.get(options, 'sort');

    return await model.paginate(filtro, { page, limit, populate, sort });
  }

  async chainCommand(objeto, commands, ...args) {
    if (!objeto) {
      throw new NegocioException(
        'Falha ao executar comandos, objeto não definido!',
      );
    }

    if (!(commands && _.isArray(commands) && commands.length)) {
      throw new NegocioException(
        'Falha ao executar comandos, comandos inválidos!',
      );
    }

    const result = {
      erro: [],
      resposta: null,
    };

    for (const command of commands) {
      try {
        if (!result.hasOwnProperty(command)) {
          result[command] = 0;
        }

        const resp = await objeto[command](...args);
        if (resp) {
          result.resposta = resp;
          result[command]++;
          break;
        }
      } catch (error) {
        result.erro.push(error);
      }
    }

    return result;
  }
}
