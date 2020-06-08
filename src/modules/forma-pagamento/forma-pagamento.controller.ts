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
import {
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@Controller('forma-pagamento')
export class FormaPagamentoController {
  constructor(private formaPagamentoService: FormaPagamentoService) {}

  @ApiOperation({
    description:
      'Sincronizção das formas de pagamento com o servidor Loja Integrada.',
  })
  // @UseGuards(AdminAuthGuard)
  @Post('agenda')
  async agenda() {
    return await this.formaPagamentoService.agenda();
  }

  @ApiOperation({
    description: 'Listar formas de pagamento.',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página atual.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de ítens por página',
  })
  @ApiQuery({
    name: 'codigo',
    required: false,
  })
  @ApiQuery({
    name: 'nome',
    required: false,
  })
  @UseGuards(AdminAuthGuard)
  @Get()
  async listar(@Query() params) {
    return await this.formaPagamentoService.listar(params);
  }

  @ApiOperation({
    description: 'Adicionar forma de pagamento.',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  async adicionar(@Body() dto: CreateFormaPagamentoDto) {
    return await this.formaPagamentoService.adicionar(dto);
  }

  @ApiOperation({
    description: 'Detalhar forma de pagamento.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @UseGuards(AdminAuthGuard)
  @Get(':id')
  async get(@Param('id') id) {
    return await this.formaPagamentoService.get(id);
  }

  @ApiOperation({
    description: 'Atualizar forma de pagamento.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @UseGuards(AdminAuthGuard)
  @Post(':id')
  async alterar(@Param('id') id, @Body() dto: AlterFormaPagamentoDto) {
    return await this.formaPagamentoService.alterar(id, dto);
  }

  @ApiOperation({
    description: 'Excluir forma de pagamento.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
  })
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id) {
    return await this.formaPagamentoService.delete(id);
  }
}
