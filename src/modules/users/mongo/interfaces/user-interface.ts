import { Document } from 'mongoose';

export interface User extends Document {
  readonly email: string;
  readonly nome: string;
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
