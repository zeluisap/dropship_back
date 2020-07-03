import { Controller, Post } from '@nestjs/common';
import { BoletimService } from './boletim.service';

@Controller('boletim')
export class BoletimController {
  constructor(private boletim: BoletimService) {}

  @Post('agenda')
  async atualizaApiAgenda() {
    return await this.boletim.agenda();
  }
}
