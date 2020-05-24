import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './LocalStrategy';
import { CurrentUserService } from './current-user/current-user.service';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.register({
      secret: jwtConstants.secret,
      // signOptions: {
      //   expiresIn: '30m',
      // },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, CurrentUserService],
  exports: [AuthService, CurrentUserService],
})
export class AuthModule {}
