import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getUserSchema } from './user-mongo';
import { UserResolver } from './gql/user.resolver';
import { AuthModule } from '../auth/auth.module';
import { NotificacaoModule } from '../notificacao/notificacao.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    forwardRef(() => NotificacaoModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'User',
        useFactory: () => getUserSchema(),
      },
    ]),
  ],
  providers: [UsersService, UserResolver],
  exports: [UsersService, MongooseModule],
  controllers: [UserController],
})
export class UsersModule {}
