import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ProdutoService } from './produto.service';

@Controller('produto')
export class ProdutoController {
  constructor(private produtoService: ProdutoService) {}

  @UseGuards(JwtAuthGuard)
  @Post('importar')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importar(@UploadedFile() arquivo) {
    return this.produtoService.importar(arquivo);
  }
}
