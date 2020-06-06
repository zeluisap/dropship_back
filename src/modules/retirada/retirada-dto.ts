import { IsNumber, IsNotEmpty } from 'class-validator';

export enum RetiradaSituacao {
  PENDENTE = 'PENDENTE',
  CANCELADA = 'CANCELADA',
  APROVADA = 'APROVADA',
}

export class SolicitarRetiradaDto {
  @IsNotEmpty({
    message: 'Informe o valor da solicitação.',
  })
  @IsNumber(
    {},
    {
      message: 'Valor solicitado é inválido.',
    },
  )
  valor: number;
}
