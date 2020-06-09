import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { RetiradaSituacao } from './retirada-dto';

export interface Retirada extends Document {
  dataSolicitacao: Date;
  valor: number;
  situacao: string;
  observacao: {};
  parceiro: {};
  analise: {
    dataAnalise: Date;
    usuario: {};
    comprovante: {};
    motivo: string;
  };

  pendente: boolean;
  cancelada: boolean;
  aprovada: boolean;
}

export const getRetiradaSchema = function() {
  const schema = new Schema(
    {
      dataSolicitacao: Date,
      valor: Number,
      situacao: String,
      observacao: {},
      parceiro: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      analise: {
        dataAnalise: Date,
        usuario: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        comprovante: {},
        motivo: String,
      },
    },
    { toJSON: { virtuals: true } },
  );

  schema.pre('save', function() {
    if (this.get('situacao') === undefined) {
      this.set({
        situacao: RetiradaSituacao.PENDENTE,
      });
    }
  });

  schema.virtual('pendente').get(function() {
    return this.situacao === RetiradaSituacao.PENDENTE;
  });

  schema.virtual('cancelada').get(function() {
    return this.situacao === RetiradaSituacao.CANCELADA;
  });

  schema.virtual('aprovada').get(function() {
    return this.situacao === RetiradaSituacao.APROVADA;
  });

  schema.plugin(mongoosePaginate);

  return schema;
};
