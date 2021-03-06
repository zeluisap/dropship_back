import {
  Injectable,
  Scope,
  Inject,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as _ from 'lodash';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';

@Injectable({
  scope: Scope.REQUEST,
})
export class CurrentUserService {
  constructor(
    @Optional() @Inject(REQUEST) private request,
    private jwt: JwtService,
  ) // @Inject(forwardRef(() => UsersService)) private userService: UsersService,
  {}

  async getUsuarioLogado() {
    const token = _.get(this.request, 'session.token');
    if (!token) {
      return null;
    }

    const user = this.jwt.verify(token);
    if (!user) {
      return null;
    }

    return user;

    // const _id = _.get(user, 'id');

    // return await this.userService.findOne({
    //   _id,
    // });
  }
}
