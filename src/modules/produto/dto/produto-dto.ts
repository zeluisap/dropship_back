import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class ProdutoDto {
  @IsOptional()
  id: Number;

  @IsNumberString(
    {},
    {
      message: 'Campo origem_id inválido!',
    },
  )
  origem_id: Number;

  @IsNotEmpty({
    message: 'Campo nome obrigatório!',
  })
  nome: String;

  @IsNotEmpty({
    message: 'Campo descricao_completa obrigatório!',
  })
  descricao_completa: String;

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
      message: 'Campo preco_cheio inválido, somente números!',
    },
  )
  preco_cheio: Number;

  @IsNumber(
    {},
    {
      message: 'Campo preco_custo inválido, somente números!',
    },
  )
  preco_custo: Number;

  @IsNumber(
    {},
    {
      message: 'Campo preco_promocional inválido, somente números!',
    },
  )
  preco_promocional: Number;

  @IsNumber(
    {},
    {
      message: 'Campo preco_cheio_original inválido, somente números!',
    },
  )
  preco_cheio_original: Number;

  @IsNumber(
    {},
    {
      message: 'Campo percentual_lucro inválido, somente números!',
    },
  )
  percentual_lucro: Number;
}
