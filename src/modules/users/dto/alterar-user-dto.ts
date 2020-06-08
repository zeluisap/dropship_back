import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsCurrency,
  IsInt,
  ValidateNested,
  Validate,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  BancoCodigoValidador,
  AgenciaValidador,
  ContaValidador,
  ArrayNotEmpty,
} from 'src/validators';
import { TipoUsuario, LucroDto } from './user-dto';
import { MapeamentoDto } from './create-user-dto';
import { ApiProperty } from '@nestjs/swagger';

export class AlterarBancoDto {
  @IsNotEmpty({
    message: 'Campo código do banco obrigatório.',
  })
  @Validate(BancoCodigoValidador)
  @IsOptional()
  codigo: string;

  @Transform((valor, obj) => (obj.nome = valor.toUpperCase()))
  @IsOptional()
  nome: string;
}

export class AlterarInformacaoBancariaDto {
  @ValidateNested({
    message: 'Campo banco não pode ser vazio.',
  })
  @IsOptional()
  @Type(() => AlterarBancoDto)
  banco: AlterarBancoDto;

  @Validate(AgenciaValidador)
  @IsOptional()
  agencia: string;

  @Validate(ContaValidador)
  @IsOptional()
  conta: string;
}

export class AlterarPrazoFormaPagamentoDto {
  @IsInt({
    message: 'Campo dias de prazo para DINHEIRO não informado.',
  })
  @IsOptional()
  dinheiro: number;

  @IsInt({
    message: 'Campo dias de prazo para CARTÃO DE DÉBITO não informado.',
  })
  @IsOptional()
  cartaoDebito: number;

  @IsInt({
    message: 'Campo dias de prazo para CARTÃO DE CRÉDITO não informado.',
  })
  @IsOptional()
  cartaoCredito: number;
}

export class AlterarUserDto {
  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Campo e-mail Inválido.',
    },
  )
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  nome: string;

  @ApiProperty()
  @IsEnum(TipoUsuario, {
    message: 'Campo tipo usuário inválido',
  })
  @IsOptional()
  @Transform((valor, obj) => (obj.tipo = valor.toUpperCase()))
  tipo: TipoUsuario;

  @ApiProperty()
  @IsString()
  @IsOptional()
  prefixoSku: string;

  @ApiProperty()
  @ValidateNested({
    message: 'Campo lucro não pode ser vazio.',
  })
  @Type(() => LucroDto)
  @IsOptional()
  lucro: LucroDto;

  @ApiProperty()
  @ValidateNested({
    message: 'Campo Informação Bancária não pode ser vazio.',
  })
  @Type(() => AlterarInformacaoBancariaDto)
  @IsOptional()
  informacaoBancaria: AlterarInformacaoBancariaDto;

  @ApiProperty()
  @ValidateNested({
    message: 'Campo prazo de formas de pagamento não informado.',
  })
  @Type(() => AlterarPrazoFormaPagamentoDto)
  @IsOptional()
  prazoFormaPagamento: AlterarPrazoFormaPagamentoDto;

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

  @ApiProperty()
  @IsBoolean({
    message: 'Valor para campo ativo é inválido.',
  })
  @IsOptional()
  ativo: boolean;
}
