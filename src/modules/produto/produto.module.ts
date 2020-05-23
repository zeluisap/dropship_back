import { Module, forwardRef } from '@nestjs/common';
import { ProdutoController } from './produto/produto.controller';
import { AppModule } from 'src/app.module';
import { ProdutoService } from './produto/produto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getProdutoSchema } from './produto-mongo';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { LojaIntegradaModule } from '../loja-integrada/loja-integrada.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => UsersModule),
    forwardRef(() => LojaIntegradaModule),
    AuthModule,
    MongooseModule.forFeatureAsync([
      {
        name: 'Produto',
        useFactory: () => getProdutoSchema(),
      },
    ]),
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService, MongooseModule],
})
export class ProdutoModule {}
