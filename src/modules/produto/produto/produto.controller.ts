import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  UseGuards,
  Body,
  Query,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto, EditarProdutoDto } from '../dto/produto-dto';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@Controller('produto')
export class ProdutoController {
  constructor(private produtoService: ProdutoService) {}

  @ApiOperation({
    description: 'Importação do arquivo csv com os produtos.',
  })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      example: {
        parceiro_id: 'parceiro_id (campo não obrigatório)',
        arquivo: 'arquivo enviado',
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @Post('importar')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importar(
    @UploadedFile() arquivo,
    @Body('parceiro_id') parceiroId: string,
  ) {
    return this.produtoService.importar(arquivo, parceiroId);
  }

  @ApiOperation({
    description: 'Confirmação dos registros de produtos importados do csv.',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'parceiro_id',
    required: false,
    description: 'Identificador do parceiro, somente para administrador.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('importar/confirma')
  async importarConfirma(
    @Body() items: CreateProdutoDto[],
    @Query('parceiro_id') parceiro_id: string,
  ) {
    return this.produtoService.importarConfirma(items, parceiro_id);
  }

  @ApiOperation({
    description: 'Listagem de produtos.',
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
    name: 'nome',
    required: false,
  })
  @ApiQuery({
    name: 'parceiro_id',
    required: false,
    description: 'Campo considerado apenas pelo administrador.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('')
  async listar(@Query() options) {
    return await this.produtoService.listar(options);
  }

  @ApiOperation({
    description: 'Novo produto.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async novo(@Body() dto: CreateProdutoDto) {
    return await this.produtoService.novo(dto);
  }

  @ApiOperation({
    description: 'Alteração de um produto.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID do produto.',
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async editar(@Param('id') id, @Body() dto: EditarProdutoDto) {
    return await this.produtoService.editar(id, dto);
  }

  @ApiOperation({
    description: 'Detalhe do produto.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'ID do produto.',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id) {
    return await this.produtoService.get(id);
  }

  @ApiOperation({
    description:
      'Sincronização de produtos com o loja integrada. (agendamento)',
  })
  // @UseGuards(JwtAuthGuard)
  @Post('atualiza/api/agenda')
  async atualizaApiAgenda() {
    return await this.produtoService.atualizaApiAgenda();
  }
}
