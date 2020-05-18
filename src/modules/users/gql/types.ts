import { InputType, Field, ObjectType } from '@nestjs/graphql';

// types
@ObjectType()
export class User {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  nome: string;

  @Field({ nullable: true })
  ativo: boolean;
}

@ObjectType()
export class SessaoUsuario {
  @Field({ nullable: true })
  user?: User;
}

@ObjectType()
export class Token {
  @Field()
  access_token: string;
}

// input types
@InputType()
export class NovoUsuarioInput {
  @Field()
  email: string;

  @Field()
  nome: string;
}

@InputType()
export class AtivarUsuarioInput {
  @Field()
  email: string;

  @Field()
  hash: string;

  @Field()
  senha: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  senha: string;
}
