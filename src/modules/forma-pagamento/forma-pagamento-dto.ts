import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormaPagamentoDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Código obrigatório.',
  })
  codigo: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Nome obrigatório.',
  })
  nome: string;

  @ApiProperty()
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
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  codigo: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  nome: string;

  @ApiProperty({
    required: false,
  })
  @IsNumber(
    {},
    {
      message: 'Campo prazo inválido.',
    },
  )
  @IsOptional()
  prazo: number;

  @ApiProperty({
    required: false,
  })
  @IsBoolean({
    message: 'Campo ativo inválido.',
  })
  @IsOptional()
  ativo: boolean;
}
