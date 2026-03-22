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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { MidiaService } from './midia.service';
import type { MidiaInterface } from '@etnos/types';
import { DeleteMidiaDto } from './dto/delete-midia.dto';
import { AdminRoleGuard } from 'src/common/guards/admin-role.guard';
import { RequestUserOwnershipGuard } from 'src/common';

@ApiTags('Mídia')
@UseGuards(
  AuthGuard('firebase-auth'),
  RequestUserOwnershipGuard,
  AdminRoleGuard,
)
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

  @Get('folders')
  @ApiOperation({ summary: 'Lista pastas de mídia com contagem' })
  async getFolders(@Req() req) {
    return this.midiaService.getFolders(req.user.uid);
  }

  @Post()
  @ApiOperation({ summary: 'Cria registro de mídia' })
  async saveMidia(@Req() req, @Body() body: MidiaInterface) {
    return this.midiaService.saveMidia({
      ...body,
      userId: req.user.uid,
    });
  }

  @Delete('by-url')
  @ApiOperation({ summary: 'Remove mídia por URL' })
  @ApiResponse({ status: 200, description: 'Mídia removida com sucesso.' })
  async deleteByUrl(@Req() req, @Query('url') url: string) {
    return this.midiaService.deleteMidiaFromUrl(url, req.user.uid);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove mídia por id' })
  async deleteById(@Req() req, @Param('id') id: string) {
    return this.midiaService.deleteMidiaById(id, req.user.uid);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove mídia enviada no body' })
  async deleteByBody(
    @Req() req,
    @Body() body: MidiaInterface | DeleteMidiaDto,
  ) {
    if ('id' in body && body.id) {
      return this.midiaService.deleteMidiaById(body.id, req.user.uid);
    }

    if (body.url) {
      return this.midiaService.deleteMidiaFromUrl(body.url, req.user.uid);
    }

    return false;
  }
}
