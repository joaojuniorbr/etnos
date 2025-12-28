import { Controller, Get, Param } from '@nestjs/common';
import { GamesService } from './games.service';
import { ConfigGamesInterface } from '@etnos/tools';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';

class Game implements ConfigGamesInterface {
  @ApiProperty({ example: '123' })
  id?: string;

  @ApiProperty({ example: 'jogo-da-memoria' })
  gameSlug: string;

  @ApiProperty({ example: 'joao-silva' })
  characterSlug: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageCoverUrl: string;
}

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todos os jogos',
    description: 'Retorna uma lista de todos os jogos.',
  })
  @ApiOkResponse({ type: [Game] })
  async getGames(): Promise<Game[]> {
    return this.gamesService.getGames();
  }

  @Get(':gameSlug')
  @ApiOkResponse({ type: Game })
  @ApiOperation({
    summary: 'Busca um jogo por slug',
    description: 'Retorna um jogo específico por slug.',
  })
  @ApiParam({
    name: 'gameSlug',
    required: true,
    description: 'Slug do jogo',
  })
  async getGamesBySlug(@Param('gameSlug') gameSlug: string): Promise<Game> {
    return this.gamesService.getGamesBySlug(gameSlug);
  }
}
