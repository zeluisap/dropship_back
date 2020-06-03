import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFormaPagamentoDto {
  @IsNotEmpty({
    message: 'Código obrigatório.',
  })
  codigo: string;

  @IsNotEmpty({
    message: 'Nome obrigatório.',
  })
  nome: string;

  @IsNumber(
    {},
    {
      message: 'Campo prazo inválido.',
    },
  )
  @IsOptional()
  prazo: Number;
}

export class AlterFormaPagamentoDto {
  @IsOptional()
  codigo: string;

  @IsOptional()
  nome: string;

  @IsNumber(
    {},
    {
      message: 'Campo prazo inválido.',
    },
  )
  @IsOptional()
  prazo: Number;
}
