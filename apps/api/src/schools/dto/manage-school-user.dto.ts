import { ApiProperty } from '@nestjs/swagger';

export class ManageSchoolUserDto {
  @ApiProperty({
    example: 'escola@etnos.com',
    description: 'E-mail do usuário que receberá acesso ao perfil de escola.',
  })
  email: string;
}
