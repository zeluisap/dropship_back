import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LucroDto } from 'src/modules/users/dto/user-dto';

export class CreateProdutoDto {
  @IsNumberString(
    {},
    {
      message: 'Campo origemId inválido!',
    },
  )
  origemId: Number;

  @IsNotEmpty({
    message: 'Campo nome obrigatório!',
  })
  nome: String;

  @IsNotEmpty({
    message: 'Campo descricaoCompleta obrigatório!',
  })
  descricaoCompleta: String;

  @IsNotEmpty({
    message: 'Campo categoria obrigatório!',
  })
  categoria: String;

  @IsNotEmpty({
    message: 'Campo marca obrigatório!',
  })
  marca: String;

  @IsNumber(
    {},
    {
      message: 'Campo quantidade inválido, somente números!',
    },
  )
  quantidade: Number;

  @IsNumber(
    {},
    {
      message: 'Campo precoCheio inválido, somente números!',
    },
  )
  precoCheio: Number;

  @IsNumber(
    {},
    {
      message: 'Campo precoCusto inválido, somente números!',
    },
  )
  precoCusto: Number;

  @IsNumber(
    {},
    {
      message: 'Campo precoPromocional inválido, somente números!',
    },
  )
  precoPromocional: Number;

  @ValidateNested({
    message: 'Campo lucro não informado.',
  })
  @Type(() => LucroDto)
  @IsOptional()
  lucro: LucroDto;
}

export class EditarProdutoDto {
  @IsNumberString(
    {},
    {
      message: 'Campo origemId inválido!',
    },
  )
  @IsOptional()
  origemId: Number;

  @IsNotEmpty({
    message: 'Campo nome obrigatório!',
  })
  @IsOptional()
  nome: String;

  @IsNotEmpty({
    message: 'Campo descricaoCompleta obrigatório!',
  })
  @IsOptional()
  descricaoCompleta: String;

  @IsNotEmpty({
    message: 'Campo categoria obrigatório!',
  })
  @IsOptional()
  categoria: String;

  @IsNotEmpty({
    message: 'Campo marca obrigatório!',
  })
  @IsOptional()
  marca: String;

  @IsNumber(
    {},
    {
      message: 'Campo quantidade inválido, somente números!',
    },
  )
  @IsOptional()
  quantidade: Number;

  @IsNumber(
    {},
    {
      message: 'Campo precoCheio inválido, somente números!',
    },
  )
  @IsOptional()
  precoCheio: Number;

  @IsNumber(
    {},
    {
      message: 'Campo precoCusto inválido, somente números!',
    },
  )
  @IsOptional()
  precoCusto: Number;

  @IsNumber(
    {},
    {
      message: 'Campo precoPromocional inválido, somente números!',
    },
  )
  @IsOptional()
  precoPromocional: Number;

  @ValidateNested({
    message: 'Campo lucro não informado.',
  })
  @Type(() => LucroDto)
  @IsOptional()
  lucro: LucroDto;
}
