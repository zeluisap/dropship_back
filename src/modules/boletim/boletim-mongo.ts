import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface Boletim extends Document {}

export const getBoletimSchema = function() {
  const schema = new Schema(
    {},
    {
      strict: false,
    },
  );

  schema.plugin(mongoosePaginate);

  // schema.set('toJSON', {
  //   transform: function(doc, ret, options) {
  //     return {
  //       _id: ret._id,
  //       nome: ret.nome,
  //     };
  //   },
  // });

  return schema;
};
