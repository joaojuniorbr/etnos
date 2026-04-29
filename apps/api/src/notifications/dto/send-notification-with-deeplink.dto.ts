import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsObject,
} from 'class-validator';

export enum NotificationTargetType {
  GLOBAL = 'GLOBAL',
  SCHOOL = 'SCHOOL',
  INDIVIDUAL = 'INDIVIDUAL',
}

/**
 * DTO para envio de notificações push com suporte a deep links
 *
 * Exemplos de deep links:
 * - "/(app)/games" - Abre a aba de jogos
 * - "/(app)/games/memory" - Abre um jogo específico
 * - "/(app)/profile" - Abre o perfil do usuário
 * - "/(app)/?tab=characters" - Abre com parâmetro de query
 */
export class SendNotificationWithDeeplinkDto {
  @ApiProperty({ example: 'Novo desafio disponível!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Entre no app e confira o novo desafio.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationTargetType })
  @IsEnum(NotificationTargetType)
  targetType: NotificationTargetType;

  @ApiPropertyOptional({
    description:
      'URL de deep link (ex: "/(app)/games" ou "/(app)/games/memory")',
    example: '/(app)/games',
  })
  @IsOptional()
  @IsString()
  deeplink?: string;

  @ApiPropertyOptional({
    description:
      'Dados adicionais para passar à notificação (utilizado em deep links)',
    example: { gameId: 'memory-123', score: 100 },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'ID da escola (obrigatório se targetType=SCHOOL)',
  })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário (obrigatório se targetType=INDIVIDUAL)',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
