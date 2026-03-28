import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import type { MemoryGameContentInterface } from '@etnos/types';
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
import { GameDto } from './dto/game.dto';
import { SaveScoreDto } from './dto/save-score.dto';
import { SaveMemoryGameContentDto } from './dto/save-memory-game-content.dto';
import { AdminRoleGuard, RequestUserOwnershipGuard } from 'src/common';

@ApiTags('Jogos')
@UseGuards(AuthGuard('firebase-auth'), RequestUserOwnershipGuard)
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Lista todos os jogos configurados' })
  @ApiOkResponse({ type: [GameDto] })
  async getGames(): Promise<GameDto[]> {
    return this.gamesService.getGames();
  }

  @Get('config/by-game/:gameSlug')
  @ApiOperation({ summary: 'Lista configurações por jogo' })
  @ApiParam({ name: 'gameSlug', required: true })
  async getConfigByGame(@Param('gameSlug') gameSlug: string) {
    return this.gamesService.getConfigByGame(gameSlug);
  }

  @Get('config/:gameSlug/:characterSlug')
  @ApiOperation({ summary: 'Busca configuração específica de jogo/personagem' })
  @ApiParam({ name: 'gameSlug', required: true })
  @ApiParam({ name: 'characterSlug', required: true })
  async getConfig(
    @Param('gameSlug') gameSlug: string,
    @Param('characterSlug') characterSlug: string,
  ) {
    return this.gamesService.getConfig(gameSlug, characterSlug);
  }

  @Post('config')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Cria/atualiza configuração de jogo' })
  @ApiBody({ type: GameDto })
  async saveConfig(@Body() data: GameDto) {
    return this.gamesService.saveConfig(data);
  }

  @Delete('config/:gameSlug/:characterSlug')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Remove configuração de jogo' })
  @ApiParam({ name: 'gameSlug', required: true, description: 'Slug do jogo' })
  @ApiParam({
    name: 'characterSlug',
    required: true,
    description: 'Slug do personagem',
  })
  async removeConfig(
    @Param('gameSlug') gameSlug: string,
    @Param('characterSlug') characterSlug: string,
  ) {
    return this.gamesService.removeConfig(gameSlug, characterSlug);
  }

  @Get('memory/:characterSlug')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({
    summary: 'Lista conteúdos do jogo da memória por personagem',
  })
  @ApiParam({
    name: 'characterSlug',
    required: true,
    description: 'Slug do personagem',
  })
  async getMemoryGameContent(@Param('characterSlug') characterSlug: string) {
    return this.gamesService.getMemoryGameContent(characterSlug);
  }

  @Get('memory/images/:characterSlug')
  @ApiOperation({ summary: 'Lista imagens formatadas do jogo da memória' })
  @ApiParam({
    name: 'characterSlug',
    required: true,
    description: 'Slug do personagem',
  })
  async getMemoryGameImages(@Param('characterSlug') characterSlug: string) {
    return this.gamesService.getMemoryGameImages(characterSlug);
  }

  @Post('memory')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Salva conteúdo do jogo da memória' })
  @ApiBody({ type: SaveMemoryGameContentDto })
  async saveMemoryGameContent(@Body() data: SaveMemoryGameContentDto) {
    return this.gamesService.saveMemoryGameContent(
      data as MemoryGameContentInterface,
    );
  }

  @Delete('memory/:id')
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Remove item do jogo da memória' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do item do jogo da memória',
  })
  async deleteMemoryGameContent(@Param('id') id: string) {
    return this.gamesService.deleteMemoryGameContent(id);
  }

  @Post('score')
  @ApiOperation({ summary: 'Salva a pontuação do jogo' })
  @ApiBody({ type: SaveScoreDto })
  @ApiResponse({ status: 201, description: 'Pontuação salva com sucesso.' })
  async saveScoreGame(@Req() req, @Body() data: SaveScoreDto) {
    return this.gamesService.saveScoreGame({
      slug: data.slug,
      characterSlug: data.characterSlug,
      score: data.score,
      userId: req.user.uid,
    });
  }

  @Post('score/history')
  @ApiOperation({ summary: 'Salva uma entrada no histórico de pontuação do jogo' })
  @ApiBody({ type: SaveScoreDto })
  @ApiResponse({
    status: 201,
    description: 'Histórico de pontuação salvo com sucesso.',
  })
  async saveScoreHistory(@Req() req, @Body() data: SaveScoreDto) {
    return this.gamesService.saveScoreHistory({
      slug: data.slug,
      characterSlug: data.characterSlug,
      score: data.score,
      userId: req.user.uid,
    });
  }

  @Get('score')
  @ApiOperation({ summary: 'Retorna todas as pontuações do usuário' })
  @ApiResponse({ status: 200, description: 'Pontuações retornadas com sucesso.' })
  async getScore(@Req() req) {
    return this.gamesService.getScoreByUser(req.user.uid);
  }

  @Get('score/:slug/:characterSlug')
  @ApiOperation({ summary: 'Obtém a pontuação do jogo para um usuário' })
  @ApiParam({ name: 'slug', required: true })
  @ApiParam({ name: 'characterSlug', required: true })
  @ApiResponse({ status: 200, description: 'Pontuação retornada com sucesso.' })
  async getFromGameScore(
    @Req() req,
    @Param('slug') slug: string,
    @Param('characterSlug') characterSlug: string,
  ) {
    return this.gamesService.getScoreGame({
      slug,
      characterSlug,
      userId: req.user.uid,
    });
  }

  @Get(':gameSlug')
  @UseGuards(AdminRoleGuard)
  @ApiOkResponse({ type: GameDto })
  @ApiOperation({ summary: 'Busca um jogo por slug' })
  @ApiParam({ name: 'gameSlug', required: true, description: 'Slug do jogo' })
  async getGamesBySlug(@Param('gameSlug') gameSlug: string): Promise<GameDto> {
    return this.gamesService.getGamesBySlug(gameSlug);
  }
}
