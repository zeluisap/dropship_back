import { Document, Schema } from 'mongoose';

export interface Produto extends Document {
  readonly origemId: string;
  lojaIntegradaId: string;
  lojaIntegradaImportado: boolean;

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

  parceiro: {
    id: string;
    nome: string;
  };
}

export const ProdutoSchema = new Schema({
  origemId: String,
  lojaIntegradaId: String,
  lojaIntegradaImportado: Boolean,

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

  parceiro: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
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

    if (user.get('lojaIntegradaId') === undefined) {
      user.set({
        lojaIntegradaId: null,
      });
    }

    if (user.get('lojaIntegradaImportado') === undefined) {
      user.set({
        lojaIntegradaImportado: false,
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
