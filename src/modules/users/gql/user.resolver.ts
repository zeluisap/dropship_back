import { UsersService } from '../users.service';
import {
  Resolver,
  Query,
  Args,
  Mutation,
  ObjectType,
  Context,
} from '@nestjs/graphql';
import {
  NovoUsuarioInput,
  AtivarUsuarioInput,
  LoginInput,
  User,
  SessaoUsuario,
  Token,
} from './types';
import {
  UseGuards,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlAuthGuard } from 'src/modules/auth/gql-auth.guard';
import { CurrentUser } from 'src/modules/auth/current-user.decorator';
import { AuthService } from 'src/modules/auth/auth.service';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  // querys
  @UseGuards(GqlAuthGuard)
  @Query(returns => [User], { name: 'users' })
  async users() {
    return await this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => User)
  async user(@Args('email') email: string) {
    return await this.userService.findOne({
      email,
    });
  }

  @Query(returns => SessaoUsuario, {
    nullable: true,
  })
  async usuarioLogado(@Context() context) {
    return this.authService.getUsuarioLogado(context);
  }

  // mutations
  @Mutation(returns => User)
  async novoUsuario(
    @Args('novoUsuarioInput') novoUsuarioInput: NovoUsuarioInput,
  ) {
    return await this.userService.novo(novoUsuarioInput);
  }

  @Mutation(returns => User)
  async ativarUsuario(@Args('params') params: AtivarUsuarioInput) {
    return await this.userService.ativar(
      params.hash,
      params.email,
      params.senha,
    );
  }

  @Mutation(returns => Token)
  async login(@Args('params') params: LoginInput, @Context() context: any) {
    const user = await this.authService.validateUser(
      params.email,
      params.senha,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    const auth = await this.authService.login(user);

    const req = context.req;

    req.session.token = auth.access_token;

    return auth;
  }

  @Mutation(returns => Boolean)
  async redefinirSenha(@Args('email') email: string) {
    return this.userService.redefinir(email);
  }

  @Mutation(returns => Boolean)
  async logout(@Context() context: any) {
    const req = context.req;

    req.session.token = null;

    return true;
  }
}
