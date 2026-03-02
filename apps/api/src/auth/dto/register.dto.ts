import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@etnos.com',
    description: 'Email da conta.',
  })
  email: string;

  @ApiProperty({
    description: 'Senha da conta.',
  })
  password: string;

  @ApiProperty({ required: false, example: 'Joao Silva' })
  parentName?: string;

  @ApiProperty({ required: false, example: 'Enzo Silva' })
  childName?: string;

  @ApiProperty({ required: false, example: '2019-01-31' })
  childBirthDate?: string;

  @ApiProperty({ required: false, example: '(41) 99999-1234' })
  parentPhone?: string;

  @ApiProperty({ required: false, example: 'Escola Municipal Modelo' })
  school?: string;
}
