import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { FormaPagamento } from './forma-pagamento-mongo';
import { UtilService } from 'src/util/util.service';
import * as _ from 'lodash';
import { CreateFormaPagamentoDto } from './forma-pagamento-dto';
import { NegocioException } from 'src/exceptions/negocio-exception';
import { LjService } from '../loja-integrada/lj/lj-service';

@Injectable()
export class FormaPagamentoService {
  constructor(
    @InjectModel('FormaPagamento')
    private formaPagamentoModel: PaginateModel<FormaPagamento>,
    private util: UtilService,
    private ljService: LjService,
  ) {}

  async listar(params) {
    const filtros: any = {};

    const codigo = _.get(params, 'codigo');
    if (codigo) {
      filtros['codigo'] = codigo.toLowerCase();
    }

    const nome = _.get(params, 'nome');
    if (nome) {
      filtros['nome'] = { $regex: '.*' + nome + '.*', $options: 'i' };
    }

    params.sort = 'codigo';

    return await this.util.paginar(this.formaPagamentoModel, filtros, params);
  }

  async adicionar(dto: CreateFormaPagamentoDto) {
    if (!dto) {
      throw new NegocioException('Falha, dados inválidos.');
    }

    let fp = await this.formaPagamentoModel.findOne({
      codigo: dto.codigo.toLowerCase(),
    });

    if (fp) {
      throw new NegocioException('Falha, Código já cadastrado!');
    }

    fp = new this.formaPagamentoModel(dto);

    return await fp.save();
  }

  async alterar(id, dto) {
    if (!(id && dto)) {
      throw new NegocioException('Falha, dados inválidos!');
    }

    const fp = await this.formaPagamentoModel.findOne({
      _id: id,
    });

    if (!fp) {
      throw new NegocioException('Falha, ID não localizado!');
    }

    fp.set(dto);

    return await fp.save();
  }

  async delete(id) {
    if (!id) {
      throw new NegocioException('Falha, dados inválidos!');
    }

    const fp = await this.formaPagamentoModel.findOne({
      _id: id,
    });

    if (!fp) {
      throw new NegocioException('Falha, ID não localizado!');
    }

    return await fp.remove();
  }

  async agenda() {
    const ljFormas = await this.ljService.listarFormaPagamento();
    if (!(ljFormas && ljFormas.length)) {
      throw new NegocioException(
        'Nenhuma forma de pagamento disponível no loja integrada.',
      );
    }

    let atualizados = 0;
    for (const ljForma of ljFormas) {
      atualizados++;

      const codigo = _.get(ljForma, 'codigo').toLowerCase();
      const nome = _.get(ljForma, 'nome');
      if (!(codigo && nome)) {
        continue;
      }

      let fp = await this.formaPagamentoModel.findOne({
        codigo,
      });

      if (!fp) {
        fp = new this.formaPagamentoModel();
      }

      fp.set({
        codigo,
        nome,
      });

      await fp.save();
    }

    return 'Total: ' + atualizados + ' registro(s) atualizado(s).';
  }

  async get(id) {
    if (!id) {
      return null;
    }

    return await this.formaPagamentoModel.findOne({
      _id: id,
    });
  }
}
