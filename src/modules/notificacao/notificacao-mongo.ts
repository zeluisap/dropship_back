import { Document, Schema } from 'mongoose';

export interface Notificacao extends Document {
  titulo: string;
  conteudo: string;
  processado: boolean;
  dataProcessamento: Date;
  sucesso: boolean;
  erro: string;
}

export interface NotificacaoEmail extends Notificacao {
  destinatario: {
    email: string;
    nome: string;
  };
  conteudoHtml: string;
  context: {};
  template: string;
}

export const NotificacaoEmailSchema = new Schema({
  destinatario: {
    email: String,
    nome: String,
  },
  titulo: String,
  conteudo: String,
  conteudoHtml: String,
  dataProcessamento: Date,
  processado: Boolean,
  sucesso: Boolean,
  erro: String,
  context: {},
  template: String,
});

export const getNotificacaoEmailSchema = function() {
  const schema = NotificacaoEmailSchema;

  /**
   * se não for ativo ... define ativo como false
   */
  schema.pre('save', function() {
    const user = this;

    let dados: any = {};

    if (user.get('processado') === undefined) {
      dados.processado = false;
    }

    if (user.get('sucesso') === undefined) {
      dados.sucesso = false;
    }

    user.set(dados);
  });

  return schema;
};
