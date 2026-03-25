import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Senha atual do usuário autenticado.',
  })
  currentPassword: string;

  @ApiProperty({
    description: 'Nova senha desejada para a conta.',
  })
  newPassword: string;
}
