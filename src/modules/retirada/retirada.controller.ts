import { Controller, UseGuards, Get, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetiradaService } from './retirada.service';
import { SolicitarRetiradaDto } from './retirada-dto';

@Controller('retirada')
export class RetiradaController {
  constructor(private retiradaService: RetiradaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('relatorio')
  async relatorio() {
    return await this.retiradaService.relatorio();
  }

  @UseGuards(JwtAuthGuard)
  @Post('solicitar')
  async solicitar(@Body() dto: SolicitarRetiradaDto) {
    return await this.retiradaService.solicitar(dto);
  }
}
