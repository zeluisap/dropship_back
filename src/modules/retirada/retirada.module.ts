import { Module, forwardRef } from '@nestjs/common';
import { RetiradaController } from './retirada.controller';
import { RetiradaService } from './retirada.service';
import { AppModule } from 'src/app.module';
import { PedidoModule } from '../pedido/pedido.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => PedidoModule),
  ],
  controllers: [RetiradaController],
  providers: [RetiradaService, MongooseModule],
  exports: [RetiradaService],
})
export class RetiradaModule {}
