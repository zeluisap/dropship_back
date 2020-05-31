import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface Parametro extends Document {
  chave: string;
  valor: {};
}

export const ParametroSchema = new Schema({
  chave: String,
  valor: {},
});

export const getParametroSchema = function() {
  const schema = ParametroSchema;

  schema.plugin(mongoosePaginate);

  return schema;
};
