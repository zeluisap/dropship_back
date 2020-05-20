import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import * as _ from 'lodash';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: req => {
        let token = _.get(req, 'session.token');
        if (token) {
          return token;
        }

        const auth = _.get(req, 'headers.authorization');
        if (!auth) {
          return null;
        }

        return auth.replace('Bearer ', '');
      },
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return this.authService.validate(payload);
  }
}
