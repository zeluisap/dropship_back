import { Document, Schema } from 'mongoose';

export interface User extends Document {
  readonly email: string;
  readonly nome: string;
  admin: boolean;
  ativo: boolean;
  password: string;
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
  admin: Boolean,
  ativo: Boolean,
  password: String,
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

  /**
   * se não for ativo ... define ativo como false
   */
  schema.pre('save', function() {
    const user = this;

    if (user.get('ativo') !== undefined) {
      return;
    }

    user.set({
      ativo: false,
    });
  });

  return schema;
};
