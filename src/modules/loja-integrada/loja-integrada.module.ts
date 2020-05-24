import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { LjService } from './lj/lj-service';
import { LjHttpService } from './lj-http/lj-http.service';
import { AppModule } from 'src/app.module';
import { LjController } from './lj/lj.controller';
import { ProdutoModule } from '../produto/produto.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getLjHookSchema } from './lj-mongo';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => ProdutoModule),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeatureAsync([
      {
        name: 'LjHook',
        useFactory: () => getLjHookSchema(),
      },
    ]),
  ],
  providers: [LjService, LjHttpService],
  exports: [LjService],
  controllers: [LjController],
})
export class LojaIntegradaModule {}
