import { Controller, Post, Request } from '@nestjs/common';
import { NotificacaoService } from '../notificacao.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notificacao')
export class NotificacaoController {
  constructor(private notificacaoService: NotificacaoService) {}

  @ApiOperation({
    description:
      'Sincronização de efetua a notificação de usuários via e-mail (Agendamento).',
  })
  @Post('agenda')
  async agendaNotificacao(@Request() req) {
    return await this.notificacaoService.agenda();
  }
}
