import { Module, forwardRef } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getPedidoSchema, getPedidoItemSchema } from './pedido-mongo';
import { LojaIntegradaModule } from '../loja-integrada/loja-integrada.module';
import { ProdutoModule } from '../produto/produto.module';
import { AppModule } from 'src/app.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => LojaIntegradaModule),
    forwardRef(() => ProdutoModule),
    forwardRef(() => UsersModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'Pedido',
        useFactory: () => getPedidoSchema(),
      },
      {
        name: 'PedidoItem',
        useFactory: () => getPedidoItemSchema(),
      },
    ]),
  ],
  controllers: [PedidoController],
  providers: [PedidoService, MongooseModule],
  exports: [PedidoService],
})
export class PedidoModule {}
