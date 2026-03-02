import { ApiProperty } from '@nestjs/swagger';
import { CharacterInterface } from '../characters.service';

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
