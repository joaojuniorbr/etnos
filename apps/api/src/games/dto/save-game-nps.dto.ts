import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SaveGameNpsDto {
  @ApiProperty({ example: 'memory-game' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'anita' })
  @IsString()
  characterSlug: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    required: false,
    description: 'Comentário opcional sobre a experiência.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
