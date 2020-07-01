import { Module, forwardRef } from '@nestjs/common';
import { ProdutoController } from './produto.controller';
import { AppModule } from 'src/app.module';
import { ProdutoService } from './produto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getProdutoSchema } from './produto-mongo';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { LojaIntegradaModule } from '../loja-integrada/loja-integrada.module';
import { ReposModule } from '../repos/repos.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => UsersModule),
    forwardRef(() => LojaIntegradaModule),
    forwardRef(() => ReposModule),
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
  exports: [ProdutoService],
})
export class ProdutoModule {}
