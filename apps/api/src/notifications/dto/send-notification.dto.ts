import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum NotificationTargetType {
  GLOBAL = 'GLOBAL',
  SCHOOL = 'SCHOOL',
  INDIVIDUAL = 'INDIVIDUAL',
}

export class SendNotificationDto {
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

  @ApiPropertyOptional({ description: 'ID da escola (obrigatório se targetType=SCHOOL)' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'ID do usuário (obrigatório se targetType=INDIVIDUAL)' })
  @IsOptional()
  @IsString()
  userId?: string;
}
