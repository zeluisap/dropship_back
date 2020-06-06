import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface FormaPagamento extends Document {
  codigo: string;
  nome: string;
  prazo: number;
  ativo: boolean;
}

export const getFormaPagamentoSchema = function() {
  const schema = new Schema({
    codigo: String,
    nome: String,
    prazo: Number,
    ativo: Boolean,
  });

  schema.pre('save', function() {
    const obj = this;
    if (obj.get('ativo') === undefined) {
      obj.set({
        ativo: true,
      });
    }
  });

  schema.plugin(mongoosePaginate);

  return schema;
};
