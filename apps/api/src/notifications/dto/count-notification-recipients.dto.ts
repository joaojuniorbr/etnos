import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationTargetType } from './send-notification.dto';

export class CountNotificationRecipientsDto {
  @ApiProperty({ enum: NotificationTargetType })
  @IsEnum(NotificationTargetType)
  targetType: NotificationTargetType;

  @ApiPropertyOptional({ example: 'school-id' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsString()
  userId?: string;
}
