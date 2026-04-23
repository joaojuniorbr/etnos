import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateSchoolGameAccessDto {
  @ApiProperty({
    example: ['memory-game', 'guess-game'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  enabledGameSlugs!: string[];

  @ApiProperty({
    example: ['anita', 'iara'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  enabledCharacterSlugs!: string[];
}
