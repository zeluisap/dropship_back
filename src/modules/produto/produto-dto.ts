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
import { LucroDto, TipoLucro } from 'src/modules/users/dto/user-dto';
import { ApiProperty } from '@nestjs/swagger';

export class EditarLucroDto {
  @ApiProperty()
  @IsEnum(TipoLucro, {
    message: 'Campo tipo lucro inválido',
  })
  @Transform((valor, obj) => (obj.tipo = valor.toLowerCase()))
  @IsOptional()
  tipo: TipoLucro;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: 'Valor do lucro inválido ou não informado.',
    },
  )
  @Transform((valor, obj) => (obj.valor = parseFloat(valor)))
  @IsOptional()
  valor: Number;
}

export class CreateProdutoDto {
  @ApiProperty()
  @IsNumberString(
    {},
    {
      message: 'Campo origemId inválido!',
    },
  )
  origemId: Number;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo nome obrigatório!',
  })
  nome: String;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo descricaoCompleta obrigatório!',
  })
  descricaoCompleta: String;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo categoria obrigatório!',
  })
  categoria: String;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo marca obrigatório!',
  })
  marca: String;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: 'Campo quantidade inválido, somente números!',
    },
  )
  quantidade: Number;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: 'Campo precoCheio inválido, somente números!',
    },
  )
  precoCheio: Number;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: 'Campo precoCusto inválido, somente números!',
    },
  )
  precoCusto: Number;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: 'Campo precoPromocional inválido, somente números!',
    },
  )
  precoPromocional: Number;

  @ApiProperty({
    description: 'ID da imagem principal do produto.',
  })
  @IsOptional()
  imagemPrincipal: String;

  @ApiProperty({
    description: 'Listagem dos ids das imagens do produto.',
  })
  @IsOptional()
  imagens: String[];
}

export class EditarProdutoDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional({
    message: 'Parceiro vinculado ao produto (apenas ADMINISTRADOR).',
  })
  parceiro: String;

  @ApiProperty({
    required: false,
  })
  @IsNumberString(
    {},
    {
      message: 'Campo origemId inválido!',
    },
  )
  @IsOptional()
  origemId: Number;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty({
    message: 'Campo nome obrigatório!',
  })
  @IsOptional()
  nome: String;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty({
    message: 'Campo descricaoCompleta obrigatório!',
  })
  @IsOptional()
  descricaoCompleta: String;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty({
    message: 'Campo categoria obrigatório!',
  })
  @IsOptional()
  categoria: String;

  @ApiProperty({
    required: false,
  })
  @IsNotEmpty({
    message: 'Campo marca obrigatório!',
  })
  @IsOptional()
  marca: String;

  @ApiProperty({
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'Campo quantidade inválido, somente números!',
    },
  )
  @IsOptional()
  quantidade: Number;

  @ApiProperty({
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'Campo precoCheio inválido, somente números!',
    },
  )
  @IsOptional()
  precoCheio: Number;

  @ApiProperty({
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'Campo precoCusto inválido, somente números!',
    },
  )
  @IsOptional()
  precoCusto: Number;

  @ApiProperty({
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'Campo precoPromocional inválido, somente números!',
    },
  )
  @IsOptional()
  precoPromocional: Number;

  @ApiProperty({
    required: false,
  })
  @ValidateNested({
    message: 'Campo lucro não informado.',
  })
  @Type(() => EditarLucroDto)
  @IsOptional()
  lucro: EditarLucroDto;

  @ApiProperty({
    description: 'ID da imagem principal do produto.',
  })
  @IsOptional()
  imagemPrincipal: String;

  @ApiProperty({
    description: 'Listagem dos ids das imagens do produto.',
  })
  @IsOptional()
  imagens: String[];
}
