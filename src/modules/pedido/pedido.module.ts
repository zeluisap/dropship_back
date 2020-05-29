import { Module, forwardRef } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getPedidoSchema } from './pedido-mongo';
import { LojaIntegradaModule } from '../loja-integrada/loja-integrada.module';

@Module({
  imports: [
    forwardRef(() => LojaIntegradaModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'Pedido',
        useFactory: () => getPedidoSchema(),
      },
    ]),
  ],
  controllers: [PedidoController],
  providers: [PedidoService, MongooseModule],
  exports: [PedidoService],
})
export class PedidoModule {}
