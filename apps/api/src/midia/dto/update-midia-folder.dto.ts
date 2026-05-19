import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMidiaFolderDto {
  @ApiProperty({
    example: 'library',
    required: false,
    description:
      'Nome da pasta de destino. Omita ou envie null para remover da pasta.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  folder?: string | null;
}
