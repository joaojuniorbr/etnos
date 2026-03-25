import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Joao Silva',
    required: false,
    description: 'Nome do responsável.',
  })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiProperty({
    example: 'Enzo Silva',
    required: false,
    description: 'Nome da criança.',
  })
  @IsOptional()
  @IsString()
  childName?: string;

  @ApiProperty({
    example: '2019-01-31',
    required: false,
    description: 'Data de nascimento da criança (YYYY-MM-DD).',
  })
  @IsOptional()
  @IsString()
  childBirthDate?: string;

  @ApiProperty({
    example: '(41) 99999-1234',
    required: false,
    description: 'Telefone do responsável.',
  })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiProperty({
    example: 'Escola Municipal Modelo',
    required: false,
    description: 'Escola da criança.',
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    example: 'https://storage.googleapis.com/example/avatar.png',
    required: false,
    nullable: true,
    description: 'URL do avatar selecionado pelo usuário.',
  })
  @IsOptional()
  @IsString()
  photoURL?: string | null;

  @ApiProperty({
    example: 'anita',
    required: false,
    nullable: true,
    description: 'Slug do personagem usado para filtrar os avatares.',
  })
  @IsOptional()
  @IsString()
  avatarCharacterSlug?: string | null;
}
