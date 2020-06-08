import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParametroDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo chave do parâmetro obrigatório.',
  })
  chave: string;

  @ApiProperty()
  @IsNotEmpty({
    message: 'Campo valor do parâmetro obrigatório.',
  })
  valor: any;
}
