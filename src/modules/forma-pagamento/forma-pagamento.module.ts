import { Module, forwardRef } from '@nestjs/common';
import { FormaPagamentoController } from './forma-pagamento.controller';
import { FormaPagamentoService } from './forma-pagamento.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getFormaPagamentoSchema } from './forma-pagamento-mongo';
import { AppModule } from 'src/app.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { LojaIntegradaModule } from '../loja-integrada/loja-integrada.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => LojaIntegradaModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'FormaPagamento',
        useFactory: () => getFormaPagamentoSchema(),
      },
    ]),
  ],
  controllers: [FormaPagamentoController],
  providers: [FormaPagamentoService, MongooseModule],
  exports: [FormaPagamentoService],
})
export class FormaPagamentoModule {}
