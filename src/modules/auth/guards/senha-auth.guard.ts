import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SenhaAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // adicionar lógica de autenticação
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    //disparar uma exceção dependendo da informação em info
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
