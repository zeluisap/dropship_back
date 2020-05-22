import { Injectable } from '@nestjs/common';
import { NovoUsuarioInput } from './gql/types';
import { Model } from 'mongoose';
import { User } from './user-mongo';
import { InjectModel } from '@nestjs/mongoose';
import { NegocioException } from 'src/exceptions/negocio-exception';

import * as uuid from 'uuid-random';
import * as md5 from 'md5';
import * as moment from 'moment';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { ConfigService } from '@nestjs/config';
import { AlterarUserDto } from './dto/alterar-user-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private notificacaoService: NotificacaoService,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().sort('nome');
  }

  async findOne(user): Promise<User | undefined> {
    const obj = await this.userModel.findOne(user);
    if (!obj) {
      return null;
    }
    return obj;
    // const json = obj.toJSON();
    // return json;
  }

  async novo(dados: NovoUsuarioInput): Promise<User> {
    if (!dados) {
      throw new NegocioException('Falha! Dados inválidos!');
    }

    if (!dados.email) {
      throw new NegocioException('Falha! E-mail é um campo obrigatório!');
    }

    const users = await this.userModel.find({
      email: dados.email,
    });

    if (users && users.length) {
      throw new NegocioException(
        'Falha! Já existe um outro usuário cadastrado com as mesmas informações de e-mail!',
      );
    }

    const user = new this.userModel(dados);
    await this.geraHashCriacao(user);
    const result = await user.save();

    this.notificaCriacao(user);

    return result;
  }

  async alterar(id, dados: AlterarUserDto): Promise<User> {
    if (!id) {
      throw new NegocioException('Falha! Identificador não informado!');
    }

    const user = await this.userModel.findOne({
      _id: id,
    });
    if (!user) {
      throw new NegocioException('Falha! Usuário não localizado!');
    }

    user.set(dados);

    return await user.save();
  }

  async notificaCriacao(user) {
    if (!user) {
      return;
    }

    const hashAtivacao: any = await this.getHashAtivacaoAtivo(user, true);
    if (!hashAtivacao) {
      return;
    }

    const decodificado = this.decodifica(hashAtivacao, user);

    const urlAtivacao =
      this.configService.get<string>('URL_FRONT') + '/ativar/' + decodificado;

    this.notificacaoService.notificar({
      destinatario: {
        email: user.email,
        nome: user.nome,
      },
      titulo: 'Novo usuário cadastrado',
      conteudo:
        'Prezado ' +
        user.nome +
        ', \n\npara ativar sua conta, acesse o endereço: ' +
        urlAtivacao +
        '  \n\n Att. Adm Sistema.',
      conteudoHtml:
        '<p>Prezado ' +
        user.nome +
        ',</p><p>para ativar sua conta, acesse o endereço: ' +
        urlAtivacao +
        '</p><br><br><p>Att. Adm Sistema.</p>',
    });
  }

  async geraHashCriacao(user) {
    return await this.geraHashAtivacao(user, true);
  }

  async geraHashAtivacao(user, novoUsuario = false) {
    if (!user) {
      return;
    }

    const hashAtivo = await this.getHashAtivacaoAtivo(user, novoUsuario);
    if (hashAtivo) {
      return hashAtivo;
    }

    if (!user.hashAtivacao) {
      user.hashAtivacao = [];
    }

    user.hashAtivacao.push({
      hash: uuid(),
      validade: moment()
        .add(5, 'd')
        .toDate(),
      novoUsuario,
      utilizado: false,
    });
  }

  async getHashAtivacaoAtivo(user, novoUsuario = false) {
    if (!user) {
      return null;
    }

    if (!(user.hashAtivacao && user.hashAtivacao.length)) {
      return null;
    }

    const ativo = user.hashAtivacao.find(item => {
      if (item.novoUsuario !== novoUsuario) {
        return false;
      }

      if (item.utilizado) {
        return false;
      }

      const agora = moment();
      const validade = moment(item.validade);

      if (agora.isAfter(validade)) {
        return false;
      }

      return true;
    });

    if (!ativo) {
      return null;
    }

    return ativo;
  }

  async ativar(hash: string, email: string, senha: string) {
    if (!(hash && senha)) {
      throw new NegocioException('E-mail ou senha não informados!');
    }

    const user = await this.userModel.findOne({
      'hashAtivacao.hash': hash,
    });

    if (!user) {
      throw new NegocioException(
        'Hash não correponde a nenhum usuário cadastrado!',
      );
    }

    const ativacao = user.hashAtivacao.find(item => {
      return item.hash === hash;
    });

    if (ativacao.utilizado) {
      throw new NegocioException(
        'Hash já foi utilizado, você precisa gerar um novo HASH de ativação!',
      );
    }

    const agora = moment();
    const validade = moment(ativacao.validade);

    if (agora.isAfter(validade)) {
      throw new NegocioException(
        'Hash fora da validade, você precisa gerar um novo HASH de ativação!',
      );
    }

    if (user.email.toLocaleLowerCase() !== email.toLocaleLowerCase()) {
      throw new NegocioException('Hash não corresponde ao usuário informado!');
    }

    user.senha = md5(senha);
    user.ativo = true;

    ativacao.utilizado = true;

    user.save();

    return user;
  }

  async redefinir(email: string): Promise<any> {
    if (!email) {
      throw new NegocioException('Nenhum e-mail informado!');
    }

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NegocioException('Usuário não encontrado!');
    }

    if (user.ativo) {
      await this.geraHashAtivacao(user);
      await user.save();
      await this.notificaRecuperacao(user);
      return true;
    }

    const hash = await this.getHashAtivacaoAtivo(user, true);
    if (!hash) {
      throw new NegocioException('Usuário inativo!');
    }

    await this.notificaCriacao(user);
    return true;
  }

  async notificaRecuperacao(user) {
    if (!user) {
      return;
    }

    const hashAtivacao: any = await this.getHashAtivacaoAtivo(user);
    if (!hashAtivacao) {
      return;
    }

    const decodificado = this.decodifica(hashAtivacao, user);

    const urlAtivacao =
      this.configService.get<string>('URL_FRONT') + '/ativar/' + decodificado;

    this.notificacaoService.notificar({
      destinatario: {
        email: user.email,
        nome: user.nome,
      },
      titulo: 'Solicitação de redefinição de senha.',
      conteudo:
        'Prezado ' +
        user.nome +
        ', \n\nPara redefinir sua senha, acesse o endereço: ' +
        urlAtivacao +
        '  \n\n Att. Adm Sistema.',
      conteudoHtml:
        '<p>Prezado ' +
        user.nome +
        ',</p><p>Para redefinir sua senha, acesse o endereço: ' +
        urlAtivacao +
        '</p><br><br><p>Att. Adm Sistema.</p>',
    });
  }

  decodifica(hash, user) {
    const dto = {
      hash: hash.hash,
      email: user.email,
      nome: user.nome,
    };

    let buff = Buffer.from(JSON.stringify(dto), 'utf-8');
    return buff.toString('base64');
  }
}
