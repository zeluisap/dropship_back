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
      text: not.conteudo, // plaintext body
      html: not.conteudoHtml, // HTML body content
    };

    const result = await this.mailerService.sendMail(dto);

    not.sucesso = true;
  }
}
