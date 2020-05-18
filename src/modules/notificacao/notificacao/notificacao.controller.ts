import { Controller, Post, Request } from '@nestjs/common';
import { NotificacaoService } from '../notificacao.service';

@Controller('notificacao')
export class NotificacaoController {
  constructor(private notificacaoService: NotificacaoService) {}

  @Post('agenda')
  async agendaNotificacao(@Request() req) {
    return await this.notificacaoService.agenda();
  }
}
