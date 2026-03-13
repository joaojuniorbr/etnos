import { ApiProperty } from '@nestjs/swagger';
import type { CharacterInterface } from '@etnos/types';

export class CharacterDto implements CharacterInterface {
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
