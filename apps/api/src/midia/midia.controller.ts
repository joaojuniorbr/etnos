import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { MidiaService } from './midia.service';
import { DeleteMidiaDto } from './dto/delete-midia.dto';
import { MidiaDto } from './dto/midia.dto';
import { AdminRoleGuard, RequestUserOwnershipGuard } from 'src/common';

@ApiTags('Mídia')
@UseGuards(AuthGuard('firebase-auth'), RequestUserOwnershipGuard)
@ApiBearerAuth()
@Controller('midia')
export class MidiaController {
  constructor(private readonly midiaService: MidiaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de uma imagem' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
      },
      required: ['file'],
    },
  })
  async uploadImage(
    @Req() req,
    @UploadedFile() file: any,
    @Body('folder') folder?: string,
  ) {
    return this.midiaService.uploadImage(
      file,
      folder ?? 'uploads',
      req.user.uid,
    );
  }

  @Post('upload/multiple')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 20 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de múltiplas imagens' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        folder: { type: 'string' },
      },
      required: ['files'],
    },
  })
  async uploadMultiple(
    @Req() req,
    @UploadedFiles() filesData: { files?: any[] },
    @Body('folder') folder?: string,
  ) {
    return this.midiaService.uploadMultipleImages(
      filesData.files ?? [],
      folder ?? 'uploads',
      req.user.uid,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lista mídias do usuário autenticado' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'folder', required: false, example: 'games/luigi' })
  async getMidia(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('folder') folder?: string,
  ) {
    return this.midiaService.getMidia(
      req.user.uid,
      Number(limit || 10),
      Number(page || 1),
      folder,
    );
  }

  @Get('admin')
  @UseGuards(AuthGuard('firebase-auth'), AdminRoleGuard)
  @ApiOperation({ summary: 'Lista todas as mídias para administradores' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'folder', required: false, example: 'games/luigi' })
  async getAllMidia(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('folder') folder?: string,
  ) {
    return this.midiaService.getMidia(
      undefined,
      Number(limit || 10),
      Number(page || 1),
      folder,
    );
  }

  @Get('folders')
  @ApiOperation({ summary: 'Lista pastas de mídia com contagem' })
  @ApiResponse({ status: 200, description: 'Pastas retornadas com sucesso.' })
  async getFolders(@Req() req) {
    return this.midiaService.getFolders(req.user.uid);
  }

  @Get('admin/folders')
  @UseGuards(AuthGuard('firebase-auth'), AdminRoleGuard)
  @ApiOperation({ summary: 'Lista todas as pastas de mídia para administradores' })
  @ApiResponse({ status: 200, description: 'Pastas retornadas com sucesso.' })
  async getAllFolders() {
    return this.midiaService.getFolders();
  }

  @Post()
  @ApiOperation({ summary: 'Cria registro de mídia' })
  @ApiBody({ type: MidiaDto })
  @ApiResponse({ status: 201, description: 'Registro de mídia criado com sucesso.' })
  async saveMidia(@Req() req, @Body() body: MidiaDto) {
    return this.midiaService.saveMidia({
      ...body,
      userId: req.user.uid,
    });
  }

  @Delete('by-url')
  @ApiOperation({ summary: 'Remove mídia por URL' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'URL da mídia que será removida',
  })
  @ApiResponse({ status: 200, description: 'Mídia removida com sucesso.' })
  async deleteByUrl(@Req() req, @Query('url') url: string) {
    return this.midiaService.deleteMidiaFromUrl(url, req.user.uid);
  }

  @Delete('admin/by-url')
  @UseGuards(AuthGuard('firebase-auth'), AdminRoleGuard)
  @ApiOperation({ summary: 'Remove mídia por URL como administrador' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'URL da mídia que será removida',
  })
  @ApiResponse({ status: 200, description: 'Mídia removida com sucesso.' })
  async adminDeleteByUrl(@Query('url') url: string) {
    return this.midiaService.deleteMidiaFromUrl(url);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove mídia por id' })
  @ApiParam({ name: 'id', required: true, description: 'ID da mídia' })
  async deleteById(@Req() req, @Param('id') id: string) {
    return this.midiaService.deleteMidiaById(id, req.user.uid);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard('firebase-auth'), AdminRoleGuard)
  @ApiOperation({ summary: 'Remove mídia por id como administrador' })
  @ApiParam({ name: 'id', required: true, description: 'ID da mídia' })
  async adminDeleteById(@Param('id') id: string) {
    return this.midiaService.deleteMidiaById(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove mídia enviada no body' })
  @ApiBody({ type: DeleteMidiaDto })
  async deleteByBody(
    @Req() req,
    @Body() body: DeleteMidiaDto,
  ) {
    if (typeof body.id === 'string' && body.id) {
      return this.midiaService.deleteMidiaById(body.id, req.user.uid);
    }

    if (typeof body.url === 'string' && body.url) {
      return this.midiaService.deleteMidiaFromUrl(body.url, req.user.uid);
    }

    return false;
  }
}
