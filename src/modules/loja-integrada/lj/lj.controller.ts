import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

import { LjService } from './lj-service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('loja-integrada')
export class LjController {
  constructor(private ljService: LjService) {}

  @ApiOperation({
    description: 'Hook para tratamento das atualizações em pedidos e produtos.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('hook')
  async hook(@Body() json) {
    return await this.ljService.hook(json);
  }

  @ApiOperation({
    description: 'Lista de campos do produto para o loja integrada.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('hook')
  listApiFields() {
    return this.ljService.listApiFields();
  }
}
