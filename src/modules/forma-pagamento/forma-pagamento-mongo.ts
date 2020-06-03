import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface FormaPagamento extends Document {
  codigo: string;
  nome: string;
  prazo: number;
}

export const getFormaPagamentoSchema = function() {
  const schema = new Schema({
    codigo: String,
    nome: String,
    prazo: Number,
  });

  schema.plugin(mongoosePaginate);

  return schema;
};
