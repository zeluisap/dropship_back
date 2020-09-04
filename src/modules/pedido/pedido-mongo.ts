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

  situacao: {
    id: number;
    codigo: string;
    nome: string;

    aprovado: boolean;
    cancelado: boolean;
    concluido: boolean;
    notificarComprador: boolean;
  };

  dataCriacao: Date;
  dataAlteracao: [Date];
}

export interface PedidoItem extends Document {
  pedido: {};
  produto: {};
  parceiro: {};

  quantidade: number;
  precoCheio: number;
  precoCusto: number;
  precoPromocional: number;
  precoVenda: number;

  dataRetirada: Date;
  retirada: {};
}

export const getPedidoSchema = function() {
  const schema = new Schema({
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

    situacao: {
      id: Number,
      codigo: String,
      nome: String,

      aprovado: Boolean,
      cancelado: Boolean,
      concluido: Boolean,
      notificarComprador: Boolean,
    },

    dataCriacao: Date,
    dataAlteracao: [Date],
  });

  schema.plugin(mongoosePaginate);

  return schema;
};

export const getPedidoItemSchema = function() {
  const schema = new Schema({
    pedido: {
      type: Schema.Types.ObjectId,
      ref: 'Pedido',
    },

    produto: {
      type: Schema.Types.ObjectId,
      ref: 'Produto',
    },

    parceiro: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    quantidade: Number,
    precoCheio: Number,
    precoCusto: Number,
    precoPromocional: Number,
    precoVenda: Number,

    dataRetirada: Date,
    retirada: {
      type: Schema.Types.ObjectId,
      ref: 'Retirada',
    },
  });

  schema.plugin(mongoosePaginate);

  return schema;
};
