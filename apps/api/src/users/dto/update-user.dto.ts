import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '@etnos/types';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    type: [String],
    enum: ['admin', 'school', 'student', 'teacher'],
  })
  roles?: UserRole[];

  @ApiProperty({ required: false, nullable: true })
  school?: string | null;

  @ApiProperty({ required: false })
  isActive?: boolean;
}
