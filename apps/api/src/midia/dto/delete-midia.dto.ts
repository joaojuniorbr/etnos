import { ApiProperty } from '@nestjs/swagger';

export class DeleteMidiaDto {
  @ApiProperty({ example: 'https://storage.googleapis.com/...', required: false })
  url?: string;
}
