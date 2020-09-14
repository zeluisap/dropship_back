import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class SenhaAuthGuard {
  constructor(private user: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = this.user.getLogado();

    if (!(req && req.body && req.body.senha)) {
      throw new UnauthorizedException('Falha ao validar senha do usuário.');
    }

    if (user.senha !== req.body.senha) {
      throw new UnauthorizedException('Falha ao validar senha do usuário!');
    }

    return user;
  }

  handleRequest(err, user, info) {
    //disparar uma exceção dependendo da informação em info
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
