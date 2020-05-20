import { IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import * as createUserDto from './create-user-dto';

export enum TipoUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PARCEIRO = 'PARCEIRO',
}

export class AtivarUserDto {
  @IsNotEmpty({
    message: 'Informar HASH de ativação.',
  })
  hash: string;

  @IsEmail(
    {},
    {
      message: 'E-mail não informado ou inválido.',
    },
  )
  email: string;

  @IsNotEmpty({
    message: 'Senha não informada.',
  })
  senha: string;
}

export class RedefinirUserDto {
  @IsEmail(
    {},
    {
      message: 'E-mail não informado ou inválido.',
    },
  )
  email: string;
}
