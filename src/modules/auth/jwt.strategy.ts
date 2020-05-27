import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import * as _ from 'lodash';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: req => {
        const auth = _.get(req, 'headers.authorization');
        if (auth) {
          return auth.replace('Bearer ', '');
        }

        let token = _.get(req, 'session.token');
        if (token) {
          return token;
        }

        return null;
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    await this.userService.setLogado(payload);
    return this.authService.validate(payload);
  }
}
