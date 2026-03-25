import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Joao Silva',
    required: false,
    description: 'Nome do responsável.',
  })
  parentName?: string;

  @ApiProperty({
    example: 'Enzo Silva',
    required: false,
    description: 'Nome da criança.',
  })
  childName?: string;

  @ApiProperty({
    example: '2019-01-31',
    required: false,
    description: 'Data de nascimento da criança (YYYY-MM-DD).',
  })
  childBirthDate?: string;

  @ApiProperty({
    example: '(41) 99999-1234',
    required: false,
    description: 'Telefone do responsável.',
  })
  parentPhone?: string;

  @ApiProperty({
    example: 'Escola Municipal Modelo',
    required: false,
    description: 'Escola da criança.',
  })
  school?: string;

  @ApiProperty({
    example: 'https://storage.googleapis.com/example/avatar.png',
    required: false,
    description: 'URL do avatar selecionado pelo usuário.',
  })
  photoURL?: string;

  @ApiProperty({
    example: 'anita',
    required: false,
    description: 'Slug do personagem usado para filtrar os avatares.',
  })
  avatarCharacterSlug?: string;
}
