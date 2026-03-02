import { ApiProperty } from '@nestjs/swagger';

export class SaveMemoryGameContentDto {
  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  url: string;

  @ApiProperty({ example: 'joao-silva' })
  slug: string;

  @ApiProperty({ example: 'character-id-123' })
  idCharacter: string;
}
