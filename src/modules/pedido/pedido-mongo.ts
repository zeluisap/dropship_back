import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface Pedido extends Document {
  numero: number;
  cliente: {
    nome: string;
  };
  pagamentos: [{}];
  itens: [
    {
      produto: any;
      quantidade: number;
      precoCheio: number;
      precoCusto: number;
      precoPromocional: number;
      precoVenda: number;
    },
  ];
  situacao: {
    id: number;
    codigo: string;
    nome: string;

    aprovado: boolean;
    cancelado: boolean;
    final: boolean;
    notificar_comprador: boolean;
  };
  dataCriação: Date;
}

export const PedidoSchema = new Schema({
  numero: Number,
  cliente: {
    nome: String,
  },
  pagamentos: [{}],
  items: [
    {
      produto: {
        type: Schema.Types.ObjectId,
        ref: 'Produto',
      },
      quantidade: Number,
      precoCheio: Number,
      precoCusto: Number,
      precoPromocional: Number,
      precoVenda: Number,
    },
  ],
  situacao: {
    id: Number,
    codigo: String,
    nome: String,

    aprovado: Boolean,
    cancelado: Boolean,
    final: Boolean,
    notificar_comprador: Boolean,
  },
  dataCriação: Date,
});

export const getPedidoSchema = function() {
  const schema = PedidoSchema;

  /**
   * se não for ativo ... define ativo como false
   */
  schema.pre('save', function() {
    const objeto = this;

    if (objeto.get('ativo') === undefined) {
      objeto.set({
        ativo: true,
      });
    }
  });

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
