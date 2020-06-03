import {
  Controller,
  UseGuards,
  Get,
  Query,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { FormaPagamentoService } from './forma-pagamento.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import {
  CreateFormaPagamentoDto,
  AlterFormaPagamentoDto,
} from './forma-pagamento-dto';
import { idText } from 'typescript';

@Controller('forma-pagamento')
export class FormaPagamentoController {
  constructor(private formaPagamentoService: FormaPagamentoService) {}

  // @UseGuards(AdminAuthGuard)
  @Post('agenda')
  async agenda() {
    return await this.formaPagamentoService.agenda();
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  async listar(@Query() params) {
    return await this.formaPagamentoService.listar(params);
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  async adicionar(@Body() dto: CreateFormaPagamentoDto) {
    return await this.formaPagamentoService.adicionar(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  async get(@Param('id') id) {
    return await this.formaPagamentoService.get(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post(':id')
  async alterar(@Param('id') id, @Body() dto: AlterFormaPagamentoDto) {
    return await this.formaPagamentoService.alterar(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id) {
    return await this.formaPagamentoService.delete(id);
  }
}
