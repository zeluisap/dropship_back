import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  constructor(private usersService: UsersService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // adicionar lógica de autenticação
    return super.canActivate(context);
  }

  async handleRequest(err, user, info) {
    super.handleRequest(err, user, info);

    const { email } = user;

    if (!(email && email.length)) {
      throw new UnauthorizedException();
    }

    const usuario = await this.usersService.findOne({
      email,
    });

    if (!(usuario && usuario.admin)) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
