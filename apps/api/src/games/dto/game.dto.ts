import { ApiProperty } from '@nestjs/swagger';
import type { ConfigGamesInterface } from '@etnos/types';

export class GameDto implements ConfigGamesInterface {
  @ApiProperty({ example: '123' })
  id?: string;

  @ApiProperty({ example: 'memory-game' })
  gameSlug: string;

  @ApiProperty({ example: 'joao-silva' })
  characterSlug: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageCoverUrl: string;
}
