import { IsNotEmpty } from 'class-validator';

export class CreateParametroDto {
  @IsNotEmpty({
    message: 'Campo chave do parâmetro obrigatório.',
  })
  chave: string;

  @IsNotEmpty({
    message: 'Campo valor do parâmetro obrigatório.',
  })
  valor: any;
}
