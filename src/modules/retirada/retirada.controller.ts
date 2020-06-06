import { Controller, UseGuards, Get, Body, Post, Query } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Post('solicitar')
  async solicitar() {
    return await this.retiradaService.solicitar();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listar(@Query() params) {
    return await this.retiradaService.listar(params);
  }
}
