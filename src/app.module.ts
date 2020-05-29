import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { NotificacaoModule } from './modules/notificacao/notificacao.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { UtilService } from './util/util.service';
import { LojaIntegradaModule } from './modules/loja-integrada/loja-integrada.module';
import { PedidoModule } from './modules/pedido/pedido.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    NotificacaoModule,
    ProdutoModule,

    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    GraphQLModule.forRoot({
      autoSchemaFile: true,
      introspection: true,
      context: ({ req }) => ({ req }),
      include: [UsersModule],
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
      cors: {
        credentials: true,
        origin: true,
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dados = {
          uri: configService.get<string>('MONGODB_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          connectionName: 'app',
        };
        // console.log({
        //   dados,
        // });
        return dados;
      },
      inject: [ConfigService],
    }),

    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('UPLOAD_DIR'),
      }),
      inject: [ConfigService],
    }),

    LojaIntegradaModule,

    PedidoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    UtilService,
  ],
  exports: [UtilService],
})
export class AppModule {}
