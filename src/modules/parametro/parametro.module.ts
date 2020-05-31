import { Module, forwardRef } from '@nestjs/common';
import { ParametroService } from './parametro.service';
import { getParametroSchema } from './parametro-mongo';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from 'src/app.module';
import { ParametroController } from './parametro.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => UsersModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'Parametro',
        useFactory: () => getParametroSchema(),
      },
    ]),
  ],
  providers: [ParametroService, MongooseModule],
  exports: [ParametroService],
  controllers: [ParametroController],
})
export class ParametroModule {}
