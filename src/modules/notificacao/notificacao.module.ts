import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NotificacaoService } from './notificacao.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getNotificacaoEmailSchema } from './notificacao-mongo';
import { NotificacaoController } from './notificacao/notificacao.controller';
import { MailerModule, PugAdapter } from '@nestjs-modules/mailer';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeatureAsync([
      {
        name: 'NotificacaoEmail',
        useFactory: () => getNotificacaoEmailSchema(),
      },
    ]),
    MailerModule.forRoot({
      transport: 'smtps://zeluis.ap:isbvbqxgkzmocpnr@smtp.gmail.com',
      defaults: {
        from: '"APP Administrador" <zeluis.ap@gmail.com>',
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [NotificacaoService],
  exports: [NotificacaoService, MongooseModule],
  controllers: [NotificacaoController],
})
export class NotificacaoModule {}
