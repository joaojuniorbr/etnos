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
import { ManageSchoolUserDto } from './dto/manage-school-user.dto';
import { UpdateSchoolGameAccessDto } from './dto/school-game-access.dto';

@ApiTags('Escolas')
@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Lista escolas',
    description: 'Retorna todas as escolas.',
  })
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

  @Get('me/managed')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary: 'Lista as escolas que o perfil autenticado pode visualizar',
  })
  async getManagedSchools(@Req() req) {
    return this.schoolsService.getManagedSchools(req.user.uid);
  }

  @Get('me/game-access')
  @UseGuards(AuthGuard('firebase-auth'))
  @ApiOperation({
    summary:
      'Retorna os jogos e personagens habilitados para a escola do usuario autenticado',
  })
  async getMyGameAccess(@Req() req) {
    return this.schoolsService.getMyGameAccess(req.user.uid);
  }

  @Get('me/users')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({ summary: 'Lista usuarios vinculados a escola autenticada' })
  async getUsersFromMySchool(@Req() req, @Query('search') search?: string) {
    return this.schoolsService.getUsersFromMySchool(req.user.uid, search);
  }

  @Get(':id/users')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary:
      'Lista usuarios de uma escola quando o perfil autenticado possui acesso a ela',
  })
  async getUsersBySchool(
    @Req() req,
    @Param('id') id: string,
    @Query('search') search?: string,
  ) {
    return this.schoolsService.getUsersBySchool(req.user.uid, id, search);
  }

  @Get(':id/game-access')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary:
      'Retorna os jogos e personagens habilitados para uma escola acessivel ao perfil autenticado',
  })
  async getGameAccessBySchool(@Req() req, @Param('id') id: string) {
    return this.schoolsService.getGameAccessBySchool(req.user.uid, id);
  }

  @Patch(':id/game-access')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary:
      'Atualiza os jogos e personagens habilitados para uma escola acessivel ao perfil autenticado',
  })
  @ApiBody({ type: UpdateSchoolGameAccessDto })
  async updateGameAccessBySchool(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateSchoolGameAccessDto,
  ) {
    return this.schoolsService.updateGameAccessBySchool(req.user.uid, id, body);
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
    summary:
      'Retorna ranking de usuarios da escola autenticada com filtro por jogo',
  })
  async getUserRankingFromMySchool(
    @Req() req,
    @Query('gameSlug') gameSlug?: string,
    @Query('characterSlug') characterSlug?: string,
  ) {
    return this.schoolsService.getUserRankingFromMySchool(
      req.user.uid,
      gameSlug,
      characterSlug,
    );
  }

  @Get(':id/users/ranking')
  @UseGuards(SchoolRoleGuard)
  @ApiOperation({
    summary:
      'Retorna ranking de usuarios de uma escola especifica quando o perfil possui acesso',
  })
  async getUserRankingBySchoolForAdmin(
    @Req() req,
    @Param('id') id: string,
    @Query('gameSlug') gameSlug?: string,
    @Query('characterSlug') characterSlug?: string,
  ) {
    return this.schoolsService.getUserRankingBySchoolForViewer(
      req.user.uid,
      id,
      gameSlug,
      characterSlug,
    );
  }

  @Get(':id/access-users')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Lista os usuários com perfil school vinculados a uma escola',
  })
  async getAccessUsersBySchool(@Param('id') id: string) {
    return this.schoolsService.getAccessUsersBySchool(id);
  }

  @Post(':id/access-users')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary:
      'Vincula um usuário ao perfil school da escola, criando-o se necessário',
  })
  @ApiBody({ type: ManageSchoolUserDto })
  async addAccessUserToSchool(
    @Param('id') id: string,
    @Body() body: ManageSchoolUserDto,
  ) {
    return this.schoolsService.addAccessUserToSchool(id, body.email);
  }

  @Delete(':id/access-users/:userId')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Remove o acesso de um usuário school a uma escola',
  })
  async removeAccessUserFromSchool(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.schoolsService.removeAccessUserFromSchool(id, userId);
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
