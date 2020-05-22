import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  UseGuards,
  Body,
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
  async importar(@UploadedFile() arquivo) {
    return this.produtoService.importar(arquivo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('importar/confirma')
  async importarConfirma(@Body() items: ProdutoDto[]) {
    return this.produtoService.importarConfirma(items);
  }
}
