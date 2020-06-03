import { Controller, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetiradaService } from './retirada.service';

@Controller('retirada')
export class RetiradaController {
  constructor(private retiradaService: RetiradaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('relatorio')
  async relatorio() {
    return await this.retiradaService.relatorio();
  }
}
