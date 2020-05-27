import { Document, Schema } from 'mongoose';
import { TipoUsuario, TipoLucro } from './dto/user-dto';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export interface User extends Document {
  readonly email: string;
  readonly nome: string;
  admin: boolean;
  ativo: boolean;
  autorizado: boolean;
  senha: string;
  tipo: string;
  prefixoSku: string;
  lucro: {
    tipo: string;
    valor: number;
  };
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
  autorizado: Boolean,
  tipo: String,
  prefixoSku: String,
  lucro: {
    tipo: String,
    valor: Number,
  },
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

    if (user.get('autorizado') === undefined) {
      user.set({
        autorizado: false,
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
        lucro: ret.lucro,
        informacaoBancaria: ret.informacaoBancaria,
        prazoFormaPagamento: ret.prazoFormaPagamento,
        mapeamento: ret.mapeamento,
        admin: doc.admin,
        ativo: ret.ativo,
        autorizado: ret.autorizado,
      };
    },
  });

  schema.plugin(mongoosePaginate);

  return schema;
};
