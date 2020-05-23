import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { LjService } from './lj/lj-service';
import { LjHttpService } from './lj-http/lj-http.service';
import { AppModule } from 'src/app.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [LjService, LjHttpService],
  exports: [LjService],
})
export class LojaIntegradaModule {}
