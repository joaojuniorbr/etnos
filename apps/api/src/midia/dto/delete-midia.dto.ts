import { ApiProperty } from '@nestjs/swagger';

export class DeleteMidiaDto {
  @ApiProperty({ example: 'midia-id-1', required: false })
  id?: string;

  @ApiProperty({ example: 'https://storage.googleapis.com/...', required: false })
  url?: string;
}
