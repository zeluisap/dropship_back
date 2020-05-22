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
import { ProdutoDto } from '../dto/produto-dto';

@Controller('produto')
export class ProdutoController {
  constructor(private produtoService: ProdutoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('importar')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importar(
    @UploadedFile() arquivo,
    @Body('parceiro_id') parceiroId: string,
  ) {
    return this.produtoService.importar(arquivo, parceiroId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('importar/confirma')
  async importarConfirma(
    @Body() items: ProdutoDto[],
    @Query('parceiro_id') parceiro_id: string,
  ) {
    return this.produtoService.importarConfirma(items, parceiro_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id) {
    return await this.produtoService.get(id);
  }
}
