import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificacaoEmail } from './notificacao-mongo';
import { NegocioException } from 'src/exceptions/negocio-exception';
import { MailerService } from '@nestjs-modules/mailer';
import moment = require('moment');

@Injectable()
export class NotificacaoService {
  constructor(
    @InjectModel('NotificacaoEmail')
    private notificacaoEmailModel: Model<NotificacaoEmail>,
    private mailerService: MailerService,
  ) {}

  async notificar(dados) {
    dados.template = 'acao';
    const notificacao = new this.notificacaoEmailModel(dados);
    return await notificacao.save();
  }

  async notificarNovoUser(user, urlAtivacao) {
    const dados = {
      destinatario: {
        email: user.email,
        nome: user.nome,
      },
      context: {
        nome: user.nome,
        link: urlAtivacao,
      },
      titulo: 'Novo usuário cadastrado',
      template: 'user_novo',
    };

    const notificacao = new this.notificacaoEmailModel(dados);
    return await notificacao.save();
  }

  async agenda() {
    const nots = await this.notificacaoEmailModel.find({
      processado: false,
    });

    if (!(nots && nots.length)) {
      throw new NegocioException('Nenhuma Notificação Disponível!');
    }

    let total = nots.length;
    let enviados = 0;
    let erros = 0;

    for (let not of nots) {
      try {
        await this.enviar(not);
        enviados++;
      } catch (error) {
        console.log({
          error,
        });
        not.erro = error.message;
        erros++;
      } finally {
        not.processado = true;
        not.dataProcessamento = moment().toDate();
      }

      await not.save();
    }

    return (
      'Total: ' + total + '. => ' + enviados + ' enviados, ' + erros + ' erros.'
    );
  }

  async enviar(not) {
    if (!not) {
      return;
    }

    const dto = {
      to: not.destinatario.email, // list of receivers
      subject: not.titulo, // Subject line
      template: 'dropship_' + not.template,
      context: not.context,
      // text: not.conteudo, // plaintext body
      // html: not.conteudoHtml, // HTML body content
    };

    await this.mailerService.sendMail(dto);

    not.sucesso = true;
  }

  async notificaRetiradaAprovar(retirada) {
    const dados = {
      destinatario: {
        email: retirada.get('parceiro.email'),
        nome: retirada.get('parceiro.nome'),
      },
      context: {
        nome: retirada.get('parceiro.nome'),
        data_solicitacao: moment(retirada.get('dataSolicitacao')).format(
          'DD/MM/YYYY',
        ),
        valor: 'R$: ' + retirada.get('valor'),
      },
      titulo: 'Retirada Aprovada',
      template: 'retirada_aprovada',
    };

    const notificacao = new this.notificacaoEmailModel(dados);
    return await notificacao.save();
  }

  async notificaRetiradaCanceladaPeloAdmin(retirada) {
    const dados = {
      destinatario: {
        email: retirada.get('parceiro.email'),
        nome: retirada.get('parceiro.nome'),
      },
      context: {
        nome: retirada.get('parceiro.nome'),
        data_solicitacao: moment(retirada.get('dataSolicitacao')).format(
          'DD/MM/YYYY',
        ),
        valor: 'R$: ' + retirada.get('valor'),
        motivo: retirada.get('analise.motivo'),
      },
      titulo: 'Retirada cancelada pelo administrador.',
      template: 'retirada_cancelada_admin',
    };

    const notificacao = new this.notificacaoEmailModel(dados);
    return await notificacao.save();
  }

  async notificaRetiradaCanceladaPeloParceiro(retirada) {
    const dados = {
      destinatario: {
        email: retirada.get('parceiro.email'),
        nome: retirada.get('parceiro.nome'),
      },
      context: {
        nome: retirada.get('parceiro.nome'),
        data_solicitacao: moment(retirada.get('dataSolicitacao')).format(
          'DD/MM/YYYY',
        ),
        valor: 'R$: ' + retirada.get('valor'),
        motivo:
          'Cancelado a pedido do parceiro em ' +
          moment(retirada.get('analise.dataAnalise')).format('DD/MM/YYYY') +
          '.',
      },
      titulo: 'Retirada cancelada',
      template: 'retirada_cancelada_parceiro',
    };

    const notificacao = new this.notificacaoEmailModel(dados);
    return await notificacao.save();
  }

  async notificaBoletim(boletim) {
    const infos = boletim.dadosHistoricoPaciente.split('\n').map(info => {
      const partes = info.split(': ');
      return {
        label: partes[0],
        valor: partes[1],
      };
    });

    const data_boletim = moment(boletim.get('dataCadastro')).format(
      'DD/MM/YYYY HH:mm:ss',
    );

    const dados = {
      destinatario: {
        email: 'zeluis.ap@gmail.com',
        nome: 'José Luís',
      },
      context: {
        data_boletim,
        dados: infos,
      },
      titulo: 'Novo boletim - ' + data_boletim,
      template: 'boletim',
    };

    const notificacao = new this.notificacaoEmailModel(dados);
    return await notificacao.save();
  }
}
