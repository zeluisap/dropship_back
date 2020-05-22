import { Module, forwardRef } from '@nestjs/common';
import { ProdutoController } from './produto/produto.controller';
import { AppModule } from 'src/app.module';
import { ProdutoService } from './produto/produto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getProdutoSchema } from './produto-mongo';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
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
