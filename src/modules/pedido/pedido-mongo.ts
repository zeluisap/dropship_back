import { Document, Schema } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface Pedido extends Document {
  numero: number;

  cliente: {
    nome: string;
    email: string;
    cpfCnpj: string;
  };

  pagamentos: [
    {
      formaPagamento: {
        codigo: string;
        nome: string;
      };
      valor: number;
      valorPago: number;
    },
  ];

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
    concluido: boolean;
    notificar_comprador: boolean;
  };

  parceiro: {};

  dataCriacao: Date;
  dataAlteracao: [Date];
}

export const PedidoSchema = new Schema({
  numero: Number,

  cliente: {
    nome: String,
    email: String,
    cpfCnpj: String,
  },

  pagamentos: [
    {
      formaPagamento: {
        codigo: String,
        nome: String,
      },
      valor: Number,
      valorPago: Number,
    },
  ],

  itens: [
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
    concluido: Boolean,
    notificar_comprador: Boolean,
  },

  parceiro: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  dataCriacao: Date,
  dataAlteracao: [Date],
});

export const getPedidoSchema = function() {
  const schema = PedidoSchema;

  schema.plugin(mongoosePaginate);

  return schema;
};
