import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  ValidateNested,
  Validate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  InformacaoBancariaDto,
  PrazoFormaPagamentoDto,
  MapeamentoDto,
} from './create-user-dto';
import { ArrayNotEmpty } from 'src/validators';

export enum TipoUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PARCEIRO = 'PARCEIRO',
}

export enum TipoLucro {
  PERCENTUAL = 'percentual',
  FIXO = 'fixo',
}

export class LucroDto {
  @IsEnum(TipoLucro, {
    message: 'Campo tipo lucro inválido',
  })
  @Transform((valor, obj) => (obj.tipo = valor.toLowerCase()))
  tipo: TipoLucro;

  @IsNumber(
    {},
    {
      message: 'Valor do lucro inválido ou não informado.',
    },
  )
  valor: Number;
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

export class AutoCadastroDto {
  @IsEmail(
    {},
    {
      message: 'Campo e-mail Inválido.',
    },
  )
  email: string;

  @IsNotEmpty({
    message: 'Campo nome obrigatório.',
  })
  nome: string;
}

export class ParceiroAutorizarDto {
  @IsNotEmpty({
    message: 'Campo prefixo SKU não informado.',
  })
  prefixoSku: string;

  @IsNotEmpty({
    message: 'Campo lucro não informado.',
  })
  @ValidateNested({
    message: 'Campo lucro não informado.',
  })
  @Type(() => LucroDto)
  lucro: LucroDto;

  @IsNotEmpty({
    message: 'Campo Informação Bancária não informado.',
  })
  @ValidateNested({
    message: 'Campo Informação Bancária não pode ser vazio.',
  })
  @Type(() => InformacaoBancariaDto)
  informacaoBancaria: InformacaoBancariaDto;

  @IsNotEmpty({
    message: 'Informe os dados de forma de pagamento.',
  })
  @ValidateNested({
    message: 'Campo prazo de formas de pagamento não informado.',
  })
  @Type(() => PrazoFormaPagamentoDto)
  prazoFormaPagamento: PrazoFormaPagamentoDto;

  @Validate(ArrayNotEmpty, {
    message: 'Nenhum mapeamento informado.',
  })
  @ValidateNested({
    message: 'Nenhum mapeamento informado.',
    each: true,
  })
  @Type(() => MapeamentoDto)
  mapeamento: MapeamentoDto[];
}

export class EditarPerfilDto {
  @IsNotEmpty({
    message: 'Campo nome obrigatório.',
  })
  nome: string;

  @IsNotEmpty({
    message: 'Campo Informação Bancária não informado.',
  })
  @ValidateNested({
    message: 'Campo Informação Bancária não pode ser vazio.',
  })
  @Type(() => InformacaoBancariaDto)
  informacaoBancaria: InformacaoBancariaDto;
}
