import { ApiProperty } from '@nestjs/swagger';

export class MidiaDto {
  @ApiProperty({
    example: 'https://storage.googleapis.com/example/image.png',
  })
  url: string;

  @ApiProperty({
    example: 'games/anita',
    required: false,
  })
  folder?: string;

  @ApiProperty({
    example: 'games/anita/1712345678901-image.png',
    required: false,
  })
  path?: string;

  @ApiProperty({
    example: 'midia-123',
    required: false,
  })
  id?: string;
}
