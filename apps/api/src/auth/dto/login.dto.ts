import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@etnos.com',
    description: 'Email de acesso do usuário.',
  })
  email: string;

  @ApiProperty({
    description: 'Credencial secreta do usuário.',
  })
  password: string;
}
