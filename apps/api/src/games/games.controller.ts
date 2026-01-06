import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { ConfigGamesInterface } from '@etnos/tools';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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

@UseGuards(AuthGuard('firebase-auth'))
@ApiBearerAuth()
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

  @Post('score')
  @ApiOperation({
    summary: 'Salva a pontuação do jogo',
    description: 'Salva a pontuação do jogo para um usuário específico.',
  })
  async saveScoreGame(
    @Req() req,
    @Body() data: { slug: string; characterSlug: string; score: number },
  ) {
    return this.gamesService.saveScoreGame({
      slug: data.slug,
      characterSlug: data.characterSlug,
      score: data.score,
      userId: req.user.uid,
    });
  }

  @Get('score/:slug/:characterSlug')
  @ApiOperation({
    summary: 'Obtém a pontuação do jogo para um usuário',
    description:
      'Retorna a pontuação do jogo para um usuário específico com base no slug do jogo e no slug do personagem.',
  })
  @ApiParam({
    name: 'slug',
    required: true,
    description: 'Slug do jogo',
  })
  @ApiParam({
    name: 'characterSlug',
    required: true,
    description: 'Slug do personagem',
  })
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
}
