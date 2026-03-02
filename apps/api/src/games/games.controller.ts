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
import {
  GamesService,
  MemoryGameContentInterface,
} from './games.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GameDto } from './dto/game.dto';
import { SaveScoreDto } from './dto/save-score.dto';
import { SaveMemoryGameContentDto } from './dto/save-memory-game-content.dto';

@ApiTags('Jogos')
@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
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
  @ApiOperation({ summary: 'Cria/atualiza configuração de jogo' })
  @ApiBody({ type: GameDto })
  async saveConfig(@Body() data: GameDto) {
    return this.gamesService.saveConfig(data);
  }

  @Delete('config/:gameSlug/:characterSlug')
  @ApiOperation({ summary: 'Remove configuração de jogo' })
  async removeConfig(
    @Param('gameSlug') gameSlug: string,
    @Param('characterSlug') characterSlug: string,
  ) {
    return this.gamesService.removeConfig(gameSlug, characterSlug);
  }

  @Get('memory/:characterSlug')
  @ApiOperation({ summary: 'Lista conteúdos do jogo da memória por personagem' })
  async getMemoryGameContent(@Param('characterSlug') characterSlug: string) {
    return this.gamesService.getMemoryGameContent(characterSlug);
  }

  @Get('memory/images/:characterSlug')
  @ApiOperation({ summary: 'Lista imagens formatadas do jogo da memória' })
  async getMemoryGameImages(@Param('characterSlug') characterSlug: string) {
    return this.gamesService.getMemoryGameImages(characterSlug);
  }

  @Post('memory')
  @ApiOperation({ summary: 'Salva conteúdo do jogo da memória' })
  @ApiBody({ type: SaveMemoryGameContentDto })
  async saveMemoryGameContent(@Body() data: SaveMemoryGameContentDto) {
    return this.gamesService.saveMemoryGameContent(data as MemoryGameContentInterface);
  }

  @Delete('memory/:id')
  @ApiOperation({ summary: 'Remove item do jogo da memória' })
  async deleteMemoryGameContent(@Param('id') id: string) {
    return this.gamesService.deleteMemoryGameContent(id);
  }

  @Post('score')
  @ApiOperation({ summary: 'Salva a pontuação do jogo' })
  @ApiBody({ type: SaveScoreDto })
  async saveScoreGame(@Req() req, @Body() data: SaveScoreDto) {
    return this.gamesService.saveScoreGame({
      slug: data.slug,
      characterSlug: data.characterSlug,
      score: data.score,
      userId: req.user.uid,
    });
  }

  @Get('score')
  @ApiOperation({ summary: 'Retorna todas as pontuações do usuário' })
  async getScore(@Req() req) {
    return this.gamesService.getScoreByUser(req.user.uid);
  }

  @Get('score/:slug/:characterSlug')
  @ApiOperation({ summary: 'Obtém a pontuação do jogo para um usuário' })
  @ApiParam({ name: 'slug', required: true })
  @ApiParam({ name: 'characterSlug', required: true })
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
  @ApiOkResponse({ type: GameDto })
  @ApiOperation({ summary: 'Busca um jogo por slug' })
  @ApiParam({ name: 'gameSlug', required: true, description: 'Slug do jogo' })
  async getGamesBySlug(@Param('gameSlug') gameSlug: string): Promise<GameDto> {
    return this.gamesService.getGamesBySlug(gameSlug);
  }
}
