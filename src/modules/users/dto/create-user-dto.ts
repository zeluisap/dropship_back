import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsCurrency,
  IsInt,
  ValidateNested,
  Validate,
  IsOptional,
  IsNumberString,
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
import { ApiProperty } from '@nestjs/swagger';

export class InformacaoBancariaDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo código do banco obrigatório.',
  })
  @Validate(BancoCodigoValidador)
  bancoCodigo: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo nome do banco obrigatório.',
  })
  @Transform((valor, obj) => (obj.nome = valor.toUpperCase()))
  bancoNome: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Agência não informada em informações bancárias.',
  })
  @Validate(AgenciaValidador)
  agencia: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Conta não informada em informações bancárias.',
  })
  @Validate(ContaValidador)
  conta: string;
}

export class PrazoFormaPagamentoDto {
  @ApiProperty()
  @IsNumberString(
    {},
    {
      message: 'Campo dias de prazo para DINHEIRO não informado.',
    },
  )
  @Transform((valor, obj) => (obj.dinheiro = parseInt(valor)))
  dinheiro: number;

  @ApiProperty()
  @IsNumberString(
    {},
    {
      message: 'Campo dias de prazo para DINHEIRO não informado.',
    },
  )
  @Transform((valor, obj) => (obj.cartaoDebito = parseInt(valor)))
  cartaoDebito: number;

  @ApiProperty()
  @IsNumberString(
    {},
    {
      message: 'Campo dias de prazo para DINHEIRO não informado.',
    },
  )
  @Transform((valor, obj) => (obj.cartaoCredito = parseInt(valor)))
  cartaoCredito: number;
}

export class MapeamentoDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Nome do campo na API não informado.',
  })
  nomeCampoNaAPI: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Nome do campo no CSV não informado.',
  })
  nomeCampoNoCSV: string;

  @ApiProperty()
  @Validate(IsMapper, {
    each: true,
  })
  @IsOptional()
  mappers: string[];
}

export class CreateUserDto {
  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Campo e-mail Inválido.',
    },
  )
  email: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo nome obrigatório.',
  })
  nome: string;

  @ApiProperty()
  @IsEnum(TipoUsuario, {
    message: 'Campo tipo usuário inválido',
  })
  @Transform((valor, obj) => (obj.tipo = valor.toUpperCase()))
  @IsOptional()
  tipo: TipoUsuario;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo prefixo SKU é obrigatório.',
  })
  prefixoSku: string;

  @ApiProperty({
    type: () => LucroDto,
  })
  @IsNotEmpty({
    message: 'Campo lucro não informado.',
  })
  @ValidateNested({
    message: 'Campo lucro não informado.',
  })
  @Type(() => LucroDto)
  lucro: LucroDto;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo Informação Bancária não informado.',
  })
  @ValidateNested({
    message: 'Campo Informação Bancária não pode ser vazio.',
  })
  @Type(() => InformacaoBancariaDto)
  informacaoBancaria: InformacaoBancariaDto;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Informe os dados de forma de pagamento.',
  })
  @ValidateNested({
    message: 'Campo prazo de formas de pagamento não informado.',
  })
  @Type(() => PrazoFormaPagamentoDto)
  prazoFormaPagamento: PrazoFormaPagamentoDto;

  @ApiProperty()
  @Validate(ArrayNotEmpty, {
    message: 'Nenhum mapeamento informado.',
  })
  @ValidateNested({
    message: 'Nenhum mapeamento informado.',
    each: true,
  })
  @Type(() => MapeamentoDto)
  @IsOptional()
  mapeamento: MapeamentoDto[];
}
