import { ApiProperty } from '@nestjs/swagger';

export class SaveScoreDto {
  @ApiProperty({ example: 'memory-game' })
  slug: string;

  @ApiProperty({ example: 'joao-silva' })
  characterSlug: string;

  @ApiProperty({ example: 100 })
  score: number;
}
