import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: String,
  nome: String,
  password: String,
  ativo: Boolean,
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
