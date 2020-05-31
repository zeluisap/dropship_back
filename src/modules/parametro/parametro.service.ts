import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';
import { Parametro } from './parametro-mongo';
import { NegocioException } from 'src/exceptions/negocio-exception';
import * as removeAccents from 'remove-accents';
import * as _ from 'lodash';
import { UtilService } from 'src/util/util.service';
import { CreateParametroDto } from './parametro-dto';

@Injectable()
export class ParametroService {
  constructor(
    @InjectModel('Parametro') private parametroModel: PaginateModel<Parametro>,
    private util: UtilService,
  ) {}

  async set(chave, valor) {
    if (!(chave && valor)) {
      throw new NegocioException('Falha, chave ou valor não informados!');
    }

    if (!this.validaChave(chave)) {
      throw new NegocioException(
        'Falha, chave deve ser string, não deve conter caracteres especiais e nem espaços!',
      );
    }

    let parametro: any = await this.getPorIdOuChave(chave);
    if (!parametro) {
      parametro = new this.parametroModel();
    }

    parametro.set({
      chave: chave.toUpperCase(),
      valor,
    });

    return await parametro.save();
  }

  async getValor(chave) {
    const parametro = await this.getPorIdOuChave(chave);

    if (!parametro) {
      return null;
    }

    return parametro.valor;
  }

  validaChave(chave) {
    if (typeof chave !== 'string') {
      return false;
    }

    if (removeAccents.has(chave)) {
      return false;
    }

    if (chave.indexOf(' ') > -1) {
      return false;
    }

    return true;
  }

  async listar(options) {
    const filtros: any = {};

    const chave = _.get(options, 'chave');

    if (chave) {
      filtros['chave'] = chave.toUpperCase();
    }

    return await this.util.paginar(this.parametroModel, filtros, options);
  }

  async adicionar(dto: CreateParametroDto) {
    return await this.set(dto.chave, dto.valor);
  }

  async getPorIdOuChave(idOuChave) {
    if (!idOuChave) {
      return null;
    }

    const $or: any[] = [
      {
        chave: idOuChave.toUpperCase(),
      },
    ];

    if (Types.ObjectId.isValid(idOuChave)) {
      $or.push({
        _id: idOuChave,
      });
    }

    return await this.parametroModel.findOne({
      $or,
    });
  }

  async excluir(idOuChave) {
    const parametro = await this.getPorIdOuChave(idOuChave);
    if (!parametro) {
      throw new NegocioException('Parâmetro não localizado!');
    }
    return await parametro.remove();
  }
}
