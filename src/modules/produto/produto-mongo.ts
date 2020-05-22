import { Document, Schema } from 'mongoose';

export interface Produto extends Document {
  readonly origemId: string;

  readonly nome: string;
  readonly descricaoCompleta: string;

  readonly peso: number;
  readonly altura: number;
  readonly largura: number;
  readonly profundidade: number;

  readonly categoria: string;
  readonly marca: string;

  quantidade: number;
  precoCheio: number;
  precoCusto: number;
  precoPromocional: number;

  ativo: boolean;
}

export const ProdutoSchema = new Schema({
  origemId: String,

  nome: String,
  descricaoCompleta: String,

  peso: Number,
  altura: Number,
  largura: Number,
  profundidade: Number,

  categoria: String,
  marca: String,

  quantidade: Number,
  precoCheio: Number,
  precoCusto: Number,
  precoPromocional: Number,

  ativo: Boolean,
});

export const getProdutoSchema = function() {
  const schema = ProdutoSchema;

  /**
   * se não for ativo ... define ativo como false
   */
  schema.pre('save', function() {
    const user = this;

    if (user.get('ativo') === undefined) {
      user.set({
        ativo: false,
      });
    }
  });

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
