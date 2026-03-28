import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SchoolDto } from './dto/school.dto';
import { AdminRoleGuard, SchoolRoleGuard } from 'src/common';

@ApiTags('Escolas')
@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Lista escolas', description: 'Retorna todas as escolas.' })
  @ApiOkResponse({ type: [SchoolDto] })
  async getAll() {
    return this.schoolsService.getAll();
  }

  @Get('me')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Busca a escola do perfil autenticado' })
  async getMySchool(@Req() req) {
    return this.schoolsService.getMySchool(req.user.uid);
  }

  @Get('me/users')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Lista usuarios vinculados a escola autenticada' })
  async getUsersFromMySchool(@Req() req, @Query('search') search?: string) {
    return this.schoolsService.getUsersFromMySchool(req.user.uid, search);
  }

  @Get('me/ranking')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Retorna ranking de escolas com filtro por jogo' })
  async getSchoolRanking(@Query('gameSlug') gameSlug?: string) {
    return this.schoolsService.getSchoolRanking(gameSlug);
  }

  @Get('me/users/ranking')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary: 'Retorna ranking de usuarios da escola autenticada com filtro por jogo',
  })
  async getUserRankingFromMySchool(
    @Req() req,
    @Query('gameSlug') gameSlug?: string,
  ) {
    return this.schoolsService.getUserRankingFromMySchool(req.user.uid, gameSlug);
  }

  @Get(':id/users/ranking')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Retorna ranking de usuarios de uma escola especifica para admin',
  })
  async getUserRankingBySchoolForAdmin(
    @Param('id') id: string,
    @Query('gameSlug') gameSlug?: string,
  ) {
    return this.schoolsService.getUserRankingBySchoolForAdmin(id, gameSlug);
  }

  @Get(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Busca escola por ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID da escola' })
  @ApiOkResponse({ type: SchoolDto })
  async getOne(@Param('id') id: string) {
    return this.schoolsService.getOne(id);
  }

  @Post()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Cria escola' })
  @ApiBody({ type: SchoolDto })
  @ApiResponse({ status: 201, description: 'Escola criada com sucesso.' })
  async create(@Body() school: SchoolDto) {
    return this.schoolsService.create(school);
  }

  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Atualiza escola' })
  @ApiParam({ name: 'id', required: true, description: 'ID da escola' })
  @ApiBody({ type: SchoolDto })
  async update(@Param('id') id: string, @Body() school: Partial<SchoolDto>) {
    return this.schoolsService.update(id, school);
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Remove escola' })
  @ApiParam({ name: 'id', required: true, description: 'ID da escola' })
  async delete(@Param('id') id: string) {
    return this.schoolsService.delete(id);
  }
}
