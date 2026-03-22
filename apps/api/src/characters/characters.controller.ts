import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import type { CharacterInterface } from '@etnos/types';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CharacterDto } from './dto/character.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminRoleGuard } from 'src/common/guards/admin-role.guard';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todos os personagens',
    description: 'Retorna uma lista de todos os personagens.',
  })
  @ApiOkResponse({ type: [CharacterDto] })
  async getCharacters(): Promise<CharacterDto[]> {
    return this.charactersService.getCharacters();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Busca um personagem por slug',
    description: 'Retorna um personagem específico por slug.',
  })
  @ApiOkResponse({ type: CharacterDto })
  @ApiParam({ name: 'slug', required: true, description: 'Slug do personagem' })
  async getCharacterBySlug(@Param('slug') slug: string): Promise<CharacterDto> {
    return this.charactersService.getCharacterBySlug(slug);
  }

  @Post()
  @UseGuards(AuthGuard('firebase-auth'), AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um personagem',
    description: 'Cria um novo personagem quando o slug ainda não existe.',
  })
  @ApiBody({ type: CharacterDto })
  @ApiResponse({ status: 201, description: 'Personagem criado com sucesso.' })
  @ApiResponse({
    status: 200,
    description: 'Slug já existe. Retorna null sem criar.',
  })
  async save(@Body() character: CharacterDto): Promise<CharacterInterface | null> {
    return this.charactersService.save(character);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('firebase-auth'), AdminRoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um personagem',
    description: 'Atualiza o personagem validando conflito de slug.',
  })
  @ApiParam({ name: 'id', required: true, description: 'ID do personagem' })
  @ApiBody({ type: CharacterDto })
  @ApiOkResponse({ type: CharacterDto, description: 'Personagem atualizado.' })
  async update(
    @Param('id') id: string,
    @Body() character: CharacterDto,
  ): Promise<CharacterInterface | null> {
    return this.charactersService.update({ ...character, id });
  }
}
