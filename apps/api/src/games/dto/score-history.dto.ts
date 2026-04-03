import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ScoreHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por slug do jogo',
    example: 'memory-game',
  })
  @IsOptional()
  @IsString()
  gameSlug?: string;
}
