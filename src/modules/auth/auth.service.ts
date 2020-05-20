import {
  Injectable,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { NegocioException } from 'src/exceptions/negocio-exception';

import * as md5 from 'md5';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne({
      email: username,
    });

    // if (!user.ativo) {
    //   throw new NegocioException('Usuário inválido!');
    // }

    if (!(user && user.senha === md5(pass))) {
      return null;
    }

    const json = user.toJSON();

    return {
      email: json.email,
      nome: json.nome,
    };
  }

  async login(user: any) {
    try {
      if (!user) {
        throw new Error('Login inválido!');
      }

      const { email } = user;
      if (!email) {
        throw new UnauthorizedException();
      }

      const usuario = await this.userService.findOne({
        email,
      });

      if (!usuario) {
        throw new UnauthorizedException();
      }

      const payload = { ...user };
      return {
        access_token: this.jwtService.sign(payload),
        user: usuario,
      };
    } catch (error) {
      throw new NegocioException('Falha ao efetuar login!');
    }
  }

  getUsuarioLogado(context) {
    const req = context.req;
    const token = _.get(req, 'session.token');
    if (!token) {
      return null;
    }
    const data = this.jwtService.verify(token);
    if (!data) {
      return null;
    }

    const result = this.validate(data);
    if (!result) {
      return null;
    }

    return {
      user: result,
    };
  }

  validate(payload) {
    return {
      id: payload._id,
      nome: payload.nome,
      email: payload.email,
      ativo: payload.ativo,
    };
  }
}
