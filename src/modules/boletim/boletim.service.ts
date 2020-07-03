import { Injectable, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Boletim } from './boletim-mongo';
import * as _ from 'lodash';
import { NotificacaoService } from '../notificacao/notificacao.service';

@Injectable()
export class BoletimService {
  constructor(
    @InjectModel('Boletim') private boletimModel: PaginateModel<Boletim>,
    private http: HttpService,
    private notificacao: NotificacaoService,
  ) {}

  async agenda() {
    const resposta = await this.http
      .post(this.getUrl(), {
        filter: {
          senha: this.getSenha(),
        },
      })
      .toPromise();

    const boletins = _.get(resposta, 'data.listaPacienteHistoricoTodos');

    if (!(boletins && boletins.length)) {
      return 'Nenhum boletim disponível!';
    }

    let contador = 0;
    for (const boletim of boletins) {
      if (!(boletim && boletim.id)) {
        continue;
      }

      let b = await this.boletimModel.findOne({
        dataCadastro: boletim.dataCadastro,
      });

      if (b) {
        continue;
      }

      b = new this.boletimModel(boletim);
      await b.save();

      await this.notificacao.notificaBoletim(b);

      contador++;
    }

    return contador + ' registro(s) adicionado(s).';
  }

  getUrl() {
    return 'https://miura.vozdigital.com.br/infos/boletim/boletim-paciente/obterTodosBoletinsPaciente';
  }

  getSenha() {
    return '61W7A8S7R15';
  }
}
