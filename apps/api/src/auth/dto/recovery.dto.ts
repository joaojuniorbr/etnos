import { ApiProperty } from '@nestjs/swagger';

export class RecoveryDto {
  @ApiProperty({
    example: 'usuario@etnos.com',
    description: 'Email para recuperação de senha.',
  })
  email: string;
}
