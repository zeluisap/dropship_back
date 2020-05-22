import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

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
}
