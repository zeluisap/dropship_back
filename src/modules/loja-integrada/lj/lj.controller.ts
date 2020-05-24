import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

import { LjService } from './lj-service';

@Controller('loja-integrada')
export class LjController {
  constructor(private ljService: LjService) {}

  @UseGuards(JwtAuthGuard)
  @Post('hook')
  async hook(@Body() json) {
    return await this.ljService.hook(json);
  }
}
