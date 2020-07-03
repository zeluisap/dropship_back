import { Module, HttpModule, forwardRef } from '@nestjs/common';
import { BoletimController } from './boletim.controller';
import { BoletimService } from './boletim.service';
import { getBoletimSchema } from './boletim-mongo';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificacaoModule } from '../notificacao/notificacao.module';

@Module({
  imports: [
    forwardRef(() => NotificacaoModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'Boletim',
        useFactory: () => getBoletimSchema(),
      },
    ]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [BoletimController],
  providers: [BoletimService],
})
export class BoletimModule {}
