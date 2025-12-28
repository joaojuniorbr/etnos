import { Controller, Get, Param } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharacterInterface } from '@etnos/tools';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';

class Character implements CharacterInterface {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao-silva' })
  slug: string;

  @ApiProperty({ example: 'Asia' })
  region: string;

  @ApiProperty({ example: 'Descrição do personagem' })
  description: string;
}

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todos os personagens',
    description: 'Retorna uma lista de todos os personagens.',
  })
  @ApiOkResponse({ type: [Character] })
  async getCharacters(): Promise<Character[]> {
    return this.charactersService.getCharacters();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Busca um personagem por slug',
    description: 'Retorna um personagem específico por slug.',
  })
  @ApiOkResponse({ type: Character })
  @ApiParam({ name: 'slug', required: true, description: 'Slug do personagem' })
  async getCharacterBySlug(@Param('slug') slug: string): Promise<Character> {
    return this.charactersService.getCharacterBySlug(slug);
  }
}
