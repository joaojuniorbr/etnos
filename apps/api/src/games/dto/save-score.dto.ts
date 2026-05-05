import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class SaveScoreDto {
  @ApiProperty({ example: 'memory-game' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'joao-silva' })
  @IsString()
  characterSlug: string;

  @ApiProperty({
    example: 100,
    required: false,
    description: 'Pontuação ao finalizar; pode ser 0 ao iniciar partida.',
  })
  @IsOptional()
  @IsInt()
  score?: number;

  @ApiProperty({
    required: false,
    enum: ['start', 'end'],
    description: 'start = abre sessão; end = encerra (use com sessionId).',
  })
  @IsOptional()
  @IsIn(['start', 'end'])
  phase?: 'start' | 'end';

  @ApiProperty({
    required: false,
    description: 'Retornado pelo servidor ao iniciar a partida',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
