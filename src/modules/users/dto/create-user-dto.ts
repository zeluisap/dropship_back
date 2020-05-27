import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsCurrency,
  IsInt,
  ValidateNested,
  Validate,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  BancoCodigoValidador,
  AgenciaValidador,
  ContaValidador,
  ArrayNotEmpty,
  IsMapper,
} from 'src/validators';
import { TipoUsuario, LucroDto } from './user-dto';

export class BancoDto {
  @IsNotEmpty({
    message: 'Campo código do banco obrigatório.',
  })
  @Validate(BancoCodigoValidador)
  codigo: string;

  @IsNotEmpty({
    message: 'Campo nome do banco obrigatório.',
  })
  @Transform((valor, obj) => (obj.nome = valor.toUpperCase()))
  nome: string;
}

export class InformacaoBancariaDto {
  @IsNotEmpty({
    message: 'Campo banco não informado.',
  })
  @ValidateNested({
    message: 'Campo banco não pode ser vazio.',
  })
  @Type(() => BancoDto)
  banco: BancoDto;

  @IsNotEmpty({
    message: 'Agência não informada em informações bancárias.',
  })
  @Validate(AgenciaValidador)
  agencia: string;

  @IsNotEmpty({
    message: 'Conta não informada em informações bancárias.',
  })
  @Validate(ContaValidador)
  conta: string;
}

export class PrazoFormaPagamentoDto {
  @IsInt({
    message: 'Campo dias de prazo para DINHEIRO não informado.',
  })
  dinheiro: number;

  @IsInt({
    message: 'Campo dias de prazo para CARTÃO DE DÉBITO não informado.',
  })
  cartaoDebito: number;

  @IsInt({
    message: 'Campo dias de prazo para CARTÃO DE CRÉDITO não informado.',
  })
  cartaoCredito: number;
}

export class MapeamentoDto {
  @IsNotEmpty({
    message: 'Nome do campo na API não informado.',
  })
  nomeCampoNaAPI: string;

  @IsNotEmpty({
    message: 'Nome do campo no CSV não informado.',
  })
  nomeCampoNoCSV: string;

  @Validate(IsMapper, {
    each: true,
  })
  @IsOptional()
  mappers: string[];
}

export class CreateUserDto {
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

  @IsEnum(TipoUsuario, {
    message: 'Campo tipo usuário inválido',
  })
  @Transform((valor, obj) => (obj.tipo = valor.toUpperCase()))
  tipo: TipoUsuario;

  @IsNotEmpty({
    message: 'Campo prefixo SKU é obrigatório.',
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
