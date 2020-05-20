import { Document, Schema } from 'mongoose';
import { TipoUsuario } from './dto/user-dto';

export interface User extends Document {
  readonly email: string;
  readonly nome: string;
  admin: boolean;
  ativo: boolean;
  senha: string;
  tipo: string;
  prefixoSku: string;
  percentualLucro: number;
  informacaoBancaria: {
    banco: {
      codigo: string;
      nome: string;
    };
    agencia: string;
    conta: string;
  };
  prazoFormaPagamento: {
    dinheiro: number;
    cartaoCredito: number;
    cartaoDebito: number;
  };
  mapeamento: [
    {
      nomeCampoNaAPI: string;
      nomeCampoNoCSV: string;
      mappers: [string];
    },
  ];
  hashAtivacao: [
    {
      hash: string;
      validade: Date;
      utilizado: boolean;
      novoUsuario: boolean;
    },
  ];
}

export const UserSchema = new Schema({
  email: String,
  nome: String,
  senha: String,
  ativo: Boolean,
  tipo: String,
  prefixoSku: String,
  percentualLucro: Number,
  informacaoBancaria: {
    banco: {
      codigo: String,
      nome: String,
    },
    agencia: String,
    conta: String,
  },
  prazoFormaPagamento: {
    dinheiro: Number,
    cartaoCredito: Number,
    cartaoDebito: Number,
  },
  mapeamento: [
    {
      nomeCampoNaAPI: String,
      nomeCampoNoCSV: String,
      mappers: [String],
    },
  ],
  hashAtivacao: [
    {
      hash: String,
      validade: Date,
      utilizado: Boolean,
      novoUsuario: Boolean,
    },
  ],
});

export const getUserSchema = function() {
  const schema = UserSchema;

  schema.virtual('admin').get(function() {
    return this.tipo === TipoUsuario.ADMINISTRADOR;
  });

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

  schema.set('toJSON', {
    transform: function(doc, ret, options) {
      return {
        _id: ret._id,
        email: ret.email,
        nome: ret.nome,
        tipo: ret.tipo,
        prefixoSku: ret.prefixoSku,
        percentualLucro: ret.percentualLucro,
        informacaoBancaria: ret.informacaoBancaria,
        prazoFormaPagamento: ret.prazoFormaPagamento,
        mapeamento: ret.mapeamento,
        admin: doc.admin,
        ativo: ret.ativo,
      };
    },
  });

  return schema;
};
