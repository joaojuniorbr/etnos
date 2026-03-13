import { ApiProperty } from '@nestjs/swagger';
import type { SchoolInterface } from '@etnos/types';

export class SchoolDto implements SchoolInterface {
  @ApiProperty({ example: 'school-123' })
  id: string;

  @ApiProperty({ example: 'Escola Municipal Aurora' })
  name: string;

  @ApiProperty({ example: 'Curitiba', required: false })
  city?: string;

  @ApiProperty({ example: 'PR', required: false })
  state?: string;
}
